export function toSentenceCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^./, (char) => char.toUpperCase())
}

export function formatName(name: string | null | undefined): string {
  if (!name?.trim()) return ""

  return name
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
