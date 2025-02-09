const mongoose = require('mongoose');

const ServicesalesSchema = new mongoose.Schema(
    {
        serviceName: String,
        date: String,
        quantity: Number,
        amount: Number,
        business: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Business',
            required: true,
        },
        paymentMode: String,
    },
    {
        timestamps: true,
    }
);

const ServiceSales = mongoose.model('ServiveSales', ServicesalesSchema);

module.exports = ServiceSales;
