# ScaleCode - DSA Revision Platform

A comprehensive platform for organizing, storing, and revising Data Structures & Algorithms (DSA) problems. Built with Next.js, TypeScript, Supabase, and Clerk authentication.

## 🚀 Features

### 📁 Pattern-Based Organization
- Create folders for different problem patterns (Graph, Two Pointer, DP, etc.)
- Organize problems by categories for better learning
- Visual folder system with color coding

### 📝 Problem Management
- Store problem statements, solutions, and your intuition
- Rate difficulty from 1-10 for each problem
- Add tags, platform info, and complexity analysis
- Include original problem URLs for reference

### 🧠 Smart Revision System
- **Random Difficult Problems**: Get challenged with your hardest problems
- **Code Comparison**: Compare your revision attempt with the original solution
- **Scoring System**: Get similarity scores to track improvement
- **Timed Practice**: Track time spent on each revision attempt
- **Progress Tracking**: Monitor your revision streak and average scores

### 📊 Analytics & Insights
- Track total problems and folders
- Monitor average difficulty of your problems
- View revision streaks and performance metrics
- Recent attempt history with scores and timing

## 🛠️ Setup Instructions

### 1. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents from `database_schema.sql`
4. Run the SQL to create all necessary tables and policies
5. Optional: Run `setup_database.sql` for additional views and sample data

### 2. Environment Variables
Make sure you have these environment variables set:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 3. Authentication
The app uses Clerk for authentication. Users need to sign up/sign in to:
- Create and manage folders
- Add problems to their collection
- Use the revision system
- Track their progress

## 📖 How to Use

### Creating Your First Folder
1. Click "New Pattern" on the organize page
2. Enter a pattern name (e.g., "Graph Algorithms")
3. Add a description and choose a color
4. Click "Create Pattern"

### Adding Problems
1. Click on a folder to open it
2. Click "Add Problem" 
3. Fill in:
   - Problem title and statement
   - Your solution code
   - Difficulty rating (1-10)
   - Your intuition/approach
   - Optional: tags, platform, URL, complexity analysis
4. Click "Add Problem"

### Using the Revision System
1. Open a folder with problems
2. Click "Start Revision" (floating button)
3. Choose "Start Random Difficult Problem" or select a specific problem
4. Read the problem statement (your original solution is hidden)
5. Write your solution from memory
6. Click "Submit & Compare"
7. View your similarity score and compare solutions
8. Review the original intuition if needed

### Understanding the Scoring
- **90-100%**: Excellent! Nearly identical to original
- **70-89%**: Good job! Main logic captured
- **50-69%**: Decent attempt, needs review
- **Below 50%**: Keep practicing, significant differences

## 🎯 Best Practices

### Problem Organization
- Use descriptive folder names (e.g., "Binary Search Variants")
- Add detailed problem statements
- Include your thought process in intuition
- Rate difficulty honestly for better revision targeting

### Revision Strategy
- Focus on difficult problems (7+ difficulty)
- Regular revision sessions to build streaks
- Review original solutions after attempts
- Track improvement over time

### Code Quality
- Include time/space complexity when known
- Add meaningful comments in solutions
- Use consistent formatting
- Tag problems with relevant keywords

## 🔧 Technical Details

### Database Schema
- `users`: Clerk user synchronization
- `folders`: Problem pattern categories
- `problems`: Individual coding problems with solutions
- `revision_attempts`: Tracking revision sessions
- `user_stats`: Aggregated user metrics

### Key Components
- **OrganizePage**: Main dashboard with folders and stats
- **FolderDetailPage**: Problem management within folders
- **RevisionPage**: Interactive revision system
- **Shared Components**: Reusable UI elements

### Similarity Algorithm
The code comparison uses a simple word-based similarity algorithm that:
1. Normalizes code (removes formatting, case)
2. Splits into words
3. Calculates percentage of common words
4. Can be enhanced with more sophisticated NLP techniques

## 🚀 Future Enhancements

- **Advanced Code Analysis**: AST-based similarity comparison
- **Spaced Repetition**: Automatic scheduling of revision sessions
- **Team Features**: Share folders and compete with friends
- **Import/Export**: Bulk problem import from coding platforms
- **Video Solutions**: Attach explanation videos to problems
- **Mobile App**: React Native version for on-the-go practice

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 📄 License

MIT License - Feel free to use and modify for your own learning journey.

---

Happy coding and may your DSA skills scale to new heights! 🚀