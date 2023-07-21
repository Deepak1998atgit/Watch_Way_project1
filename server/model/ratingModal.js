const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user', // Referencing the User collection
            required: true
        },
        products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'product', // Referencing the Product collection
                    required: true
                },
                rating: {
                    type: Number,
                    required: true,
                    min: 0
                },
                review: {
                    type: String
                },
                storeAvg:{
                    type:Number
                }
            }
        ]
    },
    {
        timestamps: true // Add timestamps option for createdAt and updatedAt fields
    }
);

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
