const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const Order = require("../models/order");

router.get("/download-pdf/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "items.product"
    );
    if (!order) {
      return res.status(404).send("Order not found");
    }

    const doc = new PDFDocument();
    res.setHeader("Content-disposition", "attachment; filename=invoice.pdf");
    res.setHeader("Content-type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(18).text("Elite Tailoring Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Order Number: ${order.orderNumber}`);
    doc.text(`Order Date: ${order.createdAt.toDateString()}`);
    doc.text(`Order Status: ${order.status}`);
    doc.moveDown();

    doc.text("Items:");
    order.items.forEach((item) => {
      doc.text(
        `${item.product?.name} - Quantity: ${
          item.quantity
        } - Price: ₹${item.price.toFixed(2)}`
      );
    });

    doc.moveDown();
    doc.text(`Total Amount: ₹${order.totalAmount.toFixed(2)}`);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
