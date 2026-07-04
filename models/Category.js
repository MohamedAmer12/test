const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is highly mandatory'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a category descriptive summary']
    },
    slug: {
        type: String,
        required: [true, 'Slug is required for clean URL structures'],
        lowercase: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);