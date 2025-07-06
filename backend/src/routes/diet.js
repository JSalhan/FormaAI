import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { generateDietPlan } from '../services/aiDietService.js';
import DietPlan from '../models/DietPlan.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * @route   POST /api/diet/generate
 * @desc    Generate a new diet plan for the authenticated user
 * @access  Private
 */
router.post('/generate', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Create a user profile object for the AI service, starting with base info
        const userProfileForAI = {
            age: user.age,
            gender: user.gender,
            height: user.height,
            weight: user.weight,
            goal: user.goal,
            activityLevel: user.activityLevel,
            dietaryPreference: user.dietaryPreference,
        };

        // Pro feature: Only include cuisine preference in the prompt if the user is a 'pro' subscriber
        if (user.role === 'pro' && user.cuisinePref && user.cuisinePref.length > 0) {
            userProfileForAI.cuisinePref = user.cuisinePref;
        }

        const planData = await generateDietPlan(userProfileForAI);
        
        const newPlan = new DietPlan({
            user: user._id,
            ...planData,
            reasonForUpdate: 'User initiated request.'
        });

        await newPlan.save();

        res.status(201).json(newPlan);
    } catch (error) {
        console.error("Error generating diet plan:", error);
        res.status(500).json({ message: "Server error while generating plan.", error: error.message });
    }
});

/**
 * @route   GET /api/diet/current
 * @desc    Get the most recent diet plan for the authenticated user
 * @access  Private
 */
router.get('/current', authenticateJWT, async (req, res) => {
    try {
        const currentPlan = await DietPlan.findOne({ user: req.user.id }).sort({ createdAt: -1 });

        if (!currentPlan) {
            return res.status(404).json({ message: "No diet plan found for this user. Generate one first." });
        }

        res.status(200).json(currentPlan);
    } catch (error) {
        console.error("Error fetching current diet plan:", error);
        res.status(500).json({ message: "Server error while fetching plan." });
    }
});

export default router;