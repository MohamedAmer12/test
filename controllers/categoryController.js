const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/appError');

exports.createCategory = asyncHandler(async (req, res, next) => {
    const { name, description, slug } = req.body;
    const newCategory = await Category.create({ name, description, slug });

    res.status(201).json({
        status: 'success',
        message: 'Category record spawned cleanly',
        data: newCategory
    });
});

exports.getAllCategories = asyncHandler(async (req, res, next) => {
    const categories = await Category.find();
    res.status(200).json({
        status: 'success',
        message: 'Category stack fetched successfully',
        data: categories
    });
});

exports.getCategoryById = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new AppError('No matching category instance found with that ID reference', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Category reference found',
        data: category
    });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!updatedCategory) {
        return next(new AppError('No matching category instance found with that ID reference', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Category altered successfully',
        data: updatedCategory
    });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
    const targetCategory = await Category.findByIdAndDelete(req.params.id);
    if (!targetCategory) {
        return next(new AppError('No matching category instance found with that ID reference', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Category purged safely from database logs',
        data: null
    });
});