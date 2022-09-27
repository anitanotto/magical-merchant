const mongoose = require('mongoose')

const ItemSchema = new mongoose.Schema({
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
    default: 1,
  },
  code: {
    type: String,
    required: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: 0,
  },
})

module.exports = mongoose.model('Item', ItemSchema)
