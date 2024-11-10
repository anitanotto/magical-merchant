const cloudinary = require("../middleware/cloudinary");
const Order = require("../models/Order");
const User = require("../models/User");
const Item = require("../models/Item");
const Big = require('big.js')
const QRcode = require('qrcode-svg')
const ejs = require('ejs')

module.exports = {
  getPos: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.user.id })
      const currencyTable = {
            'usd' : '$'
      }
      const currency = currencyTable[user.stripeCurrency]
        console.log(currency)
      let order = await Order.findOne({ user: req.user._id, completed: false })
      if (order == null) {
          order = await Order.create({ user: req.user.id })
      }
      res.render("pos.ejs", { order: order, user: req.user, Big: Big, currency: currency, stripeKey: (req.user.stripeKey ? true : false) });
    } catch (err) {
      console.log(err);
    }
  },
  addItemToOrder: async (req, res) => {
    try {
        console.log(req.body)
        let order = await Order.findOne({ _id: req.params.id })

        let item = null
        const input = req.body.searchInput
        const category = req.body.searchCategory

        if (category === 'name') {
            item = await Item.findOne({ name : input })
        } else if (category === 'code') {
            item = await Item.findOne({ code : input })
        }

        // Skip if 0 items found.
        if (item) {
            // Hash table for checking if an item is already in the current order.
            const orderItems = {}
            order.children.forEach((e, i) => {
              orderItems[e.name] = i
            })

            // Adds item to order if it is not included already, otherwise increases quantity
            if (orderItems[item.name] != null) {
                console.log(`Added ${req.body.formQuantity} ${item.name} to order.`)
                
                order.children[orderItems[item.name]].quantity += 1
                // Add additional items to order if quantity is > 1.
                if (req.body.formQuantity > 1) {
                    order.children[orderItems[item.name]].quantity += (req.body.formQuantity - 1)
                }
            } else {
                console.log(`Added ${req.body.formQuantity} ${item.name} to order.`)
                // Ensure quantity is the amount from user input.
                item.quantity = req.body.formQuantity
                order.children.push(item)
            }
            await order.save()

            // Update order values dependent on children
            order.subtotal = order.children.reduce((a,b) => Big(a).plus(Big(b.price)).times(Big(b.quantity)),Big('0.00')).toFixed(2)
            order.tax = order.children.reduce((a,b) => Big(a).plus(Big(b.tax)).times(Big(b.quantity)), Big('0.00')).toFixed(2)
            order.total = (Big(order.subtotal).plus(Big(order.tax))).toFixed(2)

            await order.save()
        } else {
          console.log('Failed to add item to order');
        }

      const user = await User.findOne({ _id: req.user.id })
      const currencyTable = {
            'usd' : '$'
      }
      const currency = currencyTable[user.stripeCurrency]
        console.log(currency)
        console.log(item._id)
        console.log(typeof item._id)
      res.render("order-info.ejs", { order: order, user: req.user, Big: Big, currency: currency, stripeKey: (req.user.stripeKey ? true : false), targetItem: String(item._id) });
                

    } catch (err) {
      console.log(err);
    }
  },
  voidItem: async(req,res) => {
     try {
         const order = await Order.findOne({ _id: req.params.orderId })
         const item = order.children.id(req.params.itemId)

         // Prevent execution when there is no selected item.
         if (item) {

         // Remove one item or the whole line if quantity remaining is 1.
         if (item.quantity > 1) {
            console.log(`Removing one ${item.name} from order.`)
            item.quantity -= 1
         } else {
            console.log(`Removing last ${item.name} from order.`)
            item.remove()
         }


        await order.save()

        // Update order values dependent on children
        order.subtotal = order.children.reduce((a,b) => Big(a).plus(Big(b.price)).times(Big(b.quantity)),Big('0.00')).toFixed(2)
        order.tax = order.children.reduce((a,b) => Big(a).plus(Big(b.tax)).times(Big(b.quantity)), Big('0.00')).toFixed(2)
        order.total = (Big(order.subtotal).plus(Big(order.tax))).toFixed(2)

         await order.save()

         } else {
            console.log('No item to void')
         }

         const user = await User.findOne({ _id: req.user.id })
         const currencyTable = {
                 'usd' : '$'
         }
         const currency = currencyTable[user.stripeCurrency]
         console.log(currency)
         const targetItem = req.params.itemId
         console.log(order.children)
         console.log('target item: ' + targetItem)
         console.log(typeof targetItem)
         res.render("order-info.ejs", { order: order, user: req.user, Big: Big, currency: currency, stripeKey: (req.user.stripeKey ? true : false), targetItem: targetItem });
                
     } catch(err) {
         console.log(err);
     }
  },
  voidLine: async(req,res) => {
     try {
         const order = await Order.findOne({ _id: req.params.orderId })
         const item = order.children.id(req.params.itemId)

         // If an item is selected, remove all of that item from the order.
         if (item) {

         console.log(`Removing all ${item.name}s from order.`)
         item.remove()
             
        // Update order values dependent on children
        order.subtotal = order.children.reduce((a,b) => Big(a).plus(Big(b.price)).times(Big(b.quantity)),Big('0.00')).toFixed(2)
        order.tax = order.children.reduce((a,b) => Big(a).plus(Big(b.tax)).times(Big(b.quantity)), Big('0.00')).toFixed(2)
        order.total = (Big(order.subtotal).plus(Big(order.tax))).toFixed(2)
         await order.save()



         } else {
            console.log('No items to void')
         }

         const user = await User.findOne({ _id: req.user.id })
         const currencyTable = {
                 'usd' : '$'
         }
         const currency = currencyTable[user.stripeCurrency]
         console.log(currency)
         res.render("order-info.ejs", { order: order, user: req.user, Big: Big, currency: currency, stripeKey: (req.user.stripeKey ? true : false), targetItem: String(order.children.at(-1)._id) });


     } catch(err) {
         console.log(err);
     }

  },
  priceOverride: async(req,res) => {
     try {
         const order = await Order.findOne({ _id: req.params.orderId })
         const item = order.children.id(req.params.itemId)
         console.log(req.body)

         // Overrides the price of the item in the order, but not in the item db.
         if (item && req.body.price !== '') {
            const newPrice = Big(req.body.price).toFixed(2)
            const oldPrice = Big(item.price).toFixed(2)
         if (newPrice !== oldPrice) {
         
         // Calculate % price change and apply same increase/reduction to the item's tax
         const priceChange = (newPrice - oldPrice) / oldPrice * 100
         item.tax = Big(item.tax * (1 + priceChange / 100)).toFixed(2)
             
         // Set item's new price & recalculate total based on quantity in order
         item.price = Big(newPrice).toFixed(2)
         item.total = Big(item.price).plus(Big(item.tax)).times(Big(item.quantity))
         await order.save()
         } else {
            console.log('Override is the same as original price.')
         }

         } else {
            console.log('No items to override')
         }

         const user = await User.findOne({ _id: req.user.id })
         const currencyTable = {
                 'usd' : '$'
         }
         const currency = currencyTable[user.stripeCurrency]
         console.log(currency)
         const targetItem = req.params.itemId
         console.log(order.children)
         console.log('target item: ' + targetItem)
         res.render("order-info.ejs", { order: order, user: req.user, Big: Big, currency: currency, stripeKey: (req.user.stripeKey ? true : false), targetItem: targetItem });


     } catch(err) {
         console.log(err);
     }

  },
  payment: async(req,res) => {
    try {
      const user = await User.findOne({ _id: req.user.id }) 
      const order = await Order.findOne({ _id: req.params.orderId })
      const total = order.total.toString() 
      const stripe = require('stripe')(user.stripeKey)

        console.log('total:' + total)
      if (order.paymentQr === '' && total !== '0.00') {
      let priceId = null
     
      const product = await stripe.products.create({
          name: 'Order #' + order.id,
          description: 'test',
          id: order.id,
      })

      const price = await stripe.prices.create({
          unit_amount: Number(order.total.toString().split('.').join('')),
          currency: 'usd',
          product: product.id,
      })

      const paymentLink = await stripe.paymentLinks.create({
          line_items: [{price: price.id, quantity: 1}],
      })

      const paymentCode = new QRcode(paymentLink.url).svg()
      order.paymentUrl = paymentLink.url
      order.paymentQr = paymentCode
      
      order.save()

      res.send(paymentCode)
      } else if (total === '0.00') {
        res.send('Cannot generate payment code with no items in order.')
      } else {
          res.send(order.paymentQr)
      }
      
    } catch (err) {
        console.log(err);
    }
  },
  setStripeSettings: async(req,res) => {
      const user = await User.findOne({ _id: req.user.id })

      user.stripeKey = req.body.stripePublicKey 
      user.save()

      res.send("<span>Updated Stripe Key Successfully!</span>")

  },
  completeOrder: async(req,res) => {
    try {
      const order = await Order.findOne({ _id: req.params.orderId })
      
      order.completed = true
      order.save()

      const currencyTable = {
            'usd' : '$'
      }
      const currency = currencyTable[req.user.stripeCurrency]
      const newOrder = await Order.create({ user: req.user.id })
        console.log('completing order');    
      res.render("order-info.ejs", { order: newOrder, user: req.user, Big: Big, currency: currency, stripeKey: (req.user.stripeKey ? true : false), targetItem: null });

    } catch (err) {
        console.log(err);
    }
  },
  calcChange: async (req, res) => {
      const user = await User.findOne({ _id: req.user.id })
      let order = await Order.findOne({ user: req.user._id })

      const orderVal = Big(order.total)
      const cashVal = Big(Number(req.body.cashVal))

      if (Number(orderVal) <= Number(cashVal)) {
            res.render("price.ejs", { change: cashVal.minus(orderVal).toFixed(2), total: '0.00' })
      } else if (Number(orderVal) > Number(cashVal)) {
            res.render("price.ejs", { change: '0.00', total: orderVal.minus(cashVal).toFixed(2) })
      }
  },
};
