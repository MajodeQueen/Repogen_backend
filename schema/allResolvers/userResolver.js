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

    login: async (_, { input }) => {
      try {
        const { email, password, businessId } = input;
        const business = await Business.findById(businessId);
        const user = await User.findOne({ email });

        if (!user) {
          throw new GraphQLError('Invalid email', {
            extensions: {
              code: 'UNAUTENTICATED',
            },
          });
        }

        if (!business) {
          throw new GraphQLError('Business ID is invalid', {
            extensions: {
              code: 'UNAUTENTICATED',
            },
          });
        }

        const passwordValidity = await bcrypt.compare(password, user.password);
        if (!passwordValidity) {
          throw new Error('Invalid password');
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

        const accessToken = genAccessTokenToken(user._id);

        return {
          success: true,
          message: 'Login successful', // Ensure message is always set
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
          },
          token: accessToken,
          businessId: businessId,
          isAdmin: userHasAdminAccess,
        };
      } catch (err) {
        // Always return a message, even in the error case
        return {
          success: false,
          message: err.message || 'Internal server error', // Provide a fallback message
          user: null, // Return null for user in case of error
          token: null,
          businessId: null,
        };
      }
    },

    logout: (_, __, contextValue) => {
      try {
        contextValue.res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });
        return {
          success: true,
          message: 'Logged out successfully',
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Internal server error',
        };
      }
    },
  },

  Query: {
    Me: async (_, __, contextValue) => {
      try {
        const { user } = contextValue;
        if (!user) {
          throw new Error('No user found');
        }
        const actualUser = await User.findById(user.id);
        return {
          success: true,
          message: 'User data retrieved successfully',
          user: actualUser,
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Internal server error',
        };
      }
    },
  },
};

module.exports = UserResolver;
