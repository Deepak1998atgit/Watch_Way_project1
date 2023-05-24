const bcrypt = require("bcrypt");
const categorySchema = require("../../model/categoryModel");
const productSchema=require("../../model/productModel");
const usersSchema=require('../../model/userModel');
const multer = require('multer');



exports.getAdminLogin = (req, res) => {

    res.render("adminLogin");
}



// to get the admin dashboard
exports.getAdminDashBoard = (req, res) => {
    res.render("adminDashBoard");
}


// exports.getAddProductForm=(req,res)=>{
//     res.render("adminProductAddForm")
// }

//get admin category Form
exports.getCategoryForm=(req,res)=>{
    res.render("adminAddCategoryForm");
}



//get admin ctegory list
exports.getCategoryList= async (req, res) => {
 
   await categorySchema
      .find()
      .then((category_find) => {
        res.render("adminAddCategoryList", { category_find ,req });
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
      const category=req.body.category;
      // Check if the category already exists
      const existingCategory = await categorySchema.findOne({ category });
      if(existingCategory){
        const errorMessage = 'Category already exists';
        return res.redirect(`/getCategoryList?error=${encodeURIComponent(errorMessage)}`);
       
        res.redirect("/getCategoryList"); 

      }else{
        const user = await new categorySchema({
           category:req.body.category,
          description: req.body.description,
        });
        const data = await user.save();
    
  
       res.redirect("/getCategoryList");
      }
     
  
     
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating a create operation",
      });
    }
};


//delete category 
exports.deleteCategory=async(req,res)=>{
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
exports.getAddProductForm=async(req,res)=>{
  try{
    const category=await categorySchema.find();
    res.render("adminProductAddForm",{category});
  }catch{
         
  }
    
}



// get products

exports.getProductsList = async (req, res) => {
    try {
      const product_data = await productSchema.find().exec();
     
      
  
      res.render("adminAddedProductsList", {
        product_data: product_data,
        
      });
    } catch(error) {
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
            req.session.user = email;
            return res.redirect("adminDashBoard");
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

        res.render('productManagement',{ data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};



//add product to db

exports.addproduct = async (req, res) => {
    try {
        const product = new productSchema({
            name: req.body.name,
            price: req.body.price,
            category_name: req.body.category,
            photo: req.file.filename                // use req.file.buffer to get the file buffer
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

exports.updateproduct=  async(req,res)=>{
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
      
      // Set { new: true } to return the updated document
  
      if (updatedProduct) {
        req.session.message = {
          type: "success",
          message: "User update successful",
        };
        req.session.authorized=true
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
exports.deleteproduct=async(req,res)=>{
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
exports.getUserList= async (req,res)=>{
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