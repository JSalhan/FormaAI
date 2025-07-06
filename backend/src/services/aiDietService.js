import { GoogleGenerativeAI } from "@google/generative-ai"; // ✅ RIGHT

import User from '../models/User.js';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenerativeAI({ apiKey: process.env.API_KEY }); // ✅ RIGHT


// In-memory cache to store generated plans for a user for 1 day
const planCache = new Map();

const generatePrompt = (userData) => {
    return `
You are an expert nutritionist and certified personal trainer. Based on the following user profile, generate a comprehensive 7-day diet and fitness plan.

User Profile:
- Age: ${userData.age || 'not provided'}
- Gender: ${userData.gender || 'not provided'}
- Height: ${userData.height} cm
- Weight: ${userData.weight} kg
- Goal: ${userData.goal || 'Maintain Weight'}
- Activity Level: ${userData.activityLevel || 'Moderately Active'}
- Dietary Preference: ${userData.dietaryPreference || 'None'}
- Cuisine Preference: ${userData.cuisinePref?.join(', ') || 'International'}

Please provide the response in a single, valid JSON object. Do not include any explanatory text before or after the JSON. The JSON object should have two main keys: "dietPlan" and "workoutPlan".

- "dietPlan" should be an array of 7 objects, one for each day. Each day object should have a "day" number, a "dailyCalories" estimate (number), and a "meals" object with keys "breakfast", "lunch", "dinner", and "snacks". Each meal should be a string describing the food and approximate portion sizes.
- "workoutPlan" should be an array of 7 objects, one for each day. Each day object should have a "day" number, a "focus" (string, e.g., "Full Body", "Upper Body", "Rest Day"), and an "exercises" array. If it's a rest day, the exercises array should be empty. Each exercise object should have a "name", "sets" (number), "reps" (string, e.g., "8-12"), and "rest" (string, e.g., "60-90 seconds").

The structure should be exactly as follows:
{
  "dietPlan": [
    {
      "day": 1,
      "dailyCalories": 2200,
      "meals": {
        "breakfast": "Scrambled eggs (3) with spinach and a slice of whole-wheat toast.",
        "lunch": "Grilled chicken breast (150g) with a large mixed green salad and vinaigrette.",
        "dinner": "Baked salmon (150g) with roasted asparagus and quinoa (1 cup).",
        "snacks": "Greek yogurt (1 cup) with a handful of almonds."
      }
    }
  ],
  "workoutPlan": [
    {
      "day": 1,
      "focus": "Full Body Strength",
      "exercises": [
        { "name": "Squats", "sets": 3, "reps": "8-12", "rest": "90s" },
        { "name": "Push-ups", "sets": 3, "reps": "As many as possible", "rest": "60s" },
        { "name": "Bent-over Rows", "sets": 3, "reps": "8-12", "rest": "60s" }
      ]
    },
    {
      "day": 2,
      "focus": "Rest Day",
      "exercises": []
    }
  ]
}
`;
};

export const generateDietPlan = async (user) => {
  const userId = user.id;

  // Check cache first
  const cached = planCache.get(userId);
  if (cached && (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000)) {
    console.log(`Returning cached plan for user ${userId}`);
    return cached.plan;
  }

  console.log(`Generating new plan for user ${userId}`);
  try {
    const prompt = generatePrompt(user);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.5,
        }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
        jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);

    if (!parsedData.dietPlan || !parsedData.workoutPlan) {
        throw new Error("Invalid plan structure received from AI.");
    }

    // Store in cache
    planCache.set(userId, { plan: parsedData, timestamp: Date.now() });

    return parsedData;

  } catch (error) {
    console.error("Error generating plan from Gemini API:", error);
    throw new Error("Failed to generate your personalized plan from the AI service.");
  }
};
