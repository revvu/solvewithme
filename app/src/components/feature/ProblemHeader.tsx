"use client"
import { Badge } from "@/components/ui/badge"
import { LatexRenderer } from "@/components/ui/LatexRenderer"
import { ChevronRight, Layers, Loader2, AlertCircle } from "lucide-react"

interface ProblemStackItem {
  id: string
  title: string
  isSubproblem: boolean
}

interface ProblemData {
  id: string
  text: string
  category: string
  title: string
  imageUrl: string | null
  isSubproblem: boolean
  targetInsight?: string
}

interface ProblemHeaderProps {
  problemId?: string
  problemStack?: ProblemStackItem[]
  problemData?: ProblemData | null
  isLoading?: boolean
  error?: string | null
}

// Fallback problems for demo/testing when database is not available
const fallbackProblems: Record<string, { title: string; category: string; content: string }> = {
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

export function ProblemHeader({
  problemId = "1",
  problemStack,
  problemData,
  isLoading = false,
  error = null
}: ProblemHeaderProps) {

  // Check if we're viewing a subproblem
  const isSubproblem = problemStack && problemStack.length > 1

  // Use API data if available, otherwise fall back to hardcoded problems
  const displayData = problemData ? {
    title: problemData.title,
    category: problemData.category,
    content: problemData.text
  } : (fallbackProblems[problemId] || fallbackProblems["1"])

  return (
    <div className="h-full w-full flex flex-col font-sans">
      {/* Breadcrumbs / Meta Bar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-border/40 bg-background/50 backdrop-blur-sm text-xs font-medium text-muted-foreground overflow-x-auto">
        {problemStack && problemStack.length > 0 ? (
          // Render dynamic breadcrumbs based on problem stack
          problemStack.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2 shrink-0">
              {index > 0 && <ChevronRight className="h-3 w-3 opacity-50" />}
              <div className={`flex items-center gap-1 ${index === problemStack.length - 1 ? 'text-foreground font-semibold' : 'hover:text-primary transition-colors cursor-pointer'}`}>
                {index === 0 && <Layers className="h-3.5 w-3.5" />}
                <span>{item.isSubproblem ? `Subproblem ${index}` : 'Original Problem'}</span>
              </div>
            </div>
          ))
        ) : (
          // Default breadcrumbs
          <>
            <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
              <Layers className="h-3.5 w-3.5" />
              <span>Original Problem</span>
            </div>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span className="text-foreground font-semibold">Current Step</span>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          // Loading state
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm">Loading problem...</span>
          </div>
        ) : error ? (
          // Error state - show fallback
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Using demo problem (database not connected)</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="rounded-md px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                {displayData.category}
              </Badge>
              <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase opacity-70">
                {displayData.title}
              </span>
            </div>
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <div className="text-lg sm:text-xl font-medium leading-relaxed text-foreground">
                <LatexRenderer>{displayData.content}</LatexRenderer>
              </div>
            </div>
          </div>
        ) : (
          // Normal display
          <>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="rounded-md px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                {isSubproblem ? 'Subproblem' : displayData.category}
              </Badge>
              <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase opacity-70">
                {isSubproblem ? 'Build Your Understanding' : displayData.title}
              </span>
            </div>

            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <div className="text-lg sm:text-xl font-medium leading-relaxed text-foreground">
                <LatexRenderer>{displayData.content}</LatexRenderer>
              </div>
            </div>

            {/* Show image if available */}
            {problemData?.imageUrl && (
              <div className="mt-4 rounded-lg overflow-hidden border border-border/50">
                <img
                  src={problemData.imageUrl}
                  alt="Problem image"
                  className="max-w-full h-auto"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
