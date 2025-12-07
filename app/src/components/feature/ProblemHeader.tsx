"use client"
import { Badge } from "@/components/ui/badge"
import { LatexRenderer } from "@/components/ui/LatexRenderer"
import { ChevronRight, Layers } from "lucide-react"

export function ProblemHeader({ problemId = "1" }: { problemId?: string }) {

  const problems: Record<string, { title: string; category: string; content: React.ReactNode }> = {
    "1": {
      title: "Problem 1",
      category: "Number Theory",
      content: "Let $S$ be the set of integers $n$ such that $n^2 + 2n + 1$ is divisible by 7. <br /> Find the number of elements in $S$ where $1 \\le n \\le 100$."
    },
    "2": {
      title: "Problem 2",
      category: "Calculus",
      content: "Evaluate the integral $\\int x^2 e^x dx$."
    }
  }

  const data = problems[problemId] || problems["1"]

  return (
    <div className="h-full w-full flex flex-col font-sans">
      {/* Breadcrumbs / Meta Bar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-border/40 bg-background/50 backdrop-blur-sm text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
          <Layers className="h-3.5 w-3.5" />
          <span>Original Problem</span>
        </div>
        <ChevronRight className="h-3 w-3 opacity-50" />
        <span className="text-foreground font-semibold">Current Step</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="rounded-md px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            {data.category}
          </Badge>
          <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase opacity-70">
            {data.title}
          </span>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <div className="text-lg sm:text-xl font-medium leading-relaxed text-foreground">
            <LatexRenderer>{data.content as string}</LatexRenderer>
          </div>
        </div>
      </div>
    </div>
  )
}
