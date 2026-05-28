'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/dal'

export async function createAnnouncementAction(formData: FormData) {
  await verifyAdmin()
  const message = (formData.get('message') as string | null)?.trim() ?? ''
  if (!message) return
  await prisma.announcement.create({ data: { message: message.slice(0, 500) } })
  revalidatePath('/', 'layout')
  revalidatePath('/admin/announcements')
}

export async function toggleAnnouncementAction(id: string, active: boolean) {
  await verifyAdmin()
  await prisma.announcement.update({ where: { id }, data: { active } })
  revalidatePath('/', 'layout')
  revalidatePath('/admin/announcements')
}

export async function deleteAnnouncementAction(id: string) {
  await verifyAdmin()
  await prisma.announcement.delete({ where: { id } })
  revalidatePath('/', 'layout')
  revalidatePath('/admin/announcements')
}
