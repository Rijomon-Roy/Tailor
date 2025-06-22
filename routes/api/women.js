const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Women = require("../../models/women");

// Get all women's products
router.get("/", async (req, res) => {
  try {
    const products = await Women.find();
    res.send(products);
  } catch (err) {
    res.status(500).send();
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Women.findById(req.params.id);
    if (!product) {
      return res.status(404).send();
    }
    res.send(product);
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
