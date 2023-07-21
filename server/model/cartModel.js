const mongoose = require('mongoose');


const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user', // Referencing the User collection
            required: true
        },
        cartItems: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product', // Referencing the Product collection
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            }

        }]
        
    },
    {
        timestamps: true, // Add timestamps option for createdAt and updatedAt fields
    }
);



const cart = mongoose.model('cart', cartSchema);



module.exports = cart;

