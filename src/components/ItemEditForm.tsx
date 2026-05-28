'use client'
import { useActionState } from 'react'
import { updateItemAction, deleteImageAction, type ItemFormState } from '@/app/actions/items'

type Image = { id: string; url: string }

export default function ItemEditForm({
  itemId,
  initialTitle,
  initialDescription,
  images,
}: {
  itemId: string
  initialTitle: string
  initialDescription: string
  images: Image[]
}) {
  const action = updateItemAction.bind(null, itemId)
  const [state, formAction, pending] = useActionState<ItemFormState, FormData>(action, undefined)

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-5">
        <h2 className="font-bold mb-3">기존 이미지</h2>
        {images.length === 0 ? (
          <p className="text-sm text-zinc-500">이미지가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover rounded" />
                <form action={deleteImageAction.bind(null, img.id)} className="absolute top-1 right-1">
                  <button
                    type="submit"
                    className="bg-black/70 text-white text-xs rounded px-1.5 py-0.5 hover:bg-black"
                  >
                    삭제
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      <form action={formAction} className="bg-white border rounded-lg p-5 space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">제목 *</label>
          <input
            name="title"
            required
            maxLength={200}
            defaultValue={initialTitle}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">본문 *</label>
          <textarea
            name="description"
            required
            rows={6}
            defaultValue={initialDescription}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">이미지 추가 (선택)</label>
          <input
            name="images"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="w-full"
          />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-zinc-900 text-white rounded px-3 py-2 hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? '저장 중...' : '저장'}
        </button>
      </form>
    </div>
  )
}
