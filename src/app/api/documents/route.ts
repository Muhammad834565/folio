import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const ownedDocuments = await prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' },
      include: { owner: true }
    })

    const sharedDocuments = await prisma.documentShare.findMany({
      where: { userId },
      include: {
        document: {
          include: { owner: true }
        }
      }
    })

    return NextResponse.json({
      owned: ownedDocuments,
      shared: sharedDocuments.map((s: { document: typeof ownedDocuments[0] }) => s.document)
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { title, content } = await request.json()

    const doc = await prisma.document.create({
      data: {
        title: title || 'Untitled Document',
        content: content || '',
        ownerId: userId
      }
    })

    return NextResponse.json(doc)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
}
