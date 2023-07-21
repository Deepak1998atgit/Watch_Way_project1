const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true

    },
    email: {
        type: String,
        require: true,


    },
    phone: {
        type: Number,
        require: true,


    },

    password: {
        type: String,
        require: true,


    },
    address: [{
        name: String,
        address: String,
        phone: Number,
        pincode: Number,
        place: String,
        state: String
    }],
    coupon: [{
        promoCode: String,
        discound: Number,
        applied:Boolean
       
    }],
    wallet: [{
        amount: Number,
        deduct:Number,
        applied:Boolean
       
    }],
    isBlocked: {
        default: false,
        type: Boolean
    }


})

const User = new mongoose.model("user", usersSchema);

module.exports = User;