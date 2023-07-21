const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const categorySchema = require("../../model/categoryModel");
const productSchema = require("../../model/productModel");
const usersSchema = require('../../model/userModel');
const multer = require('multer');
const Order = require("../../model/orderModel")
const { Chart } = require('chart.js');
const coupon = require("../../model/coupon");
const Wallet = require("../../model/wallet");
const bannerSchema = require("../../model/banner");
const sharp = require("sharp");



exports.getAdminLogin = (req, res) => {
  res.render("adminLogin");
}





// to get the admin dashboard
exports.getAdminDashBoard = async (req, res) => {
  const salesData = await Order.find({});
  res.render("adminDashBoard", { salesData });
}


// exports.getAddProductForm=(req,res)=>{
//     res.render("adminProductAddForm")
// }

//get admin category Form
exports.getCategoryForm = (req, res) => {
  res.render("adminAddCategoryForm");
}



//get admin ctegory list
exports.getCategoryList = async (req, res) => {

  await categorySchema
    .find()
    .then((category_find) => {
      res.render("adminAddCategoryList", { category_find, req });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "error occured while retrieving user information",
      });
    });

};







// add category 
exports.addcategory = async (req, res) => {
  try {
    const categoryName = req.body.category;

    // Check if the category already exists
    const existingCategory = await categorySchema.findOne({
      category: { $regex: new RegExp('^' + categoryName + '$', 'i') }
    });

    if (existingCategory) {
      const errorMessage = 'Category already exists';
      return res.redirect('/getCategoryList');
    } else {
      console.log("norepeat");
      const user = new categorySchema({
        category: categoryName,
        description: req.body.description,
      });
      const data = await user.save();
      res.redirect("/getCategoryList");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: err.message || "Some error occurred while creating a create operation",
    });
  }
};




//delete category 
exports.deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await categorySchema.findByIdAndRemove(id);

    if (result) {
      // Check if user was found and removed
      res.redirect("/getCategoryList");

    } else {

      res.redirect("/getCategoryList");
    }

  } catch (err) {
    res.status(500).send(err.message);                        // Send error response with status code 500
  }
}

//get add product form
exports.getAddProductForm = async (req, res) => {
  try {
    const category = await categorySchema.find();
    res.render("adminProductAddForm", { category });
  } catch {

  }

}



// get products

exports.getProductsList = async (req, res) => {
  try {
    const product_data = await productSchema.find().exec();
    res.render("adminAddedProductsList", {
      product_data: product_data,

    });
  } catch (error) {
    console.error(error);
    res.send({ message: error.message });
  }
};



// validation for the admin when sign in 
exports.validateAdminLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    if (email === "admin@gmail.com" && password === "1") {
      const secretKey = process.env.SECRET_KEY;
      const token = jwt.sign({ admin: "logedIn" }, secretKey, { expiresIn: '24h' }); // Generate a JWT
      res.cookie('adminJwt', token, { httpOnly: true }); // Set the JWT as a cookie
      console.log("ffff")
      return res.render("adminDashBoard");
    }
    else {
      res.render("adminLogin", { message: "Invalid entry" });
    }
  } catch (error) {
    console.error(error);
    res.send("An error occurred while logging in.");
  }
};



//get add product page 

exports.addproductpage = async (req, res) => {
  try {
    const data = await categorySchema.find()

    res.render('productManagement', { data });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};



//add product to db

exports.addproduct = async (req, res) => {
  try {
    const photos = req.files.map((file) => file.filename);
    if (req.body.price <= 0) {
      return res.redirect("/productsList");
    }
    // Function to crop the image to 300x300 dimensions
    const cropImage = async (photo) => {
      const buffer = await sharp(photo.path)
        .resize(300, 352, { fit: 'cover' }) // Resize and crop to 300x300 maintaining aspect ratio
        .toBuffer();

      // Save the cropped image back to the file system (overwrite the original image)
      await sharp(buffer).toFile(photo.path);
    };
    for (const photo of req.files) {
      await cropImage(photo);
    }

    const product = new productSchema({
      name: req.body.name,
      price: req.body.price,
      category_name: req.body.category,
      photo: photos
    });

    await product.save();

    res.redirect("/productsList");

  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: err.message || "Some error occurred while creating a create operation",
    });
  }
};



exports.addproducts = async (req, res) => {
  try {
    const photos = req.files.map((file) => file.filename);
    console.log(photos);
    if (req.body.price <= 0) {
      return res.redirect("/productsList");


    }

    const product = new productSchema({
      name: req.body.name,
      price: req.body.price,
      category_name: req.body.category,
      photo: photos
    });

    await product.save();

    res.redirect("/productsList");

  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: err.message || "Some error occurred while creating a create operation",
    });
  }
};



exports.addproductss = async (req, res) => {
  try {
    let photos = [];

    if (req.files && req.files.length > 0) {
      photos = req.files.map((file) => file.filename);
      console.log(photos);
    }
    const product = new productSchema({
      name: req.body.name,
      price: req.body.price,
      category_name: req.body.category,
      photo: photos             // use req.file.buffer to get the file buffer
    });

    await product.save();

    res.redirect("/productsList");

  } catch (err) {
    console.log(err);
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating a create operation",
    });
  }
};


//get the update view form with id 

exports.editProduct = async (req, res) => {
  try {
    const { id } = req.params;




    const user = await productSchema.findById(id);
    const category = await categorySchema.find();

    if (!user) {
      return res.redirect('/productsList');
    }

    return res.render('adminUpdateProductForm', { user, category });
  } catch (err) {
    console.error(err);
    return res.redirect('/productsList');
  }
};


//update product

exports.updateproduct = async (req, res) => {
  try {
    const { id } = req.params;
    let new_image = "";
    if (req.file) {
      new_image = req.file.filename;
      try {
        fs.unlinkSync("./uploads/" + req.body.photo);
      } catch (error) {
        console.log(error);
      }
    } else {
      new_image = req.body.photo;

    }


    // Update the product using findByIdAndUpdate
    const updatedProduct = await productSchema.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        price: req.body.price,
        category_name: req.body.category,
        photo: new_image,
      },

      { new: true }

    );
    console.log(updatedProduct);


    // Set { new: true } to return the updated document

    if (updatedProduct) {
      req.session.message = {
        type: "success",
        message: "User update successful",
      };
      req.session.authorized = true
      res.redirect("/productsList");
    } else {
      // Product not found
      req.session.message = {
        type: "error",
        message: "Product not found",
      };
      res.redirect("/productsList");
    }
  } catch (error) {
    console.error(error);
    res.send(error);
  }
}



// Admin can delete the product
exports.deleteproduct = async (req, res) => {
  console.log("hello")
  try {
    const id = req.params.id;
    const result = await productSchema.findByIdAndRemove(id);

    if (result) {
      // Check if user was found and removed
      res.redirect("/productsList");

    } else {

      res.redirect("/productsList");
    }

  } catch (err) {
    res.status(500).send(err.message); // Send error response with status code 500
  }
}






exports.logOut = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    // Redirect the user to the login page
    res.redirect('/adminLogin');
  });
}




//get user list
exports.getUserList = async (req, res) => {
  try {
    const user_data = await usersSchema.find().exec();



    res.render("adminViewUserList", {
      user_data: user_data,

    });
  } catch (error) {
    console.error(error);
    res.send({ message: error.message });
  }
}


//block user by admin
exports.blockUser = (req, res) => {
  const { id } = req.params;

  usersSchema.findByIdAndUpdate(id, {
    isBlocked: true,
  }, { new: true })
    .then((updatedUser) => {
      res.redirect('/userViewList');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Failed to update user.");
    });
};


exports.unBlockUser = (req, res) => {
  const { id } = req.params;

  usersSchema.findByIdAndUpdate(id, {
    isBlocked: false,
  }, { new: true })
    .then((updatedUser) => {
      res.redirect('/userViewList');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Failed to update user.");
    });
};





//order management
exports.orderManagements = async (req, res) => {

  try {
    const orders = await Order.find();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        console.log(item.product.name);
      });
    });

    res.status(200).render("adminOrderManagement", { orders });
  } catch (err) {
    console.error('Error retrieving orders:', err);
    res.status(500).json({ error: 'Server error' });
  }




}

exports.orderManagement = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product');
    res.status(200).render('adminOrderManagement', { orders });
  } catch (err) {
    console.error('Error retrieving orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.ordersSort = async (req, res) => {
  const { startDate, endDate } = req.body;

  const orders = await Order.find({
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  })
    .sort({ createdAt: 'asc' })
    .populate('items.product') // Sort by createdAt field in ascending order
    .exec(); // Execute the query


  res.render('adminOrderManagement', { orders });


}

exports.getChart = (req, res) => {
  res.render("adminChart")
}


// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const status = req.query.status;
    const order = await Order.findById(orderId);
    const userId = order.user._id.toString();
    const orderIdString = order._id.toString();
    order.status = status;
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }


    if (status === "Refunded Amount") {
      console.log("kkk", order);

      let existingWallet = await Wallet.findOne({ userId: userId });
      if (existingWallet) {
        existingWallet.amount += order.total;
        await existingWallet.save();
      } else {
        // If no existing wallet is found, create a new wallet with the amount
        const newWallet = new Wallet({
          userId: userId,
          amount: order.total
        });
        await newWallet.save();
      }
    }

    console.log("jjj", order)
    await order.save();
    if (status === "Delete") {
      // Delete the respective order
      console.log(orderIdString);
      // Delete the respective order
      await Order.findByIdAndDelete(orderIdString);

    }
    res.status(200).redirect("/orderManagement");
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.monthlyOrders = async (req, res) => {
  const currentDate = new Date();
  const orders = await Order.aggregate([
    {
      $match: {
        status: 'Delivered',
        createdAt: {
          $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  // Prepare the data for the chart
  const monthlyOrderData = orders.map((order) => ({
    month: order._id,
    totalOrders: order.totalOrders,
  }));

  res.json(monthlyOrderData);
}


// Assuming you have the 'Order' model defined

exports.getOrderStatus = async (req, res) => {
  try {
    console.log("ksksks")
    const orderStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log(orderStatus);
    res.json(orderStatus);

  } catch (error) {
    console.error('Error retrieving order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getLineChart = async (req, res) => {
  // Retrieve the orders from the database
  try {
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          deliveredCount: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } },
          cancelledCount: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } },
          // Add more conditions for other status types if needed
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(dailyOrders);
  } catch (error) {
    console.log('Error retrieving daily orders:', error);
    res.status(500).json({ error: 'Failed to retrieve daily orders' });
  }
}

exports.getCouponPage = async (req, res) => {
  try {
    const couponDetail = await coupon.find();
    res.render("adminCouponAdd", { couponDetail });


  } catch (error) {
    console.log(error, "error on getCouponPage")
  }
}




exports.couponAdd = async (req, res) => {
  try {
    const { promoCode, thresholdAmount, percentageOff } = req.body;

    // Create a new coupon instance with values
    const newCoupon = new coupon({
      coupon: [{
        promoCode: promoCode,
        thresholdAmount: thresholdAmount,
        percentageOff: percentageOff,
      }]
    });

    // Save the new coupon to the database
    const savedCoupon = await newCoupon.save();

    res.status(200).redirect("/couponManagement");
  } catch (error) {
    console.error('Error on couponAdd:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};





exports.removeCoupon = async (req, res) => {
  try {
    const couponId = req.params.couponId;
    console.log(couponId);
    const existingCoupon = await coupon.findOne({ "coupon._id": couponId });
    if (existingCoupon) {
      existingCoupon.coupon = existingCoupon.coupon.filter((item) => item._id.toString() !== couponId); // Remove the coupon object with the provided couponId
      await existingCoupon.save();

    }
    res.redirect("/couponManagement");


  } catch (error) {
    console.log(error, "error on removeCoupon");
  }
}

exports.activateCoupon = async (req, res) => {
  try {
    const couponId = req.params.couponId;
    console.log(couponId);
    const existingCoupon = await coupon.findOne({ "coupon._id": couponId });
    if (existingCoupon) {
      existingCoupon.coupon[0].active = true;
      await existingCoupon.save();
    }
    res.redirect("/couponManagement");




  } catch (error) {
    console.log(error, "error on deactivateCoupon");
  }
}

exports.deactivateCoupon = async (req, res) => {
  try {
    const couponId = req.params.couponId;
    console.log(couponId);
    const existingCoupon = await coupon.findOne({ "coupon._id": couponId });
    if (existingCoupon) {
      existingCoupon.coupon[0].active = false;
      await existingCoupon.save();
    }
    res.redirect("/couponManagement");


  } catch (error) {
    console.log(error, "Error on the deactivateCoupon")
  }
}


exports.adminBannerAddForm = async (req, res) => {
  try {
    const banners = await bannerSchema.find({});
    res.render("adminBannerAdd", { banners });


  } catch (error) {
    console.log(error, "error on adminBannerAddForm");
  }
}




//add banner
exports.addbanner = async (req, res) => {
  try {
    const photo = req.files.map((file) => file.filename);
    console.log(photo)
    const bannerExists = await bannerSchema.findOne({ title: req.body.title });
    if (bannerExists) {
      res.render("adminBannerAdd")
    } else {
      const banner = new bannerSchema({
        title: req.body.title,
        subtitle: req.body.subtitle,
        image: photo,
        activate: true
      })
      await banner.save()
      console.log(banner)
      res.render("adminBannerAdd")
    }
  }
  catch (err) {
    console.log(err);
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating a create operation",
    });
  }
};




exports.editBanner = async (req, res) => {
  try {
    const bannerId = req.params.bannerId;
    const action = req.query.action;

    let activate = false;

    if (action === 'show') {
      activate = true;
    } else if (action === 'notshow') {
      activate = false;
    } else if (action === 'delete') {
      // If action is 'delete', you can delete the banner and return the response
      await bannerSchema.findByIdAndDelete(bannerId);
      return res.status(200).redirect("/adminBannerAddForm");
    } else {
      return res.status(400).redirect("/adminBannerAddForm");
    }

    const banner = await bannerSchema.findByIdAndUpdate(bannerId, { activate });
    await banner.save();

    res.status(200).redirect("/adminBannerAddForm");;
  } catch (error) {
    console.log(error, 'error on editBanner');

  }
};





exports.salesPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // Find orders within the specified date range
    const orders = await Order.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    });

    // Calculate total revenue and order count
    const totalRevenue = orders.reduce((total, order) => total + order.total, 0);
    const orderCount = orders.length;

    // Return the sales performance data as JSON
    res.status(200).json({
      totalRevenue,
      orderCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }

}




exports.salesReport = async (req, res) => {

  try {
    const filteredOrders = await Order.find({
      status: 'Delivered' // Specify the desired order status
    }).populate('items.product')
      .exec();
    console.log(filteredOrders, "hhhdhdhh");
    res.render("adminSalesReport", { filteredOrders })
  } catch (error) {
    console.log(error, "error on salesreport")

  }

}




exports.FilterbyDates = async (req, res) => {
  const admin = req.session.admin
  const FromDate = req.body.fromdate
  console.log(FromDate);
  const Todate = req.body.todate
  console.log(Todate);
  const filteredOrders = await Order.find({ createdAt: { $gte: FromDate, $lte: Todate } })

  res.render("adminSalesReport", { filteredOrders })
}


exports.logOut = async (req, res) => {
  try {
    res.clearCookie('adminJwt'); // Assuming the token is stored in a cookie
    res.redirect("/adminLogin");
  } catch (error) {
    console.log(error, "error on logOut")
  }
}






