import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { connectMongo } from './config/db';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import locationRoutes from './routes/locationRoutes';

const app = express();

// --- Core Middlewares ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/family-tracking';
connectMongo(MONGODB_URI).catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});

// --- HTTP and Socket.IO Server Setup ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, you should restrict this to your frontend's URL
    methods: ["GET", "POST"],
  },
});

// Make io instance available to the rest of the app
app.set('socketio', io);

io.on('connection', (socket: Socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join_room', (trackableUserId: string) => {
    socket.join(trackableUserId);
    console.log(`Socket ${socket.id} joined room for user ${trackableUserId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// --- API Routes ---
app.get('/', (req, res) => res.send('API is running...'));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);

// --- Start Server ---
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


