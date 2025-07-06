import express from 'express';
import mongoose from 'mongoose';
import { authenticateJWT } from '../middleware/auth.js';
import ChatMessage from '../models/ChatMessage.js';

const router = express.Router();

/**
 * @route   GET /api/chat/conversations
 * @desc    Get all of a user's conversations with the last message for each.
 * @access  Private
 */
router.get('/conversations', authenticateJWT, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const conversations = await ChatMessage.aggregate([
            // Match messages involving the current user
            { $match: { $or: [{ from: userId }, { to: userId }] } },
            // Sort messages to find the last one correctly
            { $sort: { createdAt: 1 } },
            // Group by conversation partner to create conversation threads
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$from", userId] },
                            then: "$to",
                            else: "$from"
                        }
                    },
                    lastMessage: { $last: "$$ROOT" }
                }
            },
            // Sort conversations by the date of the last message
            { $sort: { "lastMessage.createdAt": -1 } },
            // Lookup partner's user details
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "partnerInfo"
                }
            },
            // Unwind the partnerInfo array
            { $unwind: "$partnerInfo" },
            // Project the final desired shape
            {
                $project: {
                    _id: 0,
                    partner: {
                        _id: "$partnerInfo._id",
                        name: "$partnerInfo.name",
                        username: "$partnerInfo.username",
                        profilePicUrl: "$partnerInfo.profilePicUrl"
                    },
                    lastMessage: {
                        _id: "$lastMessage._id",
                        from: "$lastMessage.from",
                        to: "$lastMessage.to",
                        message: "$lastMessage.message",
                        read: "$lastMessage.read",
                        createdAt: "$lastMessage.createdAt"
                    }
                }
            }
        ]);

        res.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: "Server error while fetching conversations." });
    }
});


/**
 * @route   GET /api/chat/messages/:otherUserId
 * @desc    Get chat history with another user
 * @access  Private
 */
router.get('/messages/:otherUserId', authenticateJWT, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const otherUserId = req.params.otherUserId;

        const messages = await ChatMessage.find({
            $or: [
                { from: currentUserId, to: otherUserId },
                { from: otherUserId, to: currentUserId },
            ]
        })
        .sort({ createdAt: 'asc' })
        .populate('from', 'name profilePicUrl _id');

        res.json(messages);
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: "Server error while fetching chat history." });
    }
});

export default router;