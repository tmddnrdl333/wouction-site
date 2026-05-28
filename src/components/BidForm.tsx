'use client'
import { useActionState, useEffect, useRef } from 'react'
import { createBidAction, type BidFormState } from '@/app/actions/bids'

export default function BidForm({ itemId }: { itemId: string }) {
  const action = createBidAction.bind(null, itemId)
  const [state, formAction, pending] = useActionState<BidFormState, FormData>(action, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="bg-white border rounded-lg p-4 space-y-3">
      <h3 className="font-bold text-lg">입찰 등록</h3>

      <div>
        <label className="block text-sm font-medium mb-1">이름 *</label>
        <input
          name="bidderName"
          required
          maxLength={50}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          placeholder="식별 가능한 이름 (실명 또는 사내 닉네임)"
        />
        <p className="text-xs text-zinc-500 mt-1">※ 회사 사람들이 누구인지 알 수 있도록 입력해주세요.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">비밀번호 (숫자 4자리) *</label>
        <input
          name="password"
          type="password"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          placeholder="4자리"
        />
        <p className="text-xs text-zinc-500 mt-1">※ 입찰 삭제 시 동일 비밀번호가 필요합니다.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">입찰가 (원)</label>
        <input
          name="amount"
          type="number"
          min={0}
          step={1}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          placeholder="1000"
        />
        <p className="text-xs text-zinc-500 mt-1">※ 비워두면 무료로 등록됩니다.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">코멘트 (선택)</label>
        <textarea
          name="comment"
          rows={2}
          maxLength={2000}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-700">입찰 등록 완료</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-zinc-900 text-white rounded px-3 py-2 hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? '등록 중...' : '입찰하기'}
      </button>
    </form>
  )
}
