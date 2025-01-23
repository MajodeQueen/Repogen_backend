const mongoose = require('mongoose');

const ExpensesSchema = new mongoose.Schema(
  {
    expenseName: String,
    date: String,
    amount: Number,
    category: String,
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

const Expenses = mongoose.model('Expenses', ExpensesSchema);

module.exports = Expenses;
