import Link from 'next/link'
import { verifyAdmin } from '@/lib/dal'
import ItemCreateForm from '@/components/ItemCreateForm'

export default async function NewItemPage() {
  await verifyAdmin()
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">새 물건 등록</h1>
        <Link href="/admin" className="text-sm text-zinc-500 hover:underline">← 대시보드</Link>
      </div>
      <ItemCreateForm />
    </div>
  )
}
