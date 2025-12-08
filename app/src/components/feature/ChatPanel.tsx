"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X, Bot, Sparkles, Send, User, Copy, Check } from "lucide-react"
import { LatexRenderer } from "@/components/ui/LatexRenderer"
import { cn } from "@/lib/utils"

export interface ChatMessage {
  role: 'ai' | 'user'
  content: string
  type?: 'insight' | 'subproblem' | 'normal'
  timestamp?: number
}

// Format relative time
function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return new Date(timestamp).toLocaleDateString()
}

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
  messages?: ChatMessage[]
  onSendMessage?: (message: string) => void
}

export function ChatPanel({ isOpen, onClose, messages: externalMessages, onSendMessage }: ChatPanelProps) {
  // Use external messages if provided, otherwise use internal state
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      type: 'normal',
      content: "Hello! I see you're working on a divisibility problem. Start by writing out the expression for $n = 1, 2, 3$ to see if you spot a pattern.",
      timestamp: Date.now()
    }
  ])

  const messages = externalMessages ?? internalMessages
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Copy message to clipboard
  const handleCopy = useCallback(async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input
    setInput('')

    if (onSendMessage) {
      // Use external handler
      onSendMessage(userMessage)
    } else {
      // Use internal state (fallback)
      setInternalMessages(prev => [...prev, { role: 'user', content: userMessage }])
      setIsTyping(true)

      // Simulate AI response
      setTimeout(() => {
        setInternalMessages(prev => [...prev, {
          role: 'ai',
          type: 'insight',
          content: "That's a good observation. If $n=1$, we get $1+2+1=4$. Not divisible by 7. What about $n=2$?"
        }])
        setIsTyping(false)
      }, 1500)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-y-0 right-0 w-full sm:w-[420px] bg-card/95 backdrop-blur-2xl border-l border-border/60 z-50 flex flex-col shadow-2xl shadow-black/10"
        >
          {/* Header - Warm Scholar Style */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/80">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-amber-600 text-primary-foreground rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                  <Bot className="h-5 w-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-card"></span>
                </span>
              </div>
              <div>
                <h3 className="font-serif font-semibold text-sm tracking-tight text-foreground">AI Tutor</h3>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-primary" />
                  Ready to help
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg hover:bg-secondary hover:text-foreground transition-colors h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 group/message", msg.role === 'user' ? 'flex-row-reverse' : '')}>

                {/* Avatar */}
                <div className={cn(
                  "h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold",
                  msg.role === 'ai'
                    ? "bg-primary/15 text-primary"
                    : "bg-secondary text-secondary-foreground"
                )}>
                  {msg.role === 'ai' ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </div>

                {/* Bubble */}
                <div className={cn("flex flex-col gap-1 max-w-[85%]", msg.role === 'user' ? 'items-end' : 'items-start')}>
                  <div className={cn(
                    "p-3.5 rounded-xl text-sm leading-relaxed relative overflow-hidden group",
                    msg.role === 'ai'
                      ? "bg-secondary/70 text-foreground rounded-tl-sm border border-border/40"
                      : "bg-primary text-primary-foreground rounded-tr-sm shadow-md shadow-primary/15",
                    msg.type === 'insight' && msg.role === 'ai' && "border-l-3 border-l-primary bg-primary/5",
                    msg.type === 'subproblem' && msg.role === 'ai' && "border-l-3 border-l-accent bg-accent/5"
                  )}>
                    <LatexRenderer>
                      {msg.content}
                    </LatexRenderer>
                    {/* Copy button */}
                    {msg.role === 'ai' && (
                      <button
                        onClick={() => handleCopy(msg.content, i)}
                        className="absolute top-2 right-2 p-1 rounded-md bg-card/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
                        title="Copy message"
                      >
                        {copiedIndex === i ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className={cn("flex items-center gap-2 px-1", msg.role === 'user' ? 'flex-row-reverse' : '')}>
                    {msg.type === 'insight' && msg.role === 'ai' && (
                      <span className="text-[10px] uppercase font-semibold text-primary tracking-wider">Key Insight</span>
                    )}
                    {msg.type === 'subproblem' && msg.role === 'ai' && (
                      <span className="text-[10px] uppercase font-semibold text-accent tracking-wider">New Subproblem</span>
                    )}
                    {msg.timestamp && (
                      <span className="text-[10px] text-muted-foreground/50">{formatRelativeTime(msg.timestamp)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="h-7 w-7 shrink-0 bg-primary/15 text-primary rounded-lg flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="bg-secondary/70 px-4 py-3 rounded-xl rounded-tl-sm border border-border/40">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Warm Scholar Style */}
          <div className="p-3 bg-card/80 border-t border-border/50">
            <form className="relative flex items-center gap-2" onSubmit={handleSubmit}>
              <div className="relative flex-1">
                <input
                  className="w-full bg-secondary/60 border border-border/40 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all placeholder:text-muted-foreground/60"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button
                  size="icon"
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
