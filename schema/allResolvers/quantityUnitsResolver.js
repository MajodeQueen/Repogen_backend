const Unit = require("../../models/unitModel");

const quantityUnitsResolver = {
    Mutation: {
        addUnit: async (_, { input }, contextValue) => {
            const { unitName } = input;
            const { business } = contextValue
            try {
                if (!business) {
                    throw new GraphQLError('No Business Session', {
                        extensions: { code: 'UNAUTHENTICATED' },
                    });
                }

                if (!unitName) {
                    throw new GraphQLError('All fields are required', {
                        extensions: { code: 'VALIDATION_ERROR' },
                    });
                }
                const newEntry = new Unit({
                    name: unitName,
                    business,
                });
                const units = await newEntry.save();
                return {
                    success: true,
                    message: 'Added successfully',
                    units: units
                };
            } catch (err) {

                console.error('Error in addDescriptions:', err);
                return {
                    success: false,
                    message: err.message || 'Internal server error',
                    units: null
                };
            }
        },

    },
    Query: {
        allUnits: async (_, __, contextValue) => {
            try {
                const { business } = contextValue;
                if (!business) {
                    throw new Error('Business ID is invalid');
                }

                const entries = await Unit.find({ business }).exec();
                return {
                    success: true,
                    message: "Units retrived successfully",
                    units: entries
                };
            } catch (err) {
                return {
                    success: false,
                    message: err.message || 'Internal server error',
                    units: null
                };
            }
        },
    },
};



module.exports = quantityUnitsResolver;