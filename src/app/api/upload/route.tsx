import { NextResponse } from 'next/server'
import * as fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as Blob

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const uploadPath = path.join(process.cwd(), 'uploads', file.name)

  // Save file to the server (make sure the "uploads" directory exists)
  fs.writeFileSync(uploadPath, buffer)

  return NextResponse.json({ message: 'File uploaded successfully!' })
}
