// KST 시간대 유틸리티 함수들
export function getKSTDate(): Date {
  const now = new Date()
  const kstOffset = 9 * 60 * 60 * 1000 // UTC+9 (9시간)
  return new Date(now.getTime() + kstOffset)
}

export function getKSTDateString(): string {
  return getKSTDate().toISOString().split('T')[0]
}

export function getKSTDateTimeString(): string {
  return getKSTDate().toISOString()
}

export function getKSTDateForPeriod(daysAgo: number): Date {
  const kstDate = getKSTDate()
  kstDate.setDate(kstDate.getDate() - daysAgo)
  return kstDate
}

export function getKSTDateStringForPeriod(daysAgo: number): string {
  return getKSTDateForPeriod(daysAgo).toISOString().split('T')[0]
}

export function isToday(dateString: string): boolean {
  return dateString === getKSTDateString()
} 