const express=require("express");
const route=express.Router();
const userController=require("../../controllers/user_controller/userController");


route.get("/",userController.getLandingPage);
route.get("/homePage",userController.getHomePage);
route.get("/userSignIn",userController.getUserSignin);
route.get("/userSignUp",userController.getUserSignUp);
route.get("/singleProduct/:id",userController.shopSingle);



route.post("/userSignUp",userController.signUp);
route.post("/usersignIn",userController.findUser);


module.exports=route;



