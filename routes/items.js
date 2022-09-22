const express = require("express");
const router = express.Router();
const itemsController = require("../controllers/items");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.get("/", ensureAuth, itemsController.getItems);

module.exports = router;
