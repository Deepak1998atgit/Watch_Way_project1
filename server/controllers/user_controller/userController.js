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

console.log(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)




exports.getLandingPage = (req, res) => {
    res.render("landingPage");
};



exports.getHomePage = async (req, res) => {
    userToken = req.user;
    const product = await productSchema.find().limit(18);
    const userId = userToken.userId;
    const user = await userSchema.findById(userId);
    res.render("homePage", { product, user });

}

exports.getUserSignin = (req, res) => {


    res.render("userSignIn")
}

exports.getUserSignUp = (req, res) => {
    res.render("userSignUp");
}

exports.shopSingle = async (req, res) => {

    try {
        const userId = req.user.userId;
        const user = await userSchema.findById(userId);
        const { id } = req.params
        console.log("gdg", req.params, "g")
        console.log("//////////", id, 'gdyg');
        const product = await productSchema.findById(id);
        console.log(product)


        if (product) {


            res.render("singleProductPage", { product, user });
        }
    } catch (error) {
        console.log(error);
        res.send(error)
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
                    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' }); // Generate a JWT
                    res.cookie('jwt', token, { httpOnly: true }); // Set the JWT as a cookie
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
        console.log(phone);
        const otpResponse = await client.verify.v2
            .services(serviceSid)
            .verifications.create({
                to: "+91" + phone,
                channel: "sms",
            });

        res.render('otp', { msg: "otp send successfully" });
    } catch (error) {
        res.status(error?.status || 400).send(error?.message || "Something went wrong!");
    }

}






exports.verifyOtp = async (req, res) => {

    const verificationCode = req.body.otp;
    const stringPhone = req.session.user;
    const phoneNumber = parseInt(stringPhone);
    console.log(phoneNumber);
    if (!phoneNumber) {
        res.status(400).send({ message: "Phone number is required" });
        return;
    }

    try {
        // Verify the SMS code entered by the user
        const verification_check = await client.verify.v2.services(serviceSid).verificationChecks.create({ to: '+91' + phoneNumber, code: verificationCode });

        if (verification_check.status === 'approved') {
            // If the verification is successful, do something

            res.render('homePage', { message: "Verification successful" });
        } else {
            // If the verification fails, return an error message
            res.render('otp', { message: "Invalid verification code" });
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
                return res.status(200).json({ message: 'Item added to cart successfully.' });
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
        if (!userCart) {

            return res.render('userCart', { cartItems: [], user }); // Pass an empty array if cart is not found
        }

        const cartItems = userCart.cartItems;
        res.render('userCart', { cartItems, user });
    } catch (error) {
        console.error('displayCartPage error:', error);
        res.status(500).json({ error: 'Failed to fetch cart items' });
    }

}




// Function to update the quantity
exports.updateQuantity = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;

        // Find the cart item by ID and update the quantity
        const updatedCartItem = await cart.findOneAndUpdate(

            { 'cartItems._id': itemId },
            { $set: { 'cartItems.$.quantity': quantity } },
            { new: true }
        );
        // Calculate the updated total amount
        let totalAmount = 0;
        updatedCartItem.cartItems.forEach((item) => {
            totalAmount += item.quantity * item.product.price;
        });


        return res.status(200).json({ message: 'Quantity updated successfully.', cartItem: updatedCartItem, totalAmount });
    } catch (error) {
        console.error('Error updating quantity:', error);
        return res.status(500).json({ error: 'Failed to update quantity.' });
    }
};




//function to delete cart item
exports.deleteCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.userId;

        // Find the user's cart and remove the cart item with the given item ID
        const updatedCart = await cart.findOneAndUpdate(
            { userId },
            { $pull: { cartItems: { _id: itemId } } },
            { new: true }
        );

        if (!updatedCart) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        return res.sendStatus(200);
    } catch (error) {
        console.error('Error deleting cart item:', error);
        return res.status(500).json({ error: 'Failed to delete cart item' });
    }
};

exports.getProceedCheckOut = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userSchema.findById(userId);
        const order = await Order.findOne({ user: userId });
        const cartProducts = await cart.findOne({ userId }).populate('cartItems.product')


        res.render("proceedToCheckOut", { user: user, order, cartProducts });
    } catch (err) {
        console.log(err)
    }

}





exports.orderConfirmation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userSchema.findById(userId);
        const cartDetails = await cart.findOne({ userId }).populate('cartItems.product');
        if (!cartDetails) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const { addressCheckbox, address, zip, phone, name, city, payment, state } = req.body;
        const order = await Order.findOne({ user: userId });
        console.log(addressCheckbox, address, zip, phone, name, city, payment, state);




        // Checkbox is not checked or order not found, create a new address
        const newOrder = new Order({
            user: cartDetails.userId,
            name: name,
            items: cartDetails.cartItems.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            })),
            total: calculateTotal(cartDetails),
            address: address,
            zipCode: zip,
            phone: phone,
            status: 'Pending',
            paymentMethod: payment,
            state: state,
            city: city
        });

        console.log(newOrder);

        if (payment === "Razorpay") {
            try {
                const amount = newOrder.total * 100;
                const options = {
                    amount: amount,
                    currency: 'INR',
                    receipt: user.email
                };

                razorpayInstance.orders.create(options, async (err, order) => {
                    if (!err) {
                        console.log(order, "order");
                        res.status(200).send({
                            success: true,
                            msg: 'Order Created',
                            order_id: order.id,
                            user: newOrder.name,
                            amount: amount,
                            key_id: RAZORPAY_ID_KEY,
                            product_name: newOrder.name,
                            description: "hii iam description hard string",
                            contact: user.phone,
                            name: user.name,
                            email: user.email,
                            order: order
                        });

                        // Clear the cartItems array after sending the response
                        // cartDetails.cartItems = [];
                        await cartDetails.save();
                          
                        // Save the order after sending the response
                        await newOrder.save();
                        const orderId= await newOrder._id;
                        console.log(orderId,"orderId")
                    } else {
                        res.status(400).send({ success: false, msg: 'Something went wrong!' });
                    }
                });
            } catch (error) {
                console.log(error.message + "Error on razorpay catch");
            }
        }
        else if (payment === "payPal") {
            const orderId= await newOrder._id.toString();
            await newOrder.save();
            let curren = await convertToUSD(newOrder.total, "INR");
            console.log("payapal", curren);

            const createPayment = {
                intent: 'sale',
                payer: {
                    payment_method: 'paypal'
                },
                redirect_urls: {                                       
                    return_url: `http://localhost:4000/paypal-success/${orderId}`,
                    cancel_url: `http://localhost:4000/paypal-cancel/${orderId}`
                },
                transactions: [{
                    amount: {
                        total: await convertToUSD(newOrder.total,'INR'), // Replace with actual total amount
                        currency: 'USD' // Replace with actual currency
                    },
                    description: 'Payment description' // Replace with actual description
                }]
            };
            paypal.payment.create(createPayment, (error, payment) => {
                if (error) {
                    console.error('Error creating PayPal payment:', error);
                    res.redirect('/payment-error');
                } else {
                    console.log("noerror")
                    // Save the payment ID to the database or session
                    const paymentId = payment.id;

                    // Redirect the user to PayPal for payment approval
                    const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;

                    res.send(approvalUrl);

                }
            });
        }
        else if (payment === "COD") {
            console.log("ygdyg", newOrder, "gdgdhdgg");
            res.render("orderSuccessful", { newOrder, user });
            return


        }

    } catch (error) {
        console.error('Error placing order:', error);
        return res.status(500).json({ error: 'Failed to place order' });
    }
}



const convertToUSD = async (amount, currency) => {
    try {
        const response = await axios.get(
            `https://api.exchangerate-api.com/v4/latest/${currency}`
        );
        const exchangeRate = response.data.rates.USD;
        const convertedAmount = amount * exchangeRate;
        console.log(convertedAmount);
        return convertedAmount.toFixed(2);
    } catch (error) {
        console.error('Error converting currency:', error);
        throw error;
    }
};

async function convertAndPrint(amount, currency) {
    try {
        const convertedAmount = await convertToUSD(amount, currency);
        console.log("paypal", convertedAmount);
        return convertedAmount; // Return the converted amount
    } catch (error) {
        // Handle any errors that occurred during conversion
        console.error('Error occurred:', error);
        throw error;
    }
}










exports.paypal_success = async (req, res) => {

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    console.log("hi")
    const orderId= req.params.orderId;
    console.log("hi")
    console.log(orderId, "gyddg")
    const newOrder = await Order.findById(orderId);
    console.log(newOrder,'fdf')
    const userId=newOrder.user.toString();
    console.log(userId);
    const user=await userSchema.findById(userId)
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": newOrder.total
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



            res.render("orderSuccessful", { payment, user, userId, newOrder })
        }
    });

}

exports.paypal_err = (req, res) => {
    console.log(req.query);
    res.send("error")
}


exports.orderConfirmations = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userSchema.findById(userId);
        const cartDetails = await cart.findOne({ userId }).populate('cartItems.product');
        if (!cartDetails) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const { addressCheckbox, address, zip, phone, name, city, payment, state } = req.body;
        const order = await Order.findOne({ user: userId });
        console.log(addressCheckbox, address, zip, phone, name, city, payment, state);
        let newOrder;

        if (addressCheckbox === 'on' && order) {
            // Checkbox is checked, use the previous address from the order
            newOrder = new Order({
                user: userId,
                name: order.name,
                items: cartDetails.cartItems.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.product.price
                })),
                total: calculateTotal(cartDetails),
                address: order.address,
                zipCode: order.zipCode,
                phone: order.phone,
                status: 'Pending',
                paymentMethod: payment,
                state: order.state,
                city: order.city
            });
        }
        if (addressCheckbox === 'off') {
            // Checkbox is not checked or order not found, create a new address
            newOrder = new Order({
                user: cartDetails.userId,
                name: name,
                items: cartDetails.cartItems.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.product.price
                })),
                total: calculateTotal(cartDetails),
                address: address,
                zipCode: zip,
                phone: phone,
                status: 'Pending',
                paymentMethod: payment,
                state: state,
                city: city
            });
        }
        console.log(newOrder);

        if (payment === "Razorpay") {
            try {
                const amount = newOrder.total * 100;
                const options = {
                    amount: amount,
                    currency: 'INR',
                    receipt: user.email
                };

                razorpayInstance.orders.create(options, async (err, order) => {
                    if (!err) {
                        console.log(order, "order");
                        res.status(200).send({
                            success: true,
                            msg: 'Order Created',
                            order_id: order.id,
                            user: newOrder.name,
                            amount: amount,
                            key_id: RAZORPAY_ID_KEY,
                            product_name: newOrder.name,
                            description: "hii iam description hard string",
                            contact: user.phone,
                            name: user.name,
                            email: user.email,
                            order: order
                        });

                        // Clear the cartItems array after sending the response
                        cartDetails.cartItems = [];
                        await cartDetails.save();

                        // Save the order after sending the response
                        await newOrder.save();
                    } else {
                        res.status(400).send({ success: false, msg: 'Something went wrong!' });
                    }
                });
            } catch (error) {
                console.log(error.message + "Error on razorpay catch");
            }
        }
        if (payment === "payPal") {

            const convertToUSD = async (amount, currency) => {
                try {
                    const response = await axios.get(
                        `https://api.exchangerate-api.com/v4/latest/${currency}`
                    );
                    const exchangeRate = response.data.rates.USD;
                    const convertedAmount = amount / exchangeRate;
                    return convertedAmount.toFixed(2);
                } catch (error) {
                    console.error('Error converting currency:', error);
                    throw error;
                }
            };
            console.log(userId, "sg");
            const createPayment = {
                intent: 'sale',
                payer: {
                    payment_method: 'paypal'
                },
                redirect_urls: {
                    return_url: `http://localhost:4000/paypal-success/${userId}`,
                    cancel_url: 'http://localhost:4000/paypal-cancel'
                },
                transactions: [{
                    amount: {
                        total: convertToUSD(newOrder.total, 'INR'), // Replace with actual total amount
                        currency: 'USD' // Replace with actual currency
                    },
                    description: 'Payment description' // Replace with actual description
                }]
            };
            paypal.payment.create(createPayment, (error, payment) => {
                if (error) {
                    console.error('Error creating PayPal payment:', error);
                    res.redirect('/payment-error');
                } else {
                    console.log("noerror")
                    // Save the payment ID to the database or session
                    const paymentId = payment.id;

                    // Redirect the user to PayPal for payment approval
                    const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
                    res.send(approvalUrl);

                }
            });
        }
        if (payment === "COD") {
            console.log(newOrder)
            res.render("orderSuccessful", { newOrder, user })
        }

    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Failed to place order' });
    }
}




exports.verifyPayment = (req, res) => {
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
}


function calculateTotal(cart) {
    let total = 0;
    for (const item of cart.cartItems) {
        total += item.product.price * item.quantity;
    }
    return total;
}



exports.getOrderSucessfull = (req, res) => {
    res.render("orderSuccessful");
}







//edit userProfile
exports.userProfile = async (req, res) => {
    const userToken = req.user;
    const userId = userToken.userId;
    const user = await userSchema.findById(userId);
    res.render("userProfile", { userDetail: user });
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






















//logout and session destroy
exports.logOut = (req, res) => {

    res.clearCookie('jwt'); // Assuming the token is stored in a cookie
    res.redirect("/");
}














