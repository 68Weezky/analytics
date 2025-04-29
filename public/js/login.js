document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById('login');
    const loginEmail = document.getElementById('email');
    const loginPassword = document.getElementById('password');
    const loader = document.getElementById('loader');
    const errorparagraph = document.getElementById('error');
    const success = document.getElementById('success');
    const register = document.getElementById('signup')
    
    register.addEventListener('click', async (e) =>{
        e.preventDefault()
        window.location.href = '/register'
    })

    async function showLoader() {
        loader.style.display = 'flex';
    }

    // Function to hide the loader
    async function hideLoader() {
        loader.style.display = 'none';
    }

    async function showError() {
        errorparagraph.style.display = 'block'
    }

    async function showSuccess() {
        success.style.display = 'block'
    }

    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        showLoader();
        const emailValue = loginEmail.value.trim();
        const passwordValue = loginPassword.value.trim();

        if (emailValue === '' || passwordValue === '') {
            showError();
            errorparagraph.innerText = 'Both email and password are required.';
            hideLoader();
        } else {
            const userData = {
                email: emailValue,
                password: passwordValue,
            };

            try {
                showLoader();
                const response = await fetch('/login-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData),
                });

                const result = await response.json();

                if (result.message === 'Login successful') {
                    showSuccess();
                    success.innerText = 'Login successful!';
                    window.location.href = result.redirect;
                } else {
                    showError();
                    errorparagraph.innerText = 'Login failed. Check your credentials.';
                }
            } catch (error) {
                console.error('Error during login:', error);
                showError();
                errorparagraph.innerText = 'An error occurred during login. Please try again.';
            }finally{
                hideLoader();
            }
        }
    });
});