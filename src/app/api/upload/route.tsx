'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FileUpload } from '../../../components/FileUpload'

export function Chat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages, sessionId }),
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
    <div className="flex flex-col w-full max-w-md mx-auto h-[600px] bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`p-2 rounded-lg ${
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
            className="p-2 rounded-lg bg-gray-700 max-w-[80%]"
          >
            <p className="text-white">AI is typing...</p>
          </motion.div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-gray-900">
        <div className="relative flex items-center

