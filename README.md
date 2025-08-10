# Organic Shop E-Commerce Website

A full-stack organic shop e-commerce website built with Node.js, Express, MongoDB, and vanilla JavaScript. Features a modern, eco-themed design with complete shopping functionality and admin dashboard.

## Features

### Customer Features
- 🏠 **Home Page** - Hero section with featured products and categories
- 🛍️ **Shop** - Product listing with search, filters, and pagination
- 🔍 **Product Details** - Detailed product view with related products
- 🛒 **Shopping Cart** - Add/remove items, quantity management
- 💳 **Checkout** - Secure checkout with multiple payment options
- 👤 **User Authentication** - Register, login, profile management
- 📦 **Order History** - View past orders and status

### Payment Options
- 💰 **UPI Payment** - Google Pay, PhonePe, Paytm integration ready
- 💳 **Credit/Debit Cards** - Secure card payment processing
- 🚚 **Cash on Delivery** - Pay when order is delivered

### Admin Features
- 📊 **Dashboard** - Statistics overview (products, orders, revenue)
- 📦 **Product Management** - Add, edit, delete products
- 🛒 **Order Management** - View and update order status
- 👥 **User Management** - View registered users

### Technical Features
- 🔐 **JWT Authentication** - Secure user sessions
- 🗄️ **MongoDB Database** - Scalable data storage
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌱 **Eco-Themed UI** - Green color scheme with modern design
- 🔍 **Search & Filter** - Find products by name and category
- 📄 **Pagination** - Efficient data loading

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid/Flexbox
- **Vanilla JavaScript** - No frameworks, pure JS
- **Fetch API** - HTTP requests

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd organic-shop
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/organic-shop
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-key-change-this-in-production
PORT=3000
```

**Important:** Change the JWT_SECRET and SESSION_SECRET to secure random strings in production.

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB installation
mongod

# Or use MongoDB Atlas cloud database
# Update MONGODB_URI in .env with your Atlas connection string
```

### 5. Run the Application
```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

### 6. Access the Application
- **Website**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

## Default Admin Account

To access the admin dashboard, you'll need to create an admin user. You can either:

1. **Register normally** and manually update the user role in MongoDB:
   ```javascript
   // In MongoDB shell or MongoDB Compass
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

2. **Or create directly in MongoDB**:
   ```javascript
   // Sample admin user (password: "admin123")
   db.users.insertOne({
     name: "Admin User",
     email: "admin@organicshop.com",
     passwordHash: "$2a$10$8K1p/a0dCVWHxqRtd8.VqOGBlIjVyD5HlIhJ5JdLxKZOqz5wuS2EG",
     role: "admin",
     createdAt: new Date()
   })
   ```

## Sample Data

### Sample Products
You can add sample products through the admin dashboard or insert directly into MongoDB:

```javascript
db.products.insertMany([
  {
    name: "Organic Bananas",
    category: "fruits",
    price: 60,
    description: "Fresh organic bananas from local farms. Rich in potassium and natural sweetness.",
    imageURL: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop",
    stock: 50,
    weight: "1kg",
    isOrganic: true,
    createdAt: new Date()
  },
  {
    name: "Organic Spinach",
    category: "vegetables",
    price: 40,
    description: "Fresh organic spinach leaves. Perfect for salads and cooking.",
    imageURL: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop",
    stock: 30,
    weight: "500g",
    isOrganic: true,
    createdAt: new Date()
  },
  {
    name: "Organic Brown Rice",
    category: "grains",
    price: 120,
    description: "Premium quality organic brown rice. High in fiber and nutrients.",
    imageURL: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop",
    stock: 25,
    weight: "2kg",
    isOrganic: true,
    createdAt: new Date()
  }
])
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products (with search/filter)
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured/latest` - Get featured products
- `GET /api/products/category/:category` - Get products by category

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:orderId` - Get single order
- `PUT /api/orders/:orderId/payment` - Update payment status

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/products` - Get all products (admin)
- `POST /api/admin/products` - Add new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - Get all orders (admin)
- `PUT /api/admin/orders/:id/status` - Update order status

## File Structure

```
organic-shop/
├── models/
│   ├── User.js          # User schema
│   ├── Product.js       # Product schema
│   └── Order.js         # Order schema
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── products.js      # Product routes
│   ├── orders.js        # Order routes
│   └── admin.js         # Admin routes
├── public/
│   ├── css/
│   │   └── style.css    # Main stylesheet
│   ├── js/
│   │   ├── common.js    # Common utilities
│   │   ├── home.js      # Home page logic
│   │   ├── shop.js      # Shop page logic
│   │   ├── auth.js      # Authentication logic
│   │   ├── cart.js      # Cart functionality
│   │   ├── checkout.js  # Checkout process
│   │   ├── profile.js   # Profile management
│   │   ├── product.js   # Product details
│   │   └── admin.js     # Admin dashboard
│   ├── index.html       # Home page
│   ├── shop.html        # Shop page
│   ├── product.html     # Product details page
│   ├── cart.html        # Shopping cart
│   ├── checkout.html    # Checkout page
│   ├── login.html       # Login page
│   ├── register.html    # Registration page
│   ├── profile.html     # User profile
│   └── admin.html       # Admin dashboard
├── server.js            # Main server file
├── package.json         # Dependencies
├── .env                 # Environment variables
└── README.md           # This file
```

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-secure-jwt-secret
SESSION_SECRET=your-secure-session-secret
PORT=3000
```

### Deployment Platforms
- **Heroku** - Easy deployment with MongoDB Atlas
- **DigitalOcean** - VPS deployment
- **AWS** - EC2 with MongoDB Atlas
- **Vercel/Netlify** - Frontend only (requires separate backend deployment)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@organicshop.com or create an issue in the repository.

## Acknowledgments

- Images from Unsplash
- Icons from Unicode Emoji
- Inspiration from modern e-commerce platforms

---

**Built with ❤️ for sustainable shopping**
