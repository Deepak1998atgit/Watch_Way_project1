const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({

    category: {
        type: String,
        unique: true,
        required: true

    },
    description: {
        type: String,
        required: true,


    },
    products: [
        {

            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true

        }
    ],

});


const category = new mongoose.model("category", categorySchema);


module.exports = category;