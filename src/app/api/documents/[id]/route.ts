import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const userId = request.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const doc = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        owner: true,
        shares: {
          include: { user: true }
        }
      }
    })

    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const isOwner = doc.ownerId === userId
    const isShared = doc.shares.some((share: { userId: string }) => share.userId === userId)

    if (!isOwner && !isShared) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(doc)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const userId = request.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const doc = await prisma.document.findUnique({
      where: { id: params.id },
      include: { shares: true }
    })

    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const isOwner = doc.ownerId === userId
    const isShared = doc.shares.some((share: { userId: string }) => share.userId === userId)

    if (!isOwner && !isShared) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, content } = await request.json()

    const updatedDoc = await prisma.document.update({
      where: { id: params.id },
      data: { title, content }
    })

    return NextResponse.json(updatedDoc)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const userId = request.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const doc = await prisma.document.findUnique({ where: { id: params.id } })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    if (doc.ownerId !== userId) {
      return NextResponse.json({ error: 'Forbidden. Only owner can delete.' }, { status: 403 })
    }

    await prisma.document.delete({ where: { id: params.id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
