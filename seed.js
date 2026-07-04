const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./db/connectDB');
const Category = require('./models/Category');
const Product = require('./models/Product');

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();
        if (mongoose.connection.collections['orders']) {
            await mongoose.connection.collections['orders'].drop();
            console.log('Orders collection wiped out cleanly');
        }
        await Product.deleteMany();
        console.log('Product catalog deleted...');
        await Category.deleteMany();
        console.log('Category mapping matrix cleared...');

        const categories = await Category.insertMany([
            { name: "Electronics", description: "Smart technological devices and machinery assets", slug: "electronics" },
            { name: "Apparel", description: "High-grade premium stitched garments and fashion solutions", slug: "apparel" },
            { name: "Home Goods", description: "Modern kitchen supplies and interior accessories", slug: "home-goods" }
        ]);
        console.log(`${categories.length} Categories seeded successfully.`);

        const products = await Product.insertMany([
            { name: "Smartphone X", description: "Flagship screen cellular unit", price: 999.99, stock: 12, category: categories[0]._id, images: ["phone.png"] },
            { name: "Laptop Pro", description: "High performance rendering workstation platform", price: 1899.99, stock: 5, category: categories[0]._id, images: ["laptop.png"] },
            { name: "Designer Jacket", description: "Weatherproof isolated outer element jacket fabric", price: 149.50, stock: 20, category: categories[1]._id, images: ["jacket.png"] },
            { name: "Running Sneakers", description: "Adaptive mesh running footwear sole layout", price: 85.00, stock: 0, category: categories[1]._id, images: ["shoes.png"] },
            { name: "Ergonomic Desk Chair", description: "Lumbar support orthopedic setup hardware frame", price: 340.00, stock: 8, category: categories[2]._id, images: ["chair.png"] },
            { name: "Blender Max", description: "Countertop crush blender machinery element", price: 59.99, stock: 15, category: categories[2]._id, images: ["blender.png"] }
        ]);
        console.log(`${products.length} Products structural items seeded successfully.`);

    } catch (err) {
        console.error(`Critical Execution Seeding Interruption: ${err.message}`);
    } finally {
        await mongoose.disconnect();
        console.log('Database operation connection safely terminated.');
    }
};

seedData();