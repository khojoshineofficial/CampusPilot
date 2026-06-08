const jwt = require('jsonwebtoken');
const User = require('../models/User');

const setupSocket = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = await User.findById(decoded.id).select('-password');
      } catch {}
    }
    next();
  });

  io.on('connection', (socket) => {
    if (socket.user) {
      socket.join(`user:${socket.user._id}`);
      console.log(`User connected: ${socket.user.name}`);
    }

    socket.on('join_document', (docId) => {
      socket.join(`doc:${docId}`);
    });

    socket.on('leave_document', (docId) => {
      socket.leave(`doc:${docId}`);
    });

    socket.on('join_feed', () => {
      socket.join('feed');
    });

    socket.on('typing', ({ docId, userName }) => {
      socket.to(`doc:${docId}`).emit('user_typing', { userName });
    });

    socket.on('disconnect', () => {
      if (socket.user) {
        User.findByIdAndUpdate(socket.user._id, { lastSeen: Date.now() }).exec();
        console.log(`User disconnected: ${socket.user.name}`);
      }
    });
  });
};

module.exports = setupSocket;
