"use client"
import { useState, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquare, CheckCircle, HelpCircle, BrainCircuit, Lightbulb, Eye, ArrowUp, Loader2 } from "lucide-react"
import { ProblemHeader } from "@/components/feature/ProblemHeader"
import { ChatPanel, ChatMessage } from "@/components/feature/ChatPanel"
import { cn } from "@/lib/utils"

// Dynamic import for Canvas to avoid SSR issues with window object
const CanvasBoard = dynamic(
  () => import("@/components/feature/CanvasBoard").then((mod) => mod.CanvasBoard),
  { ssr: false, loading: () => <div className="w-full h-full bg-zinc-50 dark:bg-zinc-900 animate-pulse" /> }
)

// Problem data from API
interface ProblemData {
  id: string
  text: string
  category: string
  title: string
  imageUrl: string | null
  isSubproblem: boolean
  targetInsight?: string
}

// Problem stack item for navigation
interface ProblemStackItem {
  id: string
  title: string
  isSubproblem: boolean
}

export default function SolvePage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  // Problem data state
  const [problemData, setProblemData] = useState<ProblemData | null>(null)
  const [isLoadingProblem, setIsLoadingProblem] = useState(true)
  const [problemError, setProblemError] = useState<string | null>(null)

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      type: 'normal',
      content: "Hello! I see you're working on a problem. Start by writing out your approach. I'm here to help when you need it."
    }
  ])

  // Problem hierarchy state
  const [problemStack, setProblemStack] = useState<ProblemStackItem[]>([
    { id: id || '1', title: 'Original Problem', isSubproblem: false }
  ])
  const currentProblem = problemStack[problemStack.length - 1]
  const hasParentProblem = problemStack.length > 1

  // Loading states
  const [isStuckLoading, setIsStuckLoading] = useState(false)
  const [isCheckLoading, setIsCheckLoading] = useState(false)
  const [isDoneLoading, setIsDoneLoading] = useState(false)
  const [isRevealLoading, setIsRevealLoading] = useState(false)

  // Canvas ref for getting user work
  const canvasRef = useRef<{ getDataURL: () => string } | null>(null)

  // Fetch problem data when current problem changes
  useEffect(() => {
    async function fetchProblem() {
      setIsLoadingProblem(true)
      setProblemError(null)

      try {
        const response = await fetch(`/api/problem/${currentProblem.id}`)
        if (!response.ok) {
          throw new Error('Problem not found')
        }
        const data = await response.json()
        setProblemData(data)

        // Update problem stack title with actual title
        if (data.title && problemStack.length === 1) {
          setProblemStack([{
            id: currentProblem.id,
            title: data.title,
            isSubproblem: data.isSubproblem
          }])
        }
      } catch (error) {
        console.error('Failed to fetch problem:', error)
        setProblemError('Failed to load problem. It may not exist in the database.')
      } finally {
        setIsLoadingProblem(false)
      }
    }

    fetchProblem()
  }, [currentProblem.id])

  // Add a message to chat
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message])
  }, [])

  // Handle "I'm Stuck" button
  const handleStuck = useCallback(async () => {
    setIsChatOpen(true)
    setIsStuckLoading(true)

    try {
      const response = await fetch('/api/stuck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: currentProblem.id,
          userWorkImages: [],
          userText: ''
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process stuck request')
      }

      const data = await response.json()

      // Add tutor messages
      if (data.tutor_message_intro) {
        addMessage({ role: 'ai', type: 'normal', content: data.tutor_message_intro })
      }

      if (data.missing_insight) {
        addMessage({ role: 'ai', type: 'insight', content: `The key insight you might be missing: ${data.missing_insight}` })
      }

      if (data.tutor_message_subproblem) {
        addMessage({ role: 'ai', type: 'subproblem', content: data.tutor_message_subproblem })
      }

      // Add new subproblem to the stack
      if (data.subproblemId) {
        setProblemStack(prev => [...prev, {
          id: data.subproblemId,
          title: 'Subproblem',
          isSubproblem: true
        }])
      }
    } catch (error) {
      console.error('Stuck error:', error)
      addMessage({
        role: 'ai',
        type: 'normal',
        content: "I'm having trouble processing your request. Please try again."
      })
    } finally {
      setIsStuckLoading(false)
    }
  }, [currentProblem.id, addMessage])

  // Handle "Check My Thinking" button
  const handleCheckThinking = useCallback(async () => {
    setIsChatOpen(true)
    setIsCheckLoading(true)

    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: currentProblem.id,
          userWorkImages: [],
          userText: ''
        })
      })

      if (!response.ok) {
        throw new Error('Failed to check thinking')
      }

      const data = await response.json()

      if (data.feedback) {
        addMessage({ role: 'ai', type: 'normal', content: data.feedback })
      }
    } catch (error) {
      console.error('Check thinking error:', error)
      addMessage({
        role: 'ai',
        type: 'normal',
        content: "I couldn't review your work right now. Please try again."
      })
    } finally {
      setIsCheckLoading(false)
    }
  }, [currentProblem.id, addMessage])

  // Handle "Reveal Solution" button
  const handleReveal = useCallback(async () => {
    if (!confirm("Are you sure you want to reveal the solution? This should be a last resort!")) {
      return
    }

    setIsRevealLoading(true)

    try {
      const response = await fetch(`/api/reveal?problemId=${currentProblem.id}`)

      if (!response.ok) {
        throw new Error('Failed to reveal solution')
      }

      const data = await response.json()

      setIsChatOpen(true)
      addMessage({
        role: 'ai',
        type: 'normal',
        content: `**Solution Revealed:**\n\n${data.solution}\n\n**Answer:** ${data.answer || 'See solution above'}`
      })
    } catch (error) {
      console.error('Reveal error:', error)
      alert('Failed to reveal solution. Please try again.')
    } finally {
      setIsRevealLoading(false)
    }
  }, [currentProblem.id, addMessage])

  // Handle "Done" button (submit subproblem solution)
  const handleDone = useCallback(async () => {
    if (!hasParentProblem) {
      // On the original problem - just show success message
      setIsChatOpen(true)
      addMessage({
        role: 'ai',
        type: 'normal',
        content: "Great job! If you've solved the problem, congratulations! If you'd like me to check your work, click 'Check My Thinking'."
      })
      return
    }

    setIsDoneLoading(true)

    try {
      const response = await fetch('/api/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subproblemId: currentProblem.id,
          userWorkImages: [],
          userText: ''
        })
      })

      if (!response.ok) {
        throw new Error('Failed to verify completion')
      }

      const data = await response.json()

      setIsChatOpen(true)

      if (data.solved) {
        addMessage({
          role: 'ai',
          type: 'insight',
          content: data.tutor_message || "Excellent! You've solved the subproblem. Now let's go back to the original problem with this new insight."
        })

        // Navigate back to parent problem
        setProblemStack(prev => prev.slice(0, -1))
      } else {
        addMessage({
          role: 'ai',
          type: 'normal',
          content: data.tutor_message || "Not quite there yet. Keep trying - you're making progress!"
        })
      }
    } catch (error) {
      console.error('Done error:', error)
      addMessage({
        role: 'ai',
        type: 'normal',
        content: "I couldn't verify your solution. Please try again."
      })
    } finally {
      setIsDoneLoading(false)
    }
  }, [currentProblem.id, hasParentProblem, addMessage])

  // Handle "Switch to Parent" button
  const handleSwitchToParent = useCallback(() => {
    if (problemStack.length > 1) {
      setProblemStack(prev => prev.slice(0, -1))
      addMessage({
        role: 'ai',
        type: 'normal',
        content: "Returning to the parent problem. Use what you learned from the subproblem to continue!"
      })
    }
  }, [problemStack.length, addMessage])

  // Handle chat message send
  const handleChatMessage = useCallback((userMessage: string) => {
    addMessage({ role: 'user', content: userMessage })
    // For now, just acknowledge - could integrate with an actual chat endpoint
    setTimeout(() => {
      addMessage({
        role: 'ai',
        type: 'normal',
        content: "I'm here to help! Use the action buttons above to get specific assistance, or keep working on your solution."
      })
    }, 500)
  }, [addMessage])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background font-sans transition-colors selection:bg-primary/20">

      {/* Premium Header */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border/40 bg-background/80 backdrop-blur-md z-30 shrink-0 relative">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
            <BrainCircuit className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm tracking-tight">
              {hasParentProblem ? 'Solving Subproblem' : `Problem ${id}`}
            </span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Switch to Parent Problem - only show when in subproblem */}
          {hasParentProblem && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwitchToParent}
              className="hidden sm:flex hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 dark:hover:bg-violet-900/20 dark:hover:text-violet-500 dark:hover:border-violet-900 transition-all"
            >
              <ArrowUp className="w-4 h-4 mr-2" />
              Parent Problem
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleStuck}
            disabled={isStuckLoading}
            className="hidden sm:flex hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 dark:hover:bg-amber-900/20 dark:hover:text-amber-500 dark:hover:border-amber-900 transition-all"
          >
            {isStuckLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <HelpCircle className="w-4 h-4 mr-2" />
            )}
            I'm Stuck
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckThinking}
            disabled={isCheckLoading}
            className="hidden sm:flex hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-500 dark:hover:border-blue-900 transition-all"
          >
            {isCheckLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4 mr-2" />
            )}
            Check My Thinking
          </Button>

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReveal}
            disabled={isRevealLoading}
            className="text-muted-foreground hover:text-destructive hidden md:flex"
          >
            {isRevealLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            Reveal Solution
          </Button>

          <Button
            size="sm"
            onClick={handleDone}
            disabled={isDoneLoading}
            className="glass-button bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-emerald-500/20"
          >
            {isDoneLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            {hasParentProblem ? 'Submit' : 'Done'}
          </Button>

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          <Button
            variant={isChatOpen ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={cn("relative rounded-full transition-all", isChatOpen ? "bg-primary/10 text-primary" : "text-muted-foreground")}
          >
            <MessageSquare className="h-5 w-5" />
            {!isChatOpen && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse ring-2 ring-background" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative group/layout">

        {/* Split View: Top Problem (Fixed 30% initially, resizable in future) */}
        <div className="h-[30%] min-h-[200px] border-b border-border/40 bg-muted/30 shrink-0 relative overflow-hidden flex flex-col shadow-inner z-10">
          <div className="absolute inset-0 bg-grid-zinc-200/50 dark:bg-grid-zinc-800/20 [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
          <div className="flex-1 overflow-hidden relative z-10">
            <ProblemHeader
              problemId={currentProblem.id}
              problemStack={problemStack}
              problemData={problemData}
              isLoading={isLoadingProblem}
              error={problemError}
            />
          </div>
        </div>

        {/* Canvas Area (Remaining Height) */}
        <div className="flex-1 relative overflow-hidden bg-background cursor-crosshair">
          <CanvasBoard />
        </div>

        {/* Chat Panel Overlay/Sidebar */}
        <ChatPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={messages}
          onSendMessage={handleChatMessage}
        />
      </div>
    </div>
  )
}
