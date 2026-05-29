import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { optionalAdmin } from '@/lib/dal'
import { formatPriceOrFree, formatDateTime } from '@/lib/format'
import BidForm from '@/components/BidForm'
import DeleteBidDialog from '@/components/DeleteBidDialog'
import ImageGallery from '@/components/ImageGallery'
import FavoriteStar from '@/components/FavoriteStar'
import ExcludeBidControl from '@/components/ExcludeBidControl'
import AwardBidControl from '@/components/AwardBidControl'

export const dynamic = 'force-dynamic'

export default async function ItemDetailPage(props: PageProps<'/items/[id]'>) {
  const { id } = await props.params

  const [item, admin] = await Promise.all([
    prisma.item.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        bids: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
      },
    }),
    optionalAdmin(),
  ])

  if (!item) notFound()
  const isAdmin = !!admin

  const eligible = item.bids.filter((b) => !b.excludedAt)
  const topBidId = eligible.length
    ? eligible.reduce((a, b) => (b.amount > a.amount ? b : a)).id
    : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        {item.images.length > 0 ? (
          <ImageGallery urls={item.images.map((i) => i.url)} alt={item.title} />
        ) : (
          <div className="aspect-square bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400">
            No image
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              item.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-zinc-200 text-zinc-700'
            }`}
          >
            {item.status === 'OPEN' ? '진행 중' : '종료'}
          </span>
          <span className="text-xs text-zinc-500">{formatDateTime(item.createdAt)} 등록</span>
        </div>

        <div className="flex items-start gap-2">
          <h1 className="text-2xl font-bold flex-1">{item.title}</h1>
          <FavoriteStar itemId={item.id} />
        </div>
        <p className="mt-2 text-sm text-zinc-600">
          제안가격 <span className="font-semibold text-zinc-900">{formatPriceOrFree(item.suggestedPrice)}</span>
        </p>
        <div className="mt-4 whitespace-pre-wrap text-zinc-700">{item.description}</div>

        {item.status === 'OPEN' && (
          <div className="mt-6">
            <BidForm itemId={item.id} />
          </div>
        )}

        {item.status === 'CLOSED' && item.winnerBidId && (
          <div className="mt-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <h3 className="font-bold mb-1">낙찰 정보</h3>
            {(() => {
              const winner = item.bids.find((b) => b.id === item.winnerBidId)
              return winner ? (
                <>
                  <p>
                    <span className="font-medium">{winner.bidderName}</span>{' '}
                    <span className="text-zinc-700">— {formatPriceOrFree(item.winningPrice)}</span>
                  </p>
                  {item.winningReason && (
                    <p className="text-sm text-zinc-600 mt-1">사유: {item.winningReason}</p>
                  )}
                </>
              ) : (
                <p className="text-zinc-500">낙찰자 정보 없음</p>
              )
            })()}
          </div>
        )}
      </div>

      <section className="md:col-span-2">
        <h2 className="text-lg font-bold mb-3">입찰 목록 ({item.bids.length})</h2>
        {item.bids.length === 0 ? (
          <p className="text-zinc-500 py-6 text-center bg-white border rounded">아직 입찰이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {item.bids.map((bid) => {
              const isTop = bid.id === topBidId
              const excluded = !!bid.excludedAt
              return (
                <li
                  key={bid.id}
                  className={`bg-white border rounded p-3 flex items-start justify-between gap-3 ${
                    excluded ? 'border-orange-300 bg-orange-50/40 opacity-75' : isTop ? 'border-yellow-400 bg-yellow-50' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{bid.bidderName}</span>
                      <span className={`font-bold ${excluded ? 'line-through text-stone-400' : ''}`}>
                        {formatPriceOrFree(bid.amount)}
                      </span>
                      {excluded ? (
                        <span className="text-xs bg-orange-100 text-orange-800 px-1.5 rounded">경매참여제한</span>
                      ) : (
                        isTop && <span className="text-xs bg-yellow-200 text-yellow-900 px-1.5 rounded">최고가</span>
                      )}
                    </div>
                    {bid.comment && <p className="text-sm text-zinc-600 mt-1 whitespace-pre-wrap">{bid.comment}</p>}
                    {excluded && bid.excludeReason && (
                      <p className="text-xs text-orange-700 mt-1">제외 사유: {bid.excludeReason}</p>
                    )}
                    <p className="text-xs text-zinc-400 mt-1">{formatDateTime(bid.createdAt)}</p>

                    {isAdmin && (
                      <div className="flex gap-2 mt-2">
                        <ExcludeBidControl bidId={bid.id} excluded={excluded} />
                        {!excluded && item.status === 'OPEN' && (
                          <AwardBidControl
                            itemId={item.id}
                            bidId={bid.id}
                            bidderName={bid.bidderName}
                            defaultAmount={bid.amount}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  {item.status === 'OPEN' && <DeleteBidDialog bidId={bid.id} />}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="md:col-span-2">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">← 목록으로</Link>
      </div>
    </div>
  )
}
