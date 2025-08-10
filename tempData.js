// Temporary in-memory data for testing without MongoDB
const bcrypt = require('bcryptjs');

// Sample users (including admin)
const users = [
    {
        _id: 'admin001',
        name: 'Admin User',
        email: 'admin@organicshop.com',
        passwordHash: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        address: {
            street: 'Admin Street',
            city: 'Admin City',
            state: 'Admin State',
            zipCode: '123456',
            country: 'India'
        },
        createdAt: new Date()
    },
    {
        _id: 'user001',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: bcrypt.hashSync('password123', 10),
        role: 'user',
        address: {
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
        },
        createdAt: new Date()
    }
];

// Sample products
const products = [
    {
        _id: 'prod001',
        name: 'Organic Bananas',
        category: 'fruits',
        price: 60,
        description: 'Fresh organic bananas from local farms. Rich in potassium and natural sweetness.',
        imageURL: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
        stock: 50,
        weight: '1kg',
        isOrganic: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: 'prod002',
        name: 'Organic Spinach',
        category: 'vegetables',
        price: 40,
        description: 'Fresh organic spinach leaves. Perfect for salads and cooking.',
        imageURL: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop',
        stock: 30,
        weight: '500g',
        isOrganic: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: 'prod003',
        name: 'Organic Brown Rice',
        category: 'grains',
        price: 120,
        description: 'Premium quality organic brown rice. High in fiber and nutrients.',
        imageURL: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop',
        stock: 25,
        weight: '2kg',
        isOrganic: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: 'prod004',
        name: 'Organic Tomatoes',
        category: 'vegetables',
        price: 80,
        description: 'Juicy organic tomatoes perfect for cooking and salads.',
        imageURL: 'https://images.unsplash.com/photo-1546470427-e5e5c0c9e8c7?w=300&h=200&fit=crop',
        stock: 40,
        weight: '1kg',
        isOrganic: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: 'prod005',
        name: 'Organic Milk',
        category: 'dairy',
        price: 65,
        description: 'Fresh organic milk from grass-fed cows.',
        imageURL: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=200&fit=crop',
        stock: 20,
        weight: '1L',
        isOrganic: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// Sample orders
const orders = [
    {
        _id: 'order001',
        userId: 'user001',
        products: [
            { productId: 'prod001', quantity: 2, price: 60 },
            { productId: 'prod002', quantity: 1, price: 40 }
        ],
        totalAmount: 160,
        paymentMethod: 'upi',
        paymentStatus: 'completed',
        status: 'confirmed',
        shippingAddress: {
            name: 'John Doe',
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India',
            phone: '9876543210'
        },
        orderDate: new Date(),
        deliveryDate: null
    },
    {
        _id: 'order002',
        userId: 'user001',
        products: [
            { productId: 'prod003', quantity: 1, price: 120 }
        ],
        totalAmount: 120,
        paymentMethod: 'cod',
        paymentStatus: 'cod',
        status: 'pending',
        shippingAddress: {
            name: 'John Doe',
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India',
            phone: '9876543210'
        },
        orderDate: new Date(),
        deliveryDate: null
    }
];

module.exports = {
    users,
    products,
    orders
};
