const cloudinary = require("../middleware/cloudinary");
const Order = require("../models/Order");
const Item = require("../models/Item");

module.exports = {
  getPos: async (req, res) => {
    try {
      const order = await Order.find({ user: req.user._id, completed: false })
      if (order.length === 0) {
          order = await Order.create()
      }
      res.render("pos.ejs", { order: order, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  addItemToOrder: async (req, res) => {
    try {
        let order = await Order.find({ _id: req.params.id })
        order = order[0]

        let item = null
        const input = req.body.searchInput

        // Search item collection based on search category from form.
        if (req.body.searchCategory === 'name') {
            item = await Item.find({ name: input })
        } else if (req.body.searchCategory === 'code') {
            if (Number.isNaN(Number(input))) {
                item = []
            } else {
                item = await Item.find({ code: Number(input) })
            }
        }
        
        console.log(item)
        // Skip if 0 items found.
        if (item.length) {
        item = item[0]
        console.log(item)

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


        // Recalculate order totals.
        order.subtotal = order.children.reduce((a,b) => a + (b.price * b.quantity),0)
        order.tax = order.children.reduce((a,b) => a + (b.tax * b.quantity),0)
        order.total = order.subtotal + order.tax

        await order.save()
        
      } else {
          console.log('Failed to add item to order');
      }

      res.redirect('/pos');
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
