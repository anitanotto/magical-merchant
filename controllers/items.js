const Item = require("../models/Item");
const Big = require('big.js')

module.exports = {
  getItems: async (req, res) => {
    try {
      const items = await Item.find()

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
      res.redirect("/pos");
      } catch (err) {
        console.log(err)
      }
  },
};
