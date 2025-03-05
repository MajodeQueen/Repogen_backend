const User = require('../../models/userModel');
const Business = require('../../models/businessModel');
const { GraphQLError } = require('graphql');
const useSendEmail = require('../../useSendEmail');
const { emailContent } = require('../../emailContent');



const BusinessResolver = {
  Mutation: {
    createBusinessAccount: async (_, { input }) => {
      try {
        const { name, location, aspects, email } = input;
        const user = await User.findOne({ email });
        if (!user) {
          throw new GraphQLError('User email does not exist', {
            extensions: {
              code: 'NOT_FOUND',
            },
          });
        }
        const admins = [user];
        const newBusiness = new Business({
          name,
          location,
          aspects,
          admins,
        });
        const createdBusiness = await newBusiness.save();
        const accountId = String(createdBusiness._id);
        await useSendEmail(email, emailContent, accountId);
        return {
          success: true,
          message:
            'An email containing your business ID has been sent to your inbox',
          business: createdBusiness,
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Internal server error',
        };
      }
    },
    addBusinessEditor: async (_, { input }, contextValue) => {
      const { business } = contextValue
      const { email } = input
      try {
        // Find the business by ID
        const actualBusiness = await Business.findById(business.id);
        if (!actualBusiness) {
          throw new ApolloError('Business not found', 'BUSINESS_NOT_FOUND');
        }
        // Check if user is already an editor
        const user = await User.findOne({ email });
        if (!user) {
          return {
            success: false,
            message: 'User email does not exist',
          };
        }
        if (actualBusiness.editors.includes(user)) {
          return {
            success: false,
            message: 'User is already an editor',
          };
        }

        // Add the user to the editors list
        actualBusiness.editors.push(user);
        await actualBusiness.save();

        return {
          success: true,
          message: 'Editor added',
        };
      } catch (error) {
        throw new ApolloError(error.message, 'INTERNAL_SERVER_ERROR');
      }
    },
  },
  Query: {
    getLoggedInBusinessInfo: async (_, __, contextValue) => {
      const { business } = contextValue;
      try {
        if (!business) {
          throw new GraphQLError('Business ID is missing in the context', {
            extensions: {
              code: 'UNAUTENTICATED',
            },
          });
        }
        const foundBusiness = await Business.findById(business.id)
          .populate({
            path: 'admins',  // Populate the admins field
            select: 'username email' // Specify the fields to return (e.g., username, email)
          });

        if (!foundBusiness) {
          throw new GraphQLError(
            'Business is not a registered user of Repogen',
            {
              extensions: {
                code: 'UNAUTENTICATED',
              },
            }
          );
        }
        return {
          success: true,
          message: 'Business information retrieved successfully',
          business: foundBusiness,
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Internal server error',
        };
      }
    },

    getAllBusinessesAssociatedWithUser: async (_, { input }) => {
      try {
        const { email } = input
        const actualUser = await User.findOne({ email });
        if (!actualUser) {
          return {
            success: false,
            message: 'User not found',
            businesses: null
          };
        }
        // Fetch businesses where the user is either an admin or an editor
        const businesses = await Business.find({
          $or: [
            { admins: actualUser._id },
            { editors: actualUser._id }
          ]
        });
        return {
          success: true,
          message: 'User data retrieved successfully',
          businesses: businesses
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Internal server error',
          businesses: null
        };
      }
    },
  },
};

module.exports = BusinessResolver;
