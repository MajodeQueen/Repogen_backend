const Sales = require("./models/SalesModel");

const mongoose = require('mongoose');

async function getWeeklyData(month, year) {
    try {
        const startDate = new Date(`${year}-${month}-01`);
        const endDate = new Date(`${year}-${month + 1}-01`);

        // Retrieve all sales for the given month
        const sales = await Sales.find({
            date: {
                $gte: startDate,
                $lt: endDate
            }
        });

        // Group sales by week
        const weeklyData = {};

        sales.forEach((sale) => {
            const weekOfMonth = Math.ceil(sale.date.getDate() / 7); // Calculate week of the month
            if (!weeklyData[weekOfMonth]) {
                weeklyData[weekOfMonth] = {
                    totalAmount: 0,
                    count: 0,
                    items: []
                };
            }
            weeklyData[weekOfMonth].totalAmount += sale.totalAmount;
            weeklyData[weekOfMonth].count += 1;
            weeklyData[weekOfMonth].items.push(sale);
        });

        console.log(weeklyData);
    } catch (err) {
        console.error(err);
    }
}

getWeeklyData(1, 2025);
