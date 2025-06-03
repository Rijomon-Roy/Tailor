const mongoose = require("mongoose");

const womenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

const Women = mongoose.model("women", womenSchema);

module.exports = Women;
