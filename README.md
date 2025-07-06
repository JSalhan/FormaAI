# FormaAI: AI Diet & Fitness App

FormaAI is a full-stack web application designed to be your personal AI-powered diet and fitness coach. It leverages Google's Gemini API to generate hyper-personalized meal and workout plans, helping you achieve your unique fitness goals. The application also includes social features, real-time chat, and a subscription model for premium features.

This project is built with a modern MERN-like stack: **M**ongoDB, **E**xpress, **R**eact (with **N**ext.js), and **N**ode.js.

## ✨ Features

- **AI-Powered Plan Generation**: Get a 7-day diet and workout plan tailored to your body metrics, goals, and preferences using Google Gemini.
- **Dynamic Plan Adjustments**: The system automatically regenerates your diet plan if it detects a significant weight change (≥2%).
- **Subscription Model**: A "Pro" tier powered by Stripe unlocks premium features like custom cuisine preferences.
- **Progress Logging**: Log your daily meals, workouts, and weight to track your journey.
- **Analytics Dashboard**: Visualize your weight trends and macronutrient distribution with charts.
- **Social Feed**: A community feed to share progress, create posts, and follow other users.
- **Real-Time Chat**: Secure, one-on-one chat with users you follow, powered by Socket.io.
- **Full Authentication**: JWT-based authentication system with user registration and login.
- **Profile Management**: Update your personal metrics and profile picture.

## 🚀 Tech Stack

**Backend:**
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for storing user data, plans, and logs
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB
- **Google Gemini API**: For AI-powered plan generation
- **Stripe**: For handling subscription payments
- **Socket.io**: For real-time features like chat and notifications
- **JWT (jsonwebtoken)**: For secure authentication
- **Bcrypt.js**: For password hashing
- **Helmet, Cors**: For securing Express app
- **Multer**: For handling file uploads
- **Jest**: For backend testing

**Frontend:**
- **Next.js**: React framework for server-side rendering and static site generation
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Typed superset of JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack React Query**: For server-state management (data fetching, caching)
- **Zustand**: For simple client-side state management
- **Axios**: For making HTTP requests to the backend
- **Chart.js**: For data visualization on the dashboard
- **Socket.io Client**: For real-time communication with the backend
- **Cypress**: For End-to-End (E2E) testing

**DevOps:**
- **Git & GitHub**: Version control and code hosting
- **GitHub Actions**: For Continuous Integration & Continuous Deployment (CI/CD)
- **Vercel**: For deploying the frontend
- **Render**: For deploying the backend

## Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running, or a MongoDB Atlas cluster.
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd <repository-directory>
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create a .env file from the example
cp .env.example .env
```
Now, open `backend/.env` and fill in the required environment variables:
- `PORT`: The port for the backend server (e.g., 5001).
- `MONGO_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A long, random string for signing tokens.
- `JWT_EXPIRES_IN`: Token expiration (e.g., '7d').
- `API_KEY`: Your Google Gemini API Key.
- `STRIPE_API_KEY`: Your Stripe secret key.
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret.
- `STRIPE_MONTHLY_PLAN_ID` & `STRIPE_YEARLY_PLAN_ID`: Price IDs from your Stripe dashboard.

Finally, run the backend server:
```bash
# Start the development server (with auto-reload)
npm run dev
```
The backend should now be running on the port you specified (e.g., `http://localhost:5001`).

### 3. Frontend Setup
```bash
# From the root directory
# (If you are in the backend directory, run: cd ..)

# Install dependencies
npm install

# Create a .env.local file
touch .env.local
```
Now, open `.env.local` at the root and add the following:
```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

Finally, run the frontend development server:
```bash
npm run dev
```
The frontend should now be running on `http://localhost:3000`.

## 🚀 Deployment

### Backend (Render)
1. Push your code to your GitHub repository.
2. Go to [Render](https://render.com/) and create a new "Web Service".
3. Connect your GitHub repository.
4. Configure the service:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Go to the "Environment" tab and add all the environment variables from your `backend/.env` file.
6. Create a "Deploy Hook" under the service settings and copy the URL.
7. In your GitHub repository settings, go to "Secrets and variables" > "Actions" and add the deploy hook URL as a new secret named `RENDER_DEPLOY_HOOK_URL`.

### Frontend (Vercel)
1. Push your code to your GitHub repository.
2. Go to [Vercel](https://vercel.com/) and import your project from GitHub.
3. Vercel will automatically detect the Next.js framework.
4. Go to the project settings, find the "Environment Variables" section, and add the variables from your `.env.local` file. **Make sure to use the production URL for your deployed backend.**
   - `NEXT_PUBLIC_API_URL`: Your deployed backend API URL (e.g., `https://formaai-backend.onrender.com/api`)
   - `NEXT_PUBLIC_SOCKET_URL`: Your deployed backend URL (e.g., `https://formaai-backend.onrender.com`)
5. Deploy. The `deploy-frontend.yml` workflow requires additional secrets for Vercel CLI deployments (`VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN`), which is an alternative to the standard Vercel Git integration. For simplicity, using the Git integration is recommended.
