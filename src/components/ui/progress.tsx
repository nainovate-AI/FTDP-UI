import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  showPercentage?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showPercentage = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div className="space-y-2">
        {showPercentage && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(
            "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
            className
          )}
          {...props}
        >
          <div
            className="h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out"
            style={{ transform: `translateX(-${100 - percentage}%)` }}
          />
        </div>
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
