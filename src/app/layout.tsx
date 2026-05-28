import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'wouction — 사내 약식 경매',
  description: '사내 약식 경매 사이트',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              wouction
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/" className="hover:underline">진행 중</Link>
              <Link href="/closed" className="hover:underline">종료</Link>
              <Link href="/admin" className="hover:underline text-zinc-500">관리자</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 text-xs text-zinc-500">
            사내 약식 경매 · 입찰 시 식별 가능한 이름을 입력해주세요
          </div>
        </footer>
      </body>
    </html>
  )
}
