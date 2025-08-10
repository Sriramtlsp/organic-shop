// Shop page specific JavaScript
let currentPage = 1;
let currentCategory = 'all';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', function() {
    initializeShop();
    setupEventListeners();
});

function initializeShop() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    if (category) {
        currentCategory = category;
        document.getElementById('categoryFilter').value = category;
    }
    
    if (search) {
        currentSearch = search;
        document.getElementById('searchInput').value = search;
    }
    
    loadProducts();
}

function setupEventListeners() {
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    categoryFilter.addEventListener('change', function() {
        currentCategory = this.value;
        currentPage = 1;
        loadProducts();
    });
}

function handleSearch() {
    currentSearch = document.getElementById('searchInput').value;
    currentPage = 1;
    loadProducts();
}

async function loadProducts() {
    const container = document.getElementById('productsGrid');
    
    try {
        showLoading(container);
        
        // Build query parameters
        const params = new URLSearchParams({
            page: currentPage,
            limit: 12
        });
        
        if (currentCategory !== 'all') {
            params.append('category', currentCategory);
        }
        
        if (currentSearch) {
            params.append('search', currentSearch);
        }
        
        // Fetch products from API
        const response = await API.get(`/products?${params}`);
        const { products, pagination } = response;
        
        if (products.length === 0) {
            container.innerHTML = '<div class="text-center" style="grid-column: 1 / -1;"><p>No products found matching your criteria.</p></div>';
            document.getElementById('pagination').innerHTML = '';
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
                        <a href="/product/${product._id}" class="btn btn-outline">View</a>
                    </div>
                    <div style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-light);">
                        Stock: ${product.stock} available
                    </div>
                </div>
            </div>
        `).join('');
        
        // Render pagination
        renderPagination(pagination);
        
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<div class="text-center" style="grid-column: 1 / -1;"><p>Error loading products. Please try again later.</p></div>';
    }
}

function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    
    if (pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (pagination.current > 1) {
        paginationHTML += `<button onclick="changePage(${pagination.current - 1})">Previous</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= pagination.pages; i++) {
        if (i === pagination.current) {
            paginationHTML += `<button class="active">${i}</button>`;
        } else if (i === 1 || i === pagination.pages || Math.abs(i - pagination.current) <= 2) {
            paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
        } else if (i === pagination.current - 3 || i === pagination.current + 3) {
            paginationHTML += `<span>...</span>`;
        }
    }
    
    // Next button
    if (pagination.current < pagination.pages) {
        paginationHTML += `<button onclick="changePage(${pagination.current + 1})">Next</button>`;
    }
    
    container.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function addToCart(productId) {
    try {
        // Fetch product details
        const response = await API.get(`/products/${productId}`);
        const product = response.product;
        
        // Check stock
        if (product.stock <= 0) {
            Cart.showNotification('Product is out of stock');
            return;
        }
        
        // Add to cart
        Cart.addItem(product, 1);
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        Cart.showNotification('Error adding product to cart');
    }
}
