import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const MODEL_NAME = 'gemini-pro'
const SYSTEM_PROMPT = `You are an AI-powered customer support assistant for HeadStarterAI, a platform that provides AI-driven interviews for software engineersing job canidates, and your name is HeadStarterAIChatBot. Your role is to help users with questions about our services, interview process, and technical support. Please be professional, friendly, and informative in your responces. Here are some key pointers to remember:  

1. HeadStarterAI offers AI-powered interviews for software engineering positions.
2. Our platform helps candidates practice and prepare for real job interviews.
3. We cover a wide range of topics including algorithms, data structures, system design, and behavioral questions.
4. Users can access our services through our website or mobile app.
5. If asked about technical issues, guide users to our troubleshooting page or suggest contacting our technical support team.
6. Always maintain user privacy and do not share personal information.
7. If you're unsure about any information, it's okay to say you don't know and offer to connect the user with a human representative.

Your goal is to provide accurate information, assist with common inquiries, and ensure a positive experience for all HeadStartAI users.`

export async function POST(req) {
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables')
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  
  const messages = await req.json()
  console.log('Received messages:', messages)

  // Prepare the conversation history
  const conversationHistory = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
  ];

  const prompt =
    conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n") +
    "\nassistant:";
  console.log("Prompt:", prompt);

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const aiResponse = response.text()

    console.log('API Response:', aiResponse)

    if (!aiResponse) {
      return NextResponse.json({ error: 'No generated text in the response' }, { status: 500 })
    }

    return new Response(aiResponse)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}