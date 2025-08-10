// Script to create an admin user
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('Connected to MongoDB');
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@organicshop.com' });
        
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@organicshop.com');
            console.log('Password: admin123');
            process.exit(0);
        }
        
        // Create admin user
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@organicshop.com',
            passwordHash: 'admin123', // Will be hashed automatically
            role: 'admin',
            address: {
                street: 'Admin Street',
                city: 'Admin City',
                state: 'Admin State',
                zipCode: '123456',
                country: 'India'
            }
        });
        
        await adminUser.save();
        
        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: admin@organicshop.com');
        console.log('🔑 Password: admin123');
        console.log('');
        console.log('You can now login at: http://localhost:3000/login');
        console.log('Then access admin dashboard at: http://localhost:3000/admin');
        
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        mongoose.connection.close();
    }
}

createAdminUser();
