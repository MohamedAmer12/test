const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Item must map to a explicit Product reference ID']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity metrics are mandatory'],
        min: [1, 'Quantity calculations cannot fall below 1 unit']
    },
    price: {
        type: Number,
        required: [true, 'Item snapshot pricing value must be recorded']
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    items: [cartItemSchema],
    totalPrice: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

cartSchema.pre('save', function(next) {
    const total = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    this.totalPrice = parseFloat(total.toFixed(2));
    next();
});

module.exports = mongoose.model('Cart', cartSchema);