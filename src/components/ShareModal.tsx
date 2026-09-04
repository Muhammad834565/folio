"use client"

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { User } from '@/lib/AuthContext'

export function ShareModal({ 
  isOpen, 
  onClose, 
  documentId, 
  currentUserId,
  users 
}: { 
  isOpen: boolean
  onClose: () => void
  documentId: string
  currentUserId: string
  users: User[]
}) {
  const [targetUserId, setTargetUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleShare = async () => {
    if (!targetUserId) return
    setLoading(true)
    setSuccess(false)
    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        },
        body: JSON.stringify({ targetUserId })
      })
      
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          onClose()
        }, 1500)
      } else {
        alert("Failed to share document")
      }
    } catch (err) {
      console.error(err)
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const availableUsers = users.filter(u => u.id !== currentUserId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Share Document</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
          <select 
            className="w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
          >
            <option value="" disabled>Select someone to share with...</option>
            {availableUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={handleShare}
            disabled={!targetUserId || loading || success}
            className={`flex items-center px-4 py-2 rounded-md text-white font-medium shadow-sm ${
              success ? 'bg-green-600' : loading || !targetUserId ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            } transition-colors`}
          >
            {success ? (
              <><Check className="w-4 h-4 mr-2" /> Shared</>
            ) : loading ? (
              'Sharing...'
            ) : (
              'Share'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
