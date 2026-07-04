const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/appError');

exports.createOrder = asyncHandler(async (req, res, next) => {
    const { shippingAddress } = req.body;
    if (!shippingAddress) {
        return next(new AppError('A valid shipping address configuration string is required for fulfillment processing', 400));
    }

    const cart = await Cart.findOne();
    if (!cart || cart.items.length === 0) {
        return next(new AppError('Your active shopping cart layout contains zero items. Cannot finalize transaction', 400));
    }

    let calculatedTotal = 0;
    const orderItemsSnapshots = [];

    for (const item of cart.items) {
        const liveProduct = await Product.findById(item.product);
        
        if (!liveProduct) {
            return next(new AppError(`Transaction aborted: A product in your cart (ID: ${item.product}) no longer exists`, 404));
        }

        if (liveProduct.stock < item.quantity) {
            return next(new AppError(`Stock level bottleneck: "${liveProduct.name}" only has ${liveProduct.stock} units left, but you requested ${item.quantity}`, 400));
        }

        calculatedTotal += liveProduct.price * item.quantity;

        orderItemsSnapshots.push({
            product: item.product,
            name: liveProduct.name,
            price: liveProduct.price, 
            quantity: item.quantity
        });
    }

    for (const item of cart.items) {
        const productToUpdate = await Product.findById(item.product);
        productToUpdate.stock -= item.quantity;
        await productToUpdate.save(); 
    }

    const uniqueOrderRef = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const finalizedOrder = await Order.create({
        orderNumber: uniqueOrderRef,
        items: orderItemsSnapshots,
        totalPrice: parseFloat(calculatedTotal.toFixed(2)),
        shippingAddress: shippingAddress
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({
        status: 'success',
        message: 'Order created successfully. The shopping cart has been emptied',
        data: finalizedOrder
    });
});

exports.getAllOrders = asyncHandler(async (req, res, next) => {
    const historyLogs = await Order.find().sort('-createdAt');
    
    res.status(200).json({
        status: 'success',
        results: historyLogs.length,
        message: 'Complete historical order collection compiled cleanly',
        data: historyLogs
    });
});

exports.getOrderById = asyncHandler(async (req, res, next) => {
    const orderInstance = await Order.findById(req.params.id);
    if (!orderInstance) {
        return next(new AppError('No matching transactional log instance found with that ID reference', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Order structural file located successfully',
        data: orderInstance
    });
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;

    if (!status) {
        return next(new AppError('Please supply an update configuration state parameter string', 400));
    }

    const alteredOrderLog = await Order.findByIdAndUpdate(
        req.params.id, 
        { status }, 
        { new: true, runValidators: true }
    );

    if (!alteredOrderLog) {
        return next(new AppError('No matching transactional log instance found with that ID reference', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Fulfillment order workflow tracking configuration step advanced successfully',
        data: alteredOrderLog
    });
});