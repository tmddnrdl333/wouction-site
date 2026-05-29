'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/dal'

export type ModerationState = { error?: string; ok?: boolean } | undefined

export async function excludeBidAction(
  bidId: string,
  _state: ModerationState,
  formData: FormData,
): Promise<ModerationState> {
  await verifyAdmin()
  const reason = (formData.get('reason') as string | null)?.trim() ?? ''
  if (!reason) return { error: '제외 사유를 입력해주세요' }

  const bid = await prisma.bid.findFirst({
    where: { id: bidId, deletedAt: null },
    select: { id: true, itemId: true },
  })
  if (!bid) return { error: '존재하지 않는 입찰입니다' }

  await prisma.bid.update({
    where: { id: bidId },
    data: { excludedAt: new Date(), excludeReason: reason.slice(0, 500) },
  })

  revalidatePath('/')
  revalidatePath(`/items/${bid.itemId}`)
  revalidatePath('/admin/bids')
  return { ok: true }
}

export async function restoreBidAction(bidId: string) {
  await verifyAdmin()
  const bid = await prisma.bid.findUnique({ where: { id: bidId }, select: { itemId: true } })
  if (!bid) return
  await prisma.bid.update({
    where: { id: bidId },
    data: { excludedAt: null, excludeReason: null },
  })
  revalidatePath('/')
  revalidatePath(`/items/${bid.itemId}`)
  revalidatePath('/admin/bids')
}
