const mongoose = require('mongoose');


const wallet = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user', // Referencing the User collection
            required: true
        },
        amount: {
            type:Number
        }
         
    
    },
    {
        timestamps: true, // Add timestamps option for createdAt and updatedAt fields
    }
);

const Wallet = mongoose.model('Wallet',wallet);



module.exports = Wallet;
