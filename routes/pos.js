const express = require("express");
const router = express.Router();
const posController = require("../controllers/pos");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.put("/addItemToOrder/:id", posController.addItemToOrder);
router.put("/voidItem/:orderId/:itemId/", posController.voidItem);
router.put("/voidLine/:orderId/:itemId/", posController.voidLine);
router.put("/priceOverride/:orderId/:itemId/", posController.priceOverride);
router.put("/payment/:orderId", posController.payment);
router.put("/completeOrder/:orderId", posController.completeOrder);
router.put("/setStripeSettings", posController.setStripeSettings);

router.put("/calcChange/", posController.calcChange);

module.exports = router;
