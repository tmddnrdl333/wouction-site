import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: '욱션 - 당신의 물건에게 투표하세요',
  description: '사내 약식 경매 사이트 욱션(wouction)',
}

// Supabase가 서울(ap-northeast-2)에 있으므로 서버 함수도 서울로 co-locate (DB 왕복 지연 최소화)
export const preferredRegion = 'icn1'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#faf8ef] text-stone-800">
        <header className="border-b border-stone-200 bg-[#fffdf7]/80 backdrop-blur">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-stone-900">wouction</span>
              <span className="text-xs text-stone-400">사내 경매</span>
            </Link>
            <nav className="flex gap-1 text-sm">
              <Link href="/" className="px-3 py-1.5 rounded-full hover:bg-stone-200/60 transition">
                진행 중
              </Link>
              <Link href="/closed" className="px-3 py-1.5 rounded-full hover:bg-stone-200/60 transition">
                종료된 경매
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">{children}</main>

        <footer className="border-t border-stone-200 bg-[#f4f1e6]">
          <div className="mx-auto max-w-5xl px-4 py-8 text-xs text-stone-500 space-y-2">
            <p className="font-semibold text-stone-600">우당탕탕 경매소 (주)</p>
            <p>대표이사 김경매 · 사업자등록번호 000-99-00000 (자체발급)</p>
            <p>본사 서울특별시 어딘가구 탕비실로 3, 정수기 옆 2번째 자리</p>
            <p>고객센터 1588-0000 (점심시간 12:00~13:00 및 그 외 전 시간 부재중)</p>
            <p>호스팅 옆자리 대리님 노트북 · 결제수단 무통장입금(=손에서 손으로)</p>
            <p>통신판매업신고 제2026-탕비실-001호 · 입찰가는 양심에 맡깁니다</p>
            <p className="pt-2 text-stone-400">
              © 2026 wouction. 모든 권리는 다음 회식 때 정산됩니다
              <Link href="/admin" className="ml-1 text-stone-300 hover:text-stone-500" aria-label="운영">
                ·
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
