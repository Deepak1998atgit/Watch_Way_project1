const mongoose=require("mongoose")

const productSchema=new mongoose.Schema({

    name:{
        type:String,
        require:true
       
    },
    price:{
        type:Number,
        require:true,
       
       
    },
    photo:{
        type:String,
        require:true,
       
       
    },
    category_name:{
        type: mongoose.Schema.Types.ObjectId,
        type:String,
        ref: 'category',
    }
  
})

const Product = new mongoose.model("product",productSchema);


module.exports=Product;