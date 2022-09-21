const cloudinary = require("../middleware/cloudinary");
const Order = require("../models/Order");
const Item = require("../models/Item");
const Big = require('big.js')
const stripe = require('stripe')(process.env.STRIPE_KEY)
const QRcode = require('qrcode-svg')

module.exports = {
  getPos: async (req, res) => {
    try {
      let order = await Order.findOne({ user: req.user._id, completed: false })
      console.log(order)
      if (order == null) {
          order = await Order.create({ user: req.user.id })
      }
      res.render("pos.ejs", { order: order, user: req.user, Big: Big });
    } catch (err) {
      console.log(err);
    }
  },
  addItemToOrder: async (req, res) => {
    try {
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
            console.log(order.subtotal)
            order.tax = order.children.reduce((a,b) => Big(a).plus(Big(b.tax)).times(Big(b.quantity)), Big('0.00')).toFixed(2)
            console.log(order.tax)
            order.total = (Big(order.subtotal).plus(Big(order.tax))).toFixed(2)
            console.log(order.total)

            await order.save()
        } else {
          console.log('Failed to add item to order');
        }

      res.redirect('/pos');
                

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
        console.log(order.subtotal)
        order.tax = order.children.reduce((a,b) => Big(a).plus(Big(b.tax)).times(Big(b.quantity)), Big('0.00')).toFixed(2)
        console.log(order.tax)
        order.total = (Big(order.subtotal).plus(Big(order.tax))).toFixed(2)
        console.log(order.total)

         await order.save()

         } else {
            console.log('No item to void')
         }

         res.redirect('/pos');
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
        console.log(order.subtotal)
        order.tax = order.children.reduce((a,b) => Big(a).plus(Big(b.tax)).times(Big(b.quantity)), Big('0.00')).toFixed(2)
        console.log(order.tax)
        order.total = (Big(order.subtotal).plus(Big(order.tax))).toFixed(2)
        console.log(order.total)
         await order.save()



         } else {
            console.log('No items to void')
         }



         res.redirect('/pos');
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
             console.log(item.price)
         item.total = Big(item.price).plus(Big(item.tax)).times(Big(item.quantity))
         await order.save()
         } else {
            console.log('Override is the same as original price.')
         }

         } else {
            console.log('No items to override')
         }

         res.redirect('/pos');
     } catch(err) {
         console.log(err);
     }

  },
  completeOrder: async(req,res) => {
    try {
      
      const order = await Order.findOne({ _id: req.params.orderId })
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

      res.send(new QRcode(paymentLink.url).svg())
      
      /*
      stripe.products.create({
          name: 'Order #' + order.id,
          description: 'test',
          id: order.id,
      }).then(product => {
          stripe.prices.create({
              unit_amount: Number(order.total.toString().split('.').join('')),
              currency: 'usd',
              product: product.id,
          }).then(price => {
              console.log('Success! Product ID: ' + product.id)
              console.log('Success! Price ID: ' + price.id)
              priceId = price.id
          })
      })
      */
    

      // Testing for payment link.
      /*
      order.completed = true
      console.log(`Order #${req.params.orderId} completed!`)
      await order.save()
      res.redirect('/pos');
      */  
    } catch (err) {
        console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Pos.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Pos.findById(req.params.id);
      res.render("post.ejs", { post: post, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      await Pos.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/pos");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await Pos.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Pos.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Pos.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/pos");
    } catch (err) {
      res.redirect("/pos");
    }
  },
};
