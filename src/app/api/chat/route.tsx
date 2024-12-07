import { createClient } from '@supabase/supabase-js'
import hf from '../../../lib/huggingface-client'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid';

async function storeChatMessage(supabase: any, sessionId: string, role: string, content: string) {
  await supabase.from('chat_history').insert({
    session_id: sessionId,
    role,
    content
  });
}

export async function POST(req: Request) {
  const { messages, sessionId } = await req.json();
  const latestMessage = messages[messages.length - 1].content;

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Generate a new session ID if not provided
  const currentSessionId = sessionId || uuidv4();

  // Store the user's message
  await storeChatMessage(supabase, currentSessionId, 'user', latestMessage);

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

  // Store the AI's response
  await storeChatMessage(supabase, currentSessionId, 'assistant', response.generated_text);

  // Return the generated text and session ID
  return NextResponse.json({ text: response.generated_text, sessionId: currentSessionId })
}

