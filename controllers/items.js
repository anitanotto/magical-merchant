const Item = require("../models/Item");
const User = require("../models/User");
const Big = require('big.js')

module.exports = {
  getItemDb: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.user.id })
      const currencyTable = {
            'usd' : '$'
      }
      const currency = currencyTable[user.stripeCurrency]
        console.log(currency)
      const items = await Item.find({ user: req.user.id })

      res.render('items.ejs', { user: req.user.id, currency: currency, items: items, Big: Big })
    } catch (err) {
      console.log(err);
    }
  },
  getItems: async (req, res) => {
    try {
      const items = await Item.find({ user: req.user._id})

      res.send(items)

    } catch (err) {
      console.log(err);
    }
  },
  addItem: async (req, res) => {
      try {
      await Item.create({
        name: req.body.itemName,
        price: Big(req.body.itemPrice).toFixed(2).toString(),
        tax: Big(req.body.itemTax).toFixed(2).toString(),
        code: req.body.itemCode,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.render("add-item.ejs");
      } catch (err) {
        console.log(err)
      }
  },
};
