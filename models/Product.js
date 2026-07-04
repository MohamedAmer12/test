const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name cannot be left empty'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product item explanation summary is required']
    },
    price: {
        type: Number,
        required: [true, 'A numeric evaluation price must be declared'],
        min: [0, 'Pricing variables cannot venture below zero values']
    },
    stock: {
        type: Number,
        required: [true, 'Specify total inventory stock allocation metrics'],
        min: [0, 'Stock volumes cannot assume negative formats'],
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'An item must strictly point to its target Category reference']
    },
    images: {
        type: [String],
        required: [true, 'Supply at least one reference visual product link path image string']
    },
    inStock: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

productSchema.pre('save', function(next) {
    this.inStock = this.stock > 0;
    next();
});

module.exports = mongoose.model('Product', productSchema);