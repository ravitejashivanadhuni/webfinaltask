document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const forgotPasswordForm = document.getElementById("forgot-password-form");

    const showPasswordCheckboxLogin = document.getElementById("show-password");
    const showPasswordCheckboxRegister = document.getElementById("show-password-register");

    if (showPasswordCheckboxLogin) {
        showPasswordCheckboxLogin.addEventListener("change", function() {
            const passwordField = document.getElementById("password");
            passwordField.type = this.checked ? "text" : "password";
        });
    }

    if (showPasswordCheckboxRegister) {
        showPasswordCheckboxRegister.addEventListener("change", function() {
            const passwordField = document.getElementById("password");
            passwordField.type = this.checked ? "text" : "password";
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            const email = event.target.email.value;
            const password = event.target.password.value;
            const role = event.target.role.value;

            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password, role })
                });
                if (!response.ok) {
                    throw new Error('Login failed. Please try again.');
                }

                const result = await response.json();
                if (response.ok) {
                    alert('Login successful');
                    if (role === 'doctor') {
                        window.location.href = '/doctor-dashboard.html';
                    } else if (role === 'admin') {
                        window.location.href = '/admin-dashboard.html';
                    } else if (role === 'user'){
                        window.location.href = '/user-dashboard.html';
                    }
                } else {
                    throw new Error(result.message || 'Login failed. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('your password is incorrect! Please try again.');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            const name = event.target.name.value;
            const email = event.target.email.value;
            const password = event.target.password.value;
            const role = event.target.role.value;

            const endpoint = role === 'doctor' ? '/auth/register-doctor' : '/auth/register-user';

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password, role })
                });

                const result = await response.json();
                if (response.ok) {
                    alert('Registration successful');
                    window.location.href = '/login.html';
                } else {
                    throw new Error(result.message || 'Registration failed. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while trying to register. Please try again later.');
            }
        });
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            const email = event.target.email.value;

            try {
                const response = await fetch('/auth/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const result = await response.json();
                if (response.ok) {
                    const messageDiv = document.getElementById("message");
                    messageDiv.style.display = 'block';
                    messageDiv.textContent = 'Password reset instructions have been sent to your email.';
                } else {
                    throw new Error(result.message || 'Failed to send reset instructions. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while trying to reset the password. Please try again later.');
            }
        });
    }
});

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = 'none';
    });
    const page = document.getElementById(pageId);
    if (page) {
        page.style.display = 'block';
    } else {
        console.error(`Page with ID ${pageId} not found.`);
    }
}

// Show home page on load
showPage('home');
