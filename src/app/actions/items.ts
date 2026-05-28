'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/dal'
import { itemCreateSchema } from '@/lib/schemas'
import { BUCKET, publicUrl, supabaseAdmin, storagePathFromUrl, removeStorageObjects } from '@/lib/supabase'

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BYTES = 5 * 1024 * 1024

function parseSuggestedPrice(formData: FormData): number | null {
  const raw = formData.get('suggestedPrice')
  const str = typeof raw === 'string' ? raw.replace(/,/g, '').trim() : ''
  return str === '' ? null : Number(str)
}

async function uploadImages(itemId: string, files: File[]): Promise<{ url: string; sortOrder: number }[]> {
  const supa = supabaseAdmin()
  const results: { url: string; sortOrder: number }[] = []
  let order = 0
  for (const file of files) {
    if (!file || file.size === 0) continue
    if (!ALLOWED_MIME.has(file.type)) throw new Error(`지원하지 않는 이미지 형식: ${file.type}`)
    if (file.size > MAX_BYTES) throw new Error(`이미지가 5MB를 초과합니다`)
    const ext = file.type.split('/')[1]
    const path = `items/${itemId}/${randomUUID()}.${ext}`
    const buf = Buffer.from(await file.arrayBuffer())
    const { error } = await supa.storage.from(BUCKET).upload(path, buf, {
      contentType: file.type,
      upsert: false,
    })
    if (error) throw new Error(`이미지 업로드 실패: ${error.message}`)
    results.push({ url: publicUrl(path), sortOrder: order++ })
  }
  return results
}

export type ItemFormState = { error?: string } | undefined

export async function createItemAction(_state: ItemFormState, formData: FormData): Promise<ItemFormState> {
  await verifyAdmin()
  const parsed = itemCreateSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    suggestedPrice: parseSuggestedPrice(formData),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || '입력값을 확인해주세요' }
  }

  const files = formData.getAll('images') as File[]
  const itemId = randomUUID()

  let images: { url: string; sortOrder: number }[]
  try {
    images = await uploadImages(itemId, files)
  } catch (e) {
    return { error: e instanceof Error ? e.message : '이미지 업로드 오류' }
  }

  if (images.length === 0) return { error: '이미지를 최소 1장 이상 업로드해주세요' }

  await prisma.item.create({
    data: {
      id: itemId,
      title: parsed.data.title,
      description: parsed.data.description,
      suggestedPrice: parsed.data.suggestedPrice,
      images: { create: images },
    },
  })

  revalidatePath('/')
  revalidatePath('/admin')
  redirect('/admin')
}

export async function updateItemAction(itemId: string, _state: ItemFormState, formData: FormData): Promise<ItemFormState> {
  await verifyAdmin()
  const parsed = itemCreateSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    suggestedPrice: parseSuggestedPrice(formData),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || '입력값을 확인해주세요' }

  const files = formData.getAll('images') as File[]
  let newImages: { url: string; sortOrder: number }[] = []
  try {
    newImages = await uploadImages(itemId, files)
  } catch (e) {
    return { error: e instanceof Error ? e.message : '이미지 업로드 오류' }
  }

  await prisma.$transaction([
    prisma.item.update({
      where: { id: itemId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        suggestedPrice: parsed.data.suggestedPrice,
      },
    }),
    ...(newImages.length > 0
      ? [
          prisma.image.createMany({
            data: newImages.map((img) => ({ itemId, url: img.url, sortOrder: img.sortOrder })),
          }),
        ]
      : []),
  ])

  revalidatePath('/')
  revalidatePath(`/items/${itemId}`)
  revalidatePath('/admin')
  redirect('/admin')
}

export async function deleteImageAction(imageId: string) {
  await verifyAdmin()
  const img = await prisma.image.findUnique({ where: { id: imageId } })
  if (!img) return
  await prisma.image.delete({ where: { id: imageId } })
  const path = storagePathFromUrl(img.url)
  if (path) await removeStorageObjects([path])
  revalidatePath('/')
  revalidatePath(`/items/${img.itemId}`)
}

export async function closeItemAction(
  itemId: string,
  winnerBidId: string,
): Promise<{ error?: string } | void> {
  await verifyAdmin()
  const winner = await prisma.bid.findFirst({
    where: { id: winnerBidId, itemId, deletedAt: null },
    select: { id: true },
  })
  if (!winner) return { error: '유효하지 않은 낙찰 입찰입니다. 새로고침 후 다시 시도해주세요.' }

  await prisma.item.update({
    where: { id: itemId },
    data: { status: 'CLOSED', winnerBidId, closedAt: new Date() },
  })
  revalidatePath('/')
  revalidatePath('/closed')
  revalidatePath(`/items/${itemId}`)
  revalidatePath('/admin')
  redirect('/closed')
}

export async function deleteItemAction(itemId: string) {
  await verifyAdmin()
  const images = await prisma.image.findMany({ where: { itemId }, select: { url: true } })
  const paths = images.map((i) => storagePathFromUrl(i.url)).filter((p): p is string => p !== null)
  await prisma.item.delete({ where: { id: itemId } })
  if (paths.length) await removeStorageObjects(paths)
  revalidatePath('/')
  revalidatePath('/closed')
  revalidatePath('/admin')
  redirect('/admin')
}
