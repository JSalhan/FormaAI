import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// A sanitized user object for public profiles
const sanitizePublicUser = (user) => ({
    _id: user._id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    profilePicUrl: user.profilePicUrl,
    following: user.following,
    followers: user.followers,
    createdAt: user.createdAt,
});

/**
 * @route   GET /api/users/username/:username
 * @desc    Get a user's public profile by their username
 * @access  Private (requires login to view profiles)
 */
router.get('/username/:username', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-passwordHash -email -mobile -stripeCustomerId -subscriptionPlan -twoFA');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json(sanitizePublicUser(user));
    } catch (error) {
        console.error(`Error fetching user ${req.params.username}:`, error);
        res.status(500).json({ message: 'Server error while fetching user profile.' });
    }
});

export default router;
