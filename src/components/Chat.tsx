'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FileUpload } from './FileUpload'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function Chat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages, sessionId, userId: user?.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch response')
      }

      const data = await response.json()
      setMessages([...newMessages, { role: 'assistant', content: data.text }])
      setSessionId(data.sessionId)
    } catch (error) {
      console.error('Error:', error)
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleFileIconClick = () => {
    setShowUpload(!showUpload)
  }

  return (
    <div className="flex flex-col w-full h-[600px] bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`p-3 rounded-lg ${
              m.role === 'user' ? 'bg-blue-600 ml-auto' : 'bg-gray-700'
            } max-w-[80%]`}
          >
            <p className="text-white">{m.content}</p>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-3 rounded-lg bg-gray-700 max-w-[80%]"
          >
            <p className="text-white">AI is typing...</p>
          </motion.div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-gray-900">
        <div className="relative flex items-center">
          <input
            className="flex-grow p-3 pr-20 bg-gray-800 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={input}
            placeholder="Ask something..."
            onChange={(e) => setInput(e.target.value)}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white rounded-full p-2"
            type="submit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white rounded-full p-2"
            type="button"
            onClick={handleFileIconClick}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>
        </div>
      </form>
      {showUpload && <FileUpload onUploadComplete={() => setShowUpload(false)} />}
    </div>
  )
}
