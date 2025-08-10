const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import temporary data
const { users, products, orders } = require('./tempData');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: 'user' + Date.now(),
      name,
      email,
      passwordHash: hashedPassword,
      role: 'user',
      address: address || {},
      createdAt: new Date()
    };

    users.push(newUser);

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Products Routes
app.get('/api/products', (req, res) => {
  const { category, search, page = 1, limit = 12 } = req.query;
  let filteredProducts = [...products];

  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  if (search) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json({
    products: paginatedProducts,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredProducts.length / limit),
      total: filteredProducts.length
    }
  });
});

app.get('/api/products/featured/latest', (req, res) => {
  const featuredProducts = products.slice(0, 8);
  res.json({ products: featuredProducts });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p._id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json({ product });
});

app.get('/api/products/category/:category', (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 12 } = req.query;
  
  const categoryProducts = products.filter(p => p.category === category);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = categoryProducts.slice(startIndex, endIndex);

  res.json({
    products: paginatedProducts,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(categoryProducts.length / limit),
      total: categoryProducts.length
    }
  });
});

// Orders Routes
app.post('/api/orders', authenticateToken, (req, res) => {
  try {
    const { products: orderProducts, paymentMethod, shippingAddress } = req.body;
    
    // Calculate total amount and validate products
    let totalAmount = 0;
    const validatedProducts = [];
    
    for (const item of orderProducts) {
      const product = products.find(p => p._id === item.productId);
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
      
      validatedProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }
    
    // Set payment status based on payment method
    const paymentStatus = paymentMethod === 'cod' ? 'cod' : 'pending';
    
    // Create order
    const newOrder = {
      _id: 'order' + Date.now(),
      userId: req.user.userId,
      products: validatedProducts,
      totalAmount,
      paymentMethod,
      paymentStatus,
      status: 'pending',
      shippingAddress,
      orderDate: new Date(),
      deliveryDate: null
    };
    
    orders.push(newOrder);
    
    // Update product stock
    for (const item of orderProducts) {
      const productIndex = products.findIndex(p => p._id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].stock -= item.quantity;
      }
    }
    
    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

app.get('/api/orders/my-orders', authenticateToken, (req, res) => {
  try {
    const userOrders = orders.filter(order => order.userId === req.user.userId);
    
    // Add product details to orders
    const ordersWithProducts = userOrders.map(order => ({
      ...order,
      products: order.products.map(item => ({
        ...item,
        productId: products.find(p => p._id === item.productId) || { name: 'Unknown Product', imageURL: '' }
      }))
    }));
    
    res.json({ orders: ordersWithProducts });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

app.get('/api/orders/:orderId', authenticateToken, (req, res) => {
  try {
    const order = orders.find(o => o._id === req.params.orderId && o.userId === req.user.userId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Add product details
    const orderWithProducts = {
      ...order,
      products: order.products.map(item => ({
        ...item,
        productId: products.find(p => p._id === item.productId) || { name: 'Unknown Product', imageURL: '', price: 0 }
      }))
    };
    
    res.json({ order: orderWithProducts });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
});

// User profile routes
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u._id === req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

app.put('/api/auth/profile', authenticateToken, (req, res) => {
  try {
    const { name, address } = req.body;
    const userIndex = users.findIndex(u => u._id === req.user.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    users[userIndex] = {
      ...users[userIndex],
      name,
      address
    };

    const { passwordHash, ...userWithoutPassword } = users[userIndex];
    res.json({ message: 'Profile updated successfully', user: userWithoutPassword });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Admin Routes
app.get('/api/admin/dashboard', authenticateToken, requireAdmin, (req, res) => {
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalUsers = users.filter(u => u.role === 'user').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'completed' || o.paymentStatus === 'cod')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  res.json({
    stats: {
      totalProducts,
      totalOrders,
      totalUsers,
      pendingOrders,
      totalRevenue
    }
  });
});

app.get('/api/admin/products', authenticateToken, requireAdmin, (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = products.slice(startIndex, endIndex);

  res.json({
    products: paginatedProducts,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(products.length / limit),
      total: products.length
    }
  });
});

app.post('/api/admin/products', authenticateToken, requireAdmin, (req, res) => {
  const { name, category, price, description, imageURL, stock, weight } = req.body;
  
  const newProduct = {
    _id: 'prod' + Date.now(),
    name,
    category,
    price: parseFloat(price),
    description,
    imageURL,
    stock: parseInt(stock),
    weight,
    isOrganic: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  products.push(newProduct);
  res.status(201).json({ message: 'Product added successfully', product: newProduct });
});

// Update product
app.put('/api/admin/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const { name, category, price, description, imageURL, stock, weight } = req.body;
  const productIndex = products.findIndex(p => p._id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  products[productIndex] = {
    ...products[productIndex],
    name,
    category,
    price: parseFloat(price),
    description,
    imageURL,
    stock: parseInt(stock),
    weight,
    updatedAt: new Date()
  };
  
  res.json({ message: 'Product updated successfully', product: products[productIndex] });
});

// Delete product
app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const productIndex = products.findIndex(p => p._id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  products.splice(productIndex, 1);
  res.json({ message: 'Product deleted successfully' });
});

// Update order status
app.put('/api/admin/orders/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { status } = req.body;
  const orderIndex = orders.findIndex(o => o._id === req.params.id);
  
  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  orders[orderIndex].status = status;
  
  // Add user details to the response
  const orderWithUser = {
    ...orders[orderIndex],
    userId: users.find(u => u._id === orders[orderIndex].userId) || { name: 'Unknown', email: 'unknown@example.com' }
  };
  
  res.json({ message: 'Order status updated successfully', order: orderWithUser });
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  let filteredOrders = [...orders];

  if (status && status !== 'all') {
    filteredOrders = filteredOrders.filter(o => o.status === status);
  }

  // Add user details to orders
  const ordersWithUsers = filteredOrders.map(order => ({
    ...order,
    userId: users.find(u => u._id === order.userId) || { name: 'Unknown', email: 'unknown@example.com' }
  }));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedOrders = ordersWithUsers.slice(startIndex, endIndex);

  res.json({
    orders: paginatedOrders,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredOrders.length / limit),
      total: filteredOrders.length
    }
  });
});

// Serve frontend pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Temporary server running on port ${PORT}`);
  console.log(`📱 Visit http://localhost:${PORT} to view the website`);
  console.log(`👤 Admin login: admin@organicshop.com / admin123`);
  console.log(`🔧 Access admin dashboard: http://localhost:${PORT}/admin`);
});
