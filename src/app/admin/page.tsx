import Link from 'next/link'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/dal'
import { formatDateTime } from '@/lib/format'
import { logoutAction } from '@/app/actions/auth'
import DeleteItemButton from '@/components/DeleteItemButton'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  await verifyAdmin()

  const items = await prisma.item.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      _count: { select: { bids: { where: { deletedAt: null } } } },
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/bids"
            className="px-3 py-2 text-sm border rounded hover:bg-zinc-50"
          >
            댓글 모아보기
          </Link>
          <Link
            href="/admin/items/new"
            className="px-3 py-2 text-sm bg-zinc-900 text-white rounded hover:bg-zinc-700"
          >
            새 물건 등록
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="px-3 py-2 text-sm border rounded hover:bg-zinc-50">
              로그아웃
            </button>
          </form>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-zinc-500 py-12 text-center">등록된 물건이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const cover = item.images[0]?.url
            return (
              <li key={item.id} className="bg-white border rounded-lg p-3 flex gap-3 items-center">
                <div className="w-16 h-16 bg-zinc-100 rounded flex-shrink-0">
                  {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt={item.title} className="w-full h-full object-cover rounded" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        item.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {item.status === 'OPEN' ? '진행' : '종료'}
                    </span>
                    <Link href={`/items/${item.id}`} className="font-medium hover:underline truncate">
                      {item.title}
                    </Link>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    입찰 {item._count.bids}건 · {formatDateTime(item.createdAt)}
                  </p>
                </div>
                <div className="flex gap-1 text-sm">
                  <Link
                    href={`/admin/items/${item.id}/edit`}
                    className="px-2 py-1 border rounded hover:bg-zinc-50"
                  >
                    수정
                  </Link>
                  {item.status === 'OPEN' && (
                    <Link
                      href={`/admin/items/${item.id}/close`}
                      className="px-2 py-1 border rounded hover:bg-zinc-50 text-amber-700"
                    >
                      종료
                    </Link>
                  )}
                  <DeleteItemButton itemId={item.id} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
