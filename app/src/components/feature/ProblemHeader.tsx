"use client"
import { Badge } from "@/components/ui/badge"
import { LatexRenderer } from "@/components/ui/LatexRenderer"
import { ChevronRight, Layers, Loader2, AlertCircle, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

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
  onNavigate?: (index: number) => void
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
  error = null,
  onNavigate
}: ProblemHeaderProps) {

  // Check if we're viewing a subproblem
  const isSubproblem = problemStack && problemStack.length > 1

  // Use API data if available, otherwise fall back to hardcoded problems
  const displayData = problemData ? {
    title: problemData.title,
    category: problemData.category,
    content: problemData.text
  } : (fallbackProblems[problemId] || fallbackProblems["1"])

  const handleBreadcrumbClick = (index: number) => {
    if (onNavigate && problemStack && index < problemStack.length - 1) {
      onNavigate(index)
    }
  }

  // Determine if we should show the image: only if we have an image AND NO problem text
  // The user explicitly stated: "The image is not needed if the problem is extracted."
  const showImage = problemData?.imageUrl && !displayData.content;

  return (
    <div className="h-full w-full flex flex-col font-sans">
      {/* Breadcrumbs / Meta Bar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-card text-xs font-medium text-muted-foreground overflow-x-auto">
        {problemStack && problemStack.length > 0 ? (
          // Render dynamic breadcrumbs based on problem stack
          problemStack.map((item, index) => {
            const isLast = index === problemStack.length - 1
            const isClickable = !isLast && onNavigate

            return (
              <div key={item.id} className="flex items-center gap-2 shrink-0">
                {index > 0 && <ChevronRight className="h-3 w-3 opacity-50" />}
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  disabled={isLast}
                  className={cn(
                    "flex items-center gap-1 transition-colors",
                    isLast
                      ? "text-foreground font-semibold cursor-default"
                      : "hover:text-primary cursor-pointer active:scale-95"
                  )}
                >
                  {index === 0 && <Layers className="h-3.5 w-3.5" />}
                  <span>{item.isSubproblem ? `Subproblem ${index}` : 'Original Problem'}</span>
                </button>
              </div>
            )
          })
        ) : (
          // Default breadcrumbs
          <>
            <div className="flex items-center gap-1 text-foreground font-semibold">
              <Layers className="h-3.5 w-3.5" />
              <span>Original Problem</span>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {isLoading ? (
          // Loading state
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            <span className="text-sm font-medium">Loading problem...</span>
          </div>
        ) : error ? (
          // Error state - show fallback
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 text-sm p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <AlertCircle className="h-4 w-4" />
              <span>Using demo problem (database not connected)</span>
            </div>

            <ProblemCard
              category={displayData.category}
              title={displayData.title}
              content={displayData.content}
            />
          </div>
        ) : (
          // Normal display - Warm Scholar aesthetic
          <div className="space-y-5 animate-in fade-in duration-500 mx-auto max-w-4xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide uppercase bg-primary/10 text-primary border-primary/25">
                  {isSubproblem ? 'Subproblem' : displayData.category}
                </Badge>
                <span className="text-sm text-muted-foreground font-serif italic">
                  {isSubproblem ? 'Build Your Understanding' : displayData.title}
                </span>
              </div>
            </div>

            {/* Problem Card - Warm Scholar Design */}
            <div className="problem-card p-6 sm:p-8">
              <div className="prose prose-stone dark:prose-invert max-w-none">
                <div className="text-xl sm:text-2xl font-serif font-normal leading-relaxed text-foreground tracking-tight select-text">
                  <LatexRenderer>{displayData.content}</LatexRenderer>
                </div>
              </div>
            </div>

            {/* Show image ONLY if explicitly needed (e.g. no text extracted, or logic dictates) */}
            {showImage && (
              <div className="mt-6 rounded-xl overflow-hidden border border-border/50 shadow-md bg-zinc-950/5 dark:bg-zinc-900/50">
                <div className="p-3 bg-muted/30 border-b border-border/50 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <ImageIcon className="w-4 h-4" />
                  Original Image
                </div>
                <div className="p-4 flex justify-center bg-zinc-100/50 dark:bg-zinc-950/50">
                  <img
                    src={problemData.imageUrl!}
                    alt="Problem image"
                    className="max-w-full max-h-[400px] h-auto rounded-md shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ProblemCard({ category, title, content }: { category: string, title: string, content: string }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide uppercase bg-primary/10 text-primary border-primary/25">
          {category}
        </Badge>
        <span className="text-sm text-muted-foreground font-serif italic">
          {title}
        </span>
      </div>

      <div className="problem-card p-6 sm:p-8">
        <div className="prose prose-stone dark:prose-invert max-w-none">
          <div className="text-xl sm:text-2xl font-serif font-normal leading-relaxed text-foreground tracking-tight">
            <LatexRenderer>{content}</LatexRenderer>
          </div>
        </div>
      </div>
    </div>
  )
}
