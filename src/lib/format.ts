export function formatWon(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원'
}

export function formatPriceOrFree(amount: number | null | undefined): string {
  if (amount == null || amount === 0) return '무료'
  return formatWon(amount)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
