"use client"
import { useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquare, CheckCircle, HelpCircle, BrainCircuit, Lightbulb, Play, Eye } from "lucide-react"
import { ProblemHeader } from "@/components/feature/ProblemHeader"
import { ChatPanel } from "@/components/feature/ChatPanel"
import { cn } from "@/lib/utils"

// Dynamic import for Canvas to avoid SSR issues with window object
const CanvasBoard = dynamic(
  () => import("@/components/feature/CanvasBoard").then((mod) => mod.CanvasBoard),
  { ssr: false, loading: () => <div className="w-full h-full bg-zinc-50 dark:bg-zinc-900 animate-pulse" /> }
)

export default function SolvePage() {
  const params = useParams()
  const router = useRouter()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const [isChatOpen, setIsChatOpen] = useState(true)

  // Mock handlers
  const handleStuck = () => {
    setIsChatOpen(true)
    // Trigger "stuck" logic in chat (mock)
  }

  const handleReveal = () => {
    if (confirm("Are you sure you want to reveal the solution? Try solving the subproblem first!")) {
      alert("Solution revealed (mock)")
    }
  }

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
            <span className="font-semibold text-sm tracking-tight">Trying Problem {id}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">

          <Button
            variant="outline"
            size="sm"
            onClick={handleStuck}
            className="hidden sm:flex hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 dark:hover:bg-amber-900/20 dark:hover:text-amber-500 dark:hover:border-amber-900 transition-all"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            I'm Stuck
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-500 dark:hover:border-blue-900 transition-all"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Check My Thinking
          </Button>

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReveal}
            className="text-muted-foreground hover:text-destructive hidden md:flex"
          >
            <Eye className="w-4 h-4 mr-2" />
            Reveal Solution
          </Button>

          <Button
            size="sm"
            className="glass-button bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-emerald-500/20"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Done
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
            <ProblemHeader problemId={id} />
          </div>
        </div>

        {/* Canvas Area (Remaining Height) */}
        <div className="flex-1 relative overflow-hidden bg-background cursor-crosshair">
          <CanvasBoard />

          {/* Floating Canvas Controls (Placeholder for future expansion) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-full bg-foreground/5 backdrop-blur-md border border-white/10 opacity-0 group-hover/layout:opacity-100 transition-opacity duration-500 delay-100">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center cursor-pointer shadow-sm">
              <div className="w-2 h-2 rounded-full bg-current" />
            </div>
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center cursor-pointer shadow-sm opacity-50 hover:opacity-100 transition-opacity" />
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer shadow-sm opacity-50 hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Chat Panel Overlay/Sidebar */}
        <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </div>
  )
}
