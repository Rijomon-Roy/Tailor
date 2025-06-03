var express = require("express");
var router = express.Router();
const users = require("../models/users");
const bcrypt = require("bcrypt");
const Women = require("../models/women");

/* GET home page */
router.get("/", (req, res) => {
  res.render("home-page", {
    title: "Home page",
    currentUser: req.session.user || null,
  });
});

//LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email, password); // debug
  try {
    const user = await users.findOne({ email });
    console.log("User found:", user); // debug
    if (!user) {
      return res.render("authentication/login", {
        title: "Login page",
        error: "Email not found. Please sign up first.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("authentication/login", {
        title: "Login page",
        error: "Incorrect password. Try again.",
      });
    }

    // Save user to session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    // ✅ Successful login — render home-page with user data
    return res.render("home-page", {
      title: "Home page",
      currentUser: req.session.user,
    });
  } catch (err) {
    // ✅ Properly placed catch block
    console.log("Login error:", err.message);
    return res.render("authentication/login", {
      title: "Login Page",
      error: "Something went wrong. Try again.",
    });
  }
});

//LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.render("home-page");
    }
    res.render("home-page");
  });
});

//SIGNIN

router.get("/signIn", (req, res) => {
  res.render("authentication/signIn", { title: "SignIn page", error: null });
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const newUsers = new users({ name, email, password });
    await newUsers.save();
    // res.send(console.log("users info saved"));
    res.render("authentication/login", { title: "Login page", error: null });
  } catch (err) {
    console.log("Error during registration:", err.message);
    let errMsg = "Registertion is Failed. Try Again";
    if (err.code === 11000) {
      errMsg = "This Email Already Registed ";
    }
    res.render("authentication/signIn", {
      title: "Sign In Page",
      error: errMsg,
    });
  }
});
//check the user logged in

router.get("/appointment", (req, res) => {
  if (req.session.user) {
    res.render("appointment", { currentUser: req.session.user }); // pass user if needed
  } else {
    res.redirect("/login"); // Redirect instead of rendering directly
  }
});
router.get("/login", (req, res) => {
  res.render("authentication/login", { title: "Login Page", error: null });
});
//Women collection

router.get("/womencollection", async (req, res) => {
  try {
    const products = await Women.find();
    res.render("women", {
      title: "Women's Collection",
      products,
      currentUser: req.session.user || null,
    }); // <== changed to "women"
  } catch (error) {
    console.error("Error fetching women's collection:", error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
