'use client'

import { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleFileUpload = async () => {
    if (!file) {
      setMessage('Please select a file to upload')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()

      if (response.ok) {
        setMessage('File uploaded successfully!')
      } else {
        setMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      setMessage('Error uploading file')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-900">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8 text-white text-center">AI Chatbot File Upload</h1>
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4 p-2 bg-gray-700 text-white rounded"
        />
        <button
          onClick={handleFileUpload}
          className="p-3 bg-blue-600 text-white rounded-lg"
        >
          Upload File
        </button>
        {message && <p className="text-white mt-4">{message}</p>}
      </div>
    </main>
  )
}
