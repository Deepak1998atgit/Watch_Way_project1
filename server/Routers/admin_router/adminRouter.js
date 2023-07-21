const express = require("express");
const route = express.Router();
const adminController=require("../../controllers/admin_controller/adminController");
const middlewares=require("../../controllers/admin_controller/middlewares");


route.get("/adminLogin",middlewares.isLogedIn,adminController.getAdminLogin);
route.get("/adminDashBoard",middlewares.authenticateToken,adminController.getAdminDashBoard);

route.post("/adminLogin",adminController.validateAdminLogin);
route.get("/adminLogout",adminController.logOut);

route.get("/productsList",middlewares.authenticateToken,adminController.getProductsList);
route.get("/editProduct/:id",middlewares.authenticateToken,adminController.editProduct);

route.get("/getCategoryForm",middlewares.authenticateToken,adminController.getCategoryForm);
route.get("/getCategoryList",middlewares.authenticateToken,adminController.getCategoryList);



route.get("/userViewList",middlewares.authenticateToken,adminController.getUserList);
route.get("/blockUser/:id",middlewares.authenticateToken,adminController.blockUser);
route.get("/unBlockUser/:id",middlewares.authenticateToken,adminController.unBlockUser);
route.get("/orderManagement",middlewares.authenticateToken,adminController.orderManagement);
route.get("/updateOrderStatus/:id",middlewares.authenticateToken,adminController.updateOrderStatus)

route.get("/monthly-orders",middlewares.authenticateToken,adminController.monthlyOrders);
route.get('/order-status',middlewares.authenticateToken,adminController.getOrderStatus);
route.get('/lineChart',middlewares.authenticateToken,adminController.getLineChart)
route.get("/addProductForm",middlewares.authenticateToken,adminController.getAddProductForm);
route.post("/addProductForm",middlewares.authenticateToken,middlewares.upload,adminController.addproduct);
route.post("/updateProduct/:id",middlewares.authenticateToken,middlewares.upload,adminController.updateproduct);
route.get("/deleteProduct/:id",middlewares.authenticateToken,adminController.deleteproduct);
route.post("/addCategory",middlewares.authenticateToken,adminController.addcategory);
route.post("/ordersSort",middlewares.authenticateToken,adminController.ordersSort);
route.get("/deleteCategory/:id",middlewares.authenticateToken,adminController.deleteCategory);
route.get("/adminBannerAddForm",middlewares.authenticateToken,adminController.adminBannerAddForm);
route.post("/addBannerForm",middlewares.authenticateToken,middlewares.upload,adminController.addbanner);


route.get("/couponManagement",middlewares.authenticateToken,adminController.getCouponPage);
route.post("/couponAdd",middlewares.authenticateToken,adminController.couponAdd);
route.get("/removeCoupon/:couponId",middlewares.authenticateToken,adminController.removeCoupon);
route.get("/activateCoupon/:couponId",middlewares.authenticateToken,adminController.activateCoupon);
route.get("/deactivateCoupon/:couponId",middlewares.authenticateToken,adminController.deactivateCoupon);
route.get("/editBanner/:bannerId",middlewares.authenticateToken,adminController.editBanner);
route.get("/sales-performance",middlewares.authenticateToken,adminController.salesPerformance);
route.get("/salesReport",middlewares.authenticateToken,adminController.salesReport);
route.post("/adminSalesReportFilter",middlewares.authenticateToken,adminController.FilterbyDates);
route.get("/adminLogout",middlewares.authenticateToken,adminController.logOut);



module.exports=route;