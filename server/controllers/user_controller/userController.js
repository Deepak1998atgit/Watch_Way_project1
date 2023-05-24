const bcrypt = require("bcrypt");
const userSchema = require("../../model/userModel");
const productSchema = require("../../model/productModel");


exports.getLandingPage = (req, res) => {
    res.render("landingPage");
};



exports.getHomePage = async(req, res) => {
    const product = await productSchema.find().limit(6);
    res.render("homePage", { product });
    
}

exports.getUserSignin = (req, res) => {
    res.render("userSignIn")
}

exports.getUserSignUp = (req, res) => {
    res.render("userSignUp");
}

exports.shopSingle= async(req,res)=>{
    try{
        const {id} = req.params
        const product = await productSchema.findById(id);
        if(product){
            console.log(product);
            res.render("singleProductPage",{product});
        }
    }catch(error){
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
                if(user.isBlocked){
                    res.redirect("/homePage");
                }else{
                    res.render("userSignIn", { message: "Invalid entry sorry" });
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









