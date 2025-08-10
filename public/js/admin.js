// Admin dashboard specific JavaScript
let currentProductsPage = 1;
let currentOrdersPage = 1;

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is admin
    if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
        window.location.href = '/login';
        return;
    }
    
    loadDashboardStats();
    loadProducts();
    setupEventListeners();
});

function setupEventListeners() {
    const addProductForm = document.getElementById('addProductForm');
    const editProductForm = document.getElementById('editProductForm');
    
    addProductForm.addEventListener('submit', handleAddProduct);
    editProductForm.addEventListener('submit', handleEditProduct);
    
    // Setup image upload functionality
    setupImageUpload();
    
    // Add tab button styles
    const style = document.createElement('style');
    style.textContent = `
        .tab-btn {
            padding: 0.75rem 1.5rem;
            border: none;
            background: transparent;
            cursor: pointer;
            font-weight: 500;
            border-bottom: 2px solid transparent;
            transition: all 0.3s;
        }
        .tab-btn.active {
            color: var(--primary-green);
            border-bottom-color: var(--primary-green);
        }
        .tab-btn:hover {
            color: var(--primary-green);
        }
    `;
    document.head.appendChild(style);
}

// Image Upload Functionality
function setupImageUpload() {
    const fileInput = document.getElementById('productImageFile');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const urlInput = document.getElementById('productImageUrl');
    
    // File input change handler
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop handlers
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('dragleave', handleDragLeave);
    fileUploadArea.addEventListener('drop', handleFileDrop);
    
    // URL input handler
    urlInput.addEventListener('input', handleUrlInput);
}

function switchUploadMethod(method) {
    const uploadSection = document.getElementById('uploadSection');
    const urlSection = document.getElementById('urlSection');
    const uploadTabs = document.querySelectorAll('.upload-tab');
    
    // Update tab states
    uploadTabs.forEach(tab => tab.classList.remove('active'));
    
    // Find and activate the correct tab
    const activeTab = Array.from(uploadTabs).find(tab => 
        tab.textContent.toLowerCase().includes(method === 'upload' ? 'upload' : 'url')
    );
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Show/hide sections
    if (method === 'upload') {
        uploadSection.classList.remove('hidden');
        urlSection.classList.add('hidden');
    } else {
        uploadSection.classList.add('hidden');
        urlSection.classList.remove('hidden');
    }
    
    // Clear previous selections
    clearImageSelection();
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (isValidImageFile(file)) {
            uploadImage(file);
        } else {
            showError('Please select a valid image file (JPG, PNG, GIF, WebP)');
        }
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && isValidImageFile(file)) {
        uploadImage(file);
    } else if (file) {
        showError('Please select a valid image file (JPG, PNG, GIF, WebP)');
    }
}

function handleUrlInput(e) {
    const url = e.target.value.trim();
    if (url) {
        // Simple URL validation
        if (isValidImageUrl(url)) {
            previewImageFromUrl(url);
            document.getElementById('productImage').value = url;
        } else {
            clearImageSelection();
        }
    } else {
        clearImageSelection();
    }
}

function isValidImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
        return false;
    }
    
    if (file.size > maxSize) {
        showError('File size must be less than 5MB');
        return false;
    }
    
    return true;
}

function isValidImageUrl(url) {
    try {
        new URL(url);
        return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
    } catch {
        return false;
    }
}

async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    // Show upload progress
    showUploadProgress();
    
    try {
        const response = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Hide upload progress
            hideUploadProgress();
            
            // Preview uploaded image
            previewImageFromUrl(result.imageUrl);
            
            // Set the image URL in hidden input
            document.getElementById('productImage').value = result.imageUrl;
            
            showSuccess('Image uploaded successfully!');
        } else {
            hideUploadProgress();
            showError(result.message || 'Failed to upload image');
        }
    } catch (error) {
        hideUploadProgress();
        showError('Error uploading image: ' + error.message);
    }
}

function previewImageFromUrl(url) {
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    previewImg.src = url;
    preview.classList.remove('hidden');
}

function removeImage() {
    clearImageSelection();
    document.getElementById('productImage').value = '';
    document.getElementById('productImageFile').value = '';
    document.getElementById('productImageUrl').value = '';
}

function clearImageSelection() {
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    preview.classList.add('hidden');
    previewImg.src = '';
}

function showUploadProgress() {
    const progress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progress.classList.remove('hidden');
    progressFill.style.width = '0%';
    progressText.textContent = 'Uploading...';
    
    // Simulate progress animation
    let width = 0;
    const interval = setInterval(() => {
        width += Math.random() * 15;
        if (width > 90) {
            clearInterval(interval);
            width = 90;
        }
        progressFill.style.width = width + '%';
    }, 100);
    
    // Store interval ID for cleanup
    progress.dataset.intervalId = interval;
}

function hideUploadProgress() {
    const progress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    // Clear any running interval
    if (progress.dataset.intervalId) {
        clearInterval(progress.dataset.intervalId);
        delete progress.dataset.intervalId;
    }
    
    // Complete the progress bar
    progressFill.style.width = '100%';
    progressText.textContent = 'Upload complete!';
    
    // Hide after a short delay
    setTimeout(() => {
        progress.classList.add('hidden');
        progressFill.style.width = '0%';
    }, 1000);
}

function showError(message) {
    // You can integrate this with your existing error display system
    console.error(message);
    alert(message); // Temporary - replace with your error display method
}

function showSuccess(message) {
    // You can integrate this with your existing success display system
    console.log(message);
    // Temporary - replace with your success display method
}

// Make functions globally accessible
window.switchUploadMethod = switchUploadMethod;
window.removeImage = removeImage;
window.triggerFileInput = triggerFileInput;

function triggerFileInput() {
    const fileInput = document.getElementById('productImageFile');
    if (fileInput) {
        fileInput.click();
    }
}

async function loadDashboardStats() {
    const container = document.getElementById('dashboardStats');
    
    try {
        const response = await API.get('/admin/dashboard');
        const stats = response.stats;
        
        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${stats.totalProducts}</div>
                <div class="stat-label">Total Products</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalOrders}</div>
                <div class="stat-label">Total Orders</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalUsers}</div>
                <div class="stat-label">Total Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.pendingOrders}</div>
                <div class="stat-label">Pending Orders</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${formatPrice(stats.totalRevenue)}</div>
                <div class="stat-label">Total Revenue</div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        container.innerHTML = '<p class="text-center">Error loading dashboard statistics.</p>';
    }
}

async function loadProducts(page = 1) {
    const tbody = document.getElementById('productsTableBody');
    currentProductsPage = page;
    
    try {
        showLoading(tbody);
        
        const response = await API.get(`/admin/products?page=${page}&limit=10`);
        const { products, pagination } = response;
        
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>
                    <img src="${product.imageURL}" alt="${product.name}" 
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"
                         onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=50&h=50&fit=crop'">
                </td>
                <td>${product.name}</td>
                <td style="text-transform: capitalize;">${product.category}</td>
                <td>${formatPrice(product.price)}</td>
                <td>${product.stock}</td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="editProduct('${product._id}')">
                            Edit
                        </button>
                        <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="deleteProduct('${product._id}', '${product.name}')">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        renderProductsPagination(pagination);
        
    } catch (error) {
        console.error('Error loading products:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading products.</td></tr>';
    }
}

async function loadOrders(page = 1) {
    const tbody = document.getElementById('ordersTableBody');
    const statusFilter = document.getElementById('orderStatusFilter').value;
    currentOrdersPage = page;
    
    try {
        showLoading(tbody);
        
        const params = new URLSearchParams({
            page: page,
            limit: 10
        });
        
        if (statusFilter !== 'all') {
            params.append('status', statusFilter);
        }
        
        const response = await API.get(`/admin/orders?${params}`);
        const { orders, pagination } = response;
        
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>#${order._id.slice(-8)}</td>
                <td>${order.userId.name}<br><small style="color: var(--text-light);">${order.userId.email}</small></td>
                <td>${formatDate(order.orderDate)}</td>
                <td>${formatPrice(order.totalAmount)}</td>
                <td style="text-transform: uppercase;">${order.paymentMethod}</td>
                <td>
                    <select class="form-control" style="font-size: 0.8rem; padding: 0.25rem;" onchange="updateOrderStatus('${order._id}', this.value)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="viewOrderDetails('${order._id}')">
                        View
                    </button>
                </td>
            </tr>
        `).join('');
        
        renderOrdersPagination(pagination);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error loading orders.</td></tr>';
    }
}

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.remove('hidden');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data for the selected tab
    if (tabName === 'orders') {
        loadOrders();
    } else if (tabName === 'products') {
        loadProducts();
    }
}

async function handleAddProduct(e) {
    e.preventDefault();
    
    const errorContainer = document.getElementById('addProductErrorContainer');
    const btnText = document.getElementById('addProductBtnText');
    const loader = document.getElementById('addProductLoader');
    
    errorContainer.innerHTML = '';
    btnText.textContent = 'Adding Product...';
    loader.classList.remove('hidden');
    
    try {
        const productData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            weight: document.getElementById('productWeight').value,
            stock: parseInt(document.getElementById('productStock').value),
            imageURL: document.getElementById('productImage').value,
            description: document.getElementById('productDescription').value
        };
        
        await API.post('/admin/products', productData);
        
        // Reset form
        e.target.reset();
        
        // Show success message
        showSuccess('Product added successfully!', errorContainer);
        
        // Reload products if on products tab
        if (!document.getElementById('productsTab').classList.contains('hidden')) {
            loadProducts();
        }
        
        // Update dashboard stats
        loadDashboardStats();
        
    } catch (error) {
        console.error('Error adding product:', error);
        showError(error.message || 'Failed to add product', errorContainer);
    } finally {
        btnText.textContent = 'Add Product';
        loader.classList.add('hidden');
    }
}

async function editProduct(productId) {
    try {
        const response = await API.get(`/products/${productId}`);
        const product = response.product;
        
        // Fill edit form
        document.getElementById('editProductId').value = product._id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductCategory').value = product.category;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductWeight').value = product.weight;
        document.getElementById('editProductStock').value = product.stock;
        document.getElementById('editProductImage').value = product.imageURL;
        document.getElementById('editProductDescription').value = product.description;
        
        // Show modal
        document.getElementById('editProductModal').classList.add('active');
        
    } catch (error) {
        console.error('Error loading product for edit:', error);
        alert('Error loading product details');
    }
}

async function handleEditProduct(e) {
    e.preventDefault();
    
    const errorContainer = document.getElementById('editProductErrorContainer');
    const productId = document.getElementById('editProductId').value;
    
    errorContainer.innerHTML = '';
    
    try {
        const productData = {
            name: document.getElementById('editProductName').value,
            category: document.getElementById('editProductCategory').value,
            price: parseFloat(document.getElementById('editProductPrice').value),
            weight: document.getElementById('editProductWeight').value,
            stock: parseInt(document.getElementById('editProductStock').value),
            imageURL: document.getElementById('editProductImage').value,
            description: document.getElementById('editProductDescription').value
        };
        
        await API.put(`/admin/products/${productId}`, productData);
        
        // Close modal
        closeEditModal();
        
        // Show success message
        Cart.showNotification('Product updated successfully!');
        
        // Reload products
        loadProducts(currentProductsPage);
        
    } catch (error) {
        console.error('Error updating product:', error);
        showError(error.message || 'Failed to update product', errorContainer);
    }
}

async function deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
        return;
    }
    
    try {
        await API.delete(`/admin/products/${productId}`);
        
        Cart.showNotification('Product deleted successfully!');
        
        // Reload products
        loadProducts(currentProductsPage);
        
        // Update dashboard stats
        loadDashboardStats();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        await API.put(`/admin/orders/${orderId}/status`, { status: newStatus });
        
        Cart.showNotification('Order status updated successfully!');
        
        // Update dashboard stats
        loadDashboardStats();
        
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Failed to update order status');
    }
}

function viewOrderDetails(orderId) {
    // For now, just show an alert. In a real app, you'd show a detailed modal
    alert(`Order details for ${orderId} would be shown here. This feature can be expanded with a detailed order view modal.`);
}

function closeEditModal() {
    document.getElementById('editProductModal').classList.remove('active');
    document.getElementById('editProductErrorContainer').innerHTML = '';
}

function renderProductsPagination(pagination) {
    const container = document.getElementById('productsPagination');
    
    if (pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    if (pagination.current > 1) {
        html += `<button onclick="loadProducts(${pagination.current - 1})">Previous</button>`;
    }
    
    for (let i = 1; i <= pagination.pages; i++) {
        if (i === pagination.current) {
            html += `<button class="active">${i}</button>`;
        } else if (i === 1 || i === pagination.pages || Math.abs(i - pagination.current) <= 2) {
            html += `<button onclick="loadProducts(${i})">${i}</button>`;
        } else if (i === pagination.current - 3 || i === pagination.current + 3) {
            html += `<span>...</span>`;
        }
    }
    
    if (pagination.current < pagination.pages) {
        html += `<button onclick="loadProducts(${pagination.current + 1})">Next</button>`;
    }
    
    container.innerHTML = html;
}

function renderOrdersPagination(pagination) {
    const container = document.getElementById('ordersPagination');
    
    if (pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    if (pagination.current > 1) {
        html += `<button onclick="loadOrders(${pagination.current - 1})">Previous</button>`;
    }
    
    for (let i = 1; i <= pagination.pages; i++) {
        if (i === pagination.current) {
            html += `<button class="active">${i}</button>`;
        } else if (i === 1 || i === pagination.pages || Math.abs(i - pagination.current) <= 2) {
            html += `<button onclick="loadOrders(${i})">${i}</button>`;
        } else if (i === pagination.current - 3 || i === pagination.current + 3) {
            html += `<span>...</span>`;
        }
    }
    
    if (pagination.current < pagination.pages) {
        html += `<button onclick="loadOrders(${pagination.current + 1})">Next</button>`;
    }
    
    container.innerHTML = html;
}
