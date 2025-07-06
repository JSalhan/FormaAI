
import { GoogleGenAI } from "@google/genai";
import { UserData, PlanData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generatePrompt = (userData: UserData): string => {
    return `
You are an expert nutritionist and certified personal trainer. Based on the following user profile, generate a comprehensive 7-day diet and fitness plan.

User Profile:
- Age: ${userData.age}
- Gender: ${userData.gender}
- Height: ${userData.height} cm
- Weight: ${userData.weight} kg
- Goal: ${userData.goal}
- Activity Level: ${userData.activityLevel}
- Dietary Preference: ${userData.dietaryPreference}

Please provide the response in a single, valid JSON object. Do not include any explanatory text before or after the JSON. The JSON object should have two main keys: "dietPlan" and "workoutPlan".

- "dietPlan" should be an array of 7 objects, one for each day. Each day object should have a "day" number, a "dailyCalories" estimate (number), and a "meals" object with keys "breakfast", "lunch", "dinner", and "snacks". Each meal should be a string describing the food and approximate portion sizes.
- "workoutPlan" should be an array of 7 objects, one for each day. Each day object should have a "day" number, a "focus" (string, e.g., "Full Body", "Upper Body", "Rest Day"), and an "exercises" array. If it's a rest day, the exercises array should be empty or contain a single object indicating rest. Each exercise object should have a "name", "sets" (number), "reps" (string, e.g., "8-12"), and "rest" (string, e.g., "60-90 seconds").

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

export const generatePlan = async (userData: UserData): Promise<PlanData> => {
  try {
    const prompt = generatePrompt(userData);

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
    
    const parsedData = JSON.parse(jsonStr) as PlanData;

    // Basic validation of the parsed data structure
    if (!parsedData.dietPlan || !parsedData.workoutPlan) {
        throw new Error("Invalid plan structure received from AI.");
    }

    return parsedData;

  } catch (error) {
    console.error("Error generating plan from Gemini API:", error);
    throw new Error("Failed to generate your personalized plan. The AI may be experiencing high traffic. Please try again later.");
  }
};
