import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'wouction_admin_session'
const SESSION_TTL_HOURS = 8

type SessionPayload = {
  sub: string
  iat?: number
  exp?: number
}

function key() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not set')
  return new TextEncoder().encode(secret)
}

export async function encryptSession(payload: SessionPayload) {
  return new SignJWT({ sub: payload.sub })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_HOURS}h`)
    .sign(key())
}

export async function decryptSession(token: string | undefined) {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'] })
    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function createAdminSession(adminId: string) {
  const token = await encryptSession({ sub: adminId })
  const expires = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires,
    path: '/',
  })
}

export async function destroyAdminSession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function readAdminSession() {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  return decryptSession(token)
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE
