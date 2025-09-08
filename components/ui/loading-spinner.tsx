import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-slate-400", sizeClasses[size])} />
      {text && (
        <span className="ml-2 text-slate-600 dark:text-slate-300">{text}</span>
      )}
    </div>
  )
}

export function LoadingPage({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-300">{text}</p>
      </div>
    </div>
  )
}

export function LoadingCard({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8">
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-600 dark:text-slate-300">{text}</span>
      </div>
    </div>
  )
}