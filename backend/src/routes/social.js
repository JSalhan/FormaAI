import express from 'express';
import multer from 'multer';
import { authenticateJWT } from '../middleware/auth.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

const router = express.Router();

// --- Multer for Media Uploads ---
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
        }
    }
});

// --- Placeholder for Cloud Upload ---
const uploadToCloud = async (fileBuffer) => {
    console.log('Simulating upload of media file buffer to cloud storage...');
    const fakeUrl = `https://res.cloudinary.com/demo/video/upload/dog.mp4`; // Using a video for placeholder
    console.log(`Simulated upload successful. URL: ${fakeUrl}`);
    return Promise.resolve({ secure_url: fakeUrl });
};


// @route   POST /api/social
// @desc    Create a new post with optional media
// @access  Private
router.post('/', authenticateJWT, upload.array('media', 4), async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Post content is required.' });
        }

        const newPost = new Post({
            author: req.user.id,
            content: content,
        });

        if (req.files && req.files.length > 0) {
            const mediaUrls = [];
            for (const file of req.files) {
                const result = await uploadToCloud(file.buffer);
                mediaUrls.push(result.secure_url);
            }
            newPost.mediaUrls = mediaUrls;
        }

        await newPost.save();
        const populatedPost = await Post.findById(newPost._id).populate('author', 'name username profilePicUrl _id');
        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error creating post.', error: error.message });
    }
});

// @route   GET /api/social/feed
// @desc    Get personalized feed (posts from followed users)
// @access  Private
router.get('/feed', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const feedPosts = await Post.find({ 'author': { $in: user.following } })
            .populate('author', 'name username profilePicUrl _id')
            .populate('comments.user', 'name username profilePicUrl _id')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(feedPosts);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching feed.', error: error.message });
    }
});

// @route   GET /api/social/posts/user/:userId
// @desc    Get all posts by a specific user
// @access  Private
router.get('/posts/user/:userId', authenticateJWT, async (req, res) => {
    try {
        const posts = await Post.find({ author: req.params.userId })
            .populate('author', 'name username profilePicUrl _id')
            .populate('comments.user', 'name username profilePicUrl _id')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching user posts.', error: error.message });
    }
});


// @route   GET /api/social/post/:id
// @desc    Get a single post with comments
// @access  Private
router.get('/post/:id', authenticateJWT, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name username profilePicUrl _id')
            .populate('comments.user', 'name username profilePicUrl _id');
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching post.', error: error.message });
    }
});

// @route   PUT /api/social/post/:id/like
// @desc    Like or unlike a post
// @access  Private
router.put('/post/:id/like', authenticateJWT, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const currentUserId = req.user.id;
        const isLiked = post.likes.includes(currentUserId);

        if (isLiked) {
            post.likes.pull(currentUserId);
        } else {
            post.likes.push(currentUserId);
        }
        await post.save();
        res.json(post.likes);
    } catch (error) {
        res.status(500).json({ message: 'Server error liking post.', error: error.message });
    }
});

// @route   POST /api/social/post/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post('/post/:id/comment', authenticateJWT, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Comment text is required.' });
        }
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        const newComment = { user: req.user.id, text: text };
        post.comments.push(newComment);
        await post.save();

        const populatedPost = await Post.findById(post._id).populate('comments.user', 'name username profilePicUrl _id');
        res.status(201).json(populatedPost.comments.slice(-1)[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error adding comment.', error: error.message });
    }
});

// @route   PUT /api/social/follow/:userId
// @desc    Follow or unfollow a user
// @access  Private
router.put('/follow/:userId', authenticateJWT, async (req, res) => {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;

    if (currentUserId === targetUserId) {
        return res.status(400).json({ message: "You cannot follow yourself." });
    }

    try {
        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({ message: "User not found." });
        }

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            await currentUser.updateOne({ $pull: { following: targetUserId } });
            await targetUser.updateOne({ $pull: { followers: currentUserId } });
            res.json({ message: `Unfollowed ${targetUser.name}` });
        } else {
            await currentUser.updateOne({ $addToSet: { following: targetUserId } });
            await targetUser.updateOne({ $addToSet: { followers: currentUserId } });
            res.json({ message: `Now following ${targetUser.name}` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during follow action.', error: error.message });
    }
});

// @route   GET /api/social/users/discover
// @desc    Get users to follow (that the current user isn't already following)
// @access  Private
router.get('/users/discover', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const usersToExclude = [...user.following, user._id]; // Exclude self and already followed
        const users = await User.find({ _id: { $nin: usersToExclude } })
            .select('name username profilePicUrl followers')
            .limit(10);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error discovering users.', error: error.message });
    }
});

export default router;