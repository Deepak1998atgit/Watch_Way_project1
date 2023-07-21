const mongoose = require('mongoose');


const couponSchema = new mongoose.Schema(
    {
    
        coupon: [{
            promoCode: {
                type: String,
                required: true,
                
                
            },
            thresholdAmount: {
                type:Number,

                required: true
            },
            percentageOff: {
                type: Number,
                required: true
               
            },active:{
                 type:Boolean

            }
        }]
        
    },
    {
        timestamps: true, // Add timestamps option for createdAt and updatedAt fields
    }
);



const coupon = mongoose.model('coupon', couponSchema);



module.exports = coupon;

