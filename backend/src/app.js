import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import paymentRoutes, { handleStripeWebhook } from './routes/payment.js';
import dietRoutes from './routes/diet.js';
import logRoutes from './routes/logs.js';
import socialRoutes from './routes/social.js';
import chatRoutes from './routes/chat.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();

// --- Stripe Webhook Route ---
// This route needs the raw request body for signature verification, so it must be defined *before* express.json().
app.post('/api/payment/webhook', express.raw({type: 'application/json'}), handleStripeWebhook);


// --- Middleware ---
app.use(helmet()); // Set various security headers
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming requests with JSON payloads for all other routes

// Middleware to attach Socket.io instance to requests
app.use((req, res, next) => {
    req.io = app.get('io');
    next();
});

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined.");
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected successfully.");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        // Exit process with failure
        process.exit(1);
    }
};

connectDB();

// --- Routes ---
app.get('/', (req, res) => {
    res.send('FormaAI Backend is running!');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/chat', chatRoutes);


export default app;