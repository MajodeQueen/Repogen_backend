const { GraphQLError } = require('graphql');
const Sales = require('../../models/SalesModel');
const Expenses = require('../../models/expensesModel');
const Debts = require('../../models/debtModel');
const Stock = require('../../models/StockModel');

const ReportsResolver = {
    Query: {
        productPerformance: async (_, { startDate, endDate }, { contextValue }) => {
            const { business } = contextValue;
            if (!business) {
                throw new GraphQLError('Business ID is invalid', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            try {
                const sales = await Sales.find({
                    business: business,  // Assuming the business object has an _id field
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                });

                const productPerformance = {};
                sales.forEach((sale) => {
                    if (!productPerformance[sale.productName]) {
                        productPerformance[sale.productName] = { quantitySold: 0, totalRevenue: 0 };
                    }
                    productPerformance[sale.productName].quantitySold += sale.quantity;
                    productPerformance[sale.productName].totalRevenue += sale.price * sale.quantity;
                });

                return Object.entries(productPerformance).map(([productName, data]) => ({
                    productName,
                    quantitySold: data.quantitySold,
                    totalRevenue: data.totalRevenue,
                    averagePrice: data.totalRevenue / data.quantitySold,
                }));
            } catch (error) {
                throw new Error("Error fetching product performance");
            }
        },

        salesReport: async (_, { startDate, endDate }, { contextValue }) => {
            const { business } = contextValue;
            if (!business) {
                throw new GraphQLError('Business ID is invalid', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            try {
                const sales = await Sales.find({
                    business: business,  // Filtering by businessId
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                });

                const totalSales = sales.reduce((sum, sale) => sum + sale.price * sale.quantity, 0);
                const numberOfTransactions = sales.length;

                const productPerformance = {};
                sales.forEach((sale) => {
                    if (!productPerformance[sale.productName]) {
                        productPerformance[sale.productName] = { quantitySold: 0, totalRevenue: 0 };
                    }
                    productPerformance[sale.productName].quantitySold += sale.quantity;
                    productPerformance[sale.productName].totalRevenue += sale.price * sale.quantity;
                });

                const topSellingProducts = Object.entries(productPerformance)
                    .map(([productName, data]) => ({
                        productName,
                        quantitySold: data.quantitySold,
                        totalRevenue: data.totalRevenue,
                        averagePrice: data.totalRevenue / data.quantitySold,
                    }))
                    .sort((a, b) => b.quantitySold - a.quantitySold)
                    .slice(0, 5);

                return {
                    totalSales,
                    numberOfTransactions,
                    averageTransactionValue: totalSales / numberOfTransactions,
                    topSellingProducts,
                };
            } catch (error) {
                throw new Error("Error generating sales report");
            }
        },

        expensesReport: async (_, { startDate, endDate }, { contextValue }) => {
            const { business } = contextValue;
            if (!business) {
                throw new GraphQLError('Business ID is invalid', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            try {
                const expenses = await Expenses.find({
                    business: business,  // Filtering by businessId
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                });

                const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
                const numberOfTransactions = expenses.length;

                const expensesByCategory = {};
                expenses.forEach((expense) => {
                    if (!expensesByCategory[expense.category]) {
                        expensesByCategory[expense.category] = 0;
                    }
                    expensesByCategory[expense.category] += expense.amount;
                });

                const expenseCategoriesSummary = Object.entries(expensesByCategory).map(([category, amount]) => ({
                    category,
                    amount,
                    percentage: (amount / totalExpenses) * 100,
                }));

                return {
                    totalExpenses,
                    numberOfTransactions,
                    averageTransactionValue: totalExpenses / numberOfTransactions,
                    expensesByCategory: expenseCategoriesSummary,
                };
            } catch (error) {
                throw new Error("Error generating expenses report");
            }
        },

        debtorsReport: async (_, { startDate, endDate }, { contextValue }) => {
            const { business } = contextValue;
            if (!business) {
                throw new GraphQLError('Business ID is invalid', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            try {
                const debtors = await Debts.find({
                    business: business,  // Filtering by businessId
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                });

                const totalDebt = debtors.reduce((sum, debtor) => sum + debtor.amountOwed, 0);
                const numberOfDebtors = debtors.length;

                const topDebtors = debtors
                    .sort((a, b) => b.amountOwed - a.amountOwed)
                    .slice(0, 5)
                    .map((debtor) => ({
                        debtorName: debtor.name,
                        amountOwed: debtor.amountOwed,
                    }));

                return {
                    totalDebt,
                    numberOfDebtors,
                    averageDebtPerDebtor: totalDebt / numberOfDebtors,
                    topDebtors,
                };
            } catch (error) {
                throw new Error("Error generating debtors report");
            }
        },

        profitLossReport: async (_, { startDate, endDate }, { contextValue }) => {
            const { business } = contextValue;
            if (!business) {
                throw new GraphQLError('Business ID is invalid', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            try {
                const sales = await Sales.find({
                    business: business,  // Filtering by businessId
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                });
                const expenses = await Expenses.find({
                    business: business,  // Filtering by businessId
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                });

                const totalRevenue = sales.reduce((sum, sale) => sum + sale.price * sale.quantity, 0);
                const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
                const grossProfit = totalRevenue - totalExpenses;
                const netProfit = grossProfit; // Assuming no taxes or other deductions for simplicity

                return {
                    totalRevenue,
                    totalExpenses,
                    grossProfit,
                    netProfit,
                    profitMargin: (netProfit / totalRevenue) * 100,
                };
            } catch (error) {
                throw new Error("Error generating profit/loss report");
            }
        },

        stockReport: async (_, { startDate, endDate }, { contextValue }) => {
            const { business } = contextValue;
            if (!business) {
                throw new GraphQLError('Business ID is invalid', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            try {
                const stockItems = await Stock.find({
                    business: business,  // Filtering by businessId
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                });

                const totalStockValue = stockItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
                const numberOfItems = stockItems.length;

                const lowStockThreshold = 10; // Example threshold, adjust as needed
                const lowStockItems = stockItems
                    .filter((item) => item.quantity > 0 && item.quantity <= lowStockThreshold)
                    .map((item) => ({
                        productName: item.productName,
                        quantity: item.quantity,
                        value: item.quantity * item.price,
                    }));

                const outOfStockItems = stockItems
                    .filter((item) => item.quantity === 0)
                    .map((item) => ({
                        productName: item.productName,
                        quantity: 0,
                        value: 0,
                    }));

                return {
                    totalStockValue,
                    numberOfItems,
                    lowStockItems,
                    outOfStockItems,
                };
            } catch (error) {
                throw new Error("Error generating stock report");
            }
        },
    },
};

module.exports = ReportsResolver;
