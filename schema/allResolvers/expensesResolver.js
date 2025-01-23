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
  },
};
module.exports = ExpensesResolver;
