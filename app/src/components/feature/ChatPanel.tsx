"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Bot, Sparkles, Send, User } from "lucide-react"
import { LatexRenderer } from "@/components/ui/LatexRenderer"
import { cn } from "@/lib/utils"

export interface ChatMessage {
  role: 'ai' | 'user'
  content: string
  type?: 'insight' | 'subproblem' | 'normal'
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
      content: "Hello! I see you're working on a divisibility problem. Start by writing out the expression for $n = 1, 2, 3$ to see if you spot a pattern."
    }
  ])

  const messages = externalMessages ?? internalMessages
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
          className="absolute inset-y-0 right-0 w-full sm:w-[450px] bg-background/80 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/40 bg-background/40">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Bot className="h-6 w-6" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-background"></span>
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight text-foreground">AI Tutor</h3>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                  ChatGPT 5.1
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === 'user' ? 'flex-row-reverse' : '')}>

                {/* Avatar */}
                <div className={cn(
                  "h-8 w-8 shrink-0 rounded-full flex items-center justify-center shadow-sm text-xs font-bold border",
                  msg.role === 'ai'
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-secondary text-secondary-foreground border-border"
                )}>
                  {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div className="flex flex-col gap-1 items-start max-w-[85%]">
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative overflow-hidden",
                    msg.role === 'ai'
                      ? "bg-muted/50 text-foreground rounded-tl-none border border-border/50"
                      : "bg-primary text-primary-foreground rounded-tr-none shadow-primary/20",
                    msg.type === 'insight' && msg.role === 'ai' && "border-l-4 border-l-amber-400",
                    msg.type === 'subproblem' && msg.role === 'ai' && "border-l-4 border-l-violet-400"
                  )}>
                    <LatexRenderer>
                      {msg.content}
                    </LatexRenderer>
                  </div>
                  {msg.type === 'insight' && msg.role === 'ai' && (
                    <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider px-1">Key Insight</span>
                  )}
                  {msg.type === 'subproblem' && msg.role === 'ai' && (
                    <span className="text-[10px] uppercase font-bold text-violet-500 tracking-wider px-1">New Subproblem</span>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4 animate-pulse">
                <div className="h-8 w-8 shrink-0 bg-primary/10 text-primary rounded-full flex items-center justify-center border border-primary/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted/50 px-4 py-3 rounded-2xl rounded-tl-none border border-border/50">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background/60 backdrop-blur-md border-t border-border/40">
            <form className="relative flex items-center gap-2" onSubmit={handleSubmit}>
              <div className="relative flex-1">
                <input
                  className="w-full bg-secondary/50 border-0 rounded-2xl px-5 py-3.5 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/70"
                  placeholder="Ask for a hint..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button
                  size="icon"
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-1.5 top-1.5 h-8 w-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
