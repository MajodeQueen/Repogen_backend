const mongoose = require('mongoose');



const UniqueDescriptionSchema = new mongoose.Schema(
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

const Description = mongoose.model('Description', UniqueDescriptionSchema);

module.exports = Description;