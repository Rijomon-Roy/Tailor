const express = require("express");
const router = express.Router(); // Add this line to define router
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users = require("../../models/users");

// Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new users({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || "your-secret-key"
    );
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(401).send({ error: "Login failed" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ error: "Login failed" });
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || "your-secret-key"
    );
    res.send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router; // Make sure to export the router
