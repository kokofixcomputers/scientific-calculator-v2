export interface PercentItem {
  label: string
  value: number
}

export interface PercentResult extends PercentItem {
  percent: number
}

export function percentBreakdown(items: PercentItem[]): PercentResult[] {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) return items.map(item => ({ ...item, percent: 0 }))

  return items.map(item => ({
    ...item,
    percent: (item.value / total) * 100,
  }))
}
