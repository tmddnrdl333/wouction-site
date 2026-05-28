import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPriceOrFree, formatDateTime } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function ClosedPage() {
  const items = await prisma.item.findMany({
    where: { status: 'CLOSED' },
    orderBy: { closedAt: 'desc' },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
    },
  })

  const winnerBidIds = items.map((i) => i.winnerBidId).filter(Boolean) as string[]
  const winnerBids = winnerBidIds.length
    ? await prisma.bid.findMany({ where: { id: { in: winnerBidIds } } })
    : []
  const winnerMap = new Map(winnerBids.map((b) => [b.id, b]))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">종료된 경매</h1>
      {items.length === 0 ? (
        <p className="text-zinc-500 py-12 text-center">종료된 경매가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const winner = item.winnerBidId ? winnerMap.get(item.winnerBidId) : null
            const cover = item.images[0]?.url
            return (
              <li key={item.id} className="bg-white border rounded-lg overflow-hidden flex">
                <div className="w-32 h-32 bg-zinc-100 flex-shrink-0">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">No image</div>
                  )}
                </div>
                <div className="p-3 flex-1 min-w-0">
                  <Link href={`/items/${item.id}`} className="font-semibold hover:underline">{item.title}</Link>
                  {winner ? (
                    <p className="text-sm mt-1">
                      낙찰자: <span className="font-medium">{winner.bidderName}</span>{' '}
                      <span className="text-zinc-600">({formatPriceOrFree(winner.amount)})</span>
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-500 mt-1">낙찰 정보 없음</p>
                  )}
                  <p className="text-xs text-zinc-500 mt-1">{item.closedAt && formatDateTime(item.closedAt)} 종료</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
