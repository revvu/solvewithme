"use client"
import { useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquare, CheckCircle, HelpCircle, BrainCircuit } from "lucide-react"
import { ProblemHeader } from "@/components/feature/ProblemHeader"
import { ChatPanel } from "@/components/feature/ChatPanel"

// Dynamic import for Canvas to avoid SSR issues with window object
const CanvasBoard = dynamic(
  () => import("@/components/feature/CanvasBoard").then((mod) => mod.CanvasBoard),
  { ssr: false, loading: () => <div className="w-full h-full bg-zinc-50 dark:bg-zinc-900 animate-pulse" /> }
)

export default function SolvePage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const [isChatOpen, setIsChatOpen] = useState(true)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background font-sans transition-colors">
      {/* Top Bar */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border/40 bg-background/80 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-primary">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm">Solving Problem {id}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 dark:hover:bg-amber-900/20 dark:hover:text-amber-500 dark:hover:border-amber-900">
            <HelpCircle className="w-4 h-4 mr-2" /> I'm Stuck
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 shadow-lg border-0">
            <CheckCircle className="w-4 h-4 mr-2" /> Done
          </Button>
          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
          <Button
            variant={isChatOpen ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="relative"
          >
            <MessageSquare className="h-5 w-5" />
            {!isChatOpen && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">

        {/* Split View: Top Problem (30%), Bottom Canvas (70%) */}

        {/* Problem Area */}
        <div className="h-[30%] border-b border-border/40 bg-zinc-50/50 dark:bg-zinc-900/10 shrink-0 relative overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden relative z-10">
            <ProblemHeader problemId={id} />
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-white dark:bg-zinc-950">
          <CanvasBoard />
        </div>

        {/* Chat Panel Overlay/Sidebar */}
        <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </div>
  )
}
