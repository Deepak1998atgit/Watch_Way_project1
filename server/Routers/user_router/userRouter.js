const express=require("express");
const route=express.Router();
const userController=require("../../controllers/user_controller/userController");
const middleWare=require("../../controllers/user_controller/middleWare");


route.get("/",middleWare.isLogedIn,userController.getLandingPage);
route.get("/homePage",middleWare.authenticateToken,userController.getHomePage);
route.get("/userSignIn",middleWare.isLogedIn,userController.getUserSignin);
route.get("/userSignUp",userController.getUserSignUp);
route.get("/loginWithOtp",userController.loginWithOtp);


route.post("/sendOtp",userController.sendOTP);
route.post("/verifyOtp",userController.verifyOtp);

route.get("/singleProduct/:id",middleWare.authenticateToken,userController.shopSingle);
route.get("/logOut",userController.logOut);
route.get("/priceLowRated",middleWare.authenticateToken,userController.findPriceLowRated);
route.get("/categorySelection",middleWare.authenticateToken,userController.categorySelection);

route.get("/userProfile",middleWare.authenticateToken,userController.userProfile);
route.post("/editUserProfile",middleWare.authenticateToken,userController.editProfile);



route.get("/proceedToCheckOut",middleWare.authenticateToken,userController.getProceedCheckOut);
route.post("/findOrderPlaced",middleWare.authenticateToken,userController.orderConfirmation);
route.post("/verifySignature",middleWare.authenticateToken,userController.verifyPayment);
route.get("/orderSucessfull",middleWare.authenticateToken,userController.getOrderSucessfull);
route.get("/addToCart/:id",userController.addToCart);
route.get("/findCartItems",middleWare.authenticateToken,userController.findCartItems);
route.post('/cart/update-quantity', userController.updateQuantity);
route.delete('/cart/delete-item/:itemId',middleWare.authenticateToken,userController.deleteCartItem);


route.post("/userSignUp",userController.signUp);
route.post("/usersignIn",userController.findUser);

route.get('/paypal-success/:orderId',userController.paypal_success)
route.get('/paypal-succ',userController.paypal_err)


module.exports=route;



