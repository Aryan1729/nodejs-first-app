// // const http=require("http")
// import http from "http"
// import { generateLovePercent } from "./feature.js";
// // console.log();
// import fs from "fs"
// const home=fs.readFile("./index.html",(err,data)=>{
//     console.log("File Read");
// });
// console.log(home);
// const server=http.createServer((req,res)=>{
// //    console.log(req.url); url access
// // res.end("nicee");

// if(req.url==="/about"){
//     res.end(`<h1>${generateLovePercent() }<h1>`);
// }
// else if(req.url==="/"){
//     res.end("<h1>home <h1>");
// }
// else if(req.url==="/contact"){
//     res.end("<h1>contact page <h1>");
// }
// else{
//     res.end("<h1>page not found<h1>")
// }
// });
// server.listen(5000,()=>{
//     console.log("server is working");
// });

/* gyhujikolpds           */

// import express from "express";
// import path from "path";
//  const app =express();
//  app.get("/",(req,res)=>{
//     // res.send("hi")
//     // res.sendStatus(404)
//     // res.json({    // json data
//     //     success:true,
//     //     product:[575,489]
//     // })
//     // res.status(400).send("meri marzi");
//     const pathlocation = path.resolve();
//     res.sendFile(path.join(pathlocation,"./index.html"))

//  });
//  app.listen(5000,()=>{
//     console.log("server is working");
//  });

/* *******ejs* */
import express from "express";
import mongoose from "mongoose";
import path from "path";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

// Connect to the MongoDB database
mongoose
  .connect("mongodb://localhost:27017", {
    dbName: "Backend",
  })
  .then(() => console.log("Database connected"))
  .catch((e) => console.log("Database not connected:", e));

// Define the user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

// Create a model based on the schema
const User = mongoose.model("User", userSchema);

// Initialize the Express application
const app = express();

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(path.resolve(), "public")));

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Middleware to parse cookies
app.use(cookieParser());

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Middleware for authentication
const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    try {
      const decoded = jwt.verify(token, "asdfghjkl");
      req.user = await User.findById(decoded._id);
      next();
    } catch (err) {
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
};

// Route for the home page
app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { name: req.user.name });
});

// Route to serve the registration page
app.get("/register", (req, res) => {
  res.render("register");
});

// Route to handle registration
app.post("/register", async (req, res) => {
  try {
    const { name, email } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.redirect("/login");
    }
    user = await User.create({ name, email });
    const token = jwt.sign({ _id: user._id }, "asdfghjkl");
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 1000), // 1 minute expiry
    });
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Route to serve the login page
app.get("/login", (req, res) => {
  res.render("login");
});

// Route to handle login
app.post("/login", async (req, res) => {
  try {
    const { name,email ,password} = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.redirect("/register");
    }
    const token = jwt.sign({ _id: user._id }, "asdfghjkl");
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 1000), // 1 minute expiry
    });
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Route to handle logout
app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

// Start the server
app.listen(5000, () => {
  console.log("Server is working on http://localhost:5000");
});
