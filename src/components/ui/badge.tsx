import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        active:
          "border-transparent bg-status-active text-status-active-foreground hover:bg-status-active/80",
        completed:
          "border-transparent bg-status-completed text-status-completed-foreground hover:bg-status-completed/80",
        failed:
          "border-transparent bg-status-failed text-status-failed-foreground hover:bg-status-failed/80",
        pending:
          "border-transparent bg-status-pending text-status-pending-foreground hover:bg-status-pending/80",
        timeout:
          "border-transparent bg-status-timeout text-status-timeout-foreground hover:bg-status-timeout/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
