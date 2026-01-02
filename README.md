#  AlgoGrid - Intelligent DSA Revision Platform

A modern, full-stack web application designed to **revolutionize how you revise Data Structures & Algorithms**. Unlike traditional problem trackers, AlgoGrid uses an **intelligent spaced-repetition algorithm** to ensure you never forget what you've learned.

**🌐 Live Demo:** [https://www.algogrid.dev](https://www.algogrid.dev)

## 🎯 The Problem I Solve

You solve hundreds of DSA problems, but **retention is the real challenge**. Most developers forget solutions within weeks. AlgoGrid ensures **lasting mastery** through:

✅ **Automatic confidence decay** - Your confidence drops 10% every 2 weeks without revision    
✅ **Spaced repetition** - Review problems at optimal intervals for long-term retention  
✅ **Save & Organize** - Store every DSA problem you solve with your code, approach, and intuition  

## 🧠 Smart Revision System - The Core Feature

### How It Works

1. **Save Your Solutions**: Add problems with your code, approach, and initial confidence level (1-10)
2. **Confidence Decay**: Your confidence automatically decays 10% every 2 weeks (capped at 50% max decay)
3. **Priority Algorithm**: Problems are ranked using:
   ```
   Priority Score = (Adjusted Confidence × 0.7) - (Time Factor × 0.3)
   Lower Score = Higher Priority
   ```
4. **Smart Revision**: Get notified which problems need urgent revision vs. which can wait

### Confidence-Based Learning

Replace arbitrary "difficulty ratings" with **personal confidence tracking**:
- **1-3 (Red)**: Very Low - Urgent revision needed
- **4-6 (Orange)**: Medium - High priority for revision  
- **7-8 (Light Green)**: Good - Medium priority
- **9-10 (Dark Green)**: Excellent - Low priority

Your confidence decays over time, ensuring you revisit problems before forgetting them completely.

### Revision Modes

- **Priority Mode**: Focus on problems with lowest priority scores
- **Urgent Mode**: Only problems with confidence < 4 (red zone)
- **Needs Revision**: Problems with decayed confidence
- **All Problems**: Complete overview with filtering and sorting

## ✨ Additional Features

### 📚 Problem Management
- **Save DSA Problems**: Store your solved coding problems with complete solutions
- **Rich Categories**: 50+ DSA categories based on Striver's A2Z course
- **Confidence Tracking**: Rate your understanding from 1-10, updated automatically with decay
- **Solution Storage**: Save your code, approach, intuition, and revision attempts

### 🎯 Interactive Revision System
- **Timed Practice**: Track how long you take to solve problems
- **Solution Comparison**: Compare your revision attempt with original solution
- **Progressive Learning**: Focus on areas that need improvement based on decay
- **Revision History**: Track all your revision attempts with timestamps

### 📊 Progress Analytics
- **Personal Dashboard**: Track total problems, categories covered, and recent activity
- **Category Breakdown**: Visual representation of your problem distribution
- **Confidence Analytics**: Monitor your confidence levels across categories
- **Decay Visualization**: See which problems are losing confidence and need attention
- **Performance Stats**: View your growth and improvement over time

### 🔍 Advanced Organization
- **Smart Filtering**: Filter by category, confidence level, or search terms
- **Intelligent Sorting**: Sort by priority score, confidence, date, or alphabetically
- **Category Navigation**: Quick access to specific problem types
- **Responsive Design**: Perfect experience on all devices

### Architecture
<img width="1367" height="790" alt="image" src="https://github.com/user-attachments/assets/0cbf7443-754c-4441-a91e-ab9b2c425c07" />


## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router and Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling framework
- **Lucide Icons** - Beautiful, customizable icon library
- **React Hooks** - Modern state management

### Backend
- **Next.js API Routes** - Serverless backend functions
- **MongoDB** - NoSQL document-based database
- **Mongoose** - ODM (Object Data Modeling) for MongoDB
- **RESTful API** - Clean API architecture

### Authentication & Security
- **Clerk** - Complete authentication solution with webhooks
- **JWT Tokens** - Secure session management
- **Protected Routes** - Middleware-based route protection

### Development Tools
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Git** - Version control

### Deployment & Hosting
- **Vercel** - Serverless deployment platform with CI/CD
- **MongoDB Atlas** - Cloud database hosting
- **Edge Functions** - Global edge network for optimal performance

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database (local or Atlas)
- Clerk account for authentication

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/scalecode.git
cd scalecode
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file:
```env
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000


GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
MONGO_URI=...

GEMINI_API_KEY=...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📱 Usage Guide

### Adding Your First Problem
1. Sign up/Login using the authentication system
2. Click "Add Problem" from the dashboard
3. Fill in:
   - Problem title and statement
   - Your solution code
   - Your approach/intuition
   - **Confidence level (1-10)** - How well do you understand this problem?
   - Category (e.g., Arrays, Dynamic Programming)

### Using the Smart Revision System
1. Navigate to **Main Revision** from the dashboard
2. View your problems sorted by **priority score** (automatically calculated)
3. Problems are color-coded by confidence:
   - 🔴 Red (1-3): Urgent - Needs immediate revision
   - 🟠 Orange (4-6): High priority
   - 🟢 Green (7-10): Low priority
4. Click on any problem to start revision
5. The system tracks:
   - Days since last revision
   - Confidence decay percentage
   - Adjusted confidence after decay
   - Priority score for intelligent sorting

### Revising a Problem
1. Click "Start Revision" on any problem
2. Try solving it without looking at the original solution
3. Code your solution in the provided editor
4. Submit to compare with your previous solution
5. Your confidence is updated, and decay timer resets

### Tracking Progress
- **Dashboard**: Overview of your coding journey with total problems and categories
- **Confidence Stats**: See average confidence across all problems and by category
- **Decay Monitoring**: Identify which problems have decayed and need urgent attention
- **Revision History**: Track when you last revised each problem
- **Category Mastery**: View confidence distribution across different DSA topics
- **Filtering**: Find specific problems quickly with smart search

## 🎨 Features in Detail

### Intelligent Revision Algorithm
The core of AlgoGrid is its **spaced-repetition algorithm**:

#### Confidence Decay
```
Decay Rate: 10% every 2 weeks (14 days)
Maximum Decay: 50% (your confidence won't drop below half)
Minimum Confidence: 1 (floor value)
```

**Example:**
- Day 0: You solve a problem with confidence 8
- Day 14: Confidence decays to 7.2 (8 × 0.9)
- Day 28: Confidence decays to 6.4 (8 × 0.8)
- Day 70: Confidence capped at 4.0 (8 × 0.5, max 50% decay)

#### Priority Scoring
Problems are ranked using a weighted formula:
```
Priority Score = (Adjusted Confidence × 0.7) - (Time Factor × 0.3)

Where:
- Adjusted Confidence = Original Confidence × (1 - Decay)
- Time Factor = (Days Since Revision / 30) × 10
- Lower Score = Higher Priority (appears first)
```

This ensures:
- ✅ Low confidence problems get priority
- ✅ Old problems don't get forgotten
- ✅ Optimal spacing for long-term retention

### Problem Categories
Based on **Striver's A2Z DSA Course**, including:
- **Fundamentals**: Basic Maths, Recursion, Hashing
- **Data Structures**: Arrays, Strings, Linked Lists, Stacks, Queues, Trees, Heaps, Graphs
- **Algorithms**: Sorting, Searching, Two Pointers, Sliding Window, Binary Search
- **Advanced Topics**: Dynamic Programming, Greedy Algorithms, Backtracking
- **Specialized**: Bit Manipulation, Tries, Segment Trees, System Design

### Why Confidence Over Difficulty?
Traditional platforms rate problem difficulty as a static value. AlgoGrid is **personal**:
- **Subjective Understanding**: What's hard for others might be easy for you
- **Dynamic Learning**: Your confidence changes as you learn
- **Decay Tracking**: Ensures you don't fool yourself into thinking you remember something you don't
- **Personalized Revision**: Focus on YOUR weak areas, not arbitrary difficulty ratings

### Responsive Design
- **Mobile-First**: Optimized for phones and tablets
- **Desktop Enhanced**: Rich experience on larger screens
- **Touch-Friendly**: Easy navigation on all devices
- **Fast Loading**: Optimized performance across devices

## 🚀 Deployment

The application is optimized for **Vercel** deployment with automatic CI/CD:

1. **Push to GitHub**
```bash
git add .
git commit -m "Your changes"
git push origin main
```

2. **Connect to Vercel**
   - Import your repository on Vercel
   - Add environment variables
   - Deploy automatically on every push

3. **Environment Variables**
Set production values for:
   - `MONGODB_URI` - Your MongoDB Atlas connection string

## 🎯 Use Cases

### For Interview Preparation
- Save every problem you solve during prep
- Get automatic reminders when problems need revision
- Build lasting muscle memory instead of cramming

### For Continuous Learning
- Add problems as you encounter them
- The system ensures you never forget what you've learned
- Maintain your DSA skills long-term

### For Educators
- Track student progress through confidence metrics
- Identify topics that need more attention
- Personalized learning paths based on decay patterns

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind for styling
- Write descriptive commit messages
- Test on multiple devices
- Maintain responsive design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Striver's A2Z DSA Course** for the comprehensive category structure
- **Spaced Repetition Research** for the scientific foundation of our algorithm
- **Clerk** for seamless authentication
- **Vercel** for reliable hosting and edge functions
- **MongoDB** for flexible data storage
- **The Developer Community** for continuous feedback and support

---

## 🌟 Why AlgoGrid?

**"The best time to revise a problem was 2 weeks ago. The second best time is now."**

Stop forgetting what you've learned. Start building **lasting mastery** with intelligent, data-driven revision.

---

**Built with ❤️ by developers, for developers**

*Master DSA. Retain Forever. 🧠*
