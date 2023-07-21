require("dotenv").config();
const express=require('express');
const path=require("path");
const session=require('express-session');
const cookieParser = require("cookie-parser"); // Include the cookie-parser
const app=express();
const killPort=require("kill-port");
const paypal=require('paypal-rest-sdk');
const PAYPAL_CLIENT_ID=process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET=process.env.PAYPAL_CLIENT_SECRET;
paypal.configure({
    'mode': 'sandbox',
    'client_id': PAYPAL_CLIENT_ID,
    'client_secret': PAYPAL_CLIENT_SECRET

});






const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectdB=require("./server/connection/connection");
const nocache=require("nocache");


//upload file show
app.use(cookieParser());
app.use(express.static("uploads"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(nocache());


app.use(
    session({
      secret: "secret",
      resave: "false",
      cookie: { sameSite: "strict" },      
      saveUninitialized: true,
      maxAge: 3600000, // Session duration: 1 hour
    })
);
app.use("/", require("./server/Routers/admin_router/adminRouter"));
app.use("/",require("./server/Routers/user_router/userRouter"));



app.set("view engine", "ejs");
app.set("views", [
    __dirname + "/views/admin_views",
    __dirname + "/views/user_views",
    __dirname + "/views/otp",
]);

app.use((req, res) => {
    res.status(404).render('404'); // Render the 404.ejs view
  });

const port=4000;
// Kill the port if it's already in use
killPort(port)
    .then(() => {
        // Port is now free, start the server
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            console.log("http://localhost:4000")
        });
    })
    .catch((err) => {
        // Unable to kill the port
        console.error(`Failed to kill port ${port}: ${err.message}`);
    });