// Checkout page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!Auth.isLoggedIn()) {
        window.location.href = '/login';
        return;
    }
    
    // Check if cart is empty
    const cart = Cart.getCart();
    if (cart.length === 0) {
        window.location.href = '/cart';
        return;
    }
    
    loadOrderSummary();
    loadUserInfo();
    setupEventListeners();
});

function setupEventListeners() {
    const checkoutForm = document.getElementById('checkoutForm');
    checkoutForm.addEventListener('submit', handleCheckout);
    
    // Update payment method styling when selected
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Reset all labels
            paymentRadios.forEach(r => {
                r.parentElement.style.borderColor = 'var(--border-light)';
                r.parentElement.style.backgroundColor = 'white';
            });
            
            // Highlight selected
            if (this.checked) {
                this.parentElement.style.borderColor = 'var(--primary-green)';
                this.parentElement.style.backgroundColor = 'var(--bg-light)';
            }
        });
    });
}

function loadOrderSummary() {
    const cart = Cart.getCart();
    const orderItems = document.getElementById('orderItems');
    const total = Cart.getTotal();
    
    orderItems.innerHTML = cart.map(item => `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-light);">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <img src="${item.imageURL}" alt="${item.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 3px;"
                     onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=40&h=40&fit=crop'">
                <div>
                    <div style="font-weight: 500; font-size: 0.9rem;">${item.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-light);">Qty: ${item.quantity}</div>
                </div>
            </div>
            <div style="font-weight: 500;">${formatPrice(item.price * item.quantity)}</div>
        </div>
    `).join('');
    
    document.getElementById('subtotal').textContent = formatPrice(total);
    document.getElementById('total').textContent = formatPrice(total);
}

async function loadUserInfo() {
    try {
        const response = await API.get('/auth/profile');
        const user = response.user;
        
        // Pre-fill form with user data
        document.getElementById('fullName').value = user.name || '';
        
        if (user.address) {
            document.getElementById('street').value = user.address.street || '';
            document.getElementById('city').value = user.address.city || '';
            document.getElementById('state').value = user.address.state || '';
            document.getElementById('zipCode').value = user.address.zipCode || '';
            document.getElementById('country').value = user.address.country || 'India';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

async function handleCheckout(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const errorContainer = document.getElementById('errorContainer');
    const orderBtnText = document.getElementById('orderBtnText');
    const orderLoader = document.getElementById('orderLoader');
    
    // Clear previous errors
    errorContainer.innerHTML = '';
    
    // Get form data
    const shippingAddress = {
        name: formData.get('fullName') || document.getElementById('fullName').value,
        phone: formData.get('phone') || document.getElementById('phone').value,
        street: formData.get('street') || document.getElementById('street').value,
        city: formData.get('city') || document.getElementById('city').value,
        state: formData.get('state') || document.getElementById('state').value,
        zipCode: formData.get('zipCode') || document.getElementById('zipCode').value,
        country: formData.get('country') || document.getElementById('country').value
    };
    
    const paymentMethod = formData.get('paymentMethod');
    
    if (!paymentMethod) {
        showError('Please select a payment method', errorContainer);
        return;
    }
    
    // Show loading state
    orderBtnText.textContent = 'Processing Order...';
    orderLoader.classList.remove('hidden');
    
    try {
        const cart = Cart.getCart();
        
        // Prepare order data
        const orderData = {
            products: cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            })),
            paymentMethod,
            shippingAddress
        };
        
        // Create order
        const response = await API.post('/orders', orderData);
        
        // Clear cart
        Cart.clearCart();
        
        // Show success message
        showSuccess('Order placed successfully!', errorContainer);
        
        // Redirect to success page or profile
        setTimeout(() => {
            window.location.href = `/profile?order=${response.order._id}`;
        }, 2000);
        
    } catch (error) {
        console.error('Checkout error:', error);
        showError(error.message || 'Failed to place order. Please try again.', errorContainer);
    } finally {
        // Reset button state
        orderBtnText.textContent = 'Place Order';
        orderLoader.classList.add('hidden');
    }
}
