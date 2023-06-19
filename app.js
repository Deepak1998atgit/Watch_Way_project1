require("dotenv").config();
const express=require('express');
const path=require("path");
const session=require('express-session');
const cookieParser = require("cookie-parser"); // Include the cookie-parser
const app=express();





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

app.listen(4000,()=>{
    console.log("http://localhost:4000");
    
})