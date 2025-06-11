document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = document.getElementById('submitBtn');
    
    // Reset error message
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        // Redirect based on role
        if (data.user.role === 'admin') {
            window.location.href = '/admin';
        } else {
            window.location.href = '/docs';
        }
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
    }
});

// Check if already logged in
(async () => {
    try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
            window.location.href = '/docs';
        }
    } catch (error) {
        // Not logged in, stay on login page
    }
})();