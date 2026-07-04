const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/appError');

exports.getAllProducts = asyncHandler(async (req, res, next) => {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    let filter = {};

    if (req.query.category) {
        filter.category = req.query.category;
    }

    if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Filter by Availability stock status boolean flag
    if (req.query.inStock) {
        filter.inStock = req.query.inStock === 'true';
    }

    if (req.query.search) {
        filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const products = await Product.find(filter);

    res.status(200).json({
        status: 'success',
        results: products.length,
        message: 'Product listing items retrieved successfully',
        data: products
    });
});

exports.getProductById = asyncHandler(async (req, res, next) => {
    // Populate requested subset properties only: 'name' and 'description'
    const product = await Product.findById(req.params.id).populate('category', 'name description');

    if (!product) {
        return next(new AppError('No matching product item instance found with that ID reference', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Product entry located',
        data: product
    });
});

exports.createProduct = asyncHandler(async (req, res, next) => {
    const { category } = req.body;

    const targetCategoryExists = await Category.findById(category);
    if (!targetCategoryExists) {
        return next(new AppError('Cannot bind product: Declared Category ID reference does not exist', 404));
    }

    const newProduct = await Product.create(req.body);

    res.status(201).json({
        status: 'success',
        message: 'Product catalog entry spawned cleanly',
        data: newProduct
    });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
    // Check category structure updates if dynamically provided
    if (req.body.category) {
        const targetCategoryExists = await Category.findById(req.body.category);
        if (!targetCategoryExists) {
            return next(new AppError('Cannot update product: Declared Category ID reference does not exist', 404));
        }
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!updatedProduct) {
        return next(new AppError('No matching product item instance found with that ID reference', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Product parameters adjusted successfully',
        data: updatedProduct
    });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const targetProduct = await Product.findByIdAndDelete(req.params.id);

    if (!targetProduct) {
        return next(new AppError('No matching product item instance found with that ID reference', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Product row purged safely from storage systems',
        data: null
    });
});