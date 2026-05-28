'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { getFavorites, FAVORITES_EVENT } from '@/lib/favorites'
import { formatPriceOrFree } from '@/lib/format'
import FavoriteStar from '@/components/FavoriteStar'
import MyTopBidBadge from '@/components/MyTopBidBadge'

type Item = {
  id: string
  title: string
  status: 'OPEN' | 'CLOSED'
  coverUrl: string | null
  topBid: number | null
  topBidId: string | null
  bidCount: number
}

export default function FavoritesSection() {
  const [items, setItems] = useState<Item[]>([])

  const load = useCallback(async () => {
    const ids = getFavorites()
    if (ids.length === 0) {
      setItems([])
      return
    }
    try {
      const res = await fetch(`/api/items/by-ids?ids=${ids.join(',')}`)
      const data = await res.json()
      const order = new Map(ids.map((id, i) => [id, i]))
      // 진행 중인 관심 물건만, 관심 등록 순서대로
      const open = (data.items as Item[])
        .filter((it) => it.status === 'OPEN')
        .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
      setItems(open)
    } catch {
      setItems([])
    }
  }, [])

  useEffect(() => {
    load()
    window.addEventListener(FAVORITES_EVENT, load)
    window.addEventListener('storage', load)
    return () => {
      window.removeEventListener(FAVORITES_EVENT, load)
      window.removeEventListener('storage', load)
    }
  }, [load])

  if (items.length === 0) return null

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-1.5">
        <span className="text-amber-500">⭐</span> 관심 목록
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <li key={item.id} className="relative">
            <FavoriteStar itemId={item.id} className="absolute top-2 left-2 z-10" />
            <Link
              href={`/items/${item.id}`}
              className="block bg-white border border-amber-200 rounded-lg overflow-hidden hover:shadow-md transition"
            >
              <div className="aspect-square bg-stone-100 overflow-hidden">
                {item.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-stone-400">No image</div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold truncate">{item.title}</h3>
                <p className="text-sm text-stone-600 mt-1">
                  {item.topBid != null ? (
                    <>
                      현재 최고가 <span className="font-bold text-stone-900">{formatPriceOrFree(item.topBid)}</span>
                    </>
                  ) : (
                    <span className="text-stone-400">입찰 없음</span>
                  )}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-stone-500">입찰 {item.bidCount}건</span>
                  <MyTopBidBadge topBidId={item.topBidId} />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="border-b border-stone-200 mt-8" />
    </section>
  )
}
