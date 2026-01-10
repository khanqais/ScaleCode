export interface DemoProblem {
  _id: string
  title: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  problemStatement: string
  problemDescription: string
  sampleCode: string
  explanation: string
  shortDescription: string
}

export const sampleProblems: DemoProblem[] = [
  {
    _id: 'demo-1',
    title: 'Two Sum',
    category: 'Array',
    difficulty: 'easy',
    tags: ['arrays', 'hash-map', 'two-pointers'],
    shortDescription: 'Find two numbers that add up to a target',
    problemStatement: `Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    problemDescription: `
Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] == 9, so we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]

Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
    sampleCode: `function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}

// Time Complexity: O(n)
// Space Complexity: O(n)`,
    explanation: 'Uses a hash map to store numbers and their indices. For each number, we check if its complement (target - current) exists in the map.'
  },
  {
    _id: 'demo-2',
    title: 'Valid Parentheses',
    category: 'String',
    difficulty: 'easy',
    tags: ['string', 'stack', 'parentheses'],
    shortDescription: 'Check if parentheses are valid and balanced',
    problemStatement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    problemDescription: `
Example 1:
Input: s = "()"
Output: true

Example 2:
Input: s = "()[]{}"
Output: true

Example 3:
Input: s = "([)]"
Output: false

Example 4:
Input: s = "{[]}"
Output: true

Constraints:
- 1 <= s.length <= 10^4
- s consists of parentheses only '(){}[]'`,
    sampleCode: `function isValid(s: string): boolean {
    const stack: string[] = [];
    const pairs: { [key: string]: string } = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    for (const char of s) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else {
            if (stack.length === 0 || stack[stack.length - 1] !== pairs[char]) {
                return false;
            }
            stack.pop();
        }
    }
    
    return stack.length === 0;
}

// Time Complexity: O(n)
// Space Complexity: O(n)`,
    explanation: 'Uses a stack to track opening brackets. When encountering a closing bracket, it checks if it matches the most recent opening bracket.'
  },
  {
    _id: 'demo-3',
    title: 'Reverse String',
    category: 'String',
    difficulty: 'easy',
    tags: ['string', 'two-pointers'],
    shortDescription: 'Reverse a string using two pointers',
    problemStatement: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    problemDescription: `
Example 1:
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]

Example 2:
Input: s = ["H","a","n","n","a","h"]
Output: ["h","a","n","n","a","H"]

Constraints:
- 1 <= s.length <= 10^5
- s[i] is a printable ascii character.`,
    sampleCode: `function reverseString(s: string[]): void {
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
        // Swap characters
        [s[left], s[right]] = [s[right], s[left]];
        left++;
        right--;
    }
}

// Time Complexity: O(n)
// Space Complexity: O(1)`,
    explanation: 'Uses two pointers starting from both ends of the array and swaps them while moving towards the center.'
  },
  {
    _id: 'demo-4',
    title: 'Merge Sorted Array',
    category: 'Array',
    difficulty: 'easy',
    tags: ['arrays', 'two-pointers', 'merge'],
    shortDescription: 'Merge two sorted arrays in-place',
    problemStatement: `You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of valid elements in nums1 and nums2 respectively.

Merge nums2 into nums1 as one sorted array.

Note: You may assume that nums1 has a length of m + n, so it has enough space to hold additional elements from nums2.`,
    problemDescription: `
Example 1:
Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
Output: [1,2,2,3,5,6]

Example 2:
Input: nums1 = [1], m = 1, nums2 = [], n = 0
Output: [1]

Example 3:
Input: nums1 = [0], m = 0, nums2 = [1], n = 1
Output: [1]

Constraints:
- nums1.length == m + n
- nums2.length == n
- 0 <= m, n <= 200
- 1 <= m + n <= 200`,
    sampleCode: `function merge(nums1: number[], m: number, nums2: number[], n: number): void {
    let p1 = m - 1;
    let p2 = n - 1;
    let p = m + n - 1;
    
    while (p1 >= 0 && p2 >= 0) {
        if (nums1[p1] > nums2[p2]) {
            nums1[p] = nums1[p1];
            p1--;
        } else {
            nums1[p] = nums2[p2];
            p2--;
        }
        p--;
    }
    
    // If p2 >= 0, remaining elements from nums2 need to be copied
    while (p2 >= 0) {
        nums1[p] = nums2[p2];
        p2--;
        p--;
    }
}

// Time Complexity: O(m + n)
// Space Complexity: O(1)`,
    explanation: 'Compares elements from the end of both arrays and places the larger one at the end, working backwards to avoid overwriting elements.'
  },
  {
    _id: 'demo-5',
    title: 'Best Time to Buy and Sell Stock',
    category: 'Array',
    difficulty: 'medium',
    tags: ['arrays', 'dynamic-programming', 'greedy'],
    shortDescription: 'Find maximum profit from buying and selling stock',
    problemStatement: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.`,
    problemDescription: `
Example 1:
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.

Example 2:
Input: prices = [7,6,4,3,1]
Output: 0
Explanation: In this case, no transactions are done and the max profit = 0.

Constraints:
- 1 <= prices.length <= 10^5
- 0 <= prices[i] <= 10^4`,
    sampleCode: `function maxProfit(prices: number[]): number {
    let minPrice = prices[0];
    let maxProfit = 0;
    
    for (let i = 1; i < prices.length; i++) {
        const profit = prices[i] - minPrice;
        maxProfit = Math.max(maxProfit, profit);
        minPrice = Math.min(minPrice, prices[i]);
    }
    
    return maxProfit;
}

// Time Complexity: O(n)
// Space Complexity: O(1)`,
    explanation: 'Tracks the minimum price seen so far and calculates the profit at each point. Updates max profit when a better opportunity is found.'
  }
]
