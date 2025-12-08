"use client"
import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquare, CheckCircle, HelpCircle, BrainCircuit, Lightbulb, Eye, ArrowUp, Loader2, Menu, X } from "lucide-react"
import { ProblemHeader } from "@/components/feature/ProblemHeader"
import { ChatPanel, ChatMessage } from "@/components/feature/ChatPanel"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"

import { ScratchWorkUpload } from "@/components/feature/ScratchWorkUpload"

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

  // UI states
  const [showRevealModal, setShowRevealModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)

  // Scratch work images (base64)
  const [scratchWorkImages, setScratchWorkImages] = useState<string[]>([])

  // Track unread messages when chat is closed
  useEffect(() => {
    if (!isChatOpen && messages.length > 1) {
      setHasUnreadMessages(true)
    }
  }, [messages.length, isChatOpen])

  // Clear unread when chat opens
  useEffect(() => {
    if (isChatOpen) {
      setHasUnreadMessages(false)
    }
  }, [isChatOpen])

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
          userWorkImages: scratchWorkImages,
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
  }, [currentProblem.id, scratchWorkImages, addMessage])

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
          userWorkImages: scratchWorkImages,
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
  }, [currentProblem.id, scratchWorkImages, addMessage])

  // Handle "Reveal Solution" button - opens confirmation modal
  const handleRevealClick = useCallback(() => {
    setShowRevealModal(true)
    setShowMobileMenu(false)
  }, [])

  // Actually reveal the solution after confirmation
  const handleRevealConfirm = useCallback(async () => {
    setShowRevealModal(false)
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
      addMessage({
        role: 'ai',
        type: 'normal',
        content: "Failed to reveal solution. Please try again."
      })
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
          userWorkImages: scratchWorkImages,
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
  }, [currentProblem.id, scratchWorkImages, hasParentProblem, addMessage])

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

  // Handle breadcrumb navigation
  const handleBreadcrumbNavigate = useCallback((targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < problemStack.length - 1) {
      setProblemStack(prev => prev.slice(0, targetIndex + 1))
      addMessage({
        role: 'ai',
        type: 'normal',
        content: "Navigating back in the problem hierarchy. Use the insights you've gained to continue!"
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

        {/* Action Bar - Desktop */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3">

          {/* Switch to Parent Problem - only show when in subproblem */}
          {hasParentProblem && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwitchToParent}
              className="hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 dark:hover:bg-violet-900/20 dark:hover:text-violet-500 dark:hover:border-violet-900 transition-all"
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
            className="hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 dark:hover:bg-amber-900/20 dark:hover:text-amber-500 dark:hover:border-amber-900 transition-all"
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
            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-500 dark:hover:border-blue-900 transition-all"
          >
            {isCheckLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4 mr-2" />
            )}
            Check My Thinking
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRevealClick}
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

          <div className="w-px h-6 bg-border mx-1" />

          <ThemeToggle />

          <Button
            variant={isChatOpen ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={cn("relative rounded-full transition-all", isChatOpen ? "bg-primary/10 text-primary" : "text-muted-foreground")}
          >
            <MessageSquare className="h-5 w-5" />
            {!isChatOpen && hasUnreadMessages && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse ring-2 ring-background" />
            )}
          </Button>
        </div>

        {/* Action Bar - Mobile */}
        <div className="flex sm:hidden items-center gap-2">
          <Button
            size="sm"
            onClick={handleDone}
            disabled={isDoneLoading}
            className="glass-button bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-emerald-500/20"
          >
            {isDoneLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant={isChatOpen ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={cn("relative rounded-full transition-all", isChatOpen ? "bg-primary/10 text-primary" : "text-muted-foreground")}
          >
            <MessageSquare className="h-5 w-5" />
            {!isChatOpen && hasUnreadMessages && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse ring-2 ring-background" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMobileMenu(true)}
            className="rounded-full text-muted-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Action Menu */}
      <Dialog open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Actions</DialogTitle>
            <DialogDescription>Choose an action for this problem</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            {hasParentProblem && (
              <Button
                variant="outline"
                onClick={() => { handleSwitchToParent(); setShowMobileMenu(false); }}
                className="justify-start h-12"
              >
                <ArrowUp className="w-5 h-5 mr-3" />
                Return to Parent Problem
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => { handleStuck(); setShowMobileMenu(false); }}
              disabled={isStuckLoading}
              className="justify-start h-12"
            >
              {isStuckLoading ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <HelpCircle className="w-5 h-5 mr-3" />
              )}
              I'm Stuck
            </Button>
            <Button
              variant="outline"
              onClick={() => { handleCheckThinking(); setShowMobileMenu(false); }}
              disabled={isCheckLoading}
              className="justify-start h-12"
            >
              {isCheckLoading ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <Lightbulb className="w-5 h-5 mr-3" />
              )}
              Check My Thinking
            </Button>
            <div className="h-px bg-border my-2" />
            <Button
              variant="ghost"
              onClick={handleRevealClick}
              disabled={isRevealLoading}
              className="justify-start h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {isRevealLoading ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <Eye className="w-5 h-5 mr-3" />
              )}
              Reveal Solution
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reveal Solution Confirmation Modal */}
      <Dialog open={showRevealModal} onOpenChange={setShowRevealModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reveal Solution?</DialogTitle>
            <DialogDescription>
              Are you sure you want to see the solution? This should be a last resort.
              The best learning happens when you discover the answer yourself!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowRevealModal(false)}>
              Keep Trying
            </Button>
            <Button variant="destructive" onClick={handleRevealConfirm}>
              Reveal Solution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              onNavigate={handleBreadcrumbNavigate}
            />
          </div>
        </div>

        {/* Scratch Work Upload Area (Remaining Height) */}
        <ScratchWorkUpload
          images={scratchWorkImages}
          onImagesChange={setScratchWorkImages}
        />

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
