const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const posController = require("../controllers/pos");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.get("/:id", ensureAuth, posController.getPost);

router.post("/createPost", upload.single("file"), posController.createPost);

router.put("/addItemToOrder/:id", posController.addItemToOrder);

router.delete("/deletePost/:id", posController.deletePost);

module.exports = router;
