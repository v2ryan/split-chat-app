const socket = io();

// DOM Elements
const adminForm = document.getElementById('admin-form');
const adminInput = document.getElementById('admin-input');
const adminMessages = document.getElementById('admin-messages');
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminSendBtn = document.getElementById('admin-send-btn');

const publicForm = document.getElementById('public-form');
const publicInput = document.getElementById('public-input');
const publicMessages = document.getElementById('public-messages');

// Admin Login Logic (Simple Toggle for Demo)
let isAdmin = false;
adminLoginBtn.addEventListener('click', () => {
    isAdmin = !isAdmin;
    if (isAdmin) {
        adminForm.classList.remove('disabled');
        adminInput.disabled = false;
        adminSendBtn.disabled = false;
        adminLoginBtn.textContent = 'Logout Admin';
        alert('You are now Admin!');
    } else {
        adminForm.classList.add('disabled');
        adminInput.disabled = true;
        adminSendBtn.disabled = true;
        adminLoginBtn.textContent = 'Login as Admin';
    }
});

// Helper to append message
function appendMessage(container, msg, type) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.textContent = msg;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// Admin Chat
adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (adminInput.value && isAdmin) {
        socket.emit('admin-message', adminInput.value);
        adminInput.value = '';
    }
});

socket.on('admin-message', (msg) => {
    appendMessage(adminMessages, `Admin: ${msg}`);
});

// Public Chat
publicForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (publicInput.value) {
        socket.emit('public-message', publicInput.value);
        publicInput.value = '';
    }
});

socket.on('public-message', (msg) => {
    appendMessage(publicMessages, `User: ${msg}`);
});
