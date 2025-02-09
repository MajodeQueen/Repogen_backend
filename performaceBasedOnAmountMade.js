function summarizePayments(array1) {
    let summary = {};

    // Count occurrences and total amount paid for each name
    array1.forEach(item => {
        let name = item.serviceName;
        if (!summary[name]) {
            summary[name] = { count: 0, totalAmountMade: 0 };
        }
        summary[name].count++;
        summary[name].totalAmountMade += item.amount;
    });

    // Convert the summary object to an array of objects
    let array2 = [];
    for (let name in summary) {
        array2.push({
            name: name,
            count: summary[name].count,
            totalAmountMade: summary[name].totalAmountMade
        });
    }

    return array2;
}

module.exports = summarizePayments