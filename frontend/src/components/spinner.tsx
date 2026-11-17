import type { HTMLAttributes } from "react"

type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl"

interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize
  label?: string
}

const sizes: Record<SpinnerSize, string> = {
  xs: "size-3 border-[1.5px]",
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-8 border-[3px]",
  xl: "size-12 border-4",
}

export function Spinner({
  size = "md",
  label = "Loading",
  className = "",
  ...props
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-flex shrink-0 ${className}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className={`animate-spin rounded-full border-emerald-500/20 border-t-emerald-500 ${sizes[size]}`}
      />
    </span>
  )
}
