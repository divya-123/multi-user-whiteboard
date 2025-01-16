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

const sessions = new Map();

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('createSession', () => {
    const sessionId = randomUUID();
    sessions.set(sessionId, { users: new Map(), drawings: [] });
    socket.emit('sessionCreated', sessionId);
  });

  socket.on('joinSession', (sessionId) => {
    if (!sessions.has(sessionId)) {
      socket.emit('error', 'Session not found');
      return;
    }

    const session = sessions.get(sessionId);
    if (session.users.size >= 60) {
      socket.emit('error', 'Session is full');
      return;
    }

    const userId = randomUUID();
    const user = { id: userId, name: `User ${session.users.size + 1}` };
    session.users.set(userId, user);

    socket.join(sessionId);
    socket.emit('userId', userId);
    io.to(sessionId).emit('updateUsers', Array.from(session.users.values()));

    // Send existing drawings to the new user
    socket.emit('initDrawings', session.drawings);

    socket.on('draw', (data) => {
      session.drawings.push(data);
      socket.to(sessionId).emit('draw', data);
    });

    socket.on('updateBrush', (brush) => {
      const updatedUser = { ...session.users.get(userId), brush };
      session.users.set(userId, updatedUser);
      socket.to(sessionId).emit('updateBrush', { userId, brush });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
      session.users.delete(userId);
      io.to(sessionId).emit('updateUsers', Array.from(session.users.values()));
      if (session.users.size === 0) {
        sessions.delete(sessionId);
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

