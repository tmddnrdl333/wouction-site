import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { readAdminSession } from './session'

export const verifyAdmin = cache(async () => {
  const session = await readAdminSession()
  if (!session?.sub) redirect('/admin/login')
  return { adminId: session.sub }
})

export const optionalAdmin = cache(async () => {
  const session = await readAdminSession()
  return session?.sub ? { adminId: session.sub } : null
})
