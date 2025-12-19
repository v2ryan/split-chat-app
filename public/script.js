// Initialize socket safely
let socket;
try {
    socket = io();
} catch (e) {
    console.warn("Socket.io not connected. Chat features will not work.");
}

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
if (adminLoginBtn) {
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
}

// Helper to append message
function appendMessage(container, msg, type) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.textContent = msg;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// Admin Chat
if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (adminInput.value && isAdmin) {
            if (socket) {
                socket.emit('admin-message', adminInput.value);
            } else {
                alert("Server not connected. Please run 'npm start'.");
            }
            adminInput.value = '';
        }
    });
}

if (socket) {
    socket.on('admin-message', (msg) => {
        appendMessage(adminMessages, `Admin: ${msg}`);
    });

    socket.on('public-message', (msg) => {
        appendMessage(publicMessages, `User: ${msg}`);
    });
}

// Public Chat
if (publicForm) {
    publicForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (publicInput.value) {
            if (socket) {
                socket.emit('public-message', publicInput.value);
            } else {
                alert("Server not connected. Please run 'npm start'.");
            }
            publicInput.value = '';
        }
    });
}
