const Expenses = require('../../models/expensesModel');

const ExpensesResolver = {
  Mutation: {
    addExpenses: async (_, { input }, contextValue) => {
      try {
        const { business } = contextValue;
        const { expenseName, date, amount, category } = input;
        if (!business) {
          throw new Error('Business ID is invalid');
        }
        if (!expenseName || !date || !amount || !category) {
          throw new Error(
            'All fields are required: expenseName, date, amount, and category'
          );
        }
        const newEntry = new Expenses({
          expenseName,
          amount,
          category,
          business,
          date: new Date(date).toISOString(),
        });
        await newEntry.save();
        return {
          success: true,
          message: 'Expense entry created successfully',
          expense: newEntry,
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
    allExpenses: async (_, __, contextValue) => {
      try {
        const { business } = contextValue;
        if (!business) {
          throw new Error('Business ID is invalid');
        }
        const expenses = await Expenses.find({ business });
        return {
          success: true,
          message: 'Expenses retrieved successfully',
          expenses,
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Internal server error',
        };
      }
    },
    getMonthlyExpenses: async (_, { year }, contextValue) => {
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
        const monthlyExpenses = [];

        // Loop through each month (1 to 12)
        for (let month = 1; month <= 12; month++) {
          // Query sales for the current month and year
          const expensesForMonth = await Expenses.find({
            business: business,
            $expr: {
              $and: [
                { $eq: [{ $year: { $toDate: '$date' } }, year] }, // Match year
                { $eq: [{ $month: { $toDate: '$date' } }, month] }, // Match month
              ],
            },
          });

          // Calculate total sales for the month
          const totalAmount = expensesForMonth.reduce((sum, expense) => sum + expense.amount, 0);

          // Add the month's data to the array
          monthlyExpenses.push({
            month: monthNames[month - 1], // Use month name instead of number
            totalAmount: totalAmount,
          });
        }

        return {
          success: true,
          message: `Monthly revenue for ${year} retrieved successfully`,
          data: monthlyExpenses.length > 0 ? monthlyExpenses : [],
        };
      } catch (err) {
        console.error("Error in getMonthlyRevenue:", err);
        return {
          success: false,
          message: err.message || "Internal server error",
        };
      }
    },
  },
};
module.exports = ExpensesResolver;
