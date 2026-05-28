import 'server-only'
import bcrypt from 'bcryptjs'

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const envUser = process.env.ADMIN_USERNAME
  const envHash = process.env.ADMIN_PASSWORD_HASH
  if (!envUser || !envHash) return false
  if (username !== envUser) return false
  return bcrypt.compare(password, envHash)
}

export async function hashBidPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export async function verifyBidPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
