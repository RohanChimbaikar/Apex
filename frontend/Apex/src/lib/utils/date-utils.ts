const DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "2-digit",
  timeZone: "Asia/Kolkata",
})

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
})

const TIME_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
})

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
})

function parseDate(value: string | Date | null | undefined): Date | null {
  if (value == null || value === "") return null

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

/** 2026-10-12T22:04:00+05:30 → 12/10/26 */
export function formatDate(value: string | Date | null | undefined): string {
  const date = parseDate(value)
  if (!date) return "—"

  return DATE_FORMATTER.format(date).replace(/\//g, "-")
}
/** → 12 Oct 2026, 10:04 PM */
export function formatDateTime(
  value: string | Date | null | undefined
): string {
  const date = parseDate(value)
  if (!date) return "—"

  return DATE_TIME_FORMATTER.format(date)
}

/** → 10:04 PM */
export function formatTime(value: string | Date | null | undefined): string {
  const date = parseDate(value)
  if (!date) return "—"

  return TIME_FORMATTER.format(date)
}

/** → 12 October 2026 */
export function formatLongDate(
  value: string | Date | null | undefined
): string {
  const date = parseDate(value)
  if (!date) return "—"

  return LONG_DATE_FORMATTER.format(date)
}

/** Checks whether a date is before the current time. */
export function isOverdue(value: string | Date | null | undefined): boolean {
  const date = parseDate(value)
  return date !== null && date.getTime() < Date.now()
}

/** Returns the number of whole days until a deadline. */
export function getDaysUntil(
  value: string | Date | null | undefined
): number | null {
  const date = parseDate(value)
  if (!date) return null

  const millisecondsPerDay = 24 * 60 * 60 * 1000

  return Math.ceil((date.getTime() - Date.now()) / millisecondsPerDay)
}
