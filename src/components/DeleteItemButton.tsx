'use client'
import { useState } from 'react'
import { deleteItemAction } from '@/app/actions/items'

export default function DeleteItemButton({ itemId }: { itemId: string }) {
  const [pending, setPending] = useState(false)

  async function onClick() {
    if (!confirm('이 물건을 삭제하면 입찰과 이미지까지 모두 삭제되며 되돌릴 수 없습니다. 삭제할까요?')) return
    setPending(true)
    try {
      await deleteItemAction(itemId)
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? '삭제 중...' : '삭제'}
    </button>
  )
}
