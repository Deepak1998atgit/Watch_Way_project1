const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({

    category: {
        type: String,
        unique: true,
        require: true

    },
    description: {
        type: String,
        require: true,


    }

});


const Category = new mongoose.model("category", categorySchema);


module.exports = Category;