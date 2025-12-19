# Split Chat App

A simple real-time chat application with two sections:
1. **Upper Part**: Admin-only chat (others can read, only admin can type).
2. **Lower Part**: Public chat (anyone can type).

## How to Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser at `http://localhost:3000`.

## Features
- Real-time messaging using Socket.io.
- Simple "Login as Admin" button to toggle admin privileges (for demonstration).
- Responsive split-screen layout.
