const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/appError');

const getOrCreateCart = async () => {
    let cart = await Cart.findOne();
    if (!cart) {
        cart = await Cart.create({ items: [], totalPrice: 0 });
    }
    return cart;
};

exports.getCart = asyncHandler(async (req, res, next) => {
    let cart = await getOrCreateCart();
    
    cart = await cart.populate('items.product', 'name price images description');

    res.status(200).json({
        status: 'success',
        message: 'Shopping cart data structural matrix retrieved successfully',
        data: cart
    });
});

exports.addItemToCart = asyncHandler(async (req, res, next) => {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity || quantity < 1) {
        return next(new AppError('Please supply valid structural product reference keys and quantity variables', 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('No matching product catalog item found with that ID reference', 404));
    }

    if (product.stock < quantity) {
        return next(new AppError(`Insufficient stock. Only ${product.stock} units are currently available`, 400));
    }

    const cart = await getOrCreateCart();

    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (existingItemIndex > -1) {
        const currentItem = cart.items[existingItemIndex];
        const newTotalQuantity = currentItem.quantity + quantity;

        // Verify total accumulative request doesn't exceed inventory parameters
        if (product.stock < newTotalQuantity) {
            return next(new AppError(`Cannot adjust volume: Cumulative total exceeds available stock metrics`, 400));
        }
        
        currentItem.quantity = newTotalQuantity;
        currentItem.price = product.price; // Sync fresh pricing snapshots
    } else {
        cart.items.push({
            product: productId,
            quantity: quantity,
            price: product.price
        });
    }

    await cart.save();

    res.status(200).json({
        status: 'success',
        message: 'Item pushed into the active cart collection successfully',
        data: cart
    });
});

exports.updateCartItem = asyncHandler(async (req, res, next) => {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined || quantity < 1) {
        return next(new AppError('Please provide a targeted product ID and a quantity configuration metric above zero', 400));
    }

    const cart = await Cart.findOne();
    if (!cart) return next(new AppError('No active cart logs located', 404));

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
        return next(new AppError('The requested product item is not found in the cart collection matrix', 404));
    }

    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) {
        return next(new AppError(`Stock limit conflict: Only ${product ? product.stock : 0} elements remain available`, 400));
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({
        status: 'success',
        message: 'Cart item operational quantity properties modified successfully',
        data: cart
    });
});

exports.removeItemFromCart = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;

    const cart = await Cart.findOne();
    if (!cart) return next(new AppError('No active cart logs located', 404));

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    if (cart.items.length === initialLength) {
        return next(new AppError('The requested product line item is not inside the cart array', 404));
    }

    await cart.save();

    res.status(200).json({
        status: 'success',
        message: 'Targeted item row extracted safely from cart tracking collection',
        data: cart
    });
});

exports.clearCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne();
    if (!cart) return next(new AppError('No active cart logs located', 404));

    cart.items = [];
    await cart.save();

    res.status(200).json({
        status: 'success',
        message: 'Shopping cart data dropped and purged completely',
        data: cart
    });
});