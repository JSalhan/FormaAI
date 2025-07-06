import mongoose from 'mongoose';

const mealDetailSchema = new mongoose.Schema({
    breakfast: { type: String, required: true },
    lunch: { type: String, required: true },
    dinner: { type: String, required: true },
    snacks: { type: String, required: true },
}, { _id: false });

const dietDaySchema = new mongoose.Schema({
    day: { type: Number, required: true },
    dailyCalories: { type: Number, required: true },
    meals: mealDetailSchema,
}, { _id: false });

const exerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true },
    rest: { type: String, required: true },
}, { _id: false });

const workoutDaySchema = new mongoose.Schema({
    day: { type: Number, required: true },
    focus: { type: String, required: true },
    exercises: [exerciseSchema],
}, { _id: false });


const dietPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  dietPlan: [dietDaySchema],
  workoutPlan: [workoutDaySchema],
  reasonForUpdate: { type: String, default: 'User initiated request.' }
}, { timestamps: true });

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
export default DietPlan;
