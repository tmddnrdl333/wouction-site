'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { bidCreateSchema, bidDeleteSchema } from '@/lib/schemas'
import { hashBidPassword, verifyBidPassword } from '@/lib/admin-auth'

export type BidFormState = { error?: string; ok?: boolean } | undefined

export async function createBidAction(itemId: string, _state: BidFormState, formData: FormData): Promise<BidFormState> {
  const amountRaw = formData.get('amount')
  const amountStr = typeof amountRaw === 'string' ? amountRaw.replace(/,/g, '').trim() : ''
  const amount = amountStr === '' ? 0 : Number(amountStr)
  const parsed = bidCreateSchema.safeParse({
    bidderName: formData.get('bidderName'),
    password: formData.get('password'),
    amount,
    comment: formData.get('comment') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || '입력값을 확인해주세요' }

  const item = await prisma.item.findUnique({ where: { id: itemId }, select: { status: true } })
  if (!item) return { error: '존재하지 않는 물건입니다' }
  if (item.status !== 'OPEN') return { error: '종료된 경매입니다' }

  const passwordHash = await hashBidPassword(parsed.data.password)
  await prisma.bid.create({
    data: {
      itemId,
      bidderName: parsed.data.bidderName,
      passwordHash,
      amount: parsed.data.amount,
      comment: parsed.data.comment || null,
    },
  })

  revalidatePath(`/items/${itemId}`)
  revalidatePath('/')
  return { ok: true }
}

export async function deleteBidAction(bidId: string, _state: BidFormState, formData: FormData): Promise<BidFormState> {
  const parsed = bidDeleteSchema.safeParse({ password: formData.get('password') })
  if (!parsed.success) return { error: '비밀번호는 숫자 4자리' }

  const bid = await prisma.bid.findUnique({ where: { id: bidId } })
  if (!bid || bid.deletedAt) return { error: '존재하지 않는 입찰' }

  const ok = await verifyBidPassword(parsed.data.password, bid.passwordHash)
  if (!ok) return { error: '비밀번호가 올바르지 않습니다' }

  await prisma.bid.update({
    where: { id: bidId },
    data: { deletedAt: new Date() },
  })

  revalidatePath(`/items/${bid.itemId}`)
  revalidatePath('/')
  return { ok: true }
}
