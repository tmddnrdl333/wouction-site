'use client'
import { useEffect, useState } from 'react'
import { getMyBids, MY_BIDS_EVENT } from '@/lib/mybids'

export default function MyTopBidBadge({ topBidId }: { topBidId: string | null }) {
  const [mine, setMine] = useState(false)

  useEffect(() => {
    if (!topBidId) {
      setMine(false)
      return
    }
    const sync = () => setMine(getMyBids().includes(topBidId))
    sync()
    window.addEventListener(MY_BIDS_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(MY_BIDS_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [topBidId])

  if (!mine) return null

  return (
    <span className="inline-block text-xs font-medium bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
      🏆 내가 최고가
    </span>
  )
}
