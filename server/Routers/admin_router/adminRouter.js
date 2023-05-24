const express = require("express");
const route = express.Router();
const adminController=require("../../controllers/admin_controller/adminController");
const middlewares=require("../../controllers/admin_controller/middlewares");


route.get("/adminLogin",adminController.getAdminLogin);
route.get("/adminDashBoard",adminController.getAdminDashBoard);

route.post("/adminLogin",adminController.validateAdminLogin);
route.get("/adminLogout",adminController.logOut);

route.get("/productsList",adminController.getProductsList);
route.get("/editProduct/:id",adminController.editProduct);

route.get("/getCategoryForm",adminController.getCategoryForm);
route.get("/getCategoryList",adminController.getCategoryList);



route.get("/userViewList",adminController.getUserList);
route.get("/blockUser/:id",adminController.blockUser);
route.get("/unBlockUser/:id",adminController.unBlockUser);



route.get("/addProductForm",adminController.getAddProductForm);
route.post("/addProductForm",middlewares.upload,adminController.addproduct);
route.post("/updateProduct/:id",middlewares.upload,adminController.updateproduct);
route.get("/deleteProduct/:id", adminController.deleteproduct);
route.post("/addCategory",adminController.addcategory);
route.get("/deleteCategory/:id", adminController.deleteCategory)



module.exports=route;