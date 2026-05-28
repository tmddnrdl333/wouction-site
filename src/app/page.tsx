import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPriceOrFree } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const items = await prisma.item.findMany({
    where: { status: 'OPEN' },
    orderBy: { createdAt: 'desc' },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      bids: {
        where: { deletedAt: null },
        orderBy: { amount: 'desc' },
        take: 1,
        select: { amount: true },
      },
      _count: { select: { bids: { where: { deletedAt: null } } } },
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">진행 중인 경매</h1>
      {items.length === 0 ? (
        <p className="text-zinc-500 py-12 text-center">진행 중인 경매가 없습니다.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const topBid = item.bids[0]?.amount
            const cover = item.images[0]?.url
            return (
              <li key={item.id}>
                <Link
                  href={`/items/${item.id}`}
                  className="block bg-white border rounded-lg overflow-hidden hover:shadow-md transition"
                >
                  <div className="aspect-square bg-zinc-100 overflow-hidden">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">No image</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h2 className="font-semibold truncate">{item.title}</h2>
                    <p className="text-sm text-zinc-600 mt-1">
                      {topBid != null ? (
                        <>현재 최고가 <span className="font-bold text-zinc-900">{formatPriceOrFree(topBid)}</span></>
                      ) : (
                        <span className="text-zinc-400">입찰 없음</span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">입찰 {item._count.bids}건</p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
