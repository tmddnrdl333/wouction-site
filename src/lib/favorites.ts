const KEY = 'wouction_favorites'
export const FAVORITES_EVENT = 'wouction-favorites-changed'

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function save(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(ids))
  window.dispatchEvent(new Event(FAVORITES_EVENT))
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id)
}

export function toggleFavorite(id: string): boolean {
  const cur = getFavorites()
  if (cur.includes(id)) {
    save(cur.filter((x) => x !== id))
    return false
  }
  save([...cur, id])
  return true
}
