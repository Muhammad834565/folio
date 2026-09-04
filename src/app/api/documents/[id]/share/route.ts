import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const userId = request.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const doc = await prisma.document.findUnique({ where: { id: params.id } })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    if (doc.ownerId !== userId) {
      return NextResponse.json({ error: 'Forbidden. Only owner can share.' }, { status: 403 })
    }

    const { targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 })
    }
    
    if (targetUserId === userId) {
      return NextResponse.json({ error: 'Cannot share with yourself' }, { status: 400 })
    }

    const share = await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: params.id,
          userId: targetUserId
        }
      },
      update: {},
      create: {
        documentId: params.id,
        userId: targetUserId
      }
    })

    return NextResponse.json(share)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to share document' }, { status: 500 })
  }
}
