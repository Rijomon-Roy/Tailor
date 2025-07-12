const express = require("express");
const router = express.Router();
const admins = require("../models/admin");
const appointments = require("../models/appointment");
const nodemailer = require("nodemailer");
const Women = require("../models/women");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Add this line at the top with other requires

// Admin Login Page
router.get("/", (req, res) => {
  res.render("admin/login", { title: "Admin Login", error: null });
});

// Admin Login POST
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await admins.findOne({ username });
    console.log("Admin found:", admin); // debug
    if (!admin) {
      return res.render("admin/login", {
        title: "Admin Login",
        error: "Username not found",
      });
    }

    if (admin.password !== password) {
      return res.render("admin/login", {
        title: "Admin Login",
        error: "Incorrect password",
      });
    }

    req.session.admin = {
      id: admin._id,
      username: admin.username,
    };

    return res.redirect("/admin/adminpage");
  } catch (err) {
    console.error(err);
    return res.render("admin/login", {
      title: "Admin Login",
      error: "Something went wrong",
    });
  }
});

// Admin Dashboard Page
router.get("/adminpage", async (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/admin");
  }

  try {
    const adminData = await admins.findById(req.session.admin.id).lean();

    console.log("Admin data:", adminData); // debug
    res.render("admin/adminpage", {
      title: "Admin Page",
      currentadmin: adminData,
    });
  } catch (err) {
    console.error(err);
    res.render("admin/adminpage", {
      title: "Admin Page",
      currentadmin: null,
      error: "Failed to load admin data",
    });
  }
});

// Admin Logout
router.get("/adminlogout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.redirect("/admin/adminpage");
    }
    res.redirect("/admin");
  });
});

// Appointment POST
router.post("/appointment", async (req, res) => {
  const { name, email, phone, serviceType } = req.body;
  const validServiceType = ["stitching", "alteration", "custom"].includes(
    serviceType
  )
    ? serviceType
    : "N/A";

  try {
    const newAppointment = new appointments({
      name,
      email,
      phone,
      serviceType: validServiceType,
    });

    await newAppointment.save();

    return res.render("appointment", {
      title: "Appointment",
      error: null,
      currentadmin: req.session.admin,
    });
  } catch (err) {
    console.error(err);
    return res.render("appointment", {
      title: "Appointment",
      error: "Something went wrong",
    });
  }
});

// Appointment Dashboard
router.get("/appointmentDashboard", async (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/admin");
  }

  try {
    const allAppointments = await appointments.find();
    const adminData = await admins.findById(req.session.admin.id).lean();
    res.render("admin/appointmentDashboard", {
      title: "Appointment Dashboard",
      appointments: allAppointments,
      currentadmin: adminData,
    });
  } catch (err) {
    console.error(err);
    res.render("admin/appointmentDashboard", {
      title: "Appointment Dashboard",
      appointments: [],
      error: "Failed to load appointments",
      currentadmin: req.session.admin,
    });
  }
});
// Delete Appointment
router.post("/deleteAppointment/:id", async (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/admin"); // If not logged in, redirect to login
  }

  try {
    await appointments.findByIdAndDelete(req.params.id);
    res.redirect("/admin/appointmentDashboard"); // After delete, reload dashboard
  } catch (err) {
    console.error("Error deleting appointment:", err);
    res.status(500).send("Error deleting appointment");
  }
});

// approvel code
// Ensure you install nodemailer via npm

router.post("/approve", async (req, res) => {
  const { email, dateTime } = req.body;

  if (!req.session.admin) {
    return res.status(401).send("Unauthorized: Admin not logged in");
  }

  try {
    // Configure nodemailer for sending emails
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your SMTP service
      auth: {
        user: "rijoroykallattu@gmail.com", // Replace with your email
        pass: "mgqj xciy opsk yjmt", // Replace with your email password or app password
      },
      tls: {
        rejectUnauthorized: false, // Add this line
      },
    });
    // Email content
    const mailOptions = {
      from: "rijoroykallattu@gmail.com", // Sender email
      to: email, // Recipient email
      subject: "Approval Notification",
      text: `Your data has been approved! Scheduled date and time: ${dateTime}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`Approval email sent to ${email} with date/time: ${dateTime}`);
    res.status(200).send("Approval email sent successfully");
  } catch (err) {
    console.error("Error sending approval email:", err);
    res.status(500).send("Failed to send approval email");
  }
});

// Route to render the womencollection page
router.get("/womencollection", async (req, res) => {
  try {
    const products = await Women.find();
    res.render("admin/womencollection", { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Route to handle form submission for adding a new product

// Configure storage location and file naming
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads")); // Correct path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
// Route to render the form for adding a new product
router.post(
  "/womencollection/add-product",
  upload.single("imageFile"),
  async (req, res) => {
    try {
      if (!req.file) {
        throw new Error("No file uploaded");
      }

      const { name, price, description } = req.body;
      if (!name || !price || !description) {
        throw new Error("Missing required fields");
      }

      // Verify file was saved
      const filePath = path.join(
        __dirname,
        "../public/uploads",
        req.file.filename
      );
      if (!fs.existsSync(filePath)) {
        throw new Error("File was not saved correctly");
      }

      const imagePath = "/uploads/" + req.file.filename;

      const newProduct = new Women({
        name,
        price,
        description,
        imageUrl: imagePath,
      });

      await newProduct.save();
      res.redirect("/admin/womencollection");
    } catch (err) {
      console.error("Error adding product:", err);

      // Clean up the file if it was uploaded but there was another error
      if (req.file) {
        const filePath = path.join(
          __dirname,
          "../public/uploads",
          req.file.filename
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.status(500).send(`Error: ${err.message}`);
    }
  }
);
// GET route to show the update form
router.get("/womencollection/update-product/:id", async (req, res) => {
  try {
    const product = await Women.findById(req.params.id);
    if (!product) {
      throw new Error("Product not found");
    }
    res.render("admin/updateproduct", { product, error: null });
  } catch (error) {
    console.error("Error loading update form:", error);
    res.redirect("/admin/womencollection");
  }
});

// Update Product (including updating image)
router.post(
  "/womencollection/update-product/:id",
  upload.single("imageFile"),
  async (req, res) => {
    try {
      const { name, price, description, currentImageUrl } = req.body;

      const product = await Women.findById(req.params.id);
      if (!product) {
        throw new Error("Product not found");
      }

      product.name = name;
      product.price = price;
      product.description = description;

      if (req.file) {
        // Delete old image if it exists
        if (currentImageUrl) {
          const oldImagePath = path.join(
            __dirname,
            "../public",
            currentImageUrl
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        // Save new image
        product.imageUrl = "/uploads/" + req.file.filename;
      }

      await product.save();
      res.redirect("/admin/womencollection");
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).render("admin/updateproduct", {
        product: req.body,
        error: "Failed to update product: " + error.message,
      });
    }
  }
);

// Delete Product
router.post("/womencollection/delete-product/:id", async (req, res) => {
  try {
    const product = await Women.findById(req.params.id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Delete associated image
    if (product.imageUrl) {
      const filePath = path.join(__dirname, "../public", product.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Women.findByIdAndDelete(req.params.id);
    res.redirect("/admin/womencollection");
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send("Error deleting product");
  }
});

module.exports = router;
