import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import Log from '../models/Log.js';
import User from '../models/User.js';
import DietPlan from '../models/DietPlan.js';
import { generateDietPlan } from '../services/aiDietService.js';

const router = express.Router();

/**
 * @route   GET /api/logs
 * @desc    Get all logs for the authenticated user
 * @access  Private
 */
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const logs = await Log.find({ user: req.user.id }).sort({ date: 'asc' });
        res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ message: "Server error while fetching logs." });
    }
});


/**
 * @route   POST /api/logs
 * @desc    Create a new log for the user. Triggers AI diet adjustment on significant weight change.
 * @access  Private
 */
router.post('/', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const { date, meals, workouts, weight, bodyStats } = req.body;

        // A better approach for daily logs: find or create for a specific day.
        // This avoids unique index errors and simplifies updates.
        // For simplicity, we're creating a new log document each time as per original structure.
        
        const newLog = new Log({
            user: userId,
            date,
            meals,
            workouts,
            weight,
            bodyStats
        });

        await newLog.save();

        // If weight was logged, check for significant change
        if (weight) {
            // Find the most recent log before this one that has a weight entry
            const lastLog = await Log.findOne({
                user: userId,
                weight: { $exists: true, $ne: null },
                _id: { $ne: newLog._id } // Exclude the log we just created
            }).sort({ date: -1 });

            if (lastLog && lastLog.weight) {
                const oldWeight = lastLog.weight;
                const newWeight = weight;
                const percentChange = ((newWeight - oldWeight) / oldWeight) * 100;

                // Check if the absolute percentage change is 2% or more
                if (Math.abs(percentChange) >= 2) {
                    console.log(`Significant weight change detected for user ${userId}: ${percentChange.toFixed(1)}%`);
                    
                    const user = await User.findById(userId);
                    
                    // Call AI service to generate a new plan
                    const planData = await generateDietPlan(user);
                    
                    const reason = `Automatic adjustment due to a ${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}% weight change (from ${oldWeight}kg to ${newWeight}kg).`;
                    
                    const newPlan = new DietPlan({
                        user: userId,
                        ...planData,
                        reasonForUpdate: reason
                    });
                    
                    await newPlan.save();
                    console.log(`New diet plan automatically generated and saved for user ${userId}.`);

                    // Broadcast update via Socket.io to the specific user's room
                    if (req.io) {
                        req.io.to(userId).emit('plan-updated', {
                            message: `Your diet plan has been automatically updated due to a recent weight change!`,
                            newPlan: newPlan
                        });
                    }
                }
            }
        }

        res.status(201).json(newLog);

    } catch (error) {
        console.error("Error creating log:", error);
        if (error.code === 11000) {
            return res.status(409).json({ message: "A log for this date already exists for this user." });
        }
        res.status(500).json({ message: "Server error while creating log.", error: error.message });
    }
});

export default router;