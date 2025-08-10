const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const { products, users } = require('./tempData');
require('dotenv').config();

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Insert sample products
    const insertedProducts = await Product.insertMany(products.map(product => ({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      imageURL: product.imageURL,
      stock: product.stock,
      weight: product.weight,
      isOrganic: product.isOrganic
    })));
    console.log(`Inserted ${insertedProducts.length} products`);

    // Insert sample users
    const insertedUsers = await User.insertMany(users.map(user => ({
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      address: user.address
    })));
    console.log(`Inserted ${insertedUsers.length} users`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample products added:');
    insertedProducts.forEach(product => {
      console.log(`- ${product.name} (${product.category}) - ₹${product.price}`);
    });

    console.log('\nSample users added:');
    insertedUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the seed function
seedDatabase();
