// Authentication page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (Auth.isLoggedIn()) {
        window.location.href = '/';
        return;
    }
    
    setupAuthForms();
});

function setupAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorContainer = document.getElementById('errorContainer');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginLoader = document.getElementById('loginLoader');
    
    // Clear previous errors
    errorContainer.innerHTML = '';
    
    // Show loading state
    loginBtnText.textContent = 'Logging in...';
    loginLoader.classList.remove('hidden');
    
    try {
        const response = await API.post('/auth/login', {
            email,
            password
        });
        
        // Store authentication data
        Auth.setToken(response.token);
        Auth.setUser(response.user);
        
        // Show success message
        showSuccess('Login successful! Redirecting...', errorContainer);
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'Login failed. Please try again.', errorContainer);
    } finally {
        // Reset button state
        loginBtnText.textContent = 'Login';
        loginLoader.classList.add('hidden');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorContainer = document.getElementById('errorContainer');
    const registerBtnText = document.getElementById('registerBtnText');
    const registerLoader = document.getElementById('registerLoader');
    
    // Clear previous errors
    errorContainer.innerHTML = '';
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showError('Passwords do not match', errorContainer);
        return;
    }
    
    // Validate password strength
    if (password.length < 6) {
        showError('Password must be at least 6 characters long', errorContainer);
        return;
    }
    
    // Show loading state
    registerBtnText.textContent = 'Creating Account...';
    registerLoader.classList.remove('hidden');
    
    try {
        const response = await API.post('/auth/register', {
            name,
            email,
            password
        });
        
        // Store authentication data
        Auth.setToken(response.token);
        Auth.setUser(response.user);
        
        // Show success message
        showSuccess('Account created successfully! Redirecting...', errorContainer);
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
        
    } catch (error) {
        console.error('Registration error:', error);
        showError(error.message || 'Registration failed. Please try again.', errorContainer);
    } finally {
        // Reset button state
        registerBtnText.textContent = 'Create Account';
        registerLoader.classList.add('hidden');
    }
}
