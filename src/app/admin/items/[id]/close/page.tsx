import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/dal'
import CloseItemForm from '@/components/CloseItemForm'

export default async function CloseItemPage(props: PageProps<'/admin/items/[id]/close'>) {
  await verifyAdmin()
  const { id } = await props.params

  const item = await prisma.item.findUnique({
    where: { id },
    include: { bids: { where: { deletedAt: null, excludedAt: null }, orderBy: { amount: 'desc' } } },
  })
  if (!item) notFound()
  if (item.status === 'CLOSED') redirect(`/items/${item.id}`)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">경매 종료 — {item.title}</h1>
        <Link href="/admin" className="text-sm text-zinc-500 hover:underline">← 대시보드</Link>
      </div>
      <CloseItemForm itemId={item.id} bids={item.bids} />
    </div>
  )
}
