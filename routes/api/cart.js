const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Cart = require("../../models/Cart");
const Women = require("../../models/women");

// Get cart
router.get("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    if (!cart) {
      return res.send({ items: [] });
    }
    res.send(cart);
  } catch (err) {
    res.status(500).send();
  }
});

// Add to cart
router.post("/", auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Women.findById(productId);

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(201).send(cart);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Remove from cart
router.delete("/:productId", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).send({ error: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );
    await cart.save();
    res.send(cart);
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
