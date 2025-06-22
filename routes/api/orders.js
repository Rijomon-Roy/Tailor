const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Order = require("../../models/order");
const Cart = require("../../models/Cart");

// Create order
router.post("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).send({ error: "Cart is empty" });
    }

    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    const order = new Order({
      user: req.user._id,
      orderNumber: `ET${Math.floor(100000 + Math.random() * 900000)}`,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalAmount,
      status: "Processing",
    });

    await order.save();
    await Cart.findByIdAndUpdate(cart._id, { $set: { items: [] } });

    res.status(201).send(order);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get user orders
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate(
      "items.product"
    );
    res.send(orders);
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
