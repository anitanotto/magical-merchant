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
};
