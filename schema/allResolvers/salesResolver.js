const { GraphQLError } = require('graphql');
const Sales = require('../../models/SalesModel');
const Stock = require('../../models/StockModel');

const SalesResolver = {
  Mutation: {
    addSales: async (_, { input }, contextValue) => {
      try {
        const {
          customerName,
          quantity,
          productDetails, // Assuming productDetails contains product ID and other necessary information
          amount,
          paymentMode,
          date,
        } = input;
        const { business } = contextValue;

        // Check if business context exists
        if (!business) {
          throw new GraphQLError('No Business Session', {
            extensions: {
              code: 'UNAUTHENTICATED',
            },
          });
        }

        // Validate that all required fields are present
        if (
          !customerName ||
          !quantity ||
          !productDetails ||
          !amount ||
          !paymentMode ||
          !date
        ) {
          throw new GraphQLError(
            'All fields are required: customerName, quantity, productId, amount, paymentMode, and date',
            {
              extensions: {
                code: 'ValidationFields',
              },
            }
          );
        }
        const product = await Stock.findById(productDetails.productId); // Assuming productDetails contains productId
        if (!product) {
          throw new GraphQLError('Product not found', {
            extensions: {
              code: 'PRODUCT_NOT_FOUND',
            },
          });
        }

        if (product.quantity < quantity) {
          throw new GraphQLError('Insufficient stock for this product', {
            extensions: {
              code: 'INSUFFICIENT_STOCK',
            },
          });
        }

        // Create the sale entry
        const newEntry = new Sales({
          business,
          customerName,
          quantity,
          productDetails,
          amount,
          paymentMode,
          date: new Date(date).toISOString(),
        });

        // Save the sale entry
        await newEntry.save();

        // Update the product quantity
        product.quantity -= quantity; // Subtract the sold quantity from the product's stock
        await product.save(); // Save the updated product

        return {
          success: true,
          message: 'Sales entry created successfully, product quantity updated',
          sale: newEntry,
        };
      } catch (err) {
        if (err.extensions && err.extensions.code === 'UNAUTHENTICATED') {
          return {
            success: false,
            message: 'Authentication error: No Business Session',
          };
        } else if (
          err.extensions &&
          err.extensions.code === 'PRODUCT_NOT_FOUND'
        ) {
          return {
            success: false,
            message: 'Product not found',
          };
        } else if (
          err.extensions &&
          err.extensions.code === 'INSUFFICIENT_STOCK'
        ) {
          return {
            success: false,
            message: 'Insufficient stock for the product',
          };
        }
        return {
          success: false,
          message: err.message || 'Internal server error',
        };
      }
    },
  },
  Query: {
    allSales: async (_, __, contextValue) => {
      try {
        const { business } = contextValue;
        if (!business) {
          throw new Error('Business ID is invalid');
        }
        const entries = await Sales.find({ business });
        return {
          success: true,
          message: 'Sales entries retrieved successfully',
          sales: entries,
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

module.exports = SalesResolver;
