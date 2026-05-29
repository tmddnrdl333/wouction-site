'use client'
import { useState } from 'react'
import { closeItemAction } from '@/app/actions/items'

export default function AwardBidControl({
  itemId,
  bidId,
  bidderName,
  defaultAmount,
}: {
  itemId: string
  bidId: string
  bidderName: string
  defaultAmount: number
}) {
  const [open, setOpen] = useState(false)
  const [price, setPrice] = useState(String(defaultAmount))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onConfirm(e: React.FormEvent) {
    e.preventDefault()
    const winningPrice = Number(price.replace(/,/g, '').trim() || '0')
    if (!Number.isInteger(winningPrice) || winningPrice < 0) {
      setError('낙찰가는 0 이상의 정수여야 합니다')
      return
    }
    setPending(true)
    setError(null)
    try {
      const res = await closeItemAction(itemId, bidId, winningPrice)
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
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-2 py-1 text-xs border border-amber-300 text-amber-800 rounded hover:bg-amber-50"
      >
        이 댓글로 낙찰
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="bg-white rounded-lg p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-1">낙찰 마감</h3>
            <p className="text-sm text-stone-600 mb-3">
              <span className="font-medium">{bidderName}</span> 님에게 낙찰하고 이 경매를 종료합니다. 되돌릴 수 없습니다.
            </p>
            <form onSubmit={onConfirm} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">실제 낙찰가 (원)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  autoFocus
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-sm border rounded hover:bg-stone-50">
                  취소
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="px-3 py-2 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
                >
                  {pending ? '처리 중...' : '낙찰 확정'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
