var express = require("express");
var router = express.Router();
const users = require("../models/users");
const bcrypt = require("bcrypt");
const Women = require("../models/women");
const Cart = require("../models/Cart");
const Order = require("../models/order");

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

//About page
router.get("/about", (req, res) => {
  res.render("about");
});
//service page
router.get("/services", (req, res) => {
  res.render("services", { currentUser: req.session.user || null });
});
//contant page
router.get("/contact", (req, res) => {
  res.render("contact", { currentUser: req.session.user || null });
});

// Optional: handle form submission (dummy response)
router.post("/contact", (req, res) => {
  console.log("Contact form submitted:", req.body);
  res.render("contact", {
    currentUser: req.session.user || null,
    successMessage: "Thank you for contacting us! We'll get back to you soon.",
  });
});

router.get("/womencollection", async (req, res) => {
  try {
    const products = await Women.find();
    let cartItemCount = 0;
    let cartProductIds = [];

    if (req.session.user) {
      const cart = await Cart.findOne({ user: req.session.user.id });

      if (cart) {
        cartItemCount = cart.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        cartProductIds = cart.items.map((item) => item.product.toString());
      }
    }

    res.render("women", {
      title: "Women's Collection",
      products,
      currentUser: req.session.user || null,
      cartItemCount,
      cartProductIds, // <-- Pass product IDs already in cart
    });
  } catch (error) {
    console.error("Error fetching women's collection:", error.message);
    res.status(500).send("Server Error");
  }
});

//product detail page
router.get("/womencollection/:id", async (req, res) => {
  try {
    const product = await Women.findById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    let cartItemCount = 0;
    let isInCart = false;

    if (req.session.user) {
      const cart = await Cart.findOne({ user: req.session.user.id });

      if (cart) {
        cartItemCount = cart.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        isInCart = cart.items.some(
          (item) => item.product.toString() === req.params.id
        );
      }
    }

    res.render("product-details", {
      title: product.name,
      product,
      currentUser: req.session.user || null,
      cartItemCount,
      isInCart,
    });
  } catch (error) {
    console.error("Error fetching product details:", error.message);
    res.status(500).send("Server Error");
  }
});
// Add to cart route
// routes/users.js
router.get("/cart", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const cart = await Cart.findOne({ user: req.session.user.id }).populate({
      path: "items.product",
      model: "women",
    });

    // Calculate total price
    let totalPrice = 0;
    if (cart) {
      totalPrice = cart.items.reduce((total, item) => {
        return total + item.product.price * item.quantity;
      }, 0);
    }

    res.render("cart", {
      title: "Your Cart",
      currentUser: req.session.user,
      cart: cart || { items: [] },
      totalPrice,
    });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).render("error", {
      message: "Failed to load cart",
      error: err,
      currentUser: req.session.user || null,
    });
  }
});
router.post("/cart/add", async (req, res) => {
  const isAjax =
    req.xhr ||
    req.headers.accept?.includes("json") ||
    req.headers["content-type"]?.includes("application/x-www-form-urlencoded");

  if (!req.session.user) {
    if (isAjax) {
      return res
        .status(401)
        .json({ success: false, message: "Please login first" });
    }
    return res.redirect("/login");
  }

  try {
    const { productId } = req.body;
    const userId = req.session.user.id;

    // Find the user's cart or create a new one
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Product exists, increment quantity
      cart.items[existingItemIndex].quantity += 1;
    } else {
      // Add new product to cart with quantity 1
      cart.items.push({ product: productId, quantity: 1 });
    }

    await cart.save();

    if (isAjax) {
      return res.json({
        success: true,
        message: "Product added to cart",
        cart,
      });
    }

    // Redirect to cart page or back to products page
    res.redirect("/cart");
  } catch (error) {
    console.error("Error adding to cart:", error);
    if (isAjax) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to add to cart" });
    }
    res.status(500).send("Server error");
  }
});
// Add this route to your user.js router file
router.post("/cart/remove", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if not authenticated
  }

  try {
    const { productId } = req.body;
    const userId = req.session.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.redirect("/cart"); // Redirect to cart page even if cart not found
    }

    // Remove the item from the cart
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    await cart.save();

    res.redirect("/cart"); // Redirect back to cart page after successful removal
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.redirect("/cart"); // Redirect to cart page even if error occurs
  }
});

router.post("/cart/update", async (req, res) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ success: false, message: "Please login first" });
  }

  try {
    const { productId, action } = req.body;
    const userId = req.session.user.id;

    let cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    // Update quantity based on action
    if (action === "increase") {
      cart.items[itemIndex].quantity += 1;
    } else if (action === "decrease") {
      cart.items[itemIndex].quantity = Math.max(
        1,
        cart.items[itemIndex].quantity - 1
      );
    }

    await cart.save();

    // Calculate updated values
    const cartItemCount = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    const totalPrice = cart.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

    res.json({
      success: true,
      message: "Quantity updated",
      cartItemCount,
      totalPrice,
    });
  } catch (error) {
    console.error("Error updating quantity:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update quantity" });
  }
});

// this is the checkout router
router.get("/checkout", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const cart = await Cart.findOne({ user: req.session.user.id }).populate({
      path: "items.product",
      model: "women",
    });

    if (!cart || cart.items.length === 0) {
      return res.redirect("/cart");
    }

    // Calculate total price
    const totalPrice = cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    res.render("checkout", {
      title: "Checkout",
      currentUser: req.session.user,
      cart,
      totalPrice,
    });
  } catch (err) {
    console.error("Error during checkout:", err);
    res.status(500).render("error", {
      message: "Failed to process checkout",
      error: err,
      currentUser: req.session.user || null,
    });
  }
});

//order confirmation router
router.get("/order-confirmation", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    // Get the user's cart
    const cart = await Cart.findOne({ user: req.session.user.id }).populate({
      path: "items.product",
      model: "women",
    });

    if (!cart || cart.items.length === 0) {
      return res.redirect("/cart");
    }

    // Calculate total price
    const totalPrice = cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    // Create a new order
    const order = new Order({
      user: req.session.user.id,
      orderNumber: `ET${Math.floor(100000 + Math.random() * 900000)}`,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalAmount: totalPrice,
      status: "Processing",
    });

    await order.save();

    // Clear the cart after creating the order
    await Cart.findByIdAndUpdate(cart._id, { $set: { items: [] } });

    res.render("orderConfirmation", {
      title: "Order Confirmation",
      currentUser: req.session.user,
      totalPrice: totalPrice,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    console.error("Error during order confirmation:", err);
    res.status(500).render("error", {
      message: "Failed to process order confirmation",
      error: err,
      currentUser: req.session.user || null,
    });
  }
});
router.get("/orders", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const orders = await Order.find({ user: req.session.user.id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.render("orders", {
      title: "My Orders",
      currentUser: req.session.user,
      orders: orders,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).render("error", {
      message: "Failed to fetch orders",
      error: err,
      currentUser: req.session.user || null,
    });
  }
});

module.exports = router;
