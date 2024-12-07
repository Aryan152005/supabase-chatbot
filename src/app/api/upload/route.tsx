import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Read file content
    const content = await file.text()

    // Generate embedding
    const embeddingResponse = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: content,
    })

    // Store document in Supabase
    const { data, error } = await supabase
      .from('documents')
      .insert({
        filename: file.name,
        content: content,
        embedding: embeddingResponse,
        user_id: user.id,
      })
      .select()

    if (error) throw error

    return NextResponse.json({ message: 'File uploaded successfully', data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 })
  }
}

