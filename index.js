// index.js

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const guestBtn = document.getElementById('guestBtn');

    loginBtn.addEventListener('click', () => {
        window.location.href = 'login.html';
    });

    guestBtn.addEventListener('click', () => {
        window.location.href = 'main.html';
    });
});
