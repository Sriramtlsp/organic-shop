// Product details page specific JavaScript
let currentProduct = null;

document.addEventListener('DOMContentLoaded', function() {
    const productId = getProductIdFromUrl();
    if (productId) {
        loadProduct(productId);
        loadRelatedProducts();
    } else {
        window.location.href = '/shop';
    }
});

function getProductIdFromUrl() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1];
}

async function loadProduct(productId) {
    const container = document.getElementById('productContainer');
    
    try {
        showLoading(container);
        
        const response = await API.get(`/products/${productId}`);
        currentProduct = response.product;
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start;">
                <!-- Product Image -->
                <div>
                    <img src="${currentProduct.imageURL}" alt="${currentProduct.name}" 
                         style="width: 100%; height: 400px; object-fit: cover; border-radius: 10px; box-shadow: var(--shadow);"
                         onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&h=400&fit=crop'">
                </div>
                
                <!-- Product Info -->
                <div>
                    <nav style="margin-bottom: 1rem;">
                        <a href="/shop" style="color: var(--text-light); text-decoration: none;">Shop</a>
                        <span style="color: var(--text-light);"> / </span>
                        <a href="/shop?category=${currentProduct.category}" style="color: var(--text-light); text-decoration: none; text-transform: capitalize;">${currentProduct.category}</a>
                        <span style="color: var(--text-light);"> / </span>
                        <span>${currentProduct.name}</span>
                    </nav>
                    
                    <h1 style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--text-dark);">${currentProduct.name}</h1>
                    
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--primary-green);">${formatPrice(currentProduct.price)}</div>
                        <div style="color: var(--text-light);">per ${currentProduct.weight}</div>
                        ${currentProduct.isOrganic ? '<span style="background: var(--success); color: white; padding: 0.25rem 0.5rem; border-radius: 3px; font-size: 0.8rem;">🌱 Organic</span>' : ''}
                    </div>
                    
                    <div style="margin-bottom: 2rem;">
                        <h3 style="margin-bottom: 0.5rem;">Description</h3>
                        <p style="color: var(--text-light); line-height: 1.6;">${currentProduct.description}</p>
                    </div>
                    
                    <div style="margin-bottom: 2rem;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div>
                                <strong>Category:</strong>
                                <span style="text-transform: capitalize;">${currentProduct.category}</span>
                            </div>
                            <div>
                                <strong>Weight:</strong>
                                ${currentProduct.weight}
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <strong>Stock:</strong>
                            <span style="color: ${currentProduct.stock > 0 ? 'var(--success)' : 'var(--danger)'};">
                                ${currentProduct.stock > 0 ? `${currentProduct.stock} available` : 'Out of stock'}
                            </span>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <label for="quantity" style="font-weight: 500;">Quantity:</label>
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="changeQuantity(-1)">-</button>
                                <input type="number" id="quantity" class="quantity-input" value="1" min="1" max="${currentProduct.stock}">
                                <button class="quantity-btn" onclick="changeQuantity(1)">+</button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem;">
                        <button class="btn btn-primary" onclick="addToCart()" style="flex: 2;" ${currentProduct.stock <= 0 ? 'disabled' : ''}>
                            ${currentProduct.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <a href="/shop" class="btn btn-outline" style="flex: 1;">Continue Shopping</a>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading product:', error);
        container.innerHTML = `
            <div class="text-center" style="padding: 3rem 0;">
                <h2>Product not found</h2>
                <p style="margin-bottom: 2rem;">The product you're looking for doesn't exist or has been removed.</p>
                <a href="/shop" class="btn btn-primary">Back to Shop</a>
            </div>
        `;
    }
}

async function loadRelatedProducts() {
    if (!currentProduct) return;
    
    const container = document.getElementById('relatedProducts');
    
    try {
        const response = await API.get(`/products/category/${currentProduct.category}?limit=4`);
        const products = response.products.filter(p => p._id !== currentProduct._id).slice(0, 4);
        
        if (products.length === 0) {
            container.innerHTML = '<p class="text-center">No related products found.</p>';
            return;
        }
        
        container.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.imageURL}" alt="${product.name}" class="product-image" 
                     onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop'">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">${formatPrice(product.price)} <span style="font-size: 0.8rem; color: var(--text-light);">per ${product.weight}</span></div>
                    <p class="product-description">${product.description}</p>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="addRelatedToCart('${product._id}')" style="flex: 1;">
                            Add to Cart
                        </button>
                        <a href="/product/${product._id}" class="btn btn-outline">View</a>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading related products:', error);
        container.innerHTML = '<p class="text-center">Error loading related products.</p>';
    }
}

function changeQuantity(delta) {
    const quantityInput = document.getElementById('quantity');
    const currentQuantity = parseInt(quantityInput.value);
    const newQuantity = currentQuantity + delta;
    
    if (newQuantity >= 1 && newQuantity <= currentProduct.stock) {
        quantityInput.value = newQuantity;
    }
}

function addToCart() {
    if (!currentProduct || currentProduct.stock <= 0) {
        Cart.showNotification('Product is out of stock');
        return;
    }
    
    const quantity = parseInt(document.getElementById('quantity').value);
    
    if (quantity > currentProduct.stock) {
        Cart.showNotification(`Only ${currentProduct.stock} items available`);
        return;
    }
    
    Cart.addItem(currentProduct, quantity);
}

async function addRelatedToCart(productId) {
    try {
        const response = await API.get(`/products/${productId}`);
        const product = response.product;
        
        if (product.stock <= 0) {
            Cart.showNotification('Product is out of stock');
            return;
        }
        
        Cart.addItem(product, 1);
        
    } catch (error) {
        console.error('Error adding related product to cart:', error);
        Cart.showNotification('Error adding product to cart');
    }
}
