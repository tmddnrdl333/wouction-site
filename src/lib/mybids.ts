const KEY = 'wouction_my_bids'
export const MY_BIDS_EVENT = 'wouction-mybids-changed'

export function getMyBids(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function addMyBid(id: string) {
  const cur = getMyBids()
  if (cur.includes(id)) return
  localStorage.setItem(KEY, JSON.stringify([...cur, id]))
  window.dispatchEvent(new Event(MY_BIDS_EVENT))
}
