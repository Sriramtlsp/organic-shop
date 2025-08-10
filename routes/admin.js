const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get admin dashboard stats
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: { $in: ['completed', 'cod'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;
    
    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        pendingOrders,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
});

// Get all products for admin
router.get('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const products = await Product.find()
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Product.countDocuments();
    
    res.json({
      products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// Add new product
router.post('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, category, price, description, imageURL, stock, weight } = req.body;
    
    const product = new Product({
      name,
      category,
      price,
      description,
      imageURL,
      stock,
      weight
    });
    
    await product.save();
    
    res.status(201).json({
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error adding product' });
  }
});

// Update product
router.put('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, category, price, description, imageURL, stock, weight } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, price, description, imageURL, stock, weight },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
});

// Delete product
router.delete('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

// Get all orders for admin
router.get('/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .populate('products.productId', 'name imageURL')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ orderDate: -1 });
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Update order status
router.put('/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email')
     .populate('products.productId', 'name imageURL');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
});

module.exports = router;
