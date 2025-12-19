// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, deleteDoc, doc, where, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const historyDropdown = document.getElementById('history-dropdown');

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
    loadSavedHistories(); // Load dropdown options
});

// Back to Login Logic
backToLoginBtn.addEventListener('click', () => {
    chatScreen.style.display = 'none';
    loginScreen.style.display = 'flex';
    if (unsubscribe) unsubscribe(); // Stop listening to previous date
    adminMessages.innerHTML = '';
    publicMessages.innerHTML = '';
    historyDropdown.value = 'live'; // Reset dropdown
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
            historyDropdown.style.display = 'inline-block';
            adminLoginBtn.textContent = 'Logout Admin';
            alert('You are now Admin!');
        } else {
            adminForm.classList.add('disabled');
            adminInput.disabled = true;
            adminSendBtn.disabled = true;
            adminClearBtn.style.display = 'none';
            adminSaveBtn.style.display = 'none';
            historyDropdown.style.display = 'none';
            adminLoginBtn.textContent = 'Login as Admin';
            
            // Force back to live chat if logged out while viewing history
            if (historyDropdown.value !== 'live') {
                historyDropdown.value = 'live';
                loadMessagesForDate(selectedDate);
            }
        }
    });
}

// Load Saved Histories for Dropdown
function loadSavedHistories() {
    const q = query(collection(db, "saved_chats"), orderBy("savedAt", "desc"));
    onSnapshot(q, (snapshot) => {
        // Keep "Live Chat" option
        historyDropdown.innerHTML = '<option value="live">Live Chat</option>';
        
        if (snapshot.empty) {
            const option = document.createElement('option');
            option.disabled = true;
            option.textContent = '-- No Saved Chats --';
            historyDropdown.appendChild(option);
        } else {
            const group = document.createElement('optgroup');
            group.label = "Saved Histories";
            snapshot.forEach((doc) => {
                const data = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = data.name;
                group.appendChild(option);
            });
            historyDropdown.appendChild(group);
        }
    });
}

// Handle Dropdown Change
historyDropdown.addEventListener('change', async () => {
    const choice = historyDropdown.value;
    
    if (choice === 'live') {
        // Enable inputs
        adminInput.disabled = false;
        adminSendBtn.disabled = false;
        adminForm.classList.remove('disabled');
        currentDateDisplay.textContent = `(${selectedDate})`;
        
        loadMessagesForDate(selectedDate);
    } else {
        // Disable inputs (Read-only mode)
        adminInput.disabled = true;
        adminSendBtn.disabled = true;
        adminForm.classList.add('disabled');
        
        if (unsubscribe) unsubscribe(); // Stop live listener
        
        try {
            const docRef = doc(db, "saved_chats", choice);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                currentDateDisplay.textContent = `(Viewing: ${data.name})`;
                
                adminMessages.innerHTML = '';
                publicMessages.innerHTML = ''; // Optionally clear public or show same
                
                // Render saved messages
                data.messages.forEach(msg => {
                    // Convert Firestore timestamp back to object if needed, or just use stored string if we store it that way
                    // Here we assume we stored the raw data, so timestamp might be a Firestore Timestamp object
                    const type = msg.type;
                    const text = msg.text;
                    const timestamp = msg.timestamp;
                    
                    if (type === 'admin') {
                        appendMessage(adminMessages, `Admin: ${text}`, timestamp);
                    } else {
                        appendMessage(publicMessages, `User: ${text}`, timestamp);
                    }
                });
            }
        } catch (e) {
            console.error("Error loading saved chat:", e);
            alert("Error loading saved chat.");
        }
    }
});

// Save Chat Logic (Save to Firestore)
if (adminSaveBtn) {
    adminSaveBtn.addEventListener('click', async () => {
        if (!isAdmin) return;
        
        const saveName = prompt("Enter a name for this save:", `Backup ${selectedDate} ${new Date().toLocaleTimeString()}`);
        if (!saveName) return;

        try {
            // Fetch current messages
            const q = query(collection(db, "messages"), where("date", "==", selectedDate));
            const snapshot = await getDocs(q);
            
            let messages = [];
            snapshot.forEach((doc) => {
                messages.push(doc.data());
            });

            // Sort messages
            messages.sort((a, b) => {
                const t1 = a.timestamp ? a.timestamp.toMillis() : Date.now();
                const t2 = b.timestamp ? b.timestamp.toMillis() : Date.now();
                return t1 - t2;
            });
            
            // Save to 'saved_chats' collection
            await addDoc(collection(db, "saved_chats"), {
                name: saveName,
                originalDate: selectedDate,
                savedAt: serverTimestamp(),
                messages: messages
            });
            
            alert("Chat saved successfully! Check the dropdown list.");
            
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
    
    // Removed orderBy("timestamp") to avoid needing a composite index
    const q = query(collection(db, "messages"), where("date", "==", date));
    unsubscribe = onSnapshot(q, (snapshot) => {
        adminMessages.innerHTML = '';
        publicMessages.innerHTML = '';
        
        let messages = [];
        snapshot.forEach((doc) => {
            messages.push(doc.data());
        });

        // Sort messages by timestamp in memory
        messages.sort((a, b) => {
            const t1 = a.timestamp ? a.timestamp.toMillis() : Date.now();
            const t2 = b.timestamp ? b.timestamp.toMillis() : Date.now();
            return t1 - t2;
        });
        
        messages.forEach((data) => {
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
