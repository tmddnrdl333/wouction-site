import 'server-only'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const secret = process.env.SUPABASE_SECRET_KEY

let _admin: ReturnType<typeof createClient> | null = null

export function supabaseAdmin() {
  if (!_admin) {
    if (!url || !secret) throw new Error('Supabase env not set')
    _admin = createClient(url, secret, { auth: { persistSession: false } })
  }
  return _admin
}

export const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'wouction-images'

export function publicUrl(path: string) {
  return supabaseAdmin().storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
