'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

const SORTS = [
  { value: 'latest', label: '최신순' },
  { value: 'bids', label: '입찰 많은순' },
  { value: 'price_low', label: '제안가 낮은순' },
  { value: 'price_high', label: '제안가 높은순' },
]

export default function SearchSortBar() {
  const router = useRouter()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const sort = params.get('sort') ?? 'latest'

  function push(nextQ: string, nextSort: string) {
    const p = new URLSearchParams()
    if (nextQ.trim()) p.set('q', nextQ.trim())
    if (nextSort !== 'latest') p.set('sort', nextSort)
    const qs = p.toString()
    router.push(qs ? `/?${qs}` : '/')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-5">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          push(q, sort)
        }}
        className="flex-1 flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="제목 검색"
          className="flex-1 border border-stone-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
        />
        <button type="submit" className="px-4 py-2 rounded-lg bg-stone-800 text-white hover:bg-stone-700">
          검색
        </button>
      </form>
      <select
        value={sort}
        onChange={(e) => push(q, e.target.value)}
        className="border border-stone-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  )
}
