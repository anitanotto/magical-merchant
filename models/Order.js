const mongoose = require("mongoose");

const Item = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: mongoose.Decimal128,
    required: true,
  },
  tax: {
    type: mongoose.Decimal128,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  code: {
    type: String,
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
      type: mongoose.Decimal128,
      required: true,
      default: '0.00',
  },
  tax: {
      type: mongoose.Decimal128,
      required: true,
      default:  '0.00',
  },
  total: {
      type: mongoose.Decimal128,
      required: true,
      default: '0.00',
  },
  completed: {
      type: Boolean,
      default: false,
      required: true,
  },
  paymentUrl: {
      type: String,
      default: '',
  },
  paymentQr: {
      type: String,
      default: '',
  },
});

module.exports = mongoose.model("Order", OrderSchema);
