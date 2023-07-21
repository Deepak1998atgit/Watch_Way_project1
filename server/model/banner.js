const mongoose=require('mongoose')

const bannerSchema=new mongoose.Schema({
  image:[{
    type:String,
    
  }],
  title:{
    type:String,
    require:true
  },
  subtitle:{
    type:String,
    require:true
  },
  activate:{
    type:Boolean
  },
  createdAt:{
    type:Date,
 
  }

});

const Banner =mongoose.model('banner',bannerSchema)

module.exports= Banner;