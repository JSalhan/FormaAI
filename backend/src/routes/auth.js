import express from 'express';
import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// --- Helper function to sanitize user object ---
const sanitizeUser = (user) => ({
    _id: user._id,
    id: user._id, // Keep `id` for compatibility with JWT payload
    name: user.name,
    email: user.email,
    username: user.username,
    bio: user.bio,
    role: user.role,
    isProfileComplete: user.isProfileComplete,
    profilePicUrl: user.profilePicUrl,
    height: user.height,
    weight: user.weight,
    age: user.age,
    goal: user.goal,
    activityLevel: user.activityLevel,
    dietaryPreference: user.dietaryPreference,
    cuisinePref: user.cuisinePref,
    following: user.following,
    followers: user.followers
});


// --- Helper function to generate JWT ---
const generateToken = (user) => {
    return jsonwebtoken.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
};

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password.' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const salt = await bcryptjs.genSalt(10);
        const passwordHash = await bcryptjs.hash(password, salt);

        const newUser = new User({ name, email: email.toLowerCase(), passwordHash });
        const savedUser = await newUser.save();

        const token = generateToken(savedUser);

        res.status(201).json({ token, user: sanitizeUser(savedUser) });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate a user and get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcryptjs.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = generateToken(user);

        res.status(200).json({ token, user: sanitizeUser(user) });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user's profile
 * @access  Private
 */
router.get('/me', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-passwordHash')
            .populate('following', 'name profilePicUrl _id username')
            .populate('followers', 'name profilePicUrl _id username');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(sanitizeUser(user));
    } catch (error) {
        console.error('Get Me Error:', error);
        res.status(500).json({ message: 'Server error while fetching user profile.' });
    }
});


// STUB: 2FA Setup
router.post('/2fa/setup', (req, res) => {
    res.status(501).json({ message: '2FA setup not implemented yet.' });
});

// STUB: 2FA Verify
router.post('/2fa/verify', (req, res) => {
    res.status(501).json({ message: '2FA verification not implemented yet.' });
});

export default router;