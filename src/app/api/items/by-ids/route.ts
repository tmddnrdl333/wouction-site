import { type NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('ids') ?? ''
  const ids = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => UUID_RE.test(s))
    .slice(0, 200)

  if (ids.length === 0) return Response.json({ items: [] })

  const items = await prisma.item.findMany({
    where: { id: { in: ids } },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      bids: {
        where: { deletedAt: null, excludedAt: null },
        orderBy: { amount: 'desc' },
        take: 1,
        select: { amount: true },
      },
      _count: { select: { bids: { where: { deletedAt: null } } } },
    },
  })

  const result = items.map((item) => ({
    id: item.id,
    title: item.title,
    status: item.status,
    coverUrl: item.images[0]?.url ?? null,
    topBid: item.bids[0]?.amount ?? null,
    bidCount: item._count.bids,
  }))

  return Response.json({ items: result })
}
