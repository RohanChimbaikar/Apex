export function getTodayDate(): string {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function isOverdue(dueDate: string): boolean {
  return dueDate < getTodayDate()
}

export function isDueToday(dueDate: string): boolean {
  return dueDate === getTodayDate()
}

export function isUpcoming(dueDate: string): boolean {
  return dueDate > getTodayDate()
}
