const jwt = require("jsonwebtoken");
const users = require("../models/users");

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error();
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Find user
    const user = await users.findOne({
      _id: decoded._id,
      // You might want to add additional checks here
    });

    if (!user) {
      throw new Error();
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).send({
      error: "Please authenticate with a valid token.",
    });
  }
};

module.exports = auth;
