const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema(
    {
        name: String,
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

const Unit = mongoose.model('Unit', UnitSchema);

module.exports = Unit;