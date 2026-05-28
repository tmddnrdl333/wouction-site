import { prisma } from '@/lib/db'

export default async function AnnouncementBar() {
  const list = await prisma.announcement.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    select: { message: true },
  })
  if (list.length === 0) return null

  const text = list.map((a) => a.message).join('   •   ')

  return (
    <div className="bg-stone-800 text-amber-50 text-sm overflow-hidden border-b border-stone-700">
      <div className="mx-auto max-w-5xl px-4">
        <div className="marquee py-2">
          <div className="marquee-track">
            <span className="px-6">📢&nbsp;&nbsp;{text}</span>
            <span className="px-6" aria-hidden="true">📢&nbsp;&nbsp;{text}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
