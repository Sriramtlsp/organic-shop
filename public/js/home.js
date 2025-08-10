// Home page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedProducts();
});

async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    
    try {
        showLoading(container);
        
        // Fetch featured products from API
        const response = await API.get('/products/featured/latest');
        const products = response.products;
        
        if (products.length === 0) {
            container.innerHTML = '<p class="text-center">No products available at the moment.</p>';
            return;
        }
        
        // Render products
        container.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.imageURL}" alt="${product.name}" class="product-image" 
                     onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop'">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">${formatPrice(product.price)} <span style="font-size: 0.8rem; color: var(--text-light);">per ${product.weight}</span></div>
                    <p class="product-description">${product.description}</p>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="addToCart('${product._id}')" style="flex: 1;">
                            Add to Cart
                        </button>
                        <a href="/product/${product._id}" class="btn btn-outline">View Details</a>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading featured products:', error);
        container.innerHTML = '<p class="text-center">Error loading products. Please try again later.</p>';
    }
}

async function addToCart(productId) {
    try {
        // Fetch product details
        const response = await API.get(`/products/${productId}`);
        const product = response.product;
        
        // Add to cart
        Cart.addItem(product, 1);
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        Cart.showNotification('Error adding product to cart');
    }
}
