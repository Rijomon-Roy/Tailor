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

const uploadDir = path.join(__dirname, "public/uploads");

// const searchApi = require("./routes/api/searchApi");
var adminRouter = require("./routes/admin");
var usersRouter = require("./routes/users");

var db = require("./config/db");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");

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

// Single session middleware
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
  })
);

// Single middleware for making user and admin info available to views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.currentadmin = req.session.admin || null;
  next();
});

app.use("/", usersRouter);
app.use("/admin", adminRouter);
// app.use("/api", searchApi);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

module.exports = app;
