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
  problemImages: [{
    type: String,
    trim: true
  }],
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
  
  'Basic Maths',
  'Basic Recursion',
  'Basic Hashing',
  
  
  'Sorting Algorithms',
  
  
  'Arrays',
  
  
  'Binary Search',
  
  
  'Strings',
  
  
  'Linked List',
  'Doubly Linked List',
  
  
  'Recursion',
  'Subsequences',
  'Backtracking',
  
  
  'Bit Manipulation',
  
  
  'Stack',
  'Queue',
  'Monotonic Stack',
  
  
  'Sliding Window',
  'Two Pointers',
  
  
  'Heap',
  'Priority Queue',
  
  
  'Greedy Algorithms',
  
  
  'Binary Tree',
  'Tree Traversal',
  
  
  'Binary Search Tree',
  
  
  'Graph',
  'BFS',
  'DFS',
  'Shortest Path',
  'Minimum Spanning Tree',
  'Topological Sort',
  
  
  'Dynamic Programming',
  'DP on Arrays',
  'DP on Grids',
  'DP on Strings',
  'DP on Trees',
  'DP on Subsequences',
  
  
  'Trie',
  
  
  'Mathematical',
  'Geometry',
  'Number Theory',
  'Combinatorics',
  'Game Theory',
  'Matrix',
  'Design',
  'System Design',
  
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

if (mongoose.models.Problem) {
  delete mongoose.models.Problem;
}

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;