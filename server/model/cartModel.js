const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user', // Referencing the User collection
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product', // Referencing the Product collection
        },
        addedAt: {
            type: Date,
            default: Date.now, // Set the default value to the current timestamp
        },
    },
    {
        timestamps: true, // Add timestamps option for createdAt and updatedAt fields
    }
);

const cart = mongoose.model('cart', cartSchema);

module.exports = cart;
