// Cart page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    setupEventListeners();
});

function setupEventListeners() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (!Auth.isLoggedIn()) {
                Cart.showNotification('Please login to proceed to checkout');
                window.location.href = '/login';
                return;
            }
            window.location.href = '/checkout';
        });
    }
}

function loadCart() {
    const cart = Cart.getCart();
    const cartContainer = document.getElementById('cartContainer');
    const cartSummary = document.getElementById('cartSummary');
    const emptyCart = document.getElementById('emptyCart');
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '';
        cartSummary.classList.add('hidden');
        emptyCart.classList.remove('hidden');
        return;
    }
    
    // Show cart items
    emptyCart.classList.add('hidden');
    cartSummary.classList.remove('hidden');
    
    cartContainer.innerHTML = cart.map(item => `
        <div class="cart-item" id="cart-item-${item.productId}">
            <img src="${item.imageURL}" alt="${item.name}" class="cart-item-image" 
                 onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&h=80&fit=crop'">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <div class="cart-item-price">${formatPrice(item.price)} per ${item.weight}</div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity('${item.productId}', ${item.quantity - 1})">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                       onchange="updateQuantity('${item.productId}', this.value)">
                <button class="quantity-btn" onclick="updateQuantity('${item.productId}', ${item.quantity + 1})">+</button>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: bold; margin-bottom: 0.5rem;">${formatPrice(item.price * item.quantity)}</div>
                <button class="btn btn-danger" onclick="removeFromCart('${item.productId}')" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                    Remove
                </button>
            </div>
        </div>
    `).join('');
    
    // Update summary
    updateCartSummary();
}

function updateQuantity(productId, newQuantity) {
    const quantity = parseInt(newQuantity);
    
    if (quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    Cart.updateQuantity(productId, quantity);
    loadCart(); // Reload cart display
}

function removeFromCart(productId) {
    Cart.removeItem(productId);
    loadCart(); // Reload cart display
    Cart.showNotification('Item removed from cart');
}

function updateCartSummary() {
    const total = Cart.getTotal();
    
    document.getElementById('subtotal').textContent = formatPrice(total);
    document.getElementById('total').textContent = formatPrice(total);
}
