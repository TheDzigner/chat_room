const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');

// Start the Express server on the specified port
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port: ${port}`);
});


// Serve static files from the 'dist' directory
app.use(express.static('dist'));

// send a static file to the client 





// Set up Socket.io with CORS configuration
const io = require('socket.io')(server)
const users = [];

// Listen for socket connections
io.on('connection', function (socket) {
    socket.on('new-user', (userData) => {
        // Add the new user to the list of users
        users.push({
            username: userData.username,
            socket: socket.id
        });
        console.log(users);
        // Notify all other users that a new user has joined
        socket.broadcast.emit('new-user', userData);
    });

    socket.on('user-connected', () => {
        // Send the current user count to all connected clients
        io.emit('user-connected', users.length);
    });

    socket.on('new-message', function (userData) {
        // Broadcast the new message to all connected clients
        io.emit('new-message', userData);
    });

    socket.on('typing', (user) => {
        // Notify other clients that a user is typing
        socket.broadcast.emit('typing', user);
    });

    socket.on('disconnect', () => {
        // Handle user disconnection
        const userToRemove = users.find((user) => user.socket === socket.id);
        if (userToRemove) {
            console.log(`${userToRemove.username} has disconnected`);
            const index = users.indexOf(userToRemove);
            users.splice(index, 1);
            console.log(users);
            // Notify all other users that a user has left
            io.emit('user-disconnected', userToRemove, users.length);
        }
    });
});
