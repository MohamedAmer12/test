const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Order items must maintain a clear matching Product reference']
    },
    name: { 
        type: String, 
        required: [true, 'Historical item label snapshot string is mandatory'] 
    },
    price: { 
        type: Number, 
        required: [true, 'Purchased value numeric snapshot mapping is mandatory'] 
    },
    quantity: { 
        type: Number, 
        required: [true, 'Item order unit count metrics are required'] 
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: [true, 'A distinct lookup order reference string must be produced']
    },
    items: [orderItemSchema],
    totalPrice: {
        type: Number,
        required: [true, 'Calculated checkout total price is required']
    },
    status: {
        type: String,
        enum: {
            values: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            message: 'Status parameters must strictly select within: Pending, Processing, Shipped, Delivered, or Cancelled'
        },
        default: 'Pending'
    },
    shippingAddress: {
        type: String,
        required: [true, 'Please supply a structural location delivery destination address']
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);