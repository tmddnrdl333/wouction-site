import Link from 'next/link'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { formatPriceOrFree } from '@/lib/format'
import SearchSortBar from '@/components/SearchSortBar'
import FavoriteStar from '@/components/FavoriteStar'
import FavoritesSection from '@/components/FavoritesSection'

export const dynamic = 'force-dynamic'

function buildOrderBy(sort: string): Prisma.ItemOrderByWithRelationInput {
  switch (sort) {
    case 'bids':
      return { bids: { _count: 'desc' } }
    case 'price_low':
      return { suggestedPrice: 'asc' }
    case 'price_high':
      return { suggestedPrice: 'desc' }
    default:
      return { createdAt: 'desc' }
  }
}

export default async function HomePage(props: PageProps<'/'>) {
  const sp = await props.searchParams
  const q = typeof sp.q === 'string' ? sp.q.trim() : ''
  const sort = typeof sp.sort === 'string' ? sp.sort : 'bids'

  const items = await prisma.item.findMany({
    where: {
      status: 'OPEN',
      ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
    },
    orderBy: buildOrderBy(sort),
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
      <FavoritesSection />
      <h1 className="text-2xl font-bold mb-4">진행 중인 경매</h1>
      <SearchSortBar />
      {items.length === 0 ? (
        <p className="text-zinc-500 py-12 text-center">
          {q ? `"${q}" 검색 결과가 없습니다.` : '진행 중인 경매가 없습니다.'}
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const topBid = item.bids[0]?.amount
            const cover = item.images[0]?.url
            return (
              <li key={item.id} className="relative">
                <FavoriteStar itemId={item.id} className="absolute top-2 left-2 z-10" />
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
