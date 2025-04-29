document.addEventListener('DOMContentLoaded', () => {
    const submitUser = document.getElementById('submit-user');

    submitUser.addEventListener('click', async (e) => {
        e.preventDefault();
        const name = document.getElementById('user-name').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const role = document.getElementById('user-role').value.trim();
        const password = document.getElementById('user-password').value.trim();

        if (!name || !email || !role || !password) {
            alert('Please fill in all fields.');
            e.preventDefault();
        } else {
            const userData = {
                name: name,
                email: email,
                role: role,
                password: password
            };

            try {
                const response = await fetch('/register-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                if (response.ok) {
                    alert('User created successfully!');
                    window.location.reload();
                } else {
                    alert('Error creating user. Please try again.');
                }
            } catch (error) {
                console.error('Error during submission:', error);
            }
        }
    })

    const updateUserButtons = document.querySelectorAll('.update-user');
    updateUserButtons.forEach(button => {
        button.addEventListener('click', function () {
            const userId = this.dataset.playerId;
            openUpdateUserDialog(userId);
        });
    });

    const updateUserButton = document.getElementById('update-user-btn');
    updateUserButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const userId = document.getElementById('userId').value.trim();
        const newName = document.getElementById('new-name').value.trim();
        const newEmail = document.getElementById('new-email').value.trim();
        const newRole = document.getElementById('new-role').value.trim();
        const newPassword = document.getElementById('new-password').value.trim();

        if (!userId || !newName || !newEmail || !newRole || !newPassword) {
            alert('Please fill in all fields.');
            return;
        }

        const updateData = {
            id: userId,
            name: newName,
            email: newEmail,
            role: newRole,
            password: newPassword
        };

        try {
            const response = await fetch('/update-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                alert('User updated successfully!');
                window.location.reload();
            } else {
                alert('Error updating user. Please try again.');
            }
        } catch (error) {
            console.error('Error during update:', error);
        }
    });

    const deleteUserButtons = document.querySelectorAll('.delete-user');
    deleteUserButtons.forEach(button => {
        button.addEventListener('click', function () {
            const userId = this.dataset.playerId;
            const confirmation = confirm('Are you sure you want to delete this user?');
            if (confirmation) {
                fetch(`/delete-user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: userId })
                })
                .then(response => {
                    if (response.ok) {
                        alert('User deleted successfully!');
                        window.location.reload();
                    } else {
                        alert('Error deleting user. Please try again.');
                    }
                })
                .catch(error => console.error('Error during deletion:', error));
            }
        });
    });
});

function openUpdateUserDialog(userId) {
    document.getElementById('userId').value = userId;
    document.getElementById('updateUserDialog').showModal();
}