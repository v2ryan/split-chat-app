const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle Admin Chat Messages
    socket.on('admin-message', (msg) => {
        // Broadcast to everyone, but frontend will decide where to show it
        // Or we can emit specifically to 'admin-chat' channel
        io.emit('admin-message', msg);
    });

    // Handle Public Chat Messages
    socket.on('public-message', (msg) => {
        io.emit('public-message', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
