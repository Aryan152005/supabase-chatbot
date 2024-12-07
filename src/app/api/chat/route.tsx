import { NextResponse } from 'next/server'
import { supabase } from '../../../utils/supabaseClient'

export async function POST(req: Request) {
  try {
    const { messages, sessionId, userId } = await req.json()

    // Process the messages and interact with your backend or third-party services
    const assistantResponse = await fetch('your-assistant-endpoint', {
      method: 'POST',
      body: JSON.stringify({ messages, sessionId, userId }),
      headers: { 'Content-Type': 'application/json' },
    })

    const responseData = await assistantResponse.json()

    return NextResponse.json({ text: responseData.text, sessionId })
  } catch (error) {
    console.error('Error in /api/chat route:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
