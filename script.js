// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// TODO: Replace the following with your app's Firebase project configuration
// See README.md for instructions on how to get this.
const firebaseConfig = {
  apiKey: "AIzaSyA0ZADGvf0Mvm0dEW1cr_rXoEWQHEZWLHM",
  authDomain: "white-b381b.firebaseapp.com",
  projectId: "white-b381b",
  storageBucket: "white-b381b.firebasestorage.app",
  messagingSenderId: "824500784810",
  appId: "1:824500784810:web:e0f567f6f21d657adc4ad3",
  measurementId: "G-MKPM0WGJNF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const adminForm = document.getElementById('admin-form');
const adminInput = document.getElementById('admin-input');
const adminMessages = document.getElementById('admin-messages');
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminClearBtn = document.getElementById('admin-clear-btn');
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
            adminClearBtn.style.display = 'inline-block';
            adminLoginBtn.textContent = 'Logout Admin';
            alert('You are now Admin!');
        } else {
            adminForm.classList.add('disabled');
            adminInput.disabled = true;
            adminSendBtn.disabled = true;
            adminClearBtn.style.display = 'none';
            adminLoginBtn.textContent = 'Login as Admin';
        }
    });
}

// Clear Chat Logic
if (adminClearBtn) {
    adminClearBtn.addEventListener('click', async () => {
        if (!isAdmin) return;
        if (confirm("Are you sure you want to clear ALL chat history? This cannot be undone.")) {
            try {
                const q = query(collection(db, "messages"));
                const snapshot = await getDocs(q);
                const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, "messages", d.id)));
                await Promise.all(deletePromises);
                alert("Chat history cleared!");
            } catch (e) {
                console.error("Error clearing chat: ", e);
                alert("Error clearing chat.");
            }
        }
    });
}

// Helper to append message
function appendMessage(container, msg) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.textContent = msg;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// Listen for messages in real-time
const q = query(collection(db, "messages"), orderBy("timestamp"));
onSnapshot(q, (snapshot) => {
    // Clear current messages to avoid duplicates (simple approach)
    adminMessages.innerHTML = '';
    publicMessages.innerHTML = '';
    
    snapshot.forEach((doc) => {
        const data = doc.data();
        const text = data.text;
        const type = data.type; // 'admin' or 'public'
        
        if (type === 'admin') {
            appendMessage(adminMessages, `Admin: ${text}`);
        } else {
            appendMessage(publicMessages, `User: ${text}`);
        }
    });
});

// Admin Chat Send
if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (adminInput.value && isAdmin) {
            try {
                await addDoc(collection(db, "messages"), {
                    text: adminInput.value,
                    type: "admin",
                    timestamp: serverTimestamp()
                });
                adminInput.value = '';
            } catch (e) {
                console.error("Error adding document: ", e);
                alert("Error sending message. Check console.");
            }
        }
    });
}

// Public Chat Send
if (publicForm) {
    publicForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (publicInput.value) {
            try {
                await addDoc(collection(db, "messages"), {
                    text: publicInput.value,
                    type: "public",
                    timestamp: serverTimestamp()
                });
                publicInput.value = '';
            } catch (e) {
                console.error("Error adding document: ", e);
                alert("Error sending message. Check console.");
            }
        }
    });
}
