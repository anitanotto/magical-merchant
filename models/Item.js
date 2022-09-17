const mongoose = require('mongoose')

const ItemSchema = new mongoose.Schema({
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
    default: 1,
  },
  code: {
    type: Number,
    required: false,
  }
})

module.exports = mongoose.model('Item', ItemSchema)
