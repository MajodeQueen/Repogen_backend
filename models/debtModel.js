const mongoose = require('mongoose');


const DebtsDataSchema = new mongoose.Schema(
  {
    debtorName:String,
    date: String,
    amount: Number,
    dueDate:String,
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    saleID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sales',
      required: true,
    },
    debtStatus:String
  },
  {
    timestamps: true,
  }
);

const Debts = mongoose.model('Debts', DebtsDataSchema);

module.exports = Debts;
