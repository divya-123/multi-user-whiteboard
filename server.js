const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { randomUUID } = require('crypto');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000'].filter(Boolean);
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"]
  }
});

const users = new Map();

io.on('connection', (socket) => {
  console.log('A user connected');

  if (users.size >= 60) {
    socket.emit('error', 'Server is full');
    socket.disconnect(true);
    return;
  }

  const userId = randomUUID();
  const user = { id: userId, name: `User ${users.size + 1}` };
  users.set(userId, user);

  socket.emit('userId', userId);
  io.emit('updateUsers', Array.from(users.values()));

  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data);
  });

  socket.on('updateBrush', (brush) => {
    const updatedUser = { ...users.get(userId), brush };
    users.set(userId, updatedUser);
    socket.broadcast.emit('updateBrush', { userId, brush });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    users.delete(userId);
    io.emit('updateUsers', Array.from(users.values()));
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

