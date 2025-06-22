const csrf = require("csurf");
const csrfProtection = csrf();
var createError = require("http-errors");
var express = require("express");
var session = require("express-session");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const fs = require("fs");
const flash = require("connect-flash");

// Import JWT auth middleware
const auth = require("./middleware/auth"); // Add this line

const uploadDir = path.join(__dirname, "public/uploads");

var adminRouter = require("./routes/admin");
var usersRouter = require("./routes/users");
const pdfRoutes = require("./routes/pdf");

// API routers
const apiAuth = require("./routes/api/auth");
const apiWomen = require("./routes/api/women");
const apiCart = require("./routes/api/cart");
const apiOrders = require("./routes/api/orders");

var db = require("./config/db");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(flash());

// Create upload directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Upload directory created:", uploadDir);
}

// Session middleware
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
  })
);

// Make user and admin info available to views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.currentadmin = req.session.admin || null;
  next();
});

// Flash messages middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/", usersRouter);
app.use("/admin", adminRouter);
app.use(pdfRoutes);

// API Routes
app.use("/api/auth", apiAuth); // No auth required for login/register
app.use("/api/women", apiWomen); // Public access to products
app.use("/api/cart", auth, apiCart); // Protected routes - require JWT
app.use("/api/orders", auth, apiOrders); // Protected routes - require JWT

// Error handlers
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
