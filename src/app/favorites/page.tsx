'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { getFavorites, FAVORITES_EVENT } from '@/lib/favorites'
import { formatPriceOrFree } from '@/lib/format'
import FavoriteStar from '@/components/FavoriteStar'

type Item = {
  id: string
  title: string
  status: 'OPEN' | 'CLOSED'
  coverUrl: string | null
  topBid: number | null
}

export default function FavoritesPage() {
  const [items, setItems] = useState<Item[] | null>(null)

  const load = useCallback(async () => {
    const ids = getFavorites()
    if (ids.length === 0) {
      setItems([])
      return
    }
    try {
      const res = await fetch(`/api/items/by-ids?ids=${ids.join(',')}`)
      const data = await res.json()
      // localStorage 순서 유지
      const order = new Map(ids.map((id, i) => [id, i]))
      const sorted = (data.items as Item[]).sort(
        (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
      )
      setItems(sorted)
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">관심 목록</h1>
      <p className="text-sm text-stone-500 mb-4">⭐ 표시한 물건은 이 브라우저에만 저장됩니다.</p>

      {items === null ? (
        <p className="text-stone-500 py-12 text-center">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="text-stone-500 py-12 text-center">
          아직 관심 등록한 물건이 없습니다. 목록에서 ⭐를 눌러보세요.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <li key={item.id} className="relative">
              <FavoriteStar itemId={item.id} className="absolute top-2 left-2 z-10" />
              <Link
                href={`/items/${item.id}`}
                className="block bg-white border rounded-lg overflow-hidden hover:shadow-md transition"
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
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        item.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {item.status === 'OPEN' ? '진행' : '종료'}
                    </span>
                    <h2 className="font-semibold truncate">{item.title}</h2>
                  </div>
                  <p className="text-sm text-stone-600 mt-1">
                    {item.topBid != null ? (
                      <>
                        현재 최고가 <span className="font-bold text-stone-900">{formatPriceOrFree(item.topBid)}</span>
                      </>
                    ) : (
                      <span className="text-stone-400">입찰 없음</span>
                    )}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
