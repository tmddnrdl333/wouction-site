'use client'
import { useState } from 'react'
import { closeItemAction } from '@/app/actions/items'

type Bid = { id: string; bidderName: string; amount: number; createdAt: Date }

export default function CloseItemForm({ itemId, bids }: { itemId: string; bids: Bid[] }) {
  const [selected, setSelected] = useState<string>(bids[0]?.id || '')
  const [price, setPrice] = useState<string>(bids[0] ? String(bids[0].amount) : '0')
  const [reason, setReason] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (bids.length === 0) {
    return <p className="text-zinc-500 py-6 text-center bg-white border rounded">입찰이 없어 종료할 수 없습니다.</p>
  }

  function selectBid(bid: Bid) {
    setSelected(bid.id)
    setPrice(String(bid.amount))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    const winningPrice = Number(price.replace(/,/g, '').trim() || '0')
    if (!Number.isInteger(winningPrice) || winningPrice < 0) {
      setError('낙찰가는 0 이상의 정수여야 합니다')
      return
    }
    if (!reason.trim()) {
      setError('낙찰 사유를 입력해주세요')
      return
    }
    if (!confirm(`낙찰가 ${winningPrice.toLocaleString('ko-KR')}원으로 확정합니다. 되돌릴 수 없습니다. 진행할까요?`)) return
    setPending(true)
    setError(null)
    try {
      const res = await closeItemAction(itemId, selected, winningPrice, reason)
      if (res?.error) {
        setError(res.error)
        setPending(false)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다')
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border rounded-lg p-5 space-y-3">
      <h2 className="font-bold">낙찰자 선택</h2>
      <p className="text-xs text-stone-500">※ 제외(경매참여제한)된 입찰은 목록에 나오지 않습니다.</p>
      <ul className="space-y-2">
        {bids.map((bid) => (
          <li key={bid.id}>
            <label className="flex items-center gap-3 p-2 border rounded cursor-pointer hover:bg-zinc-50">
              <input
                type="radio"
                name="winner"
                value={bid.id}
                checked={selected === bid.id}
                onChange={() => selectBid(bid)}
              />
              <div className="flex-1">
                <span className="font-medium">{bid.bidderName}</span>{' '}
                <span className="text-zinc-700">{bid.amount > 0 ? bid.amount.toLocaleString('ko-KR') + '원' : '무료'}</span>
              </div>
            </label>
          </li>
        ))}
      </ul>

      <div>
        <label className="block text-sm font-medium mb-1">실제 낙찰가 (원)</label>
        <input
          type="number"
          min={0}
          step={1}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <p className="text-xs text-stone-500 mt-1">선택한 입찰가가 기본값입니다. 직접 수정할 수 있습니다.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">낙찰 사유</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          rows={2}
          maxLength={500}
          placeholder="예: 최고가 입찰 / 협의 완료"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
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
