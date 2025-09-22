# 🚀 AlgoGrid - DSA Practice Platform

A modern, full-stack web application for organizing and practicing Data Structures & Algorithms problems. Built to help developers systematically prepare for coding interviews and improve their problem-solving skills.

**🌐 Live Demo:** [https://scale-code.vercel.app/](https://scale-code.vercel.app/)

## ✨ Features

### 📚 Problem Management
- **Add Problems**: Store your solved coding problems with complete solutions
- **Rich Categories**: 50+ DSA categories based on Striver's A2Z course
- **Difficulty Tracking**: Rate problems from 1-10 based on your confidence
- **Solution Storage**: Save your code, approach, and intuition for each problem

### 🎯 Smart Practice System
- **Revision Mode**: Practice problems without looking at solutions first
- **Timed Sessions**: Track how long you take to solve problems
- **Solution Comparison**: Compare your revision attempt with original solution
- **Progressive Learning**: Focus on areas that need improvement

### 📊 Progress Analytics
- **Personal Dashboard**: Track total problems, categories covered, and recent activity
- **Category Breakdown**: Visual representation of your problem distribution
- **Weekly Progress**: Monitor your consistency with weekly activity tracking
- **Performance Stats**: View your growth and improvement over time

### 🔍 Advanced Organization
- **Smart Filtering**: Filter by category, difficulty, or search terms
- **Sorting Options**: Sort by date, difficulty, or alphabetically
- **Category Navigation**: Quick access to specific problem types
- **Responsive Design**: Perfect experience on all devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Beautiful, customizable icons

### Backend
- **Next.js API Routes** - Serverless backend functions
- **MongoDB** - Document-based database
- **Mongoose** - MongoDB object modeling

### Authentication & Deployment
- **Clerk** - Complete authentication solution
- **Vercel** - Cloud deployment platform

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
# Database
MONGODB_URI=mongodb://localhost:27017/scalecode
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/scalecode

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/organize
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/organize
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
   - Difficulty level (1-10)
   - Category (e.g., Arrays, Dynamic Programming)

### Practicing Problems
1. Navigate to any problem from your dashboard
2. Click "Start Revision" to enter practice mode
3. Code your solution without looking at the original
4. Submit to compare with your previous solution
5. Review differences and improve your approach

### Tracking Progress
- **Dashboard**: Overview of your coding journey
- **Category Stats**: See which topics you've mastered
- **Recent Activity**: Track your consistency
- **Filtering**: Find specific problems quickly

## 🎨 Features in Detail

### Problem Categories
Based on **Striver's A2Z DSA Course**, including:
- **Fundamentals**: Basic Maths, Recursion, Hashing
- **Data Structures**: Arrays, Strings, Linked Lists, Trees
- **Algorithms**: Sorting, Searching, Graph Algorithms
- **Advanced Topics**: Dynamic Programming, Greedy, Backtracking
- **Specialized**: Bit Manipulation, Tries, System Design

### Responsive Design
- **Mobile-First**: Optimized for phones and tablets
- **Desktop Enhanced**: Rich experience on larger screens
- **Touch-Friendly**: Easy navigation on all devices
- **Fast Loading**: Optimized performance across devices

## 🚀 Deployment

The application is optimized for **Vercel** deployment:

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
   - Import your repository on Vercel
   - Add environment variables
   - Deploy automatically

3. **Environment Variables**
Set production values for:
   - `MONGODB_URI`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

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
- **Clerk** for seamless authentication
- **Vercel** for reliable hosting
- **MongoDB** for flexible data storage

***

**Built with ❤️ for the coding community**

*Happy Coding! 🎯*

[1](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scale)
[2](https://www.scale.at/blog/websites-at-scale)
[3](https://www.w3schools.com/cssref/css_pr_scale.php)
[4](https://www.clarity-ventures.com/blog/ten-key-elements-every-business-website-should-have-functionality-and-design-ed)
[5](https://acropolium.com/blog/how-to-scale-web-app/)
[6](https://www.sei.cmu.edu/blog/scale-a-tool-for-managing-output-from-static-analysis-tools/)
[7](https://www.browserstack.com/guide/responsive-web-design)
[8](https://www.w3schools.com/html/html_responsive.asp)
[9](https://www.greatfrontend.com/blog/web-apps-at-scale-javascript)