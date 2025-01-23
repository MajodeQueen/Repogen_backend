const Debts = require('../../models/debtModel');

const DebtsResolver = {
  Mutation: {
    addDebts: async (_, { input }, contextValue) => {
      try {
        const { debtorName, date, amount, dueDate } = input;
        const { business } = contextValue;
        if (!business) {
          throw new Error('Business ID is invalid');
        }

        if (!debtorName || !date || !amount || !dueDate ) {
          throw new Error(
            'All fields are required: debtorName, date, amount, dueDate, and debtStatus'
          );
        }
        const newEntry = new Debts({
          debtorName,
          date: new Date(date).toISOString(),
          amount,
          dueDate,
          business,
          debtStatus,
        });
        await newEntry.save();

        return {
          success: true,
          message: 'Debt entry created successfully',
          debt: newEntry,
        };
      } catch (err) {
        if (err.name === 'ValidationError') {
          return {
            success: false,
            message: `Validation error: ${err.message}`,
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
    allDebts: async (_, __, contextValue) => {
      try {
        const { business } = contextValue;
        if (!business) {
          throw new Error('Business ID is invalid');
        }
        const debts = await Debts.find({ business });
        return {
          success: true,
          message: 'Debts retrieved successfully',
          debts,
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

module.exports  = DebtsResolver;
