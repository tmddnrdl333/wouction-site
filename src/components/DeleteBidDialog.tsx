'use client'
import { useActionState, useState } from 'react'
import { deleteBidAction, type BidFormState } from '@/app/actions/bids'

export default function DeleteBidDialog({ bidId }: { bidId: string }) {
  const [open, setOpen] = useState(false)
  const action = deleteBidAction.bind(null, bidId)
  const [state, formAction, pending] = useActionState<BidFormState, FormData>(action, undefined)

  if (state?.ok && open) {
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-red-600 hover:underline"
      >
        삭제
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-lg p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-3">입찰 삭제</h3>
            <p className="text-sm text-zinc-600 mb-3">등록 시 입력한 4자리 비밀번호를 입력해주세요.</p>
            <form action={formAction} className="space-y-3">
              <input
                name="password"
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                required
                autoFocus
                className="w-full border rounded px-3 py-2"
              />
              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 text-sm border rounded hover:bg-zinc-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {pending ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
