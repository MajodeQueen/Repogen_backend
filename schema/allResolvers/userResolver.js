const genAccessTokenToken = require('../../generateTokens');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');
const Business = require('../../models/businessModel');
const { GraphQLError } = require('graphql');

const UserResolver = {
  Mutation: {
    signup: async (_, { input }) => {
      try {
        const { username, email, password } = input;
        const alreadyExists = await User.findOne({ email });

        if (alreadyExists) {
          throw new Error('Email already exists');
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        if (!hashedPassword) {
          throw new Error('Error hashing password');
        }

        const newUser = new User({
          username,
          email,
          password: hashedPassword,
        });

        await newUser.save();
        return {
          success: true,
          message: 'User registered successfully',
          user: newUser,
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Internal server error',
        };
      }
    },

    login: async (_, { input },contextValue) => {
      try {
        const { email, password, businessId } = input;
        const business = await Business.findById(businessId);
        const user = await User.findOne({ email });

        if (!user) {
          return {
            success: false,
            message: 'Invalid email', // Provide a fallback message
            user: null, // Return null for user in case of error
          };
        }

        if (!business) {
          return {
            success: false,
            message: 'Business ID is invalid', // Provide a fallback message
            user: null, // Return null for user in case of error
          };
        }

        const passwordValidity = await bcrypt.compare(password, user.password);
        if (!passwordValidity) {
          return {
            success: false,
            message: 'Invalid password', // Provide a fallback message
            user: null, // Return null for user in case of error
          };
        }

        const userHasAdminAccess = business.admins.includes(user._id);
        const userHasEditorAccess = business.editors.includes(user._id);

        if (!userHasAdminAccess && !userHasEditorAccess) {
          throw new GraphQLError(
            'You do not have access to this business account',
            {
              extensions: {
                code: 'UNAUTENTICATED',
              },
            }
          );
        }

        const token = genAccessTokenToken(user._id)
        const authData = JSON.stringify({ token, BusinessId:businessId });

        contextValue.res.cookie('authData', authData, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 1000 * 60 * 60, // 1 hour,
          sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        });
  

        return {
          success: true,
          message: 'Login successful', // Ensure message is always set
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
          },
          businessId: businessId,
          isAdmin: userHasAdminAccess,
          token: token

        };
      } catch (err) {
        // Always return a message, even in the error case
        return {
          success: false,
          message: err.message || 'Internal server error', // Provide a fallback message
          user: null, // Return null for user in case of error
        };
      }
    },
    logout: (parent, args, contextValue) => {
      // Clear both cookies
      contextValue.res.clearCookie('auth');
      return {
        success:true,
        message:"Logout Successful"
      };
    },
  },



  Query: {
    Me: async (_, __, contextValue) => {
      try {
        const { user,business } = contextValue;
        if (!user || !business) {
          return {
          success: false,
          message: 'Has no access',
          user: null,
          adminAccess:null
        };
        }
        const actualUser = await User.findById(user.id);
        const actualBusiness = await Business.findById(business.id)
        const userHasAdminAccess = actualBusiness.admins.includes(user.id);
        return {
          success: true,
          message: 'User data retrieved successfully',
          user: actualUser,
          adminAccess:userHasAdminAccess
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Internal server error',
          user: null,
          adminAccess:null
        };
      }
    },
    
  },
};

module.exports = UserResolver;
