const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema(
  {
    name: String,
    quantity: Number,
    quantityUnit: String,
    costPrice: Number,
    sellPrice: Number,
    date: String,
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Stock = mongoose.model('Stock', StockSchema);

module.exports = Stock;
