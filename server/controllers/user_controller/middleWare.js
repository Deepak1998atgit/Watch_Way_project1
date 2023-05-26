exports.checkloggedIn=(req,res,next)=>{
    if(req.session.user){
        next();
    }else{
        res.redirect("/userSignIn");
    }
}
  

 
