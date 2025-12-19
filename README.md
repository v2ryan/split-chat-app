# Split Chat App (Firebase Version)

A simple real-time chat application with two sections:
1. **Upper Part**: Admin-only chat (others can read, only admin can type).
2. **Lower Part**: Public chat (anyone can type).

This version uses **Firebase Firestore** for the backend, meaning it can be hosted on any static site provider like **GitHub Pages**.

## Setup Instructions

### 1. Create a Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com/).
2. Click **"Add project"** and follow the steps.
3. Once created, go to **Build** > **Firestore Database**.
4. Click **Create database**.
5. Choose **Start in test mode** (for development) and click **Enable**.

### 2. Get Your Configuration
1. In your Project Overview, click the **Web icon (</>)** to add an app.
2. Register the app (give it a name like "Split Chat").
3. You will see a code block with `const firebaseConfig = { ... };`.
4. **Copy the content inside `firebaseConfig`**.

### 3. Update the Code
1. Open `public/script.js`.
2. Find the `firebaseConfig` variable at the top.
3. Replace the placeholder values with your actual configuration.

### 4. Host on GitHub Pages
1. Go to your repository settings on GitHub.
2. Go to **Pages** (on the left sidebar).
3. Under **Source**, select `main` branch and `/public` folder (if available) or just `/` (root).
   - *Note: Since our `index.html` is in `public/`, you might need to move the files to the root or configure GitHub Pages to serve from `public`.*
   - **Easier method:** Move `index.html`, `style.css`, and `script.js` to the root folder.

## How to Run Locally
Since this is now a static site, you don't need `npm start`.
Just open `public/index.html` in your browser (or use a Live Server extension).
