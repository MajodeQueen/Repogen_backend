const { GraphQLError } = require('graphql');
const Sales = require('../../models/SalesModel');
const Stock = require('../../models/StockModel');

const SalesResolver = {
  Mutation: {
    addSales: async (_, { input }, contextValue) => {
      try {
        const { customerName, date, saleItems, paymentMode } = input;
        const { business } = contextValue;

        // 1. Check if business session exists
        if (!business) {
          throw new GraphQLError('No Business Session', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }

        // 2. Validate required fields
        if (!saleItems || saleItems.length === 0 || !paymentMode || !date) {
          throw new GraphQLError(
            'All fields are required: customerName, saleItems, paymentMode, and date',
            { extensions: { code: 'VALIDATION_ERROR' } }
          );
        }

        // 3. Validate date format
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          throw new GraphQLError('Invalid date format. Use YYYY-MM-DD or ISO 8601.', {
            extensions: { code: 'INVALID_DATE' },
          });
        }

        // Array to store created sales
        const createdSales = [];

        // 4. Process each sale item separately
        for (const item of saleItems) {
          const { productId, quantity, price } = item;

          // 4a. Fetch the product from stock
          const product = await Stock.findById(productId);
          if (!product) {
            throw new GraphQLError(`Product with ID ${productId} not found`, {
              extensions: { code: 'PRODUCT_NOT_FOUND' },
            });
          }

          // 4b. Validate stock quantity
          if (quantity.amount <= 0) {
            throw new GraphQLError('Quantity must be greater than zero', {
              extensions: { code: 'INVALID_QUANTITY' },
            });
          }

          if (product.quantity < quantity.amount) {
            throw new GraphQLError(
              `Insufficient stock for ${product.name}. Available: ${product.quantity + product.quantityUnit}, Requested: ${quantity.amount + quantity.unit}`,
              { extensions: { code: 'INSUFFICIENT_STOCK' } }
            );
          }

          // 5. Create the individual sale entry
          const newSale = new Sales({
            business,
            customerName,
            quantity,
            quantityUnit: quantity.unit,
            productDetails: product,
            amount: price,
            paymentMode,
            date: parsedDate.toISOString(),
          });

          const savedSale = await newSale.save();
          createdSales.push(savedSale);

          // 6. Update product stock quantity
          product.quantity -= quantity.amount;
          await product.save();
        }

        // 7. Return the first created sale entry
        return {
          success: true,
          message: 'Sales recorded successfully',
          sale: createdSales[0],
        };
      } catch (err) {
        console.error('Error in addSales:', err);

        return {
          success: false,
          message: err.message || 'Internal server error',
          extensions: err.extensions || { code: 'INTERNAL_SERVER_ERROR' },
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
        const entries = await Sales.find({ business })
          .populate('productDetails')
          .exec();
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
    getMonthlySalesStats: async (_, { input }, contextValue) => {
      const { year, month } = input

      try {
        const { business } = contextValue;
        if (!business) {
          throw new Error('Business ID is invalid');
        }

        // Ensure month is within valid range (1 - 12)
        if (month < 1 || month > 12) {
          throw new Error('Invalid month value. Month should be between 1 and 12.');
        }


        // Handle previous month correctly
        let prevYear = year;
        let prevMonth = month - 1;


        if (prevMonth < 1) {
          prevMonth = 12;
          prevYear -= 1;
        }

        const currentMonthSales = await Sales.find({
          business: business,
          $expr: {
            $and: [
              { $eq: [{ $year: { $toDate: '$date' } }, year] },
              { $eq: [{ $month: { $toDate: '$date' } }, month] },
            ],
          },
        });



        const prevMonthSales = await Sales.find({
          business: business,
          $expr: {
            $and: [
              { $eq: [{ $year: { $toDate: '$date' } }, year] },
              { $eq: [{ $month: { $toDate: '$date' } }, prevMonth] },
            ],
          },
        });
        const currentMonthTotalSales = currentMonthSales.length > 0 ? currentMonthSales.length : 0;
        const currentMonthTotalAmount = currentMonthSales.reduce((sum, sale) => sum + sale.amount, 0);

        const prevMonthTotalSales = prevMonthSales.length > 0 ? prevMonthSales.length : 0;
        const prevMonthTotalAmount = prevMonthSales.reduce((sum, sale) => sum + sale.amount, 0);

        // Calculate percentage differences
        const percentageDifferenceAmount = prevMonthTotalAmount
          ? ((currentMonthTotalAmount - prevMonthTotalAmount) / prevMonthTotalAmount) * 100
          : currentMonthTotalAmount
            ? 100
            : 0;

        const percentageDifferenceSales = prevMonthTotalSales
          ? ((currentMonthTotalSales - prevMonthTotalSales) / prevMonthTotalSales) * 100
          : currentMonthTotalSales
            ? 100
            : 0;

        return {
          success: true,
          message: 'Monthly sales statistics retrieved successfully',
          month,
          year,
          totalSales: currentMonthTotalSales,
          totalAmount: currentMonthTotalAmount,
          percentageDifferenceAmount: percentageDifferenceAmount.toFixed(2),
          percentageDifferenceSales: percentageDifferenceSales.toFixed(2),
        };
      } catch (err) {

        return {
          success: false,
          message: err.message || 'Internal server error',
          month: null,
          year: null,
          totalSales: null,
          totalAmount: null,
          percentageDifferenceAmount: null,
          percentageDifferenceSales: null,
        };
      }
    },


    getMonthlyRevenue: async (_, { year }, contextValue) => {
      try {
        const { business } = contextValue;
        if (!business) {
          throw new GraphQLError('Business ID is invalid', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }

        // Validate year input
        if (!year || typeof year !== 'number' || year.toString().length !== 4) {
          throw new GraphQLError('Invalid year provided', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        // Array of month names in English
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        // Array to store monthly revenue data
        const monthlyRevenue = [];

        // Loop through each month (1 to 12)
        for (let month = 1; month <= 12; month++) {
          // Query sales for the current month and year
          const salesForMonth = await Sales.find({
            business: business,
            $expr: {
              $and: [
                { $eq: [{ $year: { $toDate: '$date' } }, year] }, // Match year
                { $eq: [{ $month: { $toDate: '$date' } }, month] }, // Match month
              ],
            },
          });

          // Calculate total sales for the month
          const totalAmount = salesForMonth.reduce((sum, sale) => sum + sale.amount, 0);

          // Add the month's data to the array
          monthlyRevenue.push({
            month: monthNames[month - 1], // Use month name instead of number
            totalAmount: totalAmount,
          });
        }

        return {
          success: true,
          message: `Monthly revenue for ${year} retrieved successfully`,
          data: monthlyRevenue.length > 0 ? monthlyRevenue : [],
        };
      } catch (err) {
        console.error("Error in getMonthlyRevenue:", err);
        return {
          success: false,
          message: err.message || "Internal server error",
          data: null
        };
      }
    },
  }
};

module.exports = SalesResolver;
