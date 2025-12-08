"use client"
import { Button } from "@/components/ui/button"
import { UploadCloud, History, ArrowRight, BrainCircuit, Check, Loader2, Sparkles, Image as ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useRef, useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/format-time"

interface RecentProblem {
  id: string;
  title: string;
  category: string;
  status: string;
  lastActiveAt: string;
  createdAt: string;
}
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useToast } from "@/components/ui/toast"

export default function Home() {
  const router = useRouter()
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [inputText, setInputText] = useState("")
  const [pastedImage, setPastedImage] = useState<File | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [recentProblems, setRecentProblems] = useState<RecentProblem[]>([])
  const [isLoadingRecent, setIsLoadingRecent] = useState(true)

  // Fetch recent problems on mount
  useEffect(() => {
    async function fetchRecentProblems() {
      try {
        const response = await fetch('/api/recent-problems?limit=5')
        if (response.ok) {
          const data = await response.json()
          setRecentProblems(data.problems)
        }
      } catch (error) {
        console.error('Failed to fetch recent problems:', error)
      } finally {
        setIsLoadingRecent(false)
      }
    }
    fetchRecentProblems()
  }, [])

  // Helper to get category abbreviation for card badge
  const getCategoryAbbreviation = (category: string): string => {
    const abbreviations: Record<string, string> = {
      'Number Theory': 'NUM',
      'Calculus': 'CALC',
      'Algebra': 'ALG',
      'Geometry': 'GEO',
      'Combinatorics': 'COMB',
      'Probability': 'PROB',
      'Statistics': 'STAT',
      'General': 'GEN',
    };
    return abbreviations[category] || category.substring(0, 4).toUpperCase();
  };

  // Auto-focus textarea on load
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData?.items) {
      const items = Array.from(e.clipboardData.items)
      const imageItem = items.find(item => item.type.startsWith('image/'))

      if (imageItem) {
        e.preventDefault()
        const file = imageItem.getAsFile()
        if (file) {
          setPastedImage(file)
          addToast('Image added', 'success', 2000)
        }
      }
    }
  }

  const [uploadError, setUploadError] = useState<string | null>(null)

  // Convert file to base64 data URL
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleUploadProcess = async () => {
    if (!inputText.trim() && !pastedImage) return

    setIsUploading(true)
    setUploadError(null)

    try {
      let imageUrl: string | null = null
      let text: string | null = inputText.trim() || null

      // Convert image to base64 data URL if present
      if (pastedImage) {
        imageUrl = await fileToDataURL(pastedImage)
      }

      // Call the ingest API
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          text: imageUrl ? null : text, // Only send text if no image
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process problem')
      }

      const data = await response.json()

      setIsUploading(false)
      setUploadSuccess(true)
      addToast('Problem analyzed successfully!', 'success')

      // Navigate to solve page with the new problem ID
      setTimeout(() => {
        router.push(`/solve/${data.problemId}`)
      }, 500)
    } catch (error) {
      console.error('Upload error:', error)
      setIsUploading(false)
      const errorMessage = error instanceof Error ? error.message : 'Failed to process problem'
      setUploadError(errorMessage)
      addToast(errorMessage, 'error')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPastedImage(e.target.files[0])
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files[0] && files[0].type.startsWith('image/')) {
      setPastedImage(files[0])
      addToast('Image added', 'success', 2000)
    }
  }, [addToast])

  // Keyboard shortcut for submit (Cmd/Ctrl + Enter)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (inputText.trim() || pastedImage) {
        handleUploadProcess()
      }
    }
  }, [inputText, pastedImage])

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30 overflow-x-hidden relative">

      {/* Warm Scholar Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-background to-background dark:from-amber-950/10 dark:via-background dark:to-background" />
        <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-400/8 dark:bg-amber-500/5 blur-[120px]" />
        <div className="absolute inset-0 bg-dot-pattern text-stone-300/20 dark:text-stone-700/15" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-border/50 bg-card/60 px-6 sm:px-10 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-amber-600 text-white shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
            <BrainCircuit className="h-6 w-6" />
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground transition-all group-hover:text-primary">
            SolveWithMe
          </h1>
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-16 sm:px-12 min-h-[calc(100vh-80px)]">

        <div className="w-full max-w-4xl flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase border border-primary/20 mb-2">
              <Sparkles className="w-3 h-3" /> AI-Powered Math Tutoring
            </div>
            <h2 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-foreground">
              Master Math, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-600">
                Not Just Answers.
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Type your question, paste an image, or upload a screenshot. <br />
              Your personal AI tutor is ready to help you find the "Aha!" moment.
            </p>
          </div>

          {/* Hybrid Input Area */}
          <div
            className="w-full max-w-2xl mx-auto relative group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className={cn(
              "absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-primary/60 to-amber-500/60 opacity-20 blur-xl transition-opacity duration-500 group-hover:opacity-40",
              (inputText || pastedImage) && "opacity-40",
              isDragging && "opacity-60"
            )} />

            <div className={cn(
              "relative glass-panel rounded-[1.5rem] p-2 transition-all duration-300 shadow-2xl",
              isDragging && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}>
              <div className="rounded-[1.25rem] bg-card/60 backdrop-blur-xl border border-white/5 overflow-hidden flex flex-col relative">

                {/* Drag overlay */}
                {isDragging && (
                  <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center z-10 rounded-[1.25rem]">
                    <div className="flex flex-col items-center gap-2 text-primary">
                      <UploadCloud className="h-10 w-10 animate-bounce" />
                      <span className="font-semibold">Drop image here</span>
                    </div>
                  </div>
                )}

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a math problem or paste/drop an image..."
                  className="w-full min-h-[140px] bg-transparent border-0 p-6 text-lg placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-0"
                />

                {/* Attachment Preview */}
                {pastedImage && (
                  <div className="px-6 pb-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="relative inline-block group/image">
                      <div className="h-20 w-20 rounded-lg overflow-hidden border border-white/10 shadow-md">
                        <img src={URL.createObjectURL(pastedImage)} alt="Pasted" className="h-full w-full object-cover" />
                      </div>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg opacity-0 group-hover/image:opacity-100 transition-opacity"
                        onClick={() => setPastedImage(null)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {uploadError && (
                  <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-red-500 text-sm">
                    {uploadError}
                  </div>
                )}

                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-t border-white/5">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground hover:bg-white/10 gap-2 h-9 px-3 rounded-full"
                      onClick={handleUploadClick}
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Add Image</span>
                    </Button>
                  </div>

                  <Button
                    onClick={handleUploadProcess}
                    disabled={(!inputText.trim() && !pastedImage) || isUploading || uploadSuccess}
                    className={cn(
                      "h-10 px-6 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-primary/20",
                      (inputText.trim() || pastedImage) ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground hover:bg-muted"
                    )}
                    title="Submit (⌘+Enter)"
                  >
                    {isUploading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing...</span>
                      </div>
                    ) : uploadSuccess ? (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        <span>Ready!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Solve</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="max-w-2xl mx-auto w-full space-y-6 pt-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <History className="h-4 w-4" /> Continue Learning
              </h3>
              {recentProblems.length > 0 && (
                <Link href="/problems" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium hover:underline underline-offset-4">
                  View All
                </Link>
              )}
            </div>

            <div className="grid gap-4">
              {isLoadingRecent ? (
                // Loading skeleton
                <>
                  {[1, 2].map((i) => (
                    <div key={i} className="rounded-xl bg-card border border-border p-5 flex items-center gap-5 animate-pulse shadow-sm">
                      <div className="h-14 w-14 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-48 bg-muted rounded" />
                        <div className="h-3 w-32 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </>
              ) : recentProblems.length === 0 ? (
                // Empty state
                <div className="rounded-xl bg-card border border-border border-dashed p-8 text-center shadow-sm">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary/15 to-amber-500/15 flex items-center justify-center mx-auto mb-4 ring-1 ring-inset ring-border">
                    <History className="h-6 w-6 text-primary/50" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">No problems yet</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload your first math problem above to get started!
                  </p>
                </div>
              ) : (
                // Problem cards
                recentProblems.map((problem) => (
                  <Link key={problem.id} href={`/solve/${problem.id}`}>
                    <div className="group relative overflow-hidden rounded-xl bg-card border border-border hover:bg-card/95 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 p-5 flex items-center gap-5 shadow-sm">
                      <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary/15 to-amber-500/15 flex items-center justify-center text-sm font-bold text-primary ring-1 ring-inset ring-border/50 group-hover:scale-105 transition-transform">
                        {getCategoryAbbreviation(problem.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {problem.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last active: {formatRelativeTime(problem.lastActiveAt)}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-full border border-border/50 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

