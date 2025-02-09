const Description = require("../../models/ServicesDescriptionsModel");

const descriptionResolver = {
    Mutation: {
        addDescriptions: async (_, { input }, contextValue) => {
            const { descriptionName } = input;
            const { business } = contextValue
            try {
                if (!business) {
                    throw new GraphQLError('No Business Session', {
                        extensions: { code: 'UNAUTHENTICATED' },
                    });
                }

                if (!descriptionName) {
                    throw new GraphQLError('All fields are required', {
                        extensions: { code: 'VALIDATION_ERROR' },
                    });
                }
                const newEntry = new Description({
                    name: descriptionName,
                    business,
                });
                const description = await newEntry.save();
                return {
                    success: true,
                    message: 'Added successfully',
                    description: description
                };
            } catch (err) {

                console.error('Error in addDescriptions:', err);
                return {
                    success: false,
                    message: err.message || 'Internal server error',
                    description: null
                };
            }
        },

    },
    Query: {
        allDescrptions: async (_, __, contextValue) => {
            try {
                const { business } = contextValue;
                if (!business) {
                    throw new Error('Business ID is invalid');
                }

                const entries = await Description.find({ business }).exec();
                return {
                    success: true,
                    message: "Descriptions retrived successfully",
                    descriptions: entries
                };
            } catch (err) {
                return {
                    success: false,
                    message: err.message || 'Internal server error',
                    descriptions: null
                };
            }
        },
    },
};



module.exports = descriptionResolver;