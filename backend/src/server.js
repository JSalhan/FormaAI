import http from 'http';
import { Server } from 'socket.io';
import jsonwebtoken from 'jsonwebtoken';
import app from './app.js';
import dotenv from 'dotenv';
import ChatMessage from './models/ChatMessage.js';

dotenv.config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your frontend's URL
    methods: ["GET", "POST"]
  }
});

// Middleware to make io accessible in routes
app.set('io', io);

// Socket.io connection authentication
io.on('connection', (socket) => {
  console.log('A user connected to Socket.io');

  // Authenticate user with token
  socket.on('authenticate', (token) => {
    if (!token) {
        return socket.disconnect();
    }
    try {
      const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Attach user payload to socket
      socket.join(decoded.id);
      console.log(`User with ID ${decoded.id} authenticated and joined their room.`);
    } catch (error) {
      console.log('Socket authentication failed:', error.message);
      socket.disconnect();
    }
  });

  // Handle private messages
  socket.on('private-message', async ({ to, message }) => {
    if (!socket.user) {
        return console.log('Unauthorized message attempt');
    }
    const fromUserId = socket.user.id;
    const toUserId = to;

    try {
        const newMessage = new ChatMessage({
            from: fromUserId,
            to: toUserId,
            message: message,
        });
        await newMessage.save();
        
        // Populate sender info for the recipient
        const populatedMessage = await ChatMessage.findById(newMessage._id).populate('from', 'name profilePicUrl _id');

        // Emit message to recipient's room
        io.to(toUserId).emit('private-message', populatedMessage);
        
        // Emit message back to sender for UI update
        io.to(fromUserId).emit('private-message', populatedMessage);

    } catch (error) {
        console.error('Error handling private message:', error);
    }
  });


  socket.on('disconnect', () => {
    console.log('User disconnected from Socket.io');
  });
});


const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});