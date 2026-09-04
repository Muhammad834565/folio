"use client"

import { useAuth } from '@/lib/AuthContext'
import { Header } from '@/components/Header'
import { FilePlus, Upload, FileText, Users, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Document = {
  id: string
  title: string
  owner: { name: string }
  updatedAt: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [ownedDocs, setOwnedDocs] = useState<Document[]>([])
  const [sharedDocs, setSharedDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDocs = useCallback(() => {
    if (!user) return
    setLoading(true)
    fetch('/api/documents', { headers: { 'x-user-id': user.id } })
      .then(res => res.json())
      .then(data => {
        setOwnedDocs(data.owned || [])
        setSharedDocs(data.shared || [])
        setLoading(false)
      })
      .catch(err => { console.error(err); setLoading(false) })
  }, [user])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const handleCreateDocument = async () => {
    if (!user) return
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ title: 'Untitled Document', content: '' })
      })
      const data = await res.json()
      router.push(`/docs/${data.id}`)
    } catch { alert('Failed to create document') }
  }

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user || !confirm('Delete this document? This cannot be undone.')) return
    setDeletingId(docId)
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id }
      })
      if (res.ok) {
        setOwnedDocs(prev => prev.filter(d => d.id !== docId))
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to delete document')
      }
    } catch { alert('Failed to delete document') }
    finally { setDeletingId(null) }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const title = file.name.replace(/\.[^/.]+$/, '')
    const htmlContent = text.split('\n').map(line => `<p>${line || '<br/>'}</p>`).join('')
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ title, content: htmlContent })
      })
      const data = await res.json()
      router.push(`/docs/${data.id}`)
    } catch { alert('Failed to import document') }
    // reset input so same file can be re-uploaded
    e.target.value = ''
  }

  if (!user) return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-pulse text-lg text-gray-400">Loading...</div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, <span className="text-indigo-600 font-medium">{user.name}</span></p>
          </div>
          <div className="flex space-x-3">
            <input type="file" accept=".txt,.md" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-300 transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import .txt / .md
            </button>
            <button
              onClick={handleCreateDocument}
              className="flex items-center px-4 py-2.5 bg-indigo-600 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <FilePlus className="w-4 h-4 mr-2" />
              New Document
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* My Documents */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                My Documents
                <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 rounded-full px-2 py-0.5">{ownedDocs.length}</span>
              </h2>
              {ownedDocs.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No documents yet</p>
                  <p className="text-gray-400 text-sm mt-1">Click &ldquo;New Document&rdquo; to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ownedDocs.map(doc => (
                    <Link href={`/docs/${doc.id}`} key={doc.id} className="group">
                      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-indigo-300 transition-all h-full flex flex-col justify-between card-hover relative">
                        <div className="pr-8">
                          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
                            <FileText className="w-4 h-4 text-indigo-500" />
                          </div>
                          <h3 className="font-semibold text-gray-900 truncate">{doc.title}</h3>
                          <p className="text-xs text-gray-400 mt-1">
                            Updated {new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        {/* Delete button */}
                        <button
                          onClick={(e) => handleDelete(doc.id, e)}
                          disabled={deletingId === doc.id}
                          className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Shared with Me */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-emerald-500" />
                Shared with Me
                <span className="ml-2 text-xs bg-emerald-100 text-emerald-600 rounded-full px-2 py-0.5">{sharedDocs.length}</span>
              </h2>
              {sharedDocs.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Nothing shared yet</p>
                  <p className="text-gray-400 text-sm mt-1">Documents shared with you will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sharedDocs.map(doc => (
                    <Link href={`/docs/${doc.id}`} key={doc.id}>
                      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-emerald-300 transition-all h-full card-hover">
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                          <Users className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">{doc.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Owned by <span className="text-gray-600 font-medium">{doc.owner?.name}</span>
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
