// This interface defines the shape of the user input form data
export interface UserData {
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  height: number;
  weight: number;
  goal: 'Lose Weight' | 'Maintain Weight' | 'Gain Muscle';
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
  dietaryPreference: 'None' | 'Vegetarian' | 'Vegan' | 'Gluten-Free';
}

// Type for user profile data used in forms and state
export interface UserProfile {
  name: string;
  username?: string;
  mobile?: string;
  email: string;
  bio?: string;
  height?: number;
  weight?: number;
  age?: number;
  goal?: 'Lose Weight' | 'Maintain Weight' | 'Gain Muscle';
  activityLevel?: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
  dietaryPreference?: 'None' | 'Vegetarian' | 'Vegan' | 'Gluten-Free';
  cuisinePref?: string[];
  profilePicUrl?: string;
  isProfileComplete?: boolean;
}

// Type for user object received from the database/backend
export interface DBUser extends UserProfile {
  _id: string;
  role: 'free' | 'pro';
  subscriptionPlan?: {
    planId?: string;
    status?: string;
  };
  following: string[]; // Array of user IDs
  followers: string[]; // Array of user IDs
}

// A minimal reference to a user, used for populating fields.
export type UserReference = Pick<DBUser, '_id' | 'name' | 'username' | 'profilePicUrl'>;

// A user object where `following` and `followers` are populated with user data.
export interface PopulatedDBUser extends Omit<DBUser, 'following' | 'followers'> {
  following: UserReference[];
  followers: UserReference[];
}


// --- Plan Data Structures ---

export interface Meal {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

export interface DietDay {
  day: number;
  dailyCalories: number;
  meals: Meal;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

export interface WorkoutDay {
  day: number;
  focus: string;
  exercises: Exercise[];
}

// This should match the backend's DietPlan Mongoose model
export interface PlanData {
  _id: string;
  user: string;
  dietPlan: DietDay[];
  workoutPlan: WorkoutDay[];
  reasonForUpdate: string;
  createdAt: string;
  updatedAt: string;
}

// --- Log Data Structures ---

export interface LoggedMeal {
  mealType: string;
  description: string;
  calories?: number;
  macros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

export interface LoggedWorkout {
  exerciseName: string;
  sets?: number;
  reps?: string;
  weight?: number;
}

// This should match the backend's Log Mongoose model
export interface Log {
  _id: string;
  user: string;
  date: string; // ISO date string
  meals: LoggedMeal[];
  workouts: LoggedWorkout[];
  weight?: number;
  bodyStats?: {
    waist?: number;
    hips?: number;
    chest?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// --- Social & Chat Data Structures ---
export interface Comment {
    _id: string;
    user: UserReference;
    text: string;
    createdAt: string;
}

export interface Post {
    _id:string;
    author: UserReference;
    content: string;
    mediaUrls: string[];
    likes: string[]; // Array of user IDs
    comments: Comment[];
    createdAt: string;
    updatedAt: string;
}

export interface ChatMessage {
    _id: string;
    from: UserReference;
    to: string; // The ID of the recipient
    message: string;
    read: boolean;
    createdAt: string;
}

export interface Conversation {
    partner: UserReference;
    lastMessage: Omit<ChatMessage, 'from'| 'to'> & { from: string, to: string};
}