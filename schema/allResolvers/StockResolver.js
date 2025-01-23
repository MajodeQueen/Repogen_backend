const { GraphQLError } = require('graphql');
const Business = require('../../models/businessModel');
const Stock = require('../../models/StockModel');

const StockResolver = {
  Mutation: {
    addStock: async (_, { input }, contextValue) => {
      const { name, quantity, costPrice, sellPrice, date } = input;
      const { business } = contextValue;
      try {
        if (!business) {
          throw new GraphQLError('Business ID is Invalid', {
            extensions: {
              code: 'UNAUTENTICATED',
            },
          });
        }
        const newStock = new Stock({
          name,
          quantity,
          costPrice,
          sellPrice,
          date,
          business,
        });

        const savedStock = await newStock.save();

        return {
          success: true,
          message: 'Stock added successfully',
          stock: savedStock,
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
    allStock: async (_, __, contextValue) => {
      const { business } = contextValue;

      try {
        if (!business) {
          throw new Error('Business ID is Invalid');
        }
        const stockItems = await Stock.find({ business: business });
        return {
          success: true,
          message: 'Stock retrieved successfully',
          stock: stockItems,
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Internal server error',
          stock: [],
        };
      }
    },
  },
};

module.exports = StockResolver;
