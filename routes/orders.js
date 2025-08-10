const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Create new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { products, paymentMethod, shippingAddress } = req.body;
    
    // Calculate total amount and validate products
    let totalAmount = 0;
    const orderProducts = [];
    
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }
    
    // Set payment status based on payment method
    const paymentStatus = paymentMethod === 'cod' ? 'cod' : 'pending';
    
    // Create order
    const order = new Order({
      userId: req.user.userId,
      products: orderProducts,
      totalAmount,
      paymentMethod,
      paymentStatus,
      shippingAddress
    });
    
    await order.save();
    
    // Update product stock
    for (const item of products) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }
    
    // Populate product details for response
    const populatedOrder = await Order.findById(order._id)
      .populate('products.productId', 'name imageURL')
      .populate('userId', 'name email');
    
    res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// Get user's orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .populate('products.productId', 'name imageURL')
      .sort({ orderDate: -1 });
    
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Get single order
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.orderId,
      userId: req.user.userId 
    }).populate('products.productId', 'name imageURL price');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
});

// Update payment status (for payment gateway integration)
router.put('/:orderId/payment', authenticateToken, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    const order = await Order.findOneAndUpdate(
      { _id: req.params.orderId, userId: req.user.userId },
      { paymentStatus, status: paymentStatus === 'completed' ? 'confirmed' : 'pending' },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Payment status updated', order });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Server error updating payment status' });
  }
});

module.exports = router;
