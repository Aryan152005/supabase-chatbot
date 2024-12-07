'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface FileUploadProps {
  onUploadComplete: () => void
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setMessage('')
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setMessage('File uploaded successfully!')
      onUploadComplete()
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      onSubmit={handleSubmit}
      className="p-4 bg-gray-700"
    >
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-2 p-2 w-full text-sm text-gray-300 bg-gray-800 rounded-lg border border-gray-600 cursor-pointer focus:outline-none"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={!file || uploading}
        className="w-full p-3 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </motion.button>
      {message && <p className="mt-2 text-sm text-green-400">{message}</p>}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </motion.form>
  )
}

