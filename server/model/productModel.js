const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true

    },
    price: {
        type: Number,
        required: true,


    },
    photo: [{
        type: String,
        required: true,
    }],
    category_name: {
        type: mongoose.Schema.Types.ObjectId,
        type: String,
        ref: 'category',
    },
    averageRating:{
        type:Number

    }

});

const Product = new mongoose.model("product", productSchema);


module.exports = Product;