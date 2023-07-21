const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    total: {
        type: Number,
        required: true

    },
    status: {
        type: String,
        enum: ['Pending', 'Cancelled', 'Refunded Amount', 'Delivered', 'Returned','Delete'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Razorpay', 'Credit Card', 'COD', 'payPal']
    },

    address: {
        type: Object,
        required: true
    }, 
    city: {
        type: String,
        required: true

    },
    state: {
        type: String,
        required: true
    },
    zipCode: {
        type: Number,
        required: true
    },
    cancelReason:{
        type:String

    },
    phone:{
        type:String
    }



});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;