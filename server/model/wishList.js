const mongoose = require('mongoose');


const wishList = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user', // Referencing the User collection
            required: true
        },
        wishList: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product', // Referencing the Product collection
                required: true
            }
           

        }]
        
    },
    {
        timestamps: true, // Add timestamps option for createdAt and updatedAt fields
    }
);



const WishList = mongoose.model('WishList', wishList);



module.exports = WishList;
