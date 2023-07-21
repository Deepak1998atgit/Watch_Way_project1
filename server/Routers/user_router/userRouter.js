const express=require("express");
const route=express.Router();
const userController=require("../../controllers/user_controller/userController");
const middleWare=require("../../controllers/user_controller/middleWare");



route.get("/",middleWare.authenticateToken,userController.getHomePage);
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
route.post("/addressManage/:id",middleWare.authenticateToken,userController.addressEdit);
route.post("/addAddress",middleWare.authenticateToken,userController.addAddress)
route.get("/proceedToCheckOut/:id",middleWare.authenticateToken,userController.getProceedToCheckout);
route.post("/removeAddress",middleWare.authenticateToken,userController.addressRemove);
route.post("/editUserProfile",middleWare.authenticateToken,userController.editProfile);
route.get("/orderView",middleWare.authenticateToken,userController.viewOrder);
route.get("/viewOrderDetail/:orderId",middleWare.authenticateToken,userController.viewOrderDetail);
route.get("/invoices/:orderId",middleWare.authenticateToken,userController.invoicesPdf);
route.post("/cancelOrder/:orderId",middleWare.authenticateToken,userController.cancelOrder);

route.get("/addToWishList/:productId",middleWare.authenticateToken,userController.addWishList);
route.get("/getWishList",middleWare.authenticateToken,userController.getWishList);
route.get("/removeFromWishList/:productId",middleWare.authenticateToken,userController.removeFromWishList)


route.post("/ratingProduct/:productId",middleWare.authenticateToken,userController.ratingProduct);



route.get("/getAddress",middleWare.authenticateToken,userController.getAddress);
route.get("/proceedToCod/:addrId",middleWare.authenticateToken,userController.proceedToCod);
route.get("/proceedToPayPal/:addrId",middleWare.authenticateToken,userController.proceedToPayPal);
route.get("/proceedToRazorPay/:addrId",middleWare.authenticateToken,userController.proceedToRazorPay)


// route.post("/findOrderPlaced",middleWare.authenticateToken,userController.orderConfirmation);
route.post("/verifySignature",middleWare.authenticateToken,userController.verifyPayment);
route.get("/orderSucessfull",middleWare.authenticateToken,userController.getOrderSucessfull);
route.get("/addToCart/:id",userController.addToCart);
route.get("/cart",middleWare.authenticateToken,userController.findCartItems);
route.post('/findCartItems/incrimentQuantity',middleWare.authenticateToken, userController.incrementQtyCart);
route.post('/findCartItems/decrimentQuantity',middleWare.authenticateToken, userController.decrementQtyCart);
route.delete('/cart/delete-item/:itemId',middleWare.authenticateToken,userController.deleteCartItem);
route.post("/walletApply/:addressId",middleWare.authenticateToken,userController.walletManagement);


route.post("/userSignUp",userController.signUp);
route.post("/usersignIn",userController.findUser);

route.get('/paypal-success/:addrId',middleWare.authenticateToken,userController.paypalSuccess)
route.get('/paypal-error',userController.paypal_err);
route.post("/redeemCoupon/:addressId",middleWare.authenticateToken,userController.redeemCoupon);


route.get("/shop",middleWare.authenticateToken,userController.getShop);
route.post("/shop",middleWare.authenticateToken,userController.getProductByPrice);
route.get("/sortProductByPrice",middleWare.authenticateToken,userController.sortProductByPrice);


module.exports=route;



