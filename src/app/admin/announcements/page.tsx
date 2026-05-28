import Link from 'next/link'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/dal'
import { formatDateTime } from '@/lib/format'
import {
  createAnnouncementAction,
  toggleAnnouncementAction,
  deleteAnnouncementAction,
} from '@/app/actions/announcements'

export const dynamic = 'force-dynamic'

export default async function AnnouncementsPage() {
  await verifyAdmin()
  const list = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
        <Link href="/admin" className="text-sm text-stone-500 hover:underline">← 대시보드</Link>
      </div>

      <form action={createAnnouncementAction} className="bg-white border rounded-lg p-4 mb-6 flex gap-2">
        <input
          name="message"
          required
          maxLength={500}
          placeholder="공지 내용 입력 (헤더 하단에 흐르는 텍스트로 표시됩니다)"
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit" className="px-4 py-2 bg-stone-900 text-white rounded hover:bg-stone-700">
          추가
        </button>
      </form>

      {list.length === 0 ? (
        <p className="text-stone-500 py-12 text-center">등록된 공지가 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((a) => (
            <li
              key={a.id}
              className={`bg-white border rounded-lg p-3 flex items-center gap-3 ${a.active ? '' : 'opacity-60'}`}
            >
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  a.active ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {a.active ? '노출' : '숨김'}
              </span>
              <span className="flex-1 min-w-0 truncate">{a.message}</span>
              <span className="text-xs text-stone-400 hidden sm:inline">{formatDateTime(a.createdAt)}</span>
              <form action={toggleAnnouncementAction.bind(null, a.id, !a.active)}>
                <button type="submit" className="px-2 py-1 text-sm border rounded hover:bg-stone-50">
                  {a.active ? '숨기기' : '노출'}
                </button>
              </form>
              <form action={deleteAnnouncementAction.bind(null, a.id)}>
                <button
                  type="submit"
                  className="px-2 py-1 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50"
                >
                  삭제
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
