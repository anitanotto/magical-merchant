const mongoose = require("mongoose");

const Item = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  code: {
    type: Number,
    required: false,
  }
})


const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  children: [Item],
  subtotal: {
      type: Number,
      required: true,
      default: 0,
  },
  tax: {
      type: Number,
      required: true,
      default: 0,
  },
  total: {
      type: Number,
      required: true,
      default: 0,
  },
  completed: {
      type: Boolean,
      default: false,
      required: true,
  },
});

module.exports = mongoose.model("Order", OrderSchema);
