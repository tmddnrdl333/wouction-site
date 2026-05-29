import Link from 'next/link'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/dal'
import { formatPriceOrFree, formatDateTime } from '@/lib/format'
import ExcludeBidControl from '@/components/ExcludeBidControl'
import AwardBidControl from '@/components/AwardBidControl'

export const dynamic = 'force-dynamic'

export default async function AdminBidsPage() {
  await verifyAdmin()

  const bids = await prisma.bid.findMany({
    orderBy: { createdAt: 'desc' },
    include: { item: { select: { id: true, title: true, status: true } } },
  })

  const active = bids.filter((b) => !b.deletedAt && !b.excludedAt).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">댓글(입찰) 모아보기</h1>
        <Link href="/admin" className="text-sm text-stone-500 hover:underline">← 대시보드</Link>
      </div>

      <p className="text-sm text-stone-500 mb-3">
        전체 {bids.length}건 · 유효 {active}건 · 삭제/제외 {bids.length - active}건
      </p>

      {bids.length === 0 ? (
        <p className="text-stone-500 py-12 text-center">등록된 입찰이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {bids.map((bid) => {
            const excluded = !!bid.excludedAt
            const deleted = !!bid.deletedAt
            return (
              <li
                key={bid.id}
                className={`bg-white border rounded-lg p-3 ${deleted || excluded ? 'opacity-70' : ''} ${
                  excluded ? 'border-orange-300 bg-orange-50/40' : ''
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{bid.bidderName}</span>
                  <span className="font-bold">{formatPriceOrFree(bid.amount)}</span>
                  {excluded && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-1.5 rounded">경매참여제한</span>
                  )}
                  {deleted && <span className="text-xs bg-red-100 text-red-700 px-1.5 rounded">삭제됨</span>}
                  <Link
                    href={`/items/${bid.item.id}`}
                    className="text-xs text-stone-500 hover:underline ml-auto truncate max-w-[40%]"
                  >
                    {bid.item.title}
                  </Link>
                </div>

                {bid.comment && <p className="text-sm text-stone-600 mt-1 whitespace-pre-wrap">{bid.comment}</p>}
                {excluded && bid.excludeReason && (
                  <p className="text-xs text-orange-700 mt-1">제외 사유: {bid.excludeReason}</p>
                )}
                <p className="text-xs text-stone-400 mt-1">{formatDateTime(bid.createdAt)}</p>

                {!deleted && (
                  <div className="flex gap-2 mt-2">
                    <ExcludeBidControl bidId={bid.id} excluded={excluded} />
                    {!excluded && bid.item.status === 'OPEN' && (
                      <AwardBidControl
                        itemId={bid.item.id}
                        bidId={bid.id}
                        bidderName={bid.bidderName}
                        defaultAmount={bid.amount}
                      />
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
