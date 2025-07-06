import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, unique: true, sparse: true, trim: true },
  mobile: { type: String, trim: true },
  passwordHash: { type: String, required: true },
  profilePicUrl: { type: String, default: '' },
  bio: { type: String, trim: true, maxlength: 160, default: '' },
  height: { type: Number, min: 0 },
  weight: { type: Number, min: 0 },
  age: { type: Number, min: 0 },
  goal: { type: String },
  activityLevel: { type: String },
  dietaryPreference: { type: String },
  role: { type: String, enum: ['free', 'pro'], default: 'free' },
  isProfileComplete: { type: Boolean, default: false },
  stripeCustomerId: { type: String, unique: true, sparse: true },
  subscriptionPlan: {
    planId: { type: String }, // e.g., 'monthly', 'yearly'
    subscriptionId: { type: String }, // Stripe subscription ID
    status: { type: String }, // e.g., 'active', 'canceled'
    currentPeriodEnd: { type: Date },
  },
  cuisinePref: [{ type: String }],
  twoFA: {
    secret: { type: String },
    enabled: { type: Boolean, default: false },
  },
  // Social features
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;