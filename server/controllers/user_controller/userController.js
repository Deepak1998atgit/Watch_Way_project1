const bcrypt = require("bcrypt");
const axios = require('axios');
const jwt = require("jsonwebtoken");
const userSchema = require("../../model/userModel");
const productSchema = require("../../model/productModel");
const cart = require("../../model/cartModel");
const category = require("../../model/categoryModel");
const Order = require("../../model/orderModel");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken)
const serviceSid = process.env.TWILIO_SERVICE_SID;
const Razorpay = require("razorpay");
const paypal = require("paypal-rest-sdk");
const crypto = require('crypto');
const rating = require('../../model/ratingModal');
const WishList = require("../../model/wishList");
const coupon = require("../../model/coupon");
const Wallet = require("../../model/wallet");
const Banner = require("../../model/banner");







const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
paypal.configure({
    'mode': 'sandbox',
    'client_id': PAYPAL_CLIENT_ID,
    'client_secret': PAYPAL_CLIENT_SECRET

})





exports.getHomePage = async (req, res) => {
    try {



        // Check if the user has an active JWT token
        const banners = await Banner.find({ activate: true });
        // Fetch the necessary data for the home page
        const product = await productSchema.find().limit(18);
        let user = null;
        let CartLength = 0;


        if (req.user) {

            const userToken = req.user;
            const userId = userToken.userId;

            // Fetch the user details
            user = await userSchema.findById(userId);

            // Fetch the user's cart details
            const cartDetails = await cart.findOne({ userId: userId });
            if (cartDetails) {
                CartLength = cartDetails.cartItems.length;
            }

        }

        // Render the home page view and pass the necessary data
        res.render("homePage", { product, user, CartLength, banners });
    } catch (error) {
        console.log(error, "error on getHomePage");

    }
};





exports.getUserSignin = (req, res) => {


    res.render("userSignIn")
}





exports.getUserSignUp = (req, res) => {
    res.render("userSignUp");
}





exports.shopSingle = async (req, res) => {

    try {
        const { id } = req.params;
        const objectIdPattern = /^[0-9a-fA-F]{24}$/;
        const validObjectId = objectIdPattern.test(id);
        if (validObjectId === false) {
            return res.render("404");
        }

        const product = await productSchema.findById(id);
        if (!product) {
            return res.render("404");
        }
        if (req.user) {
            const userId = req.user.userId;
            const cartDetails = await cart.findOne({ userId: userId });
            let CartLength = 0
            if (cartDetails) {
                CartLength = cartDetails.cartItems.length
            } else {
                CartLength = 0
            }
            const user = await userSchema.findById(userId);


            if (product) {
                return res.render("singleProductPage", { product, user, CartLength });
            }

        }
        const user = null;
        const CartLength = 0;
        return res.render("singleProductPage", { product, user, CartLength });

    } catch (error) {
        console.log(error);

    }


}





exports.signUp = (req, res) => {
    try {    //signup the user
        const saltRounds = 10;            // You can adjust the number of salt rounds as needed
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

                password: hash
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
    } catch (err) {
        console.log(error);
    }
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
                    req.session.user = user;
                    const secretKey = process.env.SECRET_KEY;
                    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '3h' }); // Generate a JWT
                    res.cookie('jwt', token, { httpOnly: true }); // Set the JWT as a cookie
                    res.redirect("/");

                }

            } else {
                res.render("userSignIn", { message: "Invalid entry" });
            }
        } else {
            res.render("userSignIn", { message: "Invalid mail" });

        }
    } catch (error) {
        console.error(error);
        res.send("An error occurred while logging in.");
    }
};





//login with OTP
exports.loginWithOtp = (req, res) => {
    res.render("otp");
}





exports.sendOTP = async (req, res, next) => {
    res.redirect("/loginWithOtp");
}




exports.sendOTP = async (req, res, next) => {
    try {

        const { phone } = req.body;
        req.session.user = phone;

        const otpResponse = await client.verify.v2
            .services(serviceSid)
            .verifications.create({
                to: "+91" + phone,
                channel: "sms",
            });
        const message = "Otp send SuccessFully"

        res.render('otp', { message });
    } catch (error) {
        res.status(error?.status || 400).send(error?.message || "Something went wrong!");
    }

}




exports.verifyOtp = async (req, res) => {
    try {
        const verificationCode = req.body.otp;
        const stringPhone = req.session.user;
        const phoneNumber = parseInt(stringPhone);

        let user = await userSchema.findOne({ phone: phoneNumber });

        if (!user) {
            res.status(400).send({ message: "Valid Phone number is required" });
            return;
        }

        const saltRounds = 10;

        bcrypt.hash(req.body.confirmPassword, saltRounds, async (err, hash) => {
            if (err) {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while hashing the password",
                });
                return;
            }

            user.password = hash;
            await user.save();

            // Verify the SMS code entered by the user
            const verification_check = await client.verify.v2.services(serviceSid).verificationChecks.create({ to: '+91' + phoneNumber, code: verificationCode });

            if (verification_check.status === 'approved') {
                // If the verification is successful, do something
                res.redirect('/userSignIn');
            } else {
                // If the verification fails, return an error message
                res.json({ message: "Invalid verification code" });
            }
        });
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred while verifying the code" });
    }
};





exports.verifyOtps = async (req, res) => {
    try {
        const verificationCode = req.body.otp;
        const stringPhone = req.session.user;
        const phoneNumber = parseInt(stringPhone);

        const user = await userSchema.find({ phone: phoneNumber })

        if (!user) {
            res.status(400).send({ message: "Valid Phone number is required" });
            return;
        }
        const saltRounds = 10;            // You can adjust the number of salt rounds as needed
        bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
            if (err) {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while hashing the password",
                });
                return;
            }

            const user = await userSchema.findOneAndUpdate(
                { password: hash },
                { new: true }
            )
            user
                .save()
                .catch((err) => {
                    res.status(500).send({
                        message:
                            err.message ||
                            "Some error occurred while creating a create operation",
                    });
                });
        });
        // Verify the SMS code entered by the user
        const verification_check = await client.verify.v2.services(serviceSid).verificationChecks.create({ to: '+91' + phoneNumber, code: verificationCode });

        if (verification_check.status === 'approved') {
            // If the verification is successful, do something

            res.json({ message: "Verification successful" });
        } else {
            // If the verification fails, return an error message
            res.json({ message: "Invalid verification code " });
        }
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred while verifying the code" });
    }

};









// add product to cart 
exports.addToCart = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const secretKey = process.env.SECRET_KEY;
        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) {
                console.error('Token verification error on addToCart:', err);
                return res.status(401).json({ error: 'Unauthorized' });
            } else {
                const userId = decoded.userId;
                const productId = req.params.id;
                let userCart = await cart.findOne({ userId });             // Check if the user's cart already exists, if not, create a new cart
                if (!userCart) {
                    userCart = new cart({ userId });
                }
                const existingCartItem = userCart.cartItems.find(          // Check if the product already exists in the cartItems array
                    (item) => item.product.toString() === productId
                );
                if (existingCartItem) {
                    existingCartItem.quantity += 1;                           // If the product exists, update its quantity
                } else {
                    const cartItem = { product: productId, quantity: 1 };     // If the product doesn't exist, add it to the cartItems array
                    userCart.cartItems.push(cartItem);
                }
                const savedCart = await userCart.save();                     // Save the updated cart
                return res.status(200).json({
                    message: 'Item added to cart successfully.',
                    success: true
                });
            }
        });
    } catch (error) {
        console.error('addToCart error message:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
};






// find Cart items
exports.findCartItems = async (req, res) => {
    try {
        // Retrieve cart items for the current user
        const userId = req.user.userId;
        const userCart = await cart.findOne({ userId }).populate('cartItems.product');
        const user = await userSchema.findById(userId);


        let CartLength = 0
        if (userCart) {
            CartLength = userCart.cartItems.length
        } else {
            CartLength = 0
        }
        if (!userCart) {

            return res.render('userCart', { cartItems: [], user, CartLength }); // Pass an empty array if cart is not found
        }

        const cartItems = userCart.cartItems;
        res.render('userCart', { cartItems, user, CartLength });
    } catch (error) {
        console.error('displayCartPage error:', error);
        res.status(500).json({ error: 'Failed to fetch cart items' });
    }

}




exports.addWishList = async (req, res) => {
    try {
        const userId = req.user.userId;
        const productId = req.params.productId;
        let userWishList = await WishList.findOne({ userId });

        if (!userWishList) {
            userWishList = new WishList({ userId });
        }

        const existingWishList = userWishList.wishList.find(
            (item) => item.product.toString() === productId
        );

        if (existingWishList) {
            console.log("Product already exists in the wishlist");
            return res
                .status(200)
                .json({ message: 'Product already exists in the wishlist.', success: true });
        } else {
            const wishListItem = { product: productId }
            userWishList.wishList.push(wishListItem);

            const savedWishList = await userWishList.save();
            console.log('Product added to the wishlist:', savedWishList);
            return res
                .status(200)
                .json({ message: 'Product added to the wishlist successfully.', success: true });
        }
    } catch (error) {
        console.error('Error on addWishList:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};





exports.getWishList = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userCart = await cart.findOne({ userId })
        let CartLength = 0
        if (userCart) {
            CartLength = userCart.cartItems.length
        } else {
            CartLength = 0
        }
        const user = await userSchema.findById(userId);
        console.log("kkkkk", user)
        let userWishList = await WishList.findOne({ userId }).populate('wishList.product');
        const wishList = userWishList.wishList;
        res.render("wishList", { wishList, user, CartLength });



    } catch (error) {
        console.log(error, "error on getWishList")
    }

}





exports.removeFromWishList = async (req, res) => {
    try {
        const userId = req.user.userId;
        const productId = req.params.productId;
        let userWishList = await WishList.findOne({ userId });

        if (!userWishList) {
            return res.status(404).json({ success: false, error: 'Wishlist not found' });
        }

        const itemIndex = userWishList.wishList.findIndex((item) => item.product.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ success: false, error: 'Item not found in wishlist' });
        }

        userWishList.wishList.splice(itemIndex, 1);
        await userWishList.save();

        return res.json({ success: true, message: 'Item removed from wishlist successfully' });
    } catch (error) {
        console.log('Error removing item from wishlist:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};






exports.ratingProduct = async (req, res) => {
    try {
        console.log("hhhhh");
        const userId = req.user.userId;
        const productId = req.params.productId;
        const ratingByUser = req.body.rating;
        const ratingByUserInt = parseInt(ratingByUser);
        const userExist = await rating.findOne({ userId }).populate('products');
        const userCount = await rating.countDocuments();
        const product = await productSchema.findById(productId);
        console.log(product, "kkfffffffffff");
        if (userExist) {
            console.log(userExist)
            // Check if the product already exists in the user's rating
            const productIndex = userExist.products.findIndex((product) => product.productId.toString() === productId);
            console.log(productIndex);
            if (productIndex !== -1) {
                console.log("product Exist");
                // Product already exists, modify the rating and review case 1
                userExist.products[productIndex].rating = ratingByUser;
                const newAvgRating = (prev * usercound + ratingbyuser) / (usercound + 1)
                console.log(newAvgRating);
                // await userExist.save();
            } else {
                console.log("product not Exist user exist");
                // Product does not exist,add the new product  case 2
                userExist.products.push({
                    productId,
                    rating: ratingByUser,

                });
                product.averageRating = (product.averageRating + ratingByUser) / userCount;


            }
            // Save the updated user rating
            // await userExist.save();
            console.log('Exist User rating updated:', userExist);
        } else {
            // User rating does not exist, create a new rating document
            console.log("product not Exist no  user exist")

            const newRating = new rating({    //case 3
                userId,
                products: [
                    {
                        productId,
                        rating: ratingByUser,
                        storeAvg: 0

                    }
                ]
            });




            // await newRating.save();

        }
        res.redirect(`/singleProduct/${productId}`);

    } catch (error) {
        console.log(error);
    }

}





// Function to update the quantity
exports.incrementQtyCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userSchema.findById(userId);
        const { itemId } = req.body;
        const userCart = await cart.findOne({ userId: userId }).populate('cartItems.product');

        if (!userCart) {
            console.log('Cart not found');
            return;
        }

        // Find the item with the specified itemId in the cartItems array
        const item = userCart.cartItems.find((item) => item._id.toString() === itemId);

        if (item) {
            // Increment the quantity of the item
            item.quantity += 1;

            let indvidualTotal = item.quantity * item.product.price;

            let totalPrice = 0;

            userCart.cartItems.forEach((cartItem) => {
                const productPrice = cartItem.product.price;
                const quantity = cartItem.quantity;
                const itemTotal = productPrice * quantity;
                totalPrice += itemTotal;
            });
            // Save the updated cart document
            const updatedCart = await userCart.save();







            // Prepare JSON response
            const jsonResponse = {
                success: true,
                message: 'Item quantity incremented',
                updatedCart: item.quantity,
                totalPrice: totalPrice,
                indvidualTotal: indvidualTotal

            };



            // Send JSON response
            res.json(jsonResponse);
        } else {
            console.log('Item not found in cart');
        }
    } catch (error) {
        console.log(error);
    }
};






// Function to update the quantity
exports.decrementQtyCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userSchema.findById(userId);
        const { itemId } = req.body;
        const userCart = await cart.findOne({ userId: userId }).populate('cartItems.product');

        if (!userCart) {
            console.log('Cart not found');
            return;
        }

        // Find the item with the specified itemId in the cartItems array
        const item = userCart.cartItems.find((item) => item._id.toString() === itemId);

        if (item) {
            // Increment the quantity of the item
            item.quantity -= 1;
            if (item.quantity === 0) {
                item.quantity = 1
            }

            let indvidualTotal = item.quantity * item.product.price;
            console.log(indvidualTotal);
            let totalPrice = 0;

            userCart.cartItems.forEach((cartItem) => {
                const productPrice = cartItem.product.price;
                const quantity = cartItem.quantity;
                const itemTotal = productPrice * quantity;
                totalPrice += itemTotal;
            });
            // Save the updated cart document
            const updatedCart = await userCart.save();
            console.log(totalPrice, "hhddg")
            // Prepare JSON response
            const jsonResponse = {
                success: true,
                message: 'Item quantity incremented',
                updatedCart: item.quantity,
                totalPrice: totalPrice,
                indvidualTotal: indvidualTotal

            };
            // Send JSON response
            res.json(jsonResponse);
        } else {
            console.log('Item not found in cart');
        }
    } catch (error) {
        console.log(error);
    }
};












//function to delete cart item
exports.deleteCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        console.log(itemId)
        const userId = req.user.userId;

        // Find the user's cart and remove the cart item with the given item ID
        const updatedCart = await cart.findOneAndUpdate(
            { userId },
            { $pull: { cartItems: { _id: itemId } } },
            { new: true }
        ).populate('cartItems.product');;

        let totalPrice = 0;

        updatedCart.cartItems.forEach((cartItem) => {
            const productPrice = cartItem.product.price;
            const quantity = cartItem.quantity;
            const itemTotal = productPrice * quantity;
            totalPrice += itemTotal;
        });
        console.log(updatedCart)
        console.log("uudu", totalPrice, "dhdh")



        if (!updatedCart) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        res.status(200).json({ success: true, totalPrice });
    } catch (error) {
        console.error('Error deleting cart item:', error);
        return res.status(500).json({ error: 'Failed to delete cart item' });
    }
};



exports.addAddress = async (req, res) => {
    console.log("jjjj")
    const userId = req.user.userId;
    const user = await userSchema.findById(userId);
    const { address, city, state, name, phone, zip } = req.body;
    console.log(address, city, state, name, phone, zip);
    const newAddress = {
        name: name,
        address: address,
        phone: phone,
        pincode: zip,
        place: city,
        state: state
    };
    await user.address.push(newAddress);
    console.log("hhdhh", user.address);

    // Save the updated user document
    await user.save();
    res.redirect("/getAddress")


}






exports.getAddress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userSchema.findById(userId);
        const order = await Order.findOne({ user: userId });
        const cartProducts = await cart.findOne({ userId }).populate('cartItems.product');
        let CartLength = 0
        if (cartProducts) {
            CartLength = cartProducts.cartItems.length
        } else {
            CartLength = 0
        }
        res.render("addressPage", { user: user, order, cartProducts, CartLength });
    } catch (err) {
        console.log(err)
    }

}




//gdyeghuehdejdijdidko
exports.getProceedToCheckout = async (req, res) => {
    try {
        const userId = req.user.userId;
        const addressId = req.params.id;
        const user = await userSchema.findById(userId);
        const cartProducts = await cart.findOne({ userId }).populate('cartItems.product');
        const couponDetail = await coupon.find();
        const walletDetail = await Wallet.findOne({ userId: userId });
        const payable = req.query.payable;
        const message = req.query.message;
        const wallet = req.query.wallet;

        let CartLength = 0
        if (cartProducts) {
            CartLength = cartProducts.cartItems.length
        } else {
            CartLength = 0
        }

        if (!user) {
            // User not found
            console.log("User not found on orderConfirmation");
            return;
        }
        if (!addressId) {
            console.log("Address not found on orderConfirmation");
            return;
        }
        let walletAmount = 0;
        // if(walletDetail){
        //     walletAmount = walletDetail[0].amount;

        // }
        console.log(walletDetail, "kkk")
        if (walletDetail) {
            walletAmount = walletDetail.amount;
        }
        const address = user.address.id(addressId);
        res.render("proceedToCheckOut", { user: user, cartProducts, address, couponDetail, payable, message, walletAmount, wallet, CartLength });
        console.log(address);
    } catch (error) {
        console.error('Error placing order:', error);
        return res.status(500).json({ error: 'Failed to place order' });
    }
}





exports.walletManagement = async (req, res) => {
    try {

        const addresId = req.params.addressId;
        console.log(addresId)
        const userId = req.user.userId; // Assuming you have the authenticated user's ID available in req.user
        const amount = req.body.total;
        console.log(amount)
        const total = parseInt(amount);
        const percentage = 0.1; //10% expressed as a decimal
        const tenPercent = (total * 0.1).toFixed(1);
        const user = await userSchema.findById(userId);
        console.log(tenPercent, "tenPercent")
        // Retrieve the user's wallet document
        const wallet = await Wallet.findOne({ userId });
        const difference = wallet.amount - tenPercent;
        console.log(difference, "kkk")
        // const totalAmount = Math.abs(difference);
        // console.log(totalAmount, "kk")
        
        if (!wallet) {
            return res.status(404).redirect(`/proceedToCheckOut/${addresId}`);
        } else if (difference < 0) {

            console.log(tenPercent, "jjrrr");
            user.wallet.push({ amount: total, deduct: wallet.amount, applied: false });
            
            res.status(200).redirect(`/proceedToCheckOut/${addresId}?wallet=${wallet.amount}`);
            wallet.amount = 0;
            await user.save();
            await wallet.save(); // Save the updated wallet document
            
        } else {
            // Deduct the amount from the wallet
            wallet.amount -= tenPercent;
            console.log(tenPercent, "jj");
            user.wallet.push({ amount: total, deduct: tenPercent, applied: false });

          
            await user.save();
            await wallet.save(); // Save the updated wallet document

            // Return success response

            return res.status(200).redirect(`/proceedToCheckOut/${addresId}?wallet=${tenPercent}`);

        }



    } catch (error) {
        console.log(error, "Error on walletManagement");
        return res.status(500).redirect(`/proceedToCheckOut/${addresId}`);
    }
}





exports.proceedToCod = async (req, res) => {
    try {
        const userId = req.user.userId;
        const addressId = req.params.addrId;
        const user = await userSchema.findById(userId);
        const address = user.address.id(addressId);
        const cartDetails = await cart.findOne({ userId }).populate('cartItems.product');
        const couponFound = user.coupon.find((c) => c.applied === false);
        const walletFound = user.wallet.find((c) => c.applied === false);
        console.log(walletFound, "kkkkkkkk")
        let total = 0;
        if (!cartDetails) {
            res.redirect("/orderSucessfull");

        } else {
            for (const item of cartDetails.cartItems) {

                total += item.product.price * item.quantity;
            }
            if (couponFound) {
                console.log(couponFound)
                const discount = couponFound.discound;
                console.log(discount, "kkk");
                total = total - discount;
                console.log(total, "kkk");
                couponFound.applied = true;



            }
            if (walletFound) {
                console.log("wallet found", walletFound);
                total = walletFound.amount - walletFound.deduct;
                walletFound.applied = true;
                console.log(total, "total")

            }
            console.log(total, "total");

        }
        if (address) {
            const newOrder = new Order({
                user: userId,
                name: address.name,
                items: cartDetails.cartItems.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.product.price
                })),
                total: total,
                address: address.address,
                zipCode: address.pincode,
                phone: address.phone,
                status: 'Pending',
                paymentMethod: "COD",
                state: address.state,
                city: address.place
            });

            await newOrder.save();
            await user.save();

            await cart.deleteOne({ userId: userId })

            res.render("orderSuccessful", { user, cartDetails });

        }
    } catch (error) {
        console.log(error);
    }
}






exports.proceedToPayPal = async (req, res) => {
    try {

        const userId = req.user.userId;
        const addressId = req.params.addrId;
        const user = await userSchema.findById(userId);
        const address = user.address.id(addressId);
        const cartFound = await cart.findOne({ userId })
        if (!cartFound) {
            res.redirect("/orderSucessfull");

        } else {
            const cartDetails = await cart.findOne({ userId }).populate('cartItems.product');
            if (!cartDetails) {
                res.redirect("/orderSucessfull");

            }
            const couponFound = user.coupon.find((c) => c.applied === false);
            const walletFound = user.wallet.find((c) => c.applied === false);
            let total = 0;
            for (const item of cartDetails.cartItems) {

                total += item.product.price * item.quantity;
            }
            if (couponFound) {
                const discount = couponFound.discound;
                console.log(discount, "discount paypal");
                total = total - discount;
                console.log(total, "discount total");
                couponFound.applied = false;
            }
            if (walletFound) {
                console.log("wallet found", walletFound);
                total = walletFound.amount - walletFound.deduct;
                walletFound.applied = true;
                console.log(total, "total")

            }
            const createPayment = {
                intent: 'sale',
                payer: {
                    payment_method: 'paypal'
                },

                redirect_urls: {
                    return_url: `http://localhost:4000/paypal-success/${addressId}`,
                    cancel_url: 'http://localhost:4000/paypal-cancel'
                },
                transactions: [{
                    amount: {
                        total: (total / 82).toFixed(2), // Replace with actual total amount
                        currency: 'USD' // Replace with actual currency
                    },
                    description: 'Payment description' // Replace with actual description
                }]
            };
            console.log("lloo");
            paypal.payment.create(createPayment, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    for (let i = 0; i < payment.links.length; i++) {
                        if (payment.links[i].rel === "approval_url") {
                            res.redirect(payment.links[i].href);
                        }
                    }
                }
            });


        }


    } catch (error) {
        console.log(error);
    }


}





exports.paypalSuccess = async (req, res) => {
    try {
        const userId = req.user.userId;
        const addressId = req.params.addrId;
        const user = await userSchema.findById(userId);
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;

        const address = user.address.id(addressId);
        const cartFound = await cart.findOne({ userId })
        if (!cartFound) {
            res.redirect("/orderSucessfull");
        } else {
            const cartDetails = await cart.findOne({ userId }).populate('cartItems.product');
            const couponFound = user.coupon.find((c) => c.applied === false);
            const walletFound = user.wallet.find((c) => c.applied === false);
            let total = 0;
            for (const item of cartDetails.cartItems) {

                total += item.product.price * item.quantity;
            }
            if (couponFound) {
                console.log(couponFound)
                const discount = couponFound.discound;

                total = total - discount;

                couponFound.applied = true;
            }
            if (walletFound) {
                console.log("wallet found", walletFound);
                total = walletFound.amount - walletFound.deduct;
                walletFound.applied = true;


            }

            if (address) {
                const newOrder = new Order({
                    user: userId,
                    name: address.name,
                    items: cartDetails.cartItems.map(item => ({
                        product: item.product._id,
                        quantity: item.quantity,
                        price: item.product.price
                    })),
                    total: total,
                    address: address.address,
                    zipCode: address.pincode,
                    phone: address.phone,
                    status: 'Pending',
                    paymentMethod: "payPal",
                    state: address.state,
                    city: address.place
                });

                await newOrder.save();
                console.log(newOrder, "ii");
                await cart.deleteOne({ userId: userId })
                console.log(newOrder, "jj");
                res.render("orderSuccessful", { user, cartDetails });

            }



            const execute_payment_json = {
                "payer_id": payerId,
                "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": 1
                    }
                }]
            };
            paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
                //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
                if (error) {
                    console.log(error.response);
                    throw error;
                } else {
                    console.log(JSON.stringify(payment));
                    res.render("orderSuccessful", { user });

                }
            });


        }


    } catch (error) {
        console.log(error);
    }
}

exports.paypal_err = (req, res) => {
    console.log(req.query);
    res.send("error")
}






exports.proceedToRazorPay = async (req, res) => {
    try {
        const userId = req.user.userId;
        const addressId = req.params.addrId;
        const user = await userSchema.findById(userId);
        const address = user.address.id(addressId);
        // const amount = newOrder.total * 100;
        const options = {
            amount: 1000,
            currency: 'INR',
            receipt: user.email
        };
        razorpayInstance.orders.create(options, async (err, order) => {
            if (!err) {
                console.log(order, "order");
                res.status(200).json({
                    success: true,
                    msg: 'Order Created',
                    order_id: order.id,
                    user: address.name,
                    amount: 1000,
                    key_id: RAZORPAY_ID_KEY,
                    contact: user.phone,
                });

                // Clear the cartItems array after sending the response
                // cartDetails.cartItems = [];
                // await cartDetails.save();

                // Save the order after sending the response
                // await newOrder.save();
            } else {
                res.status(400).send({ success: false, msg: 'Something went wrong!' });
            }
        });

    } catch (error) {
        console.log(error);
    }
}







exports.verifyPayment = (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body.payment;
        console.log(req.body.payment.razorpay_order_id, "verifyPayment");
        let hmac = crypto.createHmac('sha256', RAZORPAY_SECRET_KEY);
        hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
        hmac = hmac.digest("hex");
        if (hmac === razorpay_signature) {
            console.log("payment sucessfull");

        } else {
            console.log("payment failed");
        }

    } catch (error) {
        console.log(error, "error on verifyPayment")
    }

}





async function calculateTotal(cart, userId) {
    try {
        const user = await userSchema.findById(userId);
        const couponFound = user.coupon.find((c) => c.applied === false);
        let total = 0;
        for (const item of cart.cartItems) {

            total += item.product.price * item.quantity;
        }
        if (couponFound) {
            console.log(couponFound)
            const discount = couponFound.discound;
            console.log(discount, "kkk");
            total = total - discount;
            console.log(total, "kkk");
            couponFound.applied = true;



        }
        console.log(total, "kk");
        return total; // Explicitly return the value


    } catch (error) {
        console.log(error, "erron on calculateTotal");
    }


}



exports.getOrderSucessfull = (req, res) => {

    res.render("orderSuccessful");
}



exports.viewOrder = async (req, res) => {
    try {
        const userid = req.user.userId;
        const user = await userSchema.findById(userid);
        const orders = await Order.find({ user: user._id }).populate('items.product');
        res.render("orderViewByUser", { user, orders });

    } catch (error) {
        console.log(error);
    }

}




exports.viewOrderDetail = async (req, res) => {
    try {
        const userid = req.user.userId;
        const orderId = req.params.orderId;
        const user = await userSchema.findById(userid);
        const orders = await Order.findById(orderId).populate('items.product');
        res.render("viewOrderDetail", { user, orders });


    } catch (error) {
        console.log(error);

    }

}





//edit userProfile
exports.userProfile = async (req, res) => {
    try {
        const userToken = req.user;
        const userId = userToken.userId;
        const userCart = await cart.findOne({ userId });
        const wallet = await Wallet.findOne({ userId });
        const user = await userSchema.findById(userId);
        let CartLength = 0
        if (userCart) {
            CartLength = userCart.cartItems.length
        } else {
            CartLength = 0
        }
        res.render("userProfile", { userDetail: user, CartLength, user, wallet });

    } catch (error) {
        console.log(error, "error on userProfile");

    }

}




exports.addressEdit = async (req, res) => {
    try {
        const userToken = req.user;
        const userId = userToken.userId;
        const { name, address, phone, place, state, pin } = req.body
        console.log(name, address, phone, place, state, pin);
        const id = req.params.id;
        console.log(id);


        const updatedAddress = await userSchema.findByIdAndUpdate(
            userId,
            {
                $set: {
                    "address.$[elem].name": name,
                    "address.$[elem].address": address,
                    "address.$[elem].phone": phone,
                    "address.$[elem].pincode": pin,
                    "address.$[elem].place": place,
                    "address.$[elem].state": state,
                }
            },
            { arrayFilters: [{ "elem._id": id }], new: true }


        );
        console.log(updatedAddress);
        res.redirect("/userProfile");
    } catch (error) {
        console.log(error)
    }


}

exports.addressRemove = async (req, res) => {
    try {
        const userToken = req.user;
        const userId = userToken.userId;
        console.log("hhhh")
        const { addressId } = req.body;
        console.log(addressId);
        if (addressId) {
            const updatedAddress = await userSchema.findByIdAndUpdate(
                userId,
                {
                    $pull: {
                        address: { _id: addressId }
                    }
                },
                { new: true }
            );
            res.json({ redirect: "/userProfile" });


        } else {
            console.log("On the user profile, Id of the addess is not getting from req.body for removalAddress")
        }


    } catch (error) {
        console.log(error)
    }
}







exports.editProfile = async (req, res) => {
    try {
        const userToken = req.user;
        const userId = userToken.userId;

        const { name, phone, email, newPassword } = req.body;

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Find the user by ID and update the fields
        const userDetail = await userSchema.findByIdAndUpdate(
            userId,
            { name, phone, email, password: hashedPassword },
            { new: true }
        );

        if (!userDetail) {
            // User not found
            return res.status(404).json({ error: "User not found" });
        }
        res.redirect("/userProfile")
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: "Server error" });
    }

}






// Find products with a low rating range (2000 to 10000)
exports.findPriceLowRated = async (req, res) => {
    try {
        const userToken = req.user;
        const userId = userToken.userId;
        const user = await userSchema.findById(userId);
        const lowPricedProducts = await productSchema.find({
            price: { $gte: 2000, $lte: 10000 }                 // Filter products within the price range
        })
        const productsByCategory = false;
        res.render("userPriceCategory", { user, lowPricedProducts, productsByCategory });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

}



exports.categorySelection = async (req, res) => {
    try {
        const userToken = req.user;
        const userId = userToken.userId;
        const user = await userSchema.findById(userId);
        const categoryName = req.query.category;

        // Find the category and populate the products field
        const productsByCategory = await productSchema.find({ category_name: categoryName })

        if (!productsByCategory) {
            return res.status(404).send('Category not found');
        }
        const lowPricedProducts = false; // Set your low-priced products here if needed
        res.render('userPriceCategory', { user, productsByCategory, lowPricedProducts });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};



exports.invoicesPdf = async (req, res) => {
    try {
        const userid = req.user.userId;
        const orderId = req.params.orderId;
        const user = await userSchema.findById(userid);
        const orders = await Order.findById(orderId).populate('items.product');
        res.render("invoicePdf", { orders });


    } catch (error) {
        console.log(error);

    }

}



exports.cancelOrder = async (req, res) => {


    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }


        order.status = "Cancelled";
        order.cancelReason = req.body.reason;
        await order.save();
        console.log(order)

        res.status(200).redirect(`/viewOrderDetail/${orderId}`)
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

}

exports.redeemCoupon = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userSchema.findById(userId);



        const addressId = req.params.addressId;
        const { promoCode, total } = req.body;
        console.log("ok", promoCode, total);
        const amount = parseInt(total);
        console.log(amount);
        const couponFound = await coupon.findOne({ 'coupon.promoCode': promoCode });

        if (couponFound) {
            const thresholdAmount = couponFound.coupon[0].thresholdAmount;
            const percentageOff = couponFound.coupon[0].percentageOff;

            if (amount >= thresholdAmount) {

                const found = await userSchema.findOne({ 'coupon.promoCode': promoCode });
                if (!found) {
                    const percentage = percentageOff / 100;
                    const deduct = percentage * amount;
                    const payable = amount - deduct;
                    user.coupon.push({ promoCode: promoCode, discound: deduct, applied: false });
                    user.save();
                    res.redirect(`/proceedToCheckOut/${addressId}?payable=${payable}`);

                } else {
                    res.redirect(`/proceedToCheckOut/${addressId}?message=Sorry coupon already used`);


                }

            } else {
                res.redirect(`/proceedToCheckOut/${addressId}?message=Coupon not applicable for this purchase`);

            }

        } else {
            res.redirect(`/proceedToCheckOut/${addressId}?message=Inavlid entry`);
        }

    } catch (error) {
        console.log("");
    }

}


exports.getShops = async (req, res) => {
    try {
        const userToken = req.user;
        const userId = userToken.userId;
        const user = await userSchema.findById(userId);
        const cartProducts = await cart.findOne({ userId });
        const products = await productSchema.find();
        let CartLength = 0
        if (cartProducts) {
            CartLength = cartProducts.cartItems.length
        } else {
            CartLength = 0
        }
        res.render("shopSingle", { user, CartLength, products });

    } catch (error) {
        console.log(error, "error on getShop");
    }

}


exports.getShop = async (req, res) => {
    try {
        let CartLength = 0;
        const products = await productSchema.find();


        // Check if user is authenticated
        if (req.user) {
            const userId = req.user.userId;
            const user = await userSchema.findById(userId);
            const cartProducts = await cart.findOne({ userId });

            if (cartProducts) {
                CartLength = cartProducts.cartItems.length;
                res.render("shopSingle", { user, CartLength, products });
            }



        } else {
            // Guest user
            res.render("shopSingle", { CartLength, products, user: null });
        }
    } catch (error) {
        console.log(error, "error on getShop");
    }
};




exports.getProductByPrice = async (req, res) => {
    try {

        const rangeValues = req.body.rangeValues.split(',');
        const minRange = rangeValues[0];
        const maxRange = rangeValues[1];
        const minValue = parseInt(minRange);
        const maxValue = parseInt(maxRange);
        const products = await productSchema.find({ price: { $gte: minValue, $lte: maxValue } });
        if (req.user) {
            const userToken = req.user;
            const userId = userToken.userId;
            const user = await userSchema.findById(userId);

            const cartDetails = await cart.findOne({ userId: userId })
            let CartLength = 0
            if (cartDetails) {
                CartLength = cartDetails.cartItems.length
            } else {
                CartLength = 0
            }
            return res.render("shopSingle", { products, user, CartLength, minValue, maxValue });

        } else {
            const user = null;
            const CartLength = 0;
            return res.render("shopSingle", { products, user, CartLength, minValue, maxValue });

        }
    } catch (error) {
        console.log(error, "error on getProductByPrice");
    }
}





exports.sortProductByPrice = async (req, res) => {
    try {
        console.log("testtttt")

        const value = req.query.value;
        let CartLength = 0;
        let products = {}
        if (value === "ascenting") {
            products = await productSchema.find({}).sort({ price: 1 });
        } else if (value === "decenting") {
            products = await productSchema.find({}).sort({ price: -1 });

        } else if (value === "Omega") {
            products = await productSchema.find({ category_name: "OMEGA" });

        } else if (value === "Rolex") {
            products = await productSchema.find({ category_name: "ROLEX" });

        } else if (value === "Apple") {
            products = await productSchema.find({ category_name: "APPLE" });

        }

        if (req.user) {
            const userToken = req.user;
            const userId = userToken.userId;
            const user = await userSchema.findById(userId);
            const cartDetails = await cart.findOne({ userId: userId });

            if (cartDetails) {
                CartLength = cartDetails.cartItems.length;
            } else {
                CartLength = 0;
            }
            return res.render("shopSingle", { products, user, CartLength });

        } else {
            const user = null;
            const CartLength = 0;
            return res.render("shopSingle", { products, user, CartLength });

        }


    } catch (error) {
        console.log(error, "error on productCategory")
    }
}





















//logout and session destroy
exports.logOut = (req, res) => {

    res.clearCookie('jwt'); // Assuming the token is stored in a cookie
    res.redirect("/");
}














