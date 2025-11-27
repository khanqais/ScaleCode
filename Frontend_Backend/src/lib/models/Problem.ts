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
  solutions: [{
    code: {
      type: String,
      required: true,
      trim: true
    },
    intuition: {
      type: String,
      trim: true,
      default: ''
    },
    language: {
      type: String,
      default: 'cpp'
    },
    timeComplexity: {
      type: String,
      default: ''
    },
    spaceComplexity: {
      type: String,
      default: ''
    },
    approach: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Keep old fields for backward compatibility
  myCode: {
    type: String,
    trim: true
  },
  intuition: {
    type: String,
    trim: true,
    default: ''
  },
  Confidence: {
    type: Number,
    required: [true, 'Confidence level is required'],
    min: [1, 'Confidence must be at least 1'],
    max: [10, 'Confidence cannot exceed 10']
  },
  lastRevised: {
    type: Date,
    default: Date.now
  },
  revisionCount: {
    type: Number,
    default: 0
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
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags: string[]) {
        // Each tag should be between 1-50 characters
        return tags.every(tag => tag.length >= 1 && tag.length <= 50)
      },
      message: 'Each tag must be between 1 and 50 characters'
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

problemSchema.index({ userId: 1, createdAt: -1 });
problemSchema.index({ userId: 1, category: 1 });
problemSchema.index({ userId: 1, tags: 1 });

// Clear any cached model to ensure we use the latest schema
if (mongoose.models.Problem) {
  delete mongoose.models.Problem;
}

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;