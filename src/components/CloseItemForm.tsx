'use client'
import { useState } from 'react'
import { closeItemAction } from '@/app/actions/items'

type Bid = { id: string; bidderName: string; amount: number; createdAt: Date }

export default function CloseItemForm({ itemId, bids }: { itemId: string; bids: Bid[] }) {
  const [selected, setSelected] = useState<string>(bids[0]?.id || '')
  const [pending, setPending] = useState(false)

  if (bids.length === 0) {
    return <p className="text-zinc-500 py-6 text-center bg-white border rounded">입찰이 없어 종료할 수 없습니다.</p>
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    if (!confirm('낙찰을 확정하면 되돌릴 수 없습니다. 진행하시겠습니까?')) return
    setPending(true)
    try {
      await closeItemAction(itemId, selected)
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border rounded-lg p-5 space-y-3">
      <h2 className="font-bold">낙찰자 선택</h2>
      <ul className="space-y-2">
        {bids.map((bid) => (
          <li key={bid.id}>
            <label className="flex items-center gap-3 p-2 border rounded cursor-pointer hover:bg-zinc-50">
              <input
                type="radio"
                name="winner"
                value={bid.id}
                checked={selected === bid.id}
                onChange={() => setSelected(bid.id)}
              />
              <div className="flex-1">
                <span className="font-medium">{bid.bidderName}</span>{' '}
                <span className="text-zinc-700">{bid.amount.toLocaleString('ko-KR')}원</span>
              </div>
            </label>
          </li>
        ))}
      </ul>
      <button
        type="submit"
        disabled={pending || !selected}
        className="w-full bg-amber-600 text-white rounded px-3 py-2 hover:bg-amber-700 disabled:opacity-50"
      >
        {pending ? '처리 중...' : '낙찰 확정 (되돌릴 수 없음)'}
      </button>
    </form>
  )
}
