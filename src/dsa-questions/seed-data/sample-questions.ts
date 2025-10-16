// Sample DSA Questions Seed Data
// To use: Import into MongoDB or create via API

export const sampleDsaQuestions = [
  {
    questionId: 'two-sum',
    title: 'Two Sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly one solution***, and you may not use the *same* element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

**Example 3:**
\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\`

**Constraints:**
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- Only one valid answer exists.`,
    difficulty: 'Easy',
    categories: ['Array', 'Hash Table'],
    tags: ['Google', 'Amazon', 'Apple', 'Adobe'],
    testCases: [
      {
        input: '{"nums": [2,7,11,15], "target": 9}',
        expectedOutput: '[0,1]',
        isHidden: false,
        explanation: 'nums[0] + nums[1] = 2 + 7 = 9'
      },
      {
        input: '{"nums": [3,2,4], "target": 6}',
        expectedOutput: '[1,2]',
        isHidden: false
      },
      {
        input: '{"nums": [3,3], "target": 6}',
        expectedOutput: '[0,1]',
        isHidden: false
      },
      {
        input: '{"nums": [1,5,3,7,9,2], "target": 10}',
        expectedOutput: '[2,4]',
        isHidden: true
      }
    ],
    functionSignatures: [
      {
        language: 'javascript',
        code: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your code here
}`
      },
      {
        language: 'python',
        code: `def twoSum(nums: List[int], target: int) -> List[int]:
    # Your code here
    pass`
      },
      {
        language: 'java',
        code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}`
      }
    ],
    constraints: {
      timeLimit: 5000,
      memoryLimit: 256
    },
    hints: [
      {
        order: 1,
        text: 'A brute force approach would be to use nested loops, but can we do better?'
      },
      {
        order: 2,
        text: 'Think about using a hash map to store the complement of each number.'
      },
      {
        order: 3,
        text: 'For each number, check if its complement (target - num) exists in the hash map.'
      }
    ],
    solutions: [
      {
        language: 'javascript',
        code: `function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}`,
        explanation: 'We use a hash map to store each number and its index as we iterate. For each number, we check if its complement exists in the map.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)'
      },
      {
        language: 'python',
        code: `def twoSum(nums: List[int], target: int) -> List[int]:
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in num_map:
            return [num_map[complement], i]
        
        num_map[num] = i
    
    return []`,
        explanation: 'Python implementation using a dictionary',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)'
      }
    ],
    examples: [
      'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]',
      'Input: nums = [3,2,4], target = 6\nOutput: [1,2]'
    ],
    notes: 'Follow-up: Can you come up with an algorithm that is less than O(n²) time complexity?',
    relatedQuestions: ['3sum', '4sum', 'two-sum-ii']
  },
  {
    questionId: 'reverse-linked-list',
    title: 'Reverse Linked List',
    description: `Given the \`head\` of a singly linked list, reverse the list, and return *the reversed list*.

**Example 1:**
\`\`\`
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]
\`\`\`

**Example 2:**
\`\`\`
Input: head = [1,2]
Output: [2,1]
\`\`\`

**Example 3:**
\`\`\`
Input: head = []
Output: []
\`\`\`

**Constraints:**
- The number of nodes in the list is the range \`[0, 5000]\`.
- \`-5000 <= Node.val <= 5000\``,
    difficulty: 'Easy',
    categories: ['Linked List', 'Recursion'],
    tags: ['Microsoft', 'Amazon', 'Facebook', 'Google'],
    testCases: [
      {
        input: '{"head": [1,2,3,4,5]}',
        expectedOutput: '[5,4,3,2,1]',
        isHidden: false
      },
      {
        input: '{"head": [1,2]}',
        expectedOutput: '[2,1]',
        isHidden: false
      },
      {
        input: '{"head": []}',
        expectedOutput: '[]',
        isHidden: false
      },
      {
        input: '{"head": [1]}',
        expectedOutput: '[1]',
        isHidden: true
      }
    ],
    functionSignatures: [
      {
        language: 'javascript',
        code: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
    // Your code here
}`
      },
      {
        language: 'python',
        code: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

def reverseList(head: Optional[ListNode]) -> Optional[ListNode]:
    # Your code here
    pass`
      }
    ],
    constraints: {
      timeLimit: 5000,
      memoryLimit: 256
    },
    hints: [
      {
        order: 1,
        text: 'Consider both iterative and recursive approaches.'
      },
      {
        order: 2,
        text: 'For iterative: Use three pointers (prev, current, next).'
      },
      {
        order: 3,
        text: 'For recursive: Think about reversing the rest of the list first.'
      }
    ],
    solutions: [
      {
        language: 'javascript',
        code: `function reverseList(head) {
    let prev = null;
    let current = head;
    
    while (current !== null) {
        const next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    
    return prev;
}`,
        explanation: 'Iterative approach using three pointers to reverse the links.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)'
      }
    ],
    examples: [
      'Input: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]'
    ],
    notes: 'Follow-up: Can you reverse it both iteratively and recursively?',
    relatedQuestions: ['reverse-linked-list-ii', 'palindrome-linked-list']
  },
  {
    questionId: 'valid-parentheses',
    title: 'Valid Parentheses',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:

1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**
\`\`\`
Input: s = "()"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

**Example 3:**
\`\`\`
Input: s = "(]"
Output: false
\`\`\`

**Constraints:**
- \`1 <= s.length <= 10^4\`
- \`s\` consists of parentheses only \`'()[]{}'\`.`,
    difficulty: 'Easy',
    categories: ['Stack', 'String'],
    tags: ['Amazon', 'Microsoft', 'Bloomberg', 'Facebook'],
    testCases: [
      {
        input: '{"s": "()"}',
        expectedOutput: 'true',
        isHidden: false
      },
      {
        input: '{"s": "()[]{}"}',
        expectedOutput: 'true',
        isHidden: false
      },
      {
        input: '{"s": "(]"}',
        expectedOutput: 'false',
        isHidden: false
      },
      {
        input: '{"s": "([)]"}',
        expectedOutput: 'false',
        isHidden: true
      },
      {
        input: '{"s": "{[]}"}',
        expectedOutput: 'true',
        isHidden: true
      }
    ],
    functionSignatures: [
      {
        language: 'javascript',
        code: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    // Your code here
}`
      },
      {
        language: 'python',
        code: `def isValid(s: str) -> bool:
    # Your code here
    pass`
      }
    ],
    constraints: {
      timeLimit: 5000,
      memoryLimit: 256
    },
    hints: [
      {
        order: 1,
        text: 'A stack is an ideal data structure for this problem.'
      },
      {
        order: 2,
        text: 'Push opening brackets onto the stack, and pop when you encounter closing brackets.'
      },
      {
        order: 3,
        text: 'Check if the popped bracket matches the current closing bracket.'
      }
    ],
    solutions: [
      {
        language: 'javascript',
        code: `function isValid(s) {
    const stack = [];
    const pairs = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    for (const char of s) {
        if (char in pairs) {
            if (stack.length === 0 || stack.pop() !== pairs[char]) {
                return false;
            }
        } else {
            stack.push(char);
        }
    }
    
    return stack.length === 0;
}`,
        explanation: 'Use a stack to track opening brackets. When encountering a closing bracket, check if it matches the most recent opening bracket.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)'
      }
    ],
    examples: [
      'Input: s = "()"\nOutput: true',
      'Input: s = "()[]{}"\nOutput: true',
      'Input: s = "(]"\nOutput: false'
    ],
    relatedQuestions: ['generate-parentheses', 'longest-valid-parentheses']
  }
];

// Export a function to create questions via API
export const createSampleQuestions = async (apiUrl: string, authToken: string) => {
  for (const question of sampleDsaQuestions) {
    try {
      const response = await fetch(`${apiUrl}/dsa-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(question)
      });
      
      if (response.ok) {
        console.log(`✓ Created question: ${question.title}`);
      } else {
        console.error(`✗ Failed to create ${question.title}:`, await response.text());
      }
    } catch (error) {
      console.error(`✗ Error creating ${question.title}:`, error);
    }
  }
};
