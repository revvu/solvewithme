"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Bot, Sparkles } from "lucide-react"
import { LatexRenderer } from "@/components/ui/LatexRenderer"

export function ChatPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; content: string }[]>([
    {
      role: 'ai',
      content: "Hello! I see you're working on a divisibility problem. Start by writing out the expression for $n = 1, 2, 3$ to see if you spot a pattern."
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "That's a good observation. If $n=1$, we get $1+2+1=4$. Not divisible by 7. What about $n=2$?"
      }])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute inset-y-0 right-0 w-full sm:w-[400px] bg-background/95 backdrop-blur-xl border-l border-zinc-200 dark:border-zinc-800 z-40 flex flex-col shadow-2xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center border border-primary/10">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Tutor</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  {isTyping ? "Typing..." : "Online"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center shadow-lg ${msg.role === 'ai'
                  ? 'bg-primary text-primary-foreground shadow-primary/20'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-foreground'
                  }`}>
                  {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : <div className="h-4 w-4 font-bold text-xs">Me</div>}
                </div>
                <div className="flex flex-col gap-1 items-start max-w-[80%]">
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'ai'
                    ? 'bg-muted rounded-tl-none'
                    : 'bg-primary/10 text-foreground rounded-tr-none'
                    }`}>
                    <LatexRenderer>
                      {msg.content}
                    </LatexRenderer>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-4">
                <div className="h-8 w-8 shrink-0 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border/40 bg-zinc-50/50 dark:bg-zinc-900/50">
            <form className="relative flex items-center" onSubmit={handleSubmit}>
              <input
                className="w-full bg-background border border-input rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                placeholder="Ask for a hint..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
