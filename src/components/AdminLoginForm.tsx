'use client'
import { useActionState } from 'react'
import { loginAction, type LoginState } from '@/app/actions/auth'

export default function AdminLoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, undefined)

  return (
    <form action={formAction} className="space-y-3 bg-white border rounded-lg p-5 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-2">관리자 로그인</h1>
      <div>
        <label className="block text-sm font-medium mb-1">아이디</label>
        <input name="username" required className="w-full border rounded px-3 py-2" autoComplete="username" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">비밀번호</label>
        <input
          name="password"
          type="password"
          required
          className="w-full border rounded px-3 py-2"
          autoComplete="current-password"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-zinc-900 text-white rounded px-3 py-2 hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? '로그인 중...' : '로그인'}
      </button>
    </form>
  )
}
