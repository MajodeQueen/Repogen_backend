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
        const foundBusiness = await Business.findById(business.id);
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
  },
};

module.exports = BusinessResolver;
