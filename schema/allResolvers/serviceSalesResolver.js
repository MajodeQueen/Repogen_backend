const { GraphQLError } = require('graphql');
const ServiceSales = require('../../models/serviceSalesModel');
const Description = require('../../models/ServicesDescriptionsModel');
const summarizePayments = require('../../performaceBasedOnAmountMade');


const ServicesSalesResolver = {
    Mutation: {
        addServiceSales: async (_, { input }, contextValue) => {
            try {
                const { date, saleEntries } = input;
                const { business } = contextValue;

                if (!business) {
                    throw new GraphQLError('No Business Session', {
                        extensions: { code: 'UNAUTHENTICATED' },
                    });
                }

                if (!saleEntries || saleEntries.length === 0 || !date) {
                    throw new GraphQLError('All fields are required: date and saleEntries', {
                        extensions: { code: 'VALIDATION_ERROR' },
                    });
                }

                const parsedDate = new Date(date);
                if (isNaN(parsedDate.getTime())) {
                    throw new GraphQLError('Invalid date format. Use YYYY-MM-DD or ISO 8601.', {
                        extensions: { code: 'INVALID_DATE' },
                    });
                }

                const createdSales = [];
                for (const entry of saleEntries) {
                    const { serviceName, quantity, salePrice, paymentMode } = entry;

                    if (!serviceName || quantity <= 0 || !salePrice || !paymentMode) {
                        throw new GraphQLError('Invalid sale entry data', {
                            extensions: { code: 'INVALID_INPUT' },
                        });
                    }
                    const newSale = new ServiceSales({
                        business,
                        serviceName,
                        quantity,
                        amount: salePrice,
                        paymentMode,
                        date: parsedDate.toISOString(),
                    });

                    const savedSale = await newSale.save();
                    createdSales.push(savedSale);
                }

                return {
                    success: true,
                    message: 'Service sales recorded successfully',
                    serviceSale: createdSales[0],
                };
            } catch (err) {
                console.error('Error in addSales:', err);
                return {
                    success: false,
                    message: err.message || 'Internal server error',
                    serviceSale: null,
                };
            }
        },
    },
    Query: {
        allServiceSales: async (_, __, contextValue) => {
            try {
                const { business } = contextValue;
                if (!business) {
                    throw new Error('Business ID is invalid');
                }

                const entries = await ServiceSales.find({ business }).exec();
                return {
                    success: true,
                    message: 'Service sales entries retrieved successfully',
                    serviceSales: entries,
                };
            } catch (err) {
                return {
                    success: false,
                    message: err.message || 'Internal server error',
                    serviceSales: null
                };
            }
        },
        getMonthlyServiceSalesStats: async (_, { input }, contextValue) => {
            const { year, month } = input;
            try {
                const { business } = contextValue;
                if (!business) {
                    throw new Error('Business ID is invalid');
                }

                if (month < 1 || month > 12) {
                    throw new Error('Invalid month value. Month should be between 1 and 12.');
                }

                let prevYear = year;
                let prevMonth = month - 1;


                if (prevMonth < 1) {
                    prevMonth = 12;
                    prevYear -= 1;
                }

                const currentMonthSales = await ServiceSales.find({
                    business,
                    $expr: {
                        $and: [
                            { $eq: [{ $year: { $toDate: '$date' } }, year] },
                            { $eq: [{ $month: { $toDate: '$date' } }, month] },
                        ],
                    },
                });

                const allServices = await Description.find({ business });

                const activeServices = allServices.length;



                const prevMonthSales = await ServiceSales.find({
                    business: business,
                    $expr: {
                        $and: [
                            { $eq: [{ $year: { $toDate: '$date' } }, year] },
                            { $eq: [{ $month: { $toDate: '$date' } }, prevMonth] },
                        ],
                    },
                });
                const totalSales = currentMonthSales.length;
                const totalAmount = currentMonthSales.reduce((sum, sale) => sum + sale.amount, 0);

                const prevMonthTotalSales = prevMonthSales.length > 0 ? prevMonthSales.length : 0;
                const prevMonthTotalAmount = prevMonthSales.reduce((sum, sale) => sum + sale.amount, 0);

                // Calculate percentage differences
                const percentageDifferenceAmount = prevMonthTotalAmount
                    ? ((totalAmount - prevMonthTotalAmount) / prevMonthTotalAmount) * 100
                    : totalAmount
                        ? 100
                        : 0;

                const percentageDifferenceSales = prevMonthTotalSales
                    ? ((totalSales - prevMonthTotalSales) / prevMonthTotalSales) * 100
                    : totalSales
                        ? 100
                        : 0;

                return {
                    success: true,
                    message: 'Monthly service sales statistics retrieved successfully',
                    month,
                    year,
                    totalSales,
                    totalAmount,
                    percentageDifference: percentageDifferenceSales,
                    percentageDifferenceAmount,
                    activeServices
                };
            } catch (err) {
                return {
                    success: false,
                    message: err.message || 'Internal server error',
                    month: null,
                    year: null,
                    totalSales: null,
                    totalAmount: null,
                    percentageDifference: null,
                    percentageDifferenceAmount: null,
                    activeServices: null
                };

            }
        },
        getMonthlyServiceSalesPerDay: async (_, { input }, contextValue) => {
            const { year, month } = input;
            try {
                const { business } = contextValue;
                if (!business) {
                    throw new Error('Business ID is invalid');
                }
                if (month < 1 || month > 12) {
                    throw new Error('Invalid month value. Month should be between 1 and 12.');
                }

                function getDatesInMonth(year, month) {
                    const today = new Date();
                    const lastDay = new Date(year, month, 0);  // Get the last day of the month
                    const dates = [];

                    // Loop through all the days of the month and add them to the array
                    for (let day = 1; day <= lastDay.getDate(); day++) {
                        const date = new Date(year, month - 1, day);

                        // Include all dates that are before or equal to today
                        if (date <= today) {
                            // Format the date as YYYY-MM-DD and add to the array
                            dates.push(date.toISOString().split('T')[0]);
                        }
                    }

                    return dates;
                }

                function formatDateToYYYYMMDD(dateString) {
                    const date = new Date(dateString);

                    // Get the year, month, and day
                    const year = date.getFullYear();
                    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
                    const day = date.getDate().toString().padStart(2, '0');

                    // Return the formatted date
                    return `${year}-${month}-${day}`;
                }


                const sales = await ServiceSales.find({ business }).exec();

                const datesInMonth = getDatesInMonth(year, month);

                // Initialize array3 to store the result of dates with their total amounts
                const salesPerDay = [];



                datesInMonth.forEach(date => {
                    // Filter all sales that match the current date
                    const salesForDate = sales.filter(sale => formatDateToYYYYMMDD(sale.date) === date);

                    // Sum the amounts for this date
                    const totalAmount = salesForDate.reduce((sum, sale) => sum + sale.amount, 0);

                    // Push the date and the total amount into the result array
                    salesPerDay.push({ date, totalAmount });
                });

                console.log(salesPerDay)

                // console.log('Sales per day:', salesPerDay);

                return {
                    success: true,
                    message: `Sales statistics retrieved successfully for ${month}/${year} up to today`,
                    year,
                    month,
                    salesPerDay
                };
            } catch (err) {
                console.error('Error in getMonthlyServiceSalesPerDay:', err);
                return {
                    success: false,
                    message: err.message || 'Internal server error',
                    month: null,
                    year: null,
                    salesPerDay: null
                };
            }
        },


        getProductPerformanceBasedOnNoOfSales: async (_, { input }, contextValue) => {
            const { month, year } = input
            try {
                const { business } = contextValue;
                if (!business) {
                    throw new GraphQLError('Business ID is invalid', {
                        extensions: { code: 'UNAUTHENTICATED' },
                    });
                }

                if (!year || typeof year !== 'number' || year.toString().length !== 4) {
                    throw new GraphQLError('Invalid year provided', {
                        extensions: { code: 'BAD_USER_INPUT' },
                    });
                }

                const salesForMonth = await ServiceSales.find({
                    business,
                    $expr: {
                        $and: [
                            { $eq: [{ $year: { $toDate: '$date' } }, year] },
                            { $eq: [{ $month: { $toDate: '$date' } }, month] },
                        ],
                    },
                });

                const servicePerformanceAccordingToSales = summarizePayments(salesForMonth)

                // console.log(servicePerformanceAccordingToNoOfSale)
                return {
                    success: true,
                    message: `Monthly service revenue for ${year} retrieved successfully`,
                    servicePerformanceAccordingToSales: servicePerformanceAccordingToSales
                };
            } catch (err) {
                return {
                    success: false,
                    message: err.message || 'Internal server error',
                    servicePerformanceAccordingToSales: null
                };
            }

        },

        getMonthlyServiceRevenue: async (_, { year }, contextValue) => {
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
                    const salesForMonth = await ServiceSales.find({
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

        getWeeklyDataServiceSales: async (_, { input }) => {
            const { month, year } = input;
            try {
                // Retrieve all sales for the given month
                const sales = await ServiceSales.find({
                    date: {
                        $gte: new Date(`${year}-01-01`).toISOString(),
                        $lte: new Date(`${year}-${month + 1}-01`).toISOString()
                    }
                });

                // Group sales by week
                const weeklyData = {};

                sales.forEach((sale) => {
                    const date = new Date(sale.date); // Convert string to Date
                    if (!isNaN(date)) { // Check if it's a valid date
                        const weekOfMonth = Math.ceil(date.getDate() / 7); // Calculate the week of the month
                        if (!weeklyData[weekOfMonth]) {
                            weeklyData[weekOfMonth] = { totalAmount: 0, count: 0, items: [] };
                        }
                        weeklyData[weekOfMonth].totalAmount += sale.amount;
                        weeklyData[weekOfMonth].count += 1;
                        weeklyData[weekOfMonth].items.push(sale);
                    } else {
                        console.log("Invalid date:", sale.date);
                    }
                });

                // Transform the weeklyData object into an array of WeeklyData objects
                const formattedData = Object.keys(weeklyData).map((weekOfMonth) => ({
                    weekOfMonth: Number(weekOfMonth),
                    totalAmount: weeklyData[weekOfMonth].totalAmount,
                    count: weeklyData[weekOfMonth].count,
                    items: weeklyData[weekOfMonth].items
                }));

                console.log(formattedData)

                // Ensure that 'data' is always an array or null
                return {
                    success: true,
                    message: `Weekly revenue for ${year} retrieved successfully`,
                    data: formattedData.length > 0 ? formattedData : null // Return null if no data is found
                };
            } catch (err) {
                console.error(err);
                return {
                    success: false,
                    message: `Weekly revenue for ${year} retrieved unsuccessfully`,
                    data: null
                };
            }
        },

        // getProductPerformanceBasedOnNoOfSalesOfWeekYearAndMonth: async (_, { input }, contextValue) => {
        //     const { month, year, type } = input; // 'type' can be 'monthly', 'annual', or 'weekly'

        //     try {
        //         const { business } = contextValue;

        //         // Validate business context
        //         if (!business) {
        //             throw new GraphQLError('Business ID is invalid', {
        //                 extensions: { code: 'UNAUTHENTICATED' },
        //             });
        //         }

        //         // Validate year input
        //         if (!year || typeof year !== 'number' || year.toString().length !== 4) {
        //             throw new GraphQLError('Invalid year provided', {
        //                 extensions: { code: 'BAD_USER_INPUT' },
        //             });
        //         }

        //         let salesForPeriod = [];

        //         // Handle different query types: monthly, annual, weekly
        //         if (type === 'monthly' && month) {
        //             // Query for monthly sales
        //             salesForPeriod = await ServiceSales.find({
        //                 business,
        //                 $expr: {
        //                     $and: [
        //                         { $eq: [{ $year: { $toDate: '$date' } }, year] },
        //                         { $eq: [{ $month: { $toDate: '$date' } }, month] },
        //                     ],
        //                 },
        //             });
        //         } else if (type === 'annual') {
        //             // Query for annual sales
        //             salesForPeriod = await ServiceSales.find({
        //                 business,
        //                 $expr: { $eq: [{ $year: { $toDate: '$date' } }, year] },
        //             });
        //         } else if (type === 'weekly' && month) {
        //             // Query for weekly sales performance within a specific month and year
        //             salesForPeriod = await ServiceSales.find({
        //                 business,
        //                 $expr: {
        //                     $and: [
        //                         { $eq: [{ $year: { $toDate: '$date' } }, year] },
        //                         { $eq: [{ $month: { $toDate: '$date' } }, month] },
        //                     ],
        //                 },
        //             });

        //             // Group by week of the month
        //             const weeklyPerformance = salesForPeriod.reduce((acc, sale) => {
        //                 const date = new Date(sale.date);
        //                 if (!isNaN(date)) {
        //                     const weekOfMonth = Math.ceil(date.getDate() / 7); // Week number in the month
        //                     if (!acc[weekOfMonth]) acc[weekOfMonth] = { totalAmount: 0, count: 0, items: [] };
        //                     acc[weekOfMonth].totalAmount += sale.amount;
        //                     acc[weekOfMonth].count += 1;
        //                     acc[weekOfMonth].items.push(sale);
        //                 }
        //                 return acc;
        //             }, {});

        //             // Convert to array
        //             salesForPeriod = Object.keys(weeklyPerformance).map(week => ({
        //                 weekOfMonth: parseInt(week),
        //                 totalAmount: weeklyPerformance[week].totalAmount,
        //                 count: weeklyPerformance[week].count,
        //                 items: weeklyPerformance[week].items,
        //             }));
        //         }


        //         // Summarize the sales data
        //         const servicePerformanceAccordingToSales = type === 'weekly' ? salesForPeriod : summarizePayments(salesForPeriod);

        //         return {
        //             success: true,
        //             message: `${type.charAt(0).toUpperCase() + type.slice(1)} service revenue for ${year} retrieved successfully`,
        //             servicePerformanceAccordingToSales,
        //         };
        //     } catch (err) {
        //         console.error(err);
        //         return {
        //             success: false,
        //             message: err.message || 'Internal server error',
        //             servicePerformanceAccordingToSales: null,
        //         };
        //     }
        // }
    }
};

module.exports = ServicesSalesResolver;