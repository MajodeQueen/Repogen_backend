const mongoose = require('mongoose');

const SalesSchema = new mongoose.Schema(
  {
    customerName: String,
    date: String,
    quantity: Number,
    productDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: true,
    },
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

const Sales = mongoose.model('Sales', SalesSchema);

module.exports = Sales;
