"use client"

import { useAuth } from '@/lib/AuthContext'
import { Header } from '@/components/Header'
import Editor from '@/components/Editor'
import { ShareModal } from '@/components/ShareModal'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Share2, Download, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function DocumentPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, users } = useAuth()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [isOwner, setIsOwner] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialLoadRef = useRef(true)
  const titleRef = useRef(title)
  const contentRef = useRef(content)

  // Keep refs in sync
  useEffect(() => { titleRef.current = title }, [title])
  useEffect(() => { contentRef.current = content }, [content])

  useEffect(() => {
    if (!user) return
    fetch(`/api/documents/${id}`, { headers: { 'x-user-id': user.id } })
      .then(res => {
        if (!res.ok) {
          if (res.status === 403 || res.status === 401) router.push('/dashboard')
          if (res.status === 404) router.push('/dashboard')
          throw new Error('Failed to fetch')
        }
        return res.json()
      })
      .then(data => {
        setTitle(data.title)
        setContent(data.content)
        setIsOwner(data.ownerId === user.id)
        setLoading(false)
        setTimeout(() => { initialLoadRef.current = false }, 500)
      })
      .catch(err => console.error(err))
  }, [user, id, router])

  const saveDocument = async (t: string, c: string) => {
    if (!user) return
    setSaving(true)
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ title: t, content: c })
      })
      setSaveStatus(res.ok ? 'saved' : 'error')
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const scheduleSave = (t: string, c: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => saveDocument(t, c), 1000)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setTitle(v)
    scheduleSave(v, contentRef.current)
  }

  const handleContentUpdate = (html: string) => {
    setContent(html)
    if (initialLoadRef.current) return
    scheduleSave(titleRef.current, html)
  }

  const handleDelete = async () => {
    if (!user || !isOwner) return
    if (!confirm('Permanently delete this document? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id }
      })
      if (res.ok) {
        router.push('/dashboard')
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to delete')
      }
    } catch {
      alert('Failed to delete document')
    }
  }

  const handleExportPDF = () => {
    window.print()
  }

  if (!user || loading) return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading document...</div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header is excluded from print via no-print class */}
      <div className="no-print">
        <Header />
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
        {/* Toolbar */}
        <div className="no-print flex items-center justify-between mb-5 gap-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Link
              href="/dashboard"
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Document Title"
              className="text-xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 placeholder-gray-300 min-w-0 flex-1"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Save status */}
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              saving ? 'bg-yellow-50 text-yellow-600' :
              saveStatus === 'error' ? 'bg-red-50 text-red-600' :
              'bg-green-50 text-green-600'
            }`}>
              {saving ? 'Saving…' : saveStatus === 'error' ? 'Save failed' : '✓ Saved'}
            </span>

            {/* PDF Export */}
            <button
              onClick={handleExportPDF}
              className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
              title="Export as PDF"
            >
              <Download className="w-4 h-4 mr-1.5" />
              PDF
            </button>

            {/* Share — owner only */}
            {isOwner && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
              >
                <Share2 className="w-4 h-4 mr-1.5" />
                Share
              </button>
            )}

            {/* Delete — owner only */}
            {isOwner && (
              <button
                onClick={handleDelete}
                className="flex items-center px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Print-only title */}
        <h1 className="hidden print:block text-3xl font-bold mb-6 text-gray-900">{title}</h1>

        {/* Editor */}
        <div className="flex-1">
          <Editor content={content} onUpdate={handleContentUpdate} />
        </div>
      </main>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documentId={id as string}
        currentUserId={user.id}
        users={users}
      />
    </div>
  )
}
