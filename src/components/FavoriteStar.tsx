'use client'
import { useEffect, useState } from 'react'
import { getFavorites, toggleFavorite, FAVORITES_EVENT } from '@/lib/favorites'

export default function FavoriteStar({
  itemId,
  className = '',
}: {
  itemId: string
  className?: string
}) {
  const [fav, setFav] = useState(false)

  useEffect(() => {
    const sync = () => setFav(getFavorites().includes(itemId))
    sync()
    window.addEventListener(FAVORITES_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [itemId])

  function onClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setFav(toggleFavorite(itemId))
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={fav ? '관심 해제' : '관심 등록'}
      aria-pressed={fav}
      className={`grid place-items-center h-9 w-9 rounded-full bg-white/85 backdrop-blur shadow-sm hover:bg-white transition ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={fav ? '#f59e0b' : 'none'}
        stroke={fav ? '#f59e0b' : '#78716c'}
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.9l-5.8 3.07 1.1-6.47L2.6 9.35l6.5-.95L12 2.5z" />
      </svg>
    </button>
  )
}
