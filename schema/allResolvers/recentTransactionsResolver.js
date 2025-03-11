const Business = require("../../models/businessModel");
const Expenses = require("../../models/expensesModel");
const Sales = require("../../models/SalesModel");
const ServiceSales = require("../../models/serviceSalesModel");
const Stock = require("../../models/StockModel");
const User = require("../../models/userModel");

const RecentTransactionsResolver = {
    Mutation: {
        deleteEntry: async (_, { input }, contextValue) => {
            const { type, transactionID } = input;
            try {
                const { business, user } = contextValue;

                // 1. Check authentication
                if (!business) {
                    throw new GraphQLError('No Business Session', {
                        extensions: { code: 'UNAUTHENTICATED' },
                    });
                }

                if (!user) {
                    throw new GraphQLError('No User Session', {
                        extensions: { code: 'UNAUTHENTICATED' },
                    });
                }

                const actualBusiness = await Business.findById(business.id);
                const actualUser = await User.findById(user.id);

                const userId = actualUser.id.toString();

                // 2. Check if user has permission
                if (!actualBusiness.editors.includes(userId) && !actualBusiness.admins.includes(userId)) {
                    throw new GraphQLError('Access Denied ......', {
                        extensions: { code: 'UNAUTHENTICATED' },
                    });
                }

                let model;

                switch (type) {
                    case "sale":
                        model = Sales;
                        break;
                    case "service_sale":
                        model = ServiceSales;
                        break;
                    case "expense":
                        model = Expenses;
                        break;
                    case "stock":
                        model = Stock;
                        break;
                    default:
                        throw new Error("Invalid type provided");
                }

                // 3. Special case: If type is "sale", update stock before deletion
                if (type === "sale") {
                    const saleTransaction = await Sales.findById(transactionID);
                    if (!saleTransaction) {
                        throw new GraphQLError('Sale transaction not found', {
                            extensions: { code: 'NOT_FOUND' },
                        });
                    }

                    const { productDetails, quantity } = saleTransaction;

                    if (!productDetails) {
                        throw new GraphQLError('Product details missing in sale transaction', {
                            extensions: { code: 'INVALID_DATA' },
                        });
                    }

                    // Find the actual product in stock
                    const stockItem = await Stock.findById(productDetails);
                    if (!stockItem) {
                        throw new GraphQLError('Associated stock item not found', {
                            extensions: { code: 'NOT_FOUND' },
                        });
                    }

                    // Update the stock quantity (restore quantity)
                    stockItem.quantity += quantity;
                    await stockItem.save();
                }

                // 4. Special case: If type is "stock", reduce quantity before deletion
                if (type === "stock") {
                    const stockEntry = await Stock.findById(transactionID);
                    if (!stockEntry) {
                        throw new GraphQLError('Stock entry not found', {
                            extensions: { code: 'NOT_FOUND' },
                        });
                    }

                    const { quantity, _id } = stockEntry;

                    // Find the corresponding stock product
                    const stockItem = await Stock.findById(_id);
                    if (!stockItem) {
                        throw new GraphQLError('Associated stock product not found', {
                            extensions: { code: 'NOT_FOUND' },
                        });
                    }

                    // Reduce the stock quantity
                    stockItem.quantity -= quantity;
                    if (stockItem.quantity < 0) stockItem.quantity = 0; // Ensure quantity doesn't go negative
                    await stockItem.save();
                }

                // 5. Delete the transaction
                await model.findByIdAndDelete(transactionID);

                return {
                    success: true,
                    message: "Entry Deleted",
                };
            } catch (error) {
                console.error(error);
                return {
                    success: false,
                    message: 'Delete Failed',
                };
            }
        }
    },

    Query: {
        recentEntries: async (_, { type }) => {
            try {
                const today = startOfDay(new Date());
                let model;

                // Step 1: Determine the model based on the type
                switch (type) {
                    case "sale":
                        model = Sales;
                        break;
                    case "service_sale":
                        model = ServiceSales;
                        break;
                    case "expense":
                        model = Expenses;
                        break;
                    case "stock":
                        model = Stock;
                        break;
                    default:
                        throw new Error("Invalid type provided");
                }

                let entries = await model.find({ date: { $gte: today } }).sort({ date: -1 });
                let entryDate = today; // Default to today

                // Step 2: If no entries today, find the most recent date with entries
                if (entries.length === 0) {
                    const mostRecentEntry = await model.findOne().sort({ date: -1 });

                    if (mostRecentEntry) {
                        entryDate = startOfDay(mostRecentEntry.date);

                        entries = await model.find({
                            date: { $gte: entryDate, $lt: new Date(entryDate.getTime() + 86400000) },
                        }).sort({ date: -1 });
                    }
                }

                // Step 3: If no entries, return an empty array with a null date
                if (entries.length === 0) {
                    return { date: null, entries: [] };
                }

                // Step 4: Transform entries to match GraphQL types
                let formattedEntries;
                switch (type) {
                    case "sale":
                        formattedEntries = entries.map((entry) => ({
                            _id: entry._id,
                            customerName: entry.customerName,
                            date: entry.date,
                            quantity: entry.quantity,
                            productDetails: entry.productDetails,
                            amount: entry.amount,
                            paymentMode: entry.paymentMode,
                            __typename: "SalesData",
                        }));
                        break;
                    case "service_sale":
                        formattedEntries = entries.map((entry) => ({
                            _id: entry._id,
                            serviceName: entry.serviceName,
                            date: entry.date,
                            quantity: entry.quantity,
                            amount: entry.amount,
                            paymentMode: entry.paymentMode,
                            __typename: "ServicesSalesData",
                        }));
                        break;
                    case "expense":
                        formattedEntries = entries.map((entry) => ({
                            _id: entry._id,
                            expenseName: entry.expenseName,
                            date: entry.date,
                            amount: entry.amount,
                            category: entry.category,
                            __typename: "Expenses",
                        }));
                        break;
                    case "stock":
                        formattedEntries = entries.map((entry) => ({
                            _id: entry._id,
                            name: entry.name,
                            quantity: entry.quantity,
                            costPrice: entry.costPrice,
                            sellPrice: entry.sellPrice,
                            date: entry.date,
                            __typename: "StockData",
                        }));
                        break;
                }

                return { date: entryDate, entries: formattedEntries };
            } catch (error) {
                console.error("Error fetching recent entries:", error);
                throw new Error("Failed to fetch recent entries");
            }
        },
    },
};


module.exports = RecentTransactionsResolver;
