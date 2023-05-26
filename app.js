require("dotenv").config();
const express=require('express');
const path=require("path");
const session=require('express-session');
const app=express();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectdB=require("./server/connection/connection");

//upload file show

app.use(express.static("uploads"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.use(
    session({
      secret: "secret",
      resave: "false",
      cookie: { sameSite: "strict" },
      saveUninitialized: true,
    })
);



app.use("/", require("./server/Routers/admin_router/adminRouter"));
app.use("/",require("./server/Routers/user_router/userRouter"));

app.set("views", [
    __dirname + "/views/admin_views",
    __dirname + "/views/user_views",
    __dirname + "/views/otp",
]);



 


  




app.listen(4000,()=>{
    console.log("http://localhost:4000");
    
})