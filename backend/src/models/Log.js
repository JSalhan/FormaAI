import mongoose from 'mongoose';

const mealLogSchema = new mongoose.Schema({
  mealType: { type: String, required: true }, // e.g., 'Breakfast', 'Lunch', 'Dinner', 'Snack'
  description: { type: String, required: true },
  calories: { type: Number },
  macros: {
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
  }
}, { _id: false });

const workoutLogSchema = new mongoose.Schema({
  exerciseName: { type: String, required: true },
  sets: { type: Number },
  reps: { type: String }, // Can be a range like "8-12"
  weight: { type: Number }, // Weight used in kg or lbs
}, { _id: false });

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  meals: [mealLogSchema],
  workouts: [workoutLogSchema],
  weight: { type: Number },
  bodyStats: {
    waist: { type: Number },
    hips: { type: Number },
    chest: { type: Number },
  },
}, { timestamps: true });

// Ensure a user can only have one log entry per day. 
// This is complex with timestamped logs. A better strategy is to find and update logs for a given day on the application layer.
// logSchema.index({ user: 1, date: 1 }, { unique: true });

const Log = mongoose.model('Log', logSchema);
export default Log;