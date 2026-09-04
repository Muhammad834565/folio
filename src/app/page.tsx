"use client"

import Link from 'next/link'
import { FileText, Share2, Download, Zap, Shield, Users } from 'lucide-react'

const features = [
  {
    icon: <FileText className="w-6 h-6 text-indigo-400" />,
    title: 'Rich Text Editing',
    desc: 'Write with bold, italic, underline, headings, and lists powered by Tiptap — a best-in-class editor engine.',
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-400" />,
    title: 'Auto-Save',
    desc: 'Never lose work. Every keystroke is debounced and persisted to the database silently in the background.',
  },
  {
    icon: <Share2 className="w-6 h-6 text-green-400" />,
    title: 'Document Sharing',
    desc: 'Grant collaborators access to any document with one click. Distinct views for owned and shared documents.',
  },
  {
    icon: <Download className="w-6 h-6 text-pink-400" />,
    title: 'Export to PDF',
    desc: 'Export any document as a clean PDF directly from the editor with native browser print-to-PDF support.',
  },
  {
    icon: <Shield className="w-6 h-6 text-blue-400" />,
    title: 'Access Control',
    desc: 'Only document owners can share or delete. Collaborators can read and edit but cannot remove documents.',
  },
  {
    icon: <Users className="w-6 h-6 text-orange-400" />,
    title: 'File Import',
    desc: 'Import existing .txt or .md files and instantly convert them into rich, editable documents.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-7 h-7 text-indigo-400" />
          <span className="font-bold text-xl tracking-tight">DocEditor</span>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
        >
          Open App →
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 mb-8">
          ✦ Lightweight · Collaborative · Zero-Config
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none mb-6">
          Write, Share &{' '}
          <span
            className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient"
          >
            Collaborate
          </span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mb-10 leading-relaxed">
          A full-stack document editor inspired by Google Docs. Create rich documents,
          auto-save your work, share with teammates, import files, and export to PDF — all
          from a clean, minimal interface.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-base transition-colors shadow-lg shadow-indigo-500/30"
          >
            Get Started Free
          </Link>
          <a
            href="https://github.com/Muhammad834565/folio"
            className="px-8 py-3.5 border border-white/20 hover:border-white/40 rounded-xl font-semibold text-base transition-colors text-gray-300"
          >
            View Source ↗
          </a>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-6 pb-24 max-w-6xl mx-auto w-full">
        <h2 className="text-center text-3xl font-bold mb-12 text-white/90">
          Everything you need to write and collaborate
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 card-hover"
            >
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-6 text-center text-sm text-gray-600">
        Built with Next.js · Prisma · Tiptap · SQLite · Tailwind CSS
      </footer>
    </div>
  )
}
