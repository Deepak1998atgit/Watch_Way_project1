const bcrypt = require("bcrypt");
const userSchema = require("../../model/userModel");
const productSchema = require("../../model/productModel");
const cartSchema = require("../../model/cartModel");





exports.getLandingPage = (req, res) => {
    res.render("landingPage");
};



exports.getHomePage = async (req, res) => {
    const product = await productSchema.find().limit(6);
    res.render("homePage", { product });

}

exports.getUserSignin = (req, res) => {
    res.render("userSignIn")
}

exports.getUserSignUp = (req, res) => {
    res.render("userSignUp");
}

exports.shopSingle = async (req, res) => {
    try {
        const { id } = req.params
        const product = await productSchema.findById(id);
        if (product) {

            res.render("singleProductPage", { product });
        }
    } catch (error) {
        console.log(error);
        res.send(error)
    }


}


exports.signUp = (req, res) => {

    const saltRounds = 10; // You can adjust the number of salt rounds as needed

    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (err) {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while hashing the password",
            });
            return;
        }

        const user = new userSchema({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,

            password: hash,
        });

        user
            .save()
            .then(() => {
                res.render("userSignIn", { msg: "successfully registered" });
            })
            .catch((err) => {
                res.status(500).send({
                    message:
                        err.message ||
                        "Some error occurred while creating a create operation",
                });
            });
    });
};








//user login check
exports.findUser = async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await userSchema.findOne({ email: email });

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                if (user.isBlocked) {
                    res.render("userSignIn", { message: "Your permission denied or blocked" });
                } else {

                    req.session.user = email;
                    res.redirect("/homePage");
                }

            } else {
                res.render("userSignIn", { message: "Invalid entry" });
            }
        }
    } catch (error) {
        console.error(error);
        res.send("An error occurred while logging in.");
    }
};



// userCart Page   render
exports.getUserCart = (req, res) => {
    res.render("userCart");
}





// add product to cart 
exports.addToCart = async (req, res) => {
    try {
        
        const id = req.params.id; // Assuming the user provides productId in the request url param
        const email = req.session.user;

        const user = await userSchema.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const userId = user._id.toString();

        const cartItem = new cartSchema({
            userId: userId,                 // Assuming you have authentication and can access the user ID from req.user
            productId: id,
        });

        
        const savedCartItem = await cartItem.save();  // Save the cart item to the database

        return res.status(200).json({ message: 'Item added to cart successfully.' });

    } catch (error) {
        console.error('Failed to add item to cart:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
}





// find Cart items


exports.findCartItems= async(req,res)=>{
    try{
        const email=req.session.user;
        const user = await userSchema.findOne({ email });
        const userId = user._id.toString();
        if(userId){
            const cartItems = await cartSchema.find({ userId: userId });
            console.log(cartItems);
            res.render("userCart",{cartItem:cartItems});
        }else{
            return res.status(404).json({ error: 'User not found.' });
        }

    }catch(error){
        console.log(error);
    }

}




//logout and session destroy
exports.logOut = (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.log('Error destroying session:', err);
        }
        res.redirect("/");
    })
}























