'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Chat } from '../components/Chat'
import { FunkyBackground } from '../components/FunkyBackground'
import { Auth } from '../components/Auth'
import { motion } from 'framer-motion'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-900">
      <FunkyBackground />
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8 text-white text-center">AI Chatbot with RAG</h1>
        {session ? (
          <>
            <Chat />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="w-full mt-4 p-3 bg-red-600 text-white rounded-lg transition-colors duration-200"
            >
              Logout
            </motion.button>
          </>
        ) : (
          <Auth />
        )}
      </div>
    </main>
  )
}