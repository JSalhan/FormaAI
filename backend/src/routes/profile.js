import express from 'express';
import multer from 'multer';
import { authenticateJWT } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// --- Multer Configuration for File Uploads ---
// Use memoryStorage to temporarily hold the file buffer before uploading to a cloud service.
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        // Allow only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only image files are allowed.'), false);
        }
    }
});

// --- Placeholder for Cloud Upload Service ---
/**
 * Simulates uploading a file buffer to a cloud storage service.
 * @param {Buffer} fileBuffer The file buffer from multer.
 * @returns {Promise<{secure_url: string}>} A promise that resolves to an object with the public URL.
 */
const uploadToCloud = async (fileBuffer) => {
    // In a real-world application, you would integrate a cloud storage SDK here.
    // e.g., using Cloudinary:
    // `return await cloudinary.uploader.upload_stream(...).end(fileBuffer);`
    console.log('Simulating upload of file buffer to cloud storage...');
    const fakeUrl = `https://res.cloudinary.com/demo/image/upload/sample.jpg`;
    console.log(`Simulated upload successful. URL: ${fakeUrl}`);
    return Promise.resolve({ secure_url: fakeUrl });
};

/**
 * @route   PUT /api/profile
 * @desc    Update user profile data (name, metrics, etc.)
 * @access  Private
 */
router.put('/', authenticateJWT, async (req, res) => {
    try {
        const { name, username, mobile, bio, height, weight, age, goal, activityLevel, dietaryPreference, cuisinePref } = req.body;

        const fieldsToUpdate = { isProfileComplete: true }; // Mark profile as complete on any update via this route
        if (name) fieldsToUpdate.name = name;
        if (username) fieldsToUpdate.username = username;
        if (mobile) fieldsToUpdate.mobile = mobile;
        if (bio || bio === '') fieldsToUpdate.bio = bio;
        if (height) fieldsToUpdate.height = height;
        if (weight) fieldsToUpdate.weight = weight;
        if (age) fieldsToUpdate.age = age;
        if (goal) fieldsToUpdate.goal = goal;
        if (activityLevel) fieldsToUpdate.activityLevel = activityLevel;
        if (dietaryPreference) fieldsToUpdate.dietaryPreference = dietaryPreference;
        if (cuisinePref) fieldsToUpdate.cuisinePref = cuisinePref;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true }
        ).select('-passwordHash');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });

    } catch (error) {
        console.error("Profile update error:", error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Username is already taken. Please choose another one.'});
        }
        res.status(500).json({ message: 'Error updating profile.', error: error.message });
    }
});


/**
 * @route   PUT /api/profile/picture
 * @desc    Upload or update user profile picture
 * @access  Private
 */
router.put('/picture', authenticateJWT, upload.single('profilePic'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
        // Upload the image buffer from memory to a cloud service
        const uploadResult = await uploadToCloud(req.file.buffer);
        const imageUrl = uploadResult.secure_url;

        // Update the user's record in the database
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { profilePicUrl: imageUrl },
            { new: true }
        ).select('-passwordHash');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            message: 'Profile picture updated successfully.',
            user: updatedUser
        });

    } catch (error) {
        console.error("Profile picture upload error:", error);
        res.status(500).json({ message: 'Error uploading profile picture.', error: error.message });
    }
});

export default router;