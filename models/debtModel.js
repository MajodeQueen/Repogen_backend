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
    debtStatus:String
  },
  {
    timestamps: true,
  }
);

const Debts = mongoose.model('Debts', DebtsDataSchema);

module.exports = Debts;
