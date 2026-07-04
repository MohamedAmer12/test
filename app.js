const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./db/connectDB');

const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes'); 

const AppError = require('./utils/appError');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(mongoSanitize());

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes); 

app.all('*', (req, res, next) => {
    next(new AppError(`Can't locate resource route: ${req.originalUrl} pathing targets on this server instance`, 404));
});

app.use(errorHandler);

const startServer = async () => {
    await connectDB();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`E-Commerce REST API is now 100% complete and execution matches all tasks on port ${PORT}`);
    });
};

startServer();