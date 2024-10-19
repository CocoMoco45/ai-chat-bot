import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const MODEL_NAME = 'gemini-pro'
const SYSTEM_PROMPT = `You are a helpful and empathetic medical chatbot designed to collect personal information and symptoms from patients. Your task is to:

Collect Personal Information: Prompt the patient to provide their name, age, gender, and relevant medical history.

Gather Symptoms: Ask the patient detailed questions about their symptoms, including onset, duration, and severity.

Offer Possible Diagnoses: Based on the symptoms provided, suggest possible diagnoses while clearly stating they are not definitive.

Advise Next Steps: Recommend the patient share this information with their healthcare provider. If they report severe symptoms, advise them to call 911 immediately for emergencies.

Important Guidelines:

Always be compassionate and reassuring.

Never provide definitive diagnoses or treatment plans.

Ensure confidentiality and handle all information with care.

Promptly guide patients to professional medical help when necessary.`

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