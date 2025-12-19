// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, deleteDoc, doc, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const datePicker = document.getElementById('date-picker');
const enterChatBtn = document.getElementById('enter-chat-btn');
const currentDateDisplay = document.getElementById('current-date-display');
const backToLoginBtn = document.getElementById('back-to-login-btn');

const adminForm = document.getElementById('admin-form');
const adminInput = document.getElementById('admin-input');
const adminMessages = document.getElementById('admin-messages');
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminClearBtn = document.getElementById('admin-clear-btn');
const adminSaveBtn = document.getElementById('admin-save-btn');
const adminSendBtn = document.getElementById('admin-send-btn');

const publicForm = document.getElementById('public-form');
const publicInput = document.getElementById('public-input');
const publicMessages = document.getElementById('public-messages');

// State
let selectedDate = null;
let unsubscribe = null; // To stop listening when changing dates

// Initialize Date Picker with Today
const today = new Date().toISOString().split('T')[0];
datePicker.value = today;

// Enter Chat Logic
enterChatBtn.addEventListener('click', () => {
    if (!datePicker.value) {
        alert("Please select a date.");
        return;
    }
    selectedDate = datePicker.value;
    currentDateDisplay.textContent = `(${selectedDate})`;
    
    loginScreen.style.display = 'none';
    chatScreen.style.display = 'flex';
    
    loadMessagesForDate(selectedDate);
});

// Back to Login Logic
backToLoginBtn.addEventListener('click', () => {
    chatScreen.style.display = 'none';
    loginScreen.style.display = 'flex';
    if (unsubscribe) unsubscribe(); // Stop listening to previous date
    adminMessages.innerHTML = '';
    publicMessages.innerHTML = '';
});

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
            adminSaveBtn.style.display = 'inline-block';
            adminLoginBtn.textContent = 'Logout Admin';
            alert('You are now Admin!');
        } else {
            adminForm.classList.add('disabled');
            adminInput.disabled = true;
            adminSendBtn.disabled = true;
            adminClearBtn.style.display = 'none';
            adminSaveBtn.style.display = 'none';
            adminLoginBtn.textContent = 'Login as Admin';
        }
    });
}

// Save Chat Logic (Download as Text)
if (adminSaveBtn) {
    adminSaveBtn.addEventListener('click', async () => {
        if (!isAdmin) return;
        
        try {
            const q = query(collection(db, "messages"), where("date", "==", selectedDate), orderBy("timestamp"));
            const snapshot = await getDocs(q);
            
            let content = `Chat History for ${selectedDate}\n\n`;
            snapshot.forEach((doc) => {
                const data = doc.data();
                const time = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString() : 'Pending';
                const sender = data.type === 'admin' ? 'Admin' : 'User';
                content += `[${time}] ${sender}: ${data.text}\n`;
            });
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat-history-${selectedDate}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            
        } catch (e) {
            console.error("Error saving chat: ", e);
            alert("Error saving chat history.");
        }
    });
}

// Clear Chat Logic
if (adminClearBtn) {
    adminClearBtn.addEventListener('click', async () => {
        if (!isAdmin) return;
        if (confirm(`Are you sure you want to clear chat history for ${selectedDate}? This cannot be undone.`)) {
            try {
                const q = query(collection(db, "messages"), where("date", "==", selectedDate));
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
function appendMessage(container, msg, timestamp) {
    const div = document.createElement('div');
    div.classList.add('message');
    
    const textDiv = document.createElement('div');
    textDiv.classList.add('message-text');
    textDiv.textContent = msg;
    
    const timeDiv = document.createElement('div');
    timeDiv.classList.add('message-time');
    if (timestamp) {
        timeDiv.textContent = new Date(timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        timeDiv.textContent = 'Sending...';
    }
    
    div.appendChild(textDiv);
    div.appendChild(timeDiv);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// Load Messages Function
function loadMessagesForDate(date) {
    if (unsubscribe) unsubscribe();
    
    const q = query(collection(db, "messages"), where("date", "==", date), orderBy("timestamp"));
    unsubscribe = onSnapshot(q, (snapshot) => {
        adminMessages.innerHTML = '';
        publicMessages.innerHTML = '';
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            const text = data.text;
            const type = data.type;
            const timestamp = data.timestamp;
            
            if (type === 'admin') {
                appendMessage(adminMessages, `Admin: ${text}`, timestamp);
            } else {
                appendMessage(publicMessages, `User: ${text}`, timestamp);
            }
        });
    });
}

// Admin Chat Send
if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (adminInput.value && isAdmin) {
            try {
                await addDoc(collection(db, "messages"), {
                    text: adminInput.value,
                    type: "admin",
                    timestamp: serverTimestamp(),
                    date: selectedDate
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
                    timestamp: serverTimestamp(),
                    date: selectedDate
                });
                publicInput.value = '';
            } catch (e) {
                console.error("Error adding document: ", e);
                alert("Error sending message. Check console.");
            }
        }
    });
}
