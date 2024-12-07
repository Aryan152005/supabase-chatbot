import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function POST(req: NextRequest) {
  const { messages, sessionId } = await req.json()
  const latestMessage = messages[messages.length - 1].content

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate embedding for the latest message
    const embeddingResponse = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: latestMessage,
    })

    // Query Supabase for similar documents
    const { data: documents } = await supabase.rpc('match_documents', {
      query_embedding: embeddingResponse,
      match_threshold: 0.5,
      match_count: 5,
    })

    // Prepare context from similar documents
    const context = documents.map((doc: any) => doc.content).join('\n\n')

    // Prepare messages for Hugging Face
    const prompt = `Context: ${context}\n\nHuman: ${latestMessage}\n\nAI:`

    // Generate response using Hugging Face
    const response = await hf.textGeneration({
      model: 'gpt2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.2,
      },
    })

    // Store the chat message
    await supabase.from('chat_history').insert({
      session_id: sessionId,
      user_id: user.id,
      role: 'user',
      content: latestMessage,
    })

    await supabase.from('chat_history').insert({
      session_id: sessionId,
      user_id: user.id,
      role: 'assistant',
      content: response.generated_text,
    })

    // Return the generated text and session ID
    return NextResponse.json({ text: response.generated_text, sessionId })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
