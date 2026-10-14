import type { ComponentProps } from "react"
import { Button } from "./ui/button"

type PageHeaderButtonProps = ComponentProps<typeof Button>

export default function PageHeaderButton({
  children,
  className,
  size = "lg",
  ...props
}: PageHeaderButtonProps) {
  return (
    <Button
      {...props}
      size={size}
      className={`shrink-0 whitespace-nowrap ${className ?? ""}`}
    >
      {children}
    </Button>
  )
}
