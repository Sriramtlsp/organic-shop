// Common JavaScript functions and utilities
class API {
    static BASE_URL = '/api';
    
    static async request(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        const token = localStorage.getItem('authToken');
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    static async get(endpoint) {
        return this.request(endpoint);
    }
    
    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    static async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// Authentication utilities
class Auth {
    static getToken() {
        return localStorage.getItem('authToken');
    }
    
    static setToken(token) {
        localStorage.setItem('authToken', token);
    }
    
    static removeToken() {
        localStorage.removeItem('authToken');
    }
    
    static getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
    
    static setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }
    
    static removeUser() {
        localStorage.removeItem('user');
    }
    
    static isLoggedIn() {
        return !!this.getToken();
    }
    
    static isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    }
    
    static logout() {
        this.removeToken();
        this.removeUser();
        Cart.clearCart();
        window.location.href = '/';
    }
}

// Cart utilities
class Cart {
    static getCart() {
        const cartStr = localStorage.getItem('cart');
        return cartStr ? JSON.parse(cartStr) : [];
    }
    
    static setCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartCount();
    }
    
    static addItem(product, quantity = 1) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.productId === product._id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                imageURL: product.imageURL,
                quantity: quantity,
                weight: product.weight
            });
        }
        
        this.setCart(cart);
        this.showNotification(`${product.name} added to cart!`);
    }
    
    static removeItem(productId) {
        const cart = this.getCart();
        const updatedCart = cart.filter(item => item.productId !== productId);
        this.setCart(updatedCart);
    }
    
    static updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.productId === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.setCart(cart);
            }
        }
    }
    
    static clearCart() {
        localStorage.removeItem('cart');
        this.updateCartCount();
    }
    
    static getTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    static getItemCount() {
        const cart = this.getCart();
        return cart.reduce((count, item) => count + item.quantity, 0);
    }
    
    static updateCartCount() {
        const countElement = document.getElementById('cartCount');
        if (countElement) {
            countElement.textContent = this.getItemCount();
        }
    }
    
    static showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            box-shadow: var(--shadow);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 3000);
    }
}

// Utility functions
function formatPrice(price) {
    return `₹${price.toFixed(2)}`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN');
}

function showLoading(element) {
    element.innerHTML = '<div class="loading"></div>';
}

function hideLoading(element) {
    element.innerHTML = '';
}

function showError(message, container) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(message, container) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    container.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function() {
    // Update cart count on page load
    Cart.updateCartCount();
    
    // Update user menu based on authentication status
    updateUserMenu();
    
    // Add logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            Auth.logout();
        });
    }
});

function updateUserMenu() {
    const userMenu = document.getElementById('userMenu');
    if (!userMenu) return;
    
    if (Auth.isLoggedIn()) {
        const user = Auth.getUser();
        userMenu.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span>Welcome, ${user.name}</span>
                <a href="/profile" class="btn btn-outline">Profile</a>
                ${user.role === 'admin' ? '<a href="/admin" class="btn btn-secondary">Admin</a>' : ''}
                <button id="logoutBtn" class="btn btn-danger">Logout</button>
            </div>
        `;
        
        // Re-add logout event listener
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                Auth.logout();
            });
        }
    } else {
        userMenu.innerHTML = `
            <a href="/login" class="btn btn-outline" id="loginBtn">Login</a>
            <a href="/register" class="btn btn-primary" id="registerBtn">Register</a>
        `;
    }
}
