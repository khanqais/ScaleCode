import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  problemStatement: {
    type: String,
    required: [true, 'Problem statement is required'],
    trim: true
  },
  myCode: {
    type: String,
    required: [true, 'Solution code is required'],
    trim: true
  },
  intuition: {
    type: String,
    trim: true,
    default: ''
  },
  difficulty: {
    type: Number,
    required: [true, 'Difficulty level is required'],
    min: [1, 'Difficulty must be at least 1'],
    max: [10, 'Difficulty cannot exceed 10']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
  // Step 1: Basics
  'Basic Maths',
  'Basic Recursion',
  'Basic Hashing',
  
  // Step 2: Sorting
  'Sorting Algorithms',
  
  // Step 3: Arrays
  'Arrays',
  
  // Step 4: Binary Search
  'Binary Search',
  
  // Step 5: Strings
  'Strings',
  
  // Step 6: Linked List
  'Linked List',
  'Doubly Linked List',
  
  // Step 7: Recursion Patterns
  'Recursion',
  'Subsequences',
  'Backtracking',
  
  // Step 8: Bit Manipulation
  'Bit Manipulation',
  
  // Step 9: Stack and Queues
  'Stack',
  'Queue',
  'Monotonic Stack',
  
  // Step 10: Sliding Window & Two Pointer
  'Sliding Window',
  'Two Pointers',
  
  // Step 11: Heaps
  'Heap',
  'Priority Queue',
  
  // Step 12: Greedy
  'Greedy Algorithms',
  
  // Step 13: Binary Trees
  'Binary Tree',
  'Tree Traversal',
  
  // Step 14: Binary Search Trees
  'Binary Search Tree',
  
  // Step 15: Graphs
  'Graph',
  'BFS',
  'DFS',
  'Shortest Path',
  'Minimum Spanning Tree',
  'Topological Sort',
  
  // Step 16: Dynamic Programming
  'Dynamic Programming',
  'DP on Arrays',
  'DP on Grids',
  'DP on Strings',
  'DP on Trees',
  'DP on Subsequences',
  
  // Step 17: Tries
  'Trie',
  
  // Additional Important Categories
  'Mathematical',
  'Geometry',
  'Number Theory',
  'Combinatorics',
  'Game Theory',
  'Matrix',
  'Design',
  'System Design',
  
  // Company/Contest Specific
  'Interview Questions',
  'Contest Problems',
  'Mock Interview',
],
      message: 'Invalid category'
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexing for performance
problemSchema.index({ userId: 1, createdAt: -1 });
problemSchema.index({ userId: 1, category: 1 });
problemSchema.index({ userId: 1, difficulty: 1 });

const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);

export default Problem;