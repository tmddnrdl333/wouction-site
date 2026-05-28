'use server'
import { redirect } from 'next/navigation'
import { adminLoginSchema } from '@/lib/schemas'
import { verifyAdminCredentials } from '@/lib/admin-auth'
import { createAdminSession, destroyAdminSession } from '@/lib/session'

export type LoginState = { error?: string } | undefined

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = adminLoginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: '입력값을 확인해주세요' }

  const ok = await verifyAdminCredentials(parsed.data.username, parsed.data.password)
  if (!ok) return { error: '아이디 또는 비밀번호가 올바르지 않습니다' }

  await createAdminSession(parsed.data.username)
  redirect('/admin')
}

export async function logoutAction() {
  await destroyAdminSession()
  redirect('/admin/login')
}
