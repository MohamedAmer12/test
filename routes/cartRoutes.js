const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.route('/')
    .get(cartController.getCart)
    .post(cartController.addItemToCart)
    .patch(cartController.updateCartItem)
    .delete(cartController.clearCart);

router.route('/:productId')
    .delete(cartController.removeItemFromCart);

module.exports = router;