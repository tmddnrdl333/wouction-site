'use client'
import { useActionState, useEffect, useState } from 'react'
import { excludeBidAction, restoreBidAction, type ModerationState } from '@/app/actions/moderation'

export default function ExcludeBidControl({ bidId, excluded }: { bidId: string; excluded: boolean }) {
  const [open, setOpen] = useState(false)
  const action = excludeBidAction.bind(null, bidId)
  const [state, formAction, pending] = useActionState<ModerationState, FormData>(action, undefined)

  useEffect(() => {
    if (state?.ok) setOpen(false)
  }, [state])

  if (excluded) {
    return (
      <form action={restoreBidAction.bind(null, bidId)}>
        <button type="submit" className="px-2 py-1 text-xs border rounded hover:bg-stone-50">
          제외 해제
        </button>
      </form>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-2 py-1 text-xs border border-orange-200 text-orange-700 rounded hover:bg-orange-50"
      >
        경매참여제한
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="bg-white rounded-lg p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-1">경매참여제한 (입찰 제외)</h3>
            <p className="text-sm text-stone-600 mb-3">제외 사유를 입력하세요. 댓글은 목록에 남되 제외 표시됩니다.</p>
            <form action={formAction} className="space-y-3">
              <textarea
                name="reason"
                required
                rows={3}
                maxLength={500}
                autoFocus
                placeholder="예: 사내 직원 아님 / 중복 입찰 / 규정 위반"
                className="w-full border rounded px-3 py-2"
              />
              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-sm border rounded hover:bg-stone-50">
                  취소
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                >
                  {pending ? '처리 중...' : '제외'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
