import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

// AI Hint API Route
// This route generates progressive hints for DSA problems using Google's Gemini API

interface HintRequest {
  problemTitle: string
  problemStatement: string
  category: string
  userCode?: string
  hintLevel: 1 | 2 | 3 // 1 = gentle nudge, 2 = approach hint, 3 = detailed hint
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please add GEMINI_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }

    const body: HintRequest = await request.json()
    const { problemTitle, problemStatement, category, userCode, hintLevel } = body

    // Validate required fields
    if (!problemTitle || !problemStatement || !hintLevel) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Build the prompt based on hint level
    const prompt = buildHintPrompt(problemTitle, problemStatement, category, userCode, hintLevel)

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    // Generate content
    const result = await model.generateContent(prompt)
    const response = await result.response
    const hintText = response.text()
    
    if (!hintText) {
      return NextResponse.json(
        { success: false, error: 'AI could not generate a hint. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        hint: hintText,
        hintLevel,
        problemTitle
      }
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

function buildHintPrompt(
  title: string,
  statement: string,
  category: string,
  userCode: string | undefined,
  level: 1 | 2 | 3
): string {
  const baseContext = `
You are a helpful DSA (Data Structures and Algorithms) tutor. You're helping a student who is practicing coding problems.

Problem Title: ${title}
Category: ${category}
Problem Statement:
${statement}

${userCode ? `Student's current attempt:\n${userCode}\n` : ''}
`

  switch (level) {
    case 1:
      return `${baseContext}
TASK: Provide a LEVEL 1 HINT (Gentle Nudge)

Guidelines:
- Give a very subtle hint that points them in the right direction
- Ask a guiding question that helps them think about the problem differently
- Do NOT reveal the algorithm or approach directly
- Keep it to 2-3 sentences maximum
- Be encouraging and supportive

Format your response as a helpful hint without any markdown headers.`

    case 2:
      return `${baseContext}
TASK: Provide a LEVEL 2 HINT (Approach Hint)

Guidelines:
- Suggest the type of data structure or algorithm pattern that might help
- Explain WHY this approach could work without giving the full solution
- You can mention concepts like "sliding window", "two pointers", "dynamic programming", etc.
- Keep it to 4-5 sentences
- Include a thought-provoking question at the end

Format your response as a helpful hint without any markdown headers.`

    case 3:
      return `${baseContext}
TASK: Provide a LEVEL 3 HINT (Detailed Hint)

Guidelines:
- Explain the approach step by step conceptually
- You can include pseudocode or high-level steps
- Explain the time and space complexity briefly
- Still don't write the actual complete code solution
- Keep it educational - explain the "why" behind each step

Format your response with clear structure but without revealing the full code solution.`

    default:
      return `${baseContext}
TASK: Provide a helpful hint for this problem.
Keep it concise and educational.`
  }
}
