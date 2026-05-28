'use client'
import { useActionState } from 'react'
import { createItemAction, type ItemFormState } from '@/app/actions/items'

export default function ItemCreateForm() {
  const [state, formAction, pending] = useActionState<ItemFormState, FormData>(createItemAction, undefined)

  return (
    <form action={formAction} className="bg-white border rounded-lg p-5 space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">제목 *</label>
        <input name="title" required maxLength={200} className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">본문 *</label>
        <textarea name="description" required rows={6} className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">이미지 * (여러 장 가능)</label>
        <input
          name="images"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          required
          className="w-full"
        />
        <p className="text-xs text-zinc-500 mt-1">JPG / PNG / WebP, 장당 최대 5MB</p>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-zinc-900 text-white rounded px-3 py-2 hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? '등록 중... (이미지 업로드 시간이 걸릴 수 있습니다)' : '등록'}
      </button>
    </form>
  )
}
