// Profile page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!Auth.isLoggedIn()) {
        window.location.href = '/login';
        return;
    }
    
    loadProfile();
    loadOrders();
    setupEventListeners();
    
    // Check for order success message
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('order')) {
        document.getElementById('orderSuccess').classList.remove('hidden');
    }
});

function setupEventListeners() {
    const profileForm = document.getElementById('profileForm');
    profileForm.addEventListener('submit', handleProfileUpdate);
}

async function loadProfile() {
    try {
        const response = await API.get('/auth/profile');
        const user = response.user;
        
        // Update profile display
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
        
        // Pre-fill edit form
        document.getElementById('editName').value = user.name || '';
        
        if (user.address) {
            document.getElementById('editStreet').value = user.address.street || '';
            document.getElementById('editCity').value = user.address.city || '';
            document.getElementById('editState').value = user.address.state || '';
            document.getElementById('editZipCode').value = user.address.zipCode || '';
            document.getElementById('editCountry').value = user.address.country || 'India';
        }
        
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadOrders() {
    const container = document.getElementById('ordersContainer');
    
    try {
        showLoading(container);
        
        const response = await API.get('/orders/my-orders');
        const orders = response.orders;
        
        if (orders.length === 0) {
            container.innerHTML = `
                <div class="text-center" style="padding: 2rem 0;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                    <h4>No orders yet</h4>
                    <p style="color: var(--text-light); margin-bottom: 2rem;">Start shopping to see your orders here!</p>
                    <a href="/shop" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = orders.map(order => `
            <div style="border: 1px solid var(--border-light); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div>
                        <h4 style="margin-bottom: 0.5rem;">Order #${order._id.slice(-8)}</h4>
                        <p style="color: var(--text-light); margin: 0;">Placed on ${formatDate(order.orderDate)}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.2rem; font-weight: bold; color: var(--primary-green);">${formatPrice(order.totalAmount)}</div>
                        <div class="status-badge status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                    ${order.products.slice(0, 3).map(item => `
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <img src="${item.productId.imageURL}" alt="${item.productId.name}" 
                                 style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;"
                                 onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=40&h=40&fit=crop'">
                            <div>
                                <div style="font-size: 0.9rem; font-weight: 500;">${item.productId.name}</div>
                                <div style="font-size: 0.8rem; color: var(--text-light);">Qty: ${item.quantity}</div>
                            </div>
                        </div>
                    `).join('')}
                    ${order.products.length > 3 ? `<div style="color: var(--text-light); font-size: 0.9rem;">+${order.products.length - 3} more items</div>` : ''}
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 0.9rem; color: var(--text-light);">
                        Payment: ${order.paymentMethod.toUpperCase()} • Status: ${order.paymentStatus}
                    </div>
                    <button class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="viewOrderDetails('${order._id}')">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = '<p class="text-center">Error loading orders. Please try again later.</p>';
    }
}

function showEditProfile() {
    document.getElementById('editProfileForm').classList.remove('hidden');
}

function hideEditProfile() {
    document.getElementById('editProfileForm').classList.add('hidden');
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const errorContainer = document.getElementById('profileErrorContainer');
    errorContainer.innerHTML = '';
    
    const profileData = {
        name: document.getElementById('editName').value,
        address: {
            street: document.getElementById('editStreet').value,
            city: document.getElementById('editCity').value,
            state: document.getElementById('editState').value,
            zipCode: document.getElementById('editZipCode').value,
            country: document.getElementById('editCountry').value
        }
    };
    
    try {
        const response = await API.put('/auth/profile', profileData);
        
        // Update stored user data
        Auth.setUser(response.user);
        
        // Reload profile display
        loadProfile();
        
        // Hide edit form
        hideEditProfile();
        
        // Show success message
        Cart.showNotification('Profile updated successfully!');
        
    } catch (error) {
        console.error('Profile update error:', error);
        showError(error.message || 'Failed to update profile', errorContainer);
    }
}

function viewOrderDetails(orderId) {
    // For now, just show an alert. In a real app, you'd navigate to a detailed order page
    alert(`Order details for ${orderId} would be shown here. This feature can be expanded with a dedicated order details page.`);
}
