const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema(
  {
    name: String,
    location: String,
    aspects: [String],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    editors: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);
const Business = mongoose.model('Business', BusinessSchema);
module.exports = Business;
