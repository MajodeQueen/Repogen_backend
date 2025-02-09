const Debts = require('../../models/debtModel');
const Sales = require('../../models/SalesModel');

const DebtsResolver = {
  Mutation: {
    addDebts: async (_, { input }, contextValue) => {
      try {
        const { debtorName, date, amount, dueDate } = input;
        const { business } = contextValue;
        if (!business) {
          throw new Error('Business ID is invalid');
        }

        if (!debtorName || !date || !amount || !dueDate) {
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
    updateDebtPayment: async (_, { input }, contextValue) => {
      try {
        const { business } = contextValue;
        const { debtId, amountPaid } = input;

        if (!business) {
          throw new Error('Business ID is invalid');
        }

        // Find the debt by ID and ensure it exists
        const debt = await Debts.findOne({ _id: debtId, business });
        if (!debt) {
          throw new Error('Debt not found');
        }

        // Update the debt amount and calculate the new balance
        const updatedAmount = debt.amount - amountPaid;

        // Ensure the payment doesn't exceed the amount owed
        if (updatedAmount < 0) {
          return {
            success: false,
            message: 'Amount paid exceeds the debt balance',
          };
        }

        // If the debt is fully paid off, delete it
        if (updatedAmount === 0) {
          await Debts.deleteOne({ _id: debtId }); // Delete the debt entry
          return {
            success: true,
            message: 'Debt paid off and deleted successfully',
          };
        }

        // Otherwise, update the debt amount
        debt.amount = updatedAmount;

        // Save the updated debt entry
        await debt.save();

        return {
          success: true,
          message: 'Debt updated successfully',
          debt: debt,
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
    allDebts: async (_, __, contextValue) => {
      try {
        const { business } = contextValue;
        if (!business) {
          throw new Error('Business ID is invalid');
        }

        // Fetch all sales with paymentMode as "credit"
        const creditSales = await Sales.find({ business, paymentMode: 'credit' });

        for (const sale of creditSales) {
          const existingDebt = await Debts.findOne({ business, saleID: sale });

          if (!existingDebt) {
            // Create a new debt entry
            await Debts.create({
              debtorName: sale.customerName,
              date: sale.date,
              amount: sale.amount,
              dueDate: new Date(new Date(sale.date).setMonth(new Date(sale.date).getMonth() + 1)).toISOString(), // Due date set to 1 month later
              business: sale.business,
              debtStatus: 'pending',
              saleID: sale, // Linking debt to sale
            });
          }
        }

        // Retrieve all debts after ensuring all are created
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

module.exports = DebtsResolver;
