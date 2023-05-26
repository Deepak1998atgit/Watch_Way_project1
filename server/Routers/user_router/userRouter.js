const express=require("express");
const route=express.Router();
const userController=require("../../controllers/user_controller/userController");
const middleWare=require("../../controllers/user_controller/middleWare");


route.get("/",userController.getLandingPage);
route.get("/homePage",middleWare.checkloggedIn,userController.getHomePage);
route.get("/userSignIn",userController.getUserSignin);
route.get("/userSignUp",userController.getUserSignUp);
route.get("/singleProduct/:id",middleWare.checkloggedIn,userController.shopSingle);
route.get("/logOut",userController.logOut);


route.get("/userCart",userController.getUserCart);
route.get("/addToCart/:id",userController.addToCart);
route.get("/findCartItems",userController.findCartItems);



route.post("/userSignUp",userController.signUp);
route.post("/usersignIn",userController.findUser);


module.exports=route;



