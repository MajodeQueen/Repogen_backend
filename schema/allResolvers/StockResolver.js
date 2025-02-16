const { GraphQLError } = require('graphql');
const Stock = require('../../models/StockModel');

const StockResolver = {
  Mutation: {
    addStock: async (_, { input }, contextValue) => {
      const { date, stockItems } = input;
      const { business } = contextValue;

      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new GraphQLError('Invalid date format. Please provide a valid date (YYYY-MM-DD or ISO 8601).', {
          extensions: { code: 'INVALID_DATE' },
        });
      }

      const stockAdded = [];

      try {
        if (!business) {
          throw new GraphQLError('Business ID is Invalid', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }

        for (const product of stockItems) {
          const { costPrice, name, price, productId, quantity } = product;

          if (quantity <= 0) {
            throw new GraphQLError('Quantity must be greater than zero', {
              extensions: { code: 'INVALID_QUANTITY' },
            });
          }

          if (!productId) {
            // Create new stock when productId is empty
            const newStock = new Stock({
              name,
              quantity,
              costPrice,
              sellPrice: price,
              date: parsedDate.toISOString(),
              business,
            });

            const savedStock = await newStock.save();
            stockAdded.push(savedStock);
          } else {
            // Find existing stock
            const existingStock = await Stock.findOne({ _id: productId, business });

            if (!existingStock) {
              throw new GraphQLError(`Product with ID ${productId} not found`, {
                extensions: { code: 'PRODUCT_NOT_FOUND' },
              });
            }

            if (existingStock.costPrice !== costPrice || existingStock.sellPrice !== price) {
              // If prices differ, create a new stock entry
              const newStock = new Stock({
                name,
                quantity,
                costPrice,
                sellPrice: price,
                date: parsedDate.toISOString(),
                business,
              });

              const savedStock = await newStock.save();
              stockAdded.push(savedStock);
            } else {
              // If prices are the same, update the existing stock quantity
              existingStock.quantity += quantity;
              const updatedStock = await existingStock.save();
              stockAdded.push(updatedStock);
            }
          }
        }

        return {
          success: true,
          message: 'Stock added successfully',
          stock: stockAdded[0], // Returning the first stock added
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Internal server error',
        };
      }
    },

    updateStock: async (_, { input }, contextValue) => {
      const { stockId, quantity, costPrice } = input;
      const { business } = contextValue;

      try {
        // Check if the business is valid
        if (!business) {
          throw new GraphQLError('Business ID is Invalid', {
            extensions: {
              code: 'UNAUTHORIZED',
            },
          });
        }

        // Find the stock by ID for the given business
        const stock = await Stock.findOne({ _id: stockId, business });

        // If the stock doesn't exist, return an error
        if (!stock) {
          throw new GraphQLError('Stock not found', {
            extensions: {
              code: 'NOT_FOUND',
            },
          });
        }

        // Check if the costPrice is different from the existing stock costPrice
        if (costPrice !== undefined && costPrice !== stock.costPrice) {
          // Create a new stock entry with the updated costPrice and quantity
          const newStock = new Stock({
            name: stock.name,
            quantity: stock.quantity += quantity,
            costPrice,
            sellPrice: stock.sellPrice, // Retain the same sellPrice for the new stock
            date: new Date().toISOString(), // Optionally, set a new date for the new stock
            business,
          });

          // Save the new stock
          const savedNewStock = await newStock.save();

          return {
            success: true,
            message: 'New stock created due to a change in cost price',
            stock: savedNewStock,
          };
        } else {
          // Update the existing stock if the costPrice is the same
          if (quantity !== undefined) {
            stock.quantity = quantity;
          }
          // Save the updated stock
          const updatedStock = await stock.save();

          return {
            success: true,
            message: 'Stock updated successfully',
            stock: updatedStock,
          };
        }
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
