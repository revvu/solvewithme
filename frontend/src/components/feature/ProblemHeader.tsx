"use client"
import { Badge } from "@/components/ui/badge"

export function ProblemHeader() {
  return (
    <div className="h-full w-full p-6 overflow-y-auto font-sans">
      <div className="flex items-center gap-3 mb-4">
        <Badge variant="outline" className="text-xs font-mono">PROBLEM 14</Badge>
        <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Number Theory</span>
      </div>

      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <div className="p-6 bg-white dark:bg-zinc-800/50 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700/50">
          <p className="text-lg leading-relaxed font-serif">
            Let $S$ be the set of integers $n$ such that $n^2 + 2n + 1$ is divisible by 7.
            <br />
            Find the number of elements in $S$ where $1 \le n \le 100$.
          </p>
        </div>
      </div>
    </div>
  )
}
