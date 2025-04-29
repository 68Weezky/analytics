document.addEventListener('DOMContentLoaded', async ()=>{
    const errorparagraph = document.getElementById('error');
    const success = document.getElementById('success');
    const registerBtn = document.getElementById('signup');
    const loader = document.getElementById('loader');
    const login = document.getElementById('login')

    login.addEventListener('click', async (e) =>{
        e.preventDefault()
        window.location.href = '/login'
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

    registerBtn.addEventListener('click', async (e)=>{
        e.preventDefault();
        showLoader();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!name || !email ||!password) {
            hideLoader();
            showError();
            errorparagraph.innerText = 'All fields are required'
        } else {
            const userData = {
                name,
                email,
                password
            }

            // console.log('Collected', userData)

            try {
                // Send registration data to server
                showLoader();
                const response = await fetch('/register-user', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
    
                const result = await response.json();
    
                if (response.ok) {
                    showSuccess();
                    success.innerText = "You have successfully registered on Analytics!";
                    // Redirect to login page 
                    window.location.href = "/login";
                } else {
                    showError();
                    errorparagraph.innerText = "Registration failed. Please try again.";
                    console.log(error);
                }
            } catch (error) {
                console.error("Error during registration:", error);
                showError();
                errorparagraph.innerText = "An error occurred. Please try again later.";
            } finally{
                hideLoader();
            }
        }
    })
})