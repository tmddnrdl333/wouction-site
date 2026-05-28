import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/dal'
import ItemEditForm from '@/components/ItemEditForm'

export default async function EditItemPage(props: PageProps<'/admin/items/[id]/edit'>) {
  await verifyAdmin()
  const { id } = await props.params

  const item = await prisma.item.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!item) notFound()

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">물건 수정</h1>
        <Link href="/admin" className="text-sm text-zinc-500 hover:underline">← 대시보드</Link>
      </div>
      <ItemEditForm
        itemId={item.id}
        initialTitle={item.title}
        initialDescription={item.description}
        images={item.images.map((i) => ({ id: i.id, url: i.url }))}
      />
    </div>
  )
}
