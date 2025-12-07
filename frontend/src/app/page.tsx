"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UploadCloud, History, Settings, ArrowRight, BrainCircuit, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRef, useState } from "react"

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true)
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsUploading(false)
      setUploadSuccess(true)

      // Reset after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground selection:bg-primary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 duration-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">SolveWithMe</h1>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-secondary hover:text-foreground rounded-full transition-all duration-300">
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

        <div className="mx-auto flex w-full max-w-xl flex-col gap-12 relative z-10">

          {/* Hero / Upload */}
          <div className="flex flex-col gap-6 items-center text-center">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 pb-2">
              Ready to learn?
            </h2>
            <Card className="w-full group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="flex flex-col items-center justify-center py-16 text-center relative z-10">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground shadow-lg">
                  <UploadCloud className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">Upload a Problem</h3>
                <p className="mt-3 text-muted-foreground max-w-xs text-sm leading-relaxed">
                  Drop a screenshot or take a photo. <br /> AI will guide you to the solution.
                </p>
                <div className="hidden">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                  />
                </div>
                <Button
                  size="lg"
                  className="mt-8 px-8 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-80"
                  onClick={handleUploadClick}
                  disabled={isUploading || uploadSuccess}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Uploaded!
                    </>
                  ) : (
                    "Choose Image"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
                <History className="h-3.5 w-3.5" /> Recent Activity
              </h3>
              <Button variant="link" size="sm" className="h-auto p-0 text-primary hover:underline underline-offset-4">
                View all
              </Button>
            </div>

            <div className="grid gap-4">
              <Link href="/solve/1">
                <Card className="group cursor-pointer border border-border/50 bg-card/50 hover:bg-card hover:border-violet-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5">
                  <CardContent className="flex items-center gap-5 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100/50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400 group-hover:scale-105 transition-transform duration-300">
                      <span className="font-bold text-xs ring-1 ring-inset ring-violet-500/20 px-1 rounded">AIME</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-semibold text-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Problem 1 (Number Theory)</p>
                      <p className="text-xs text-muted-foreground mt-1">Modified 2 hours ago</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-violet-500" />
                  </CardContent>
                </Card>
              </Link>

              <Link href="/solve/2">
                <Card className="group cursor-pointer border border-border/50 bg-card/50 hover:bg-card hover:border-orange-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/5">
                  <CardContent className="flex items-center gap-5 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100/50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 group-hover:scale-105 transition-transform duration-300">
                      <span className="font-bold text-xs ring-1 ring-inset ring-orange-500/20 px-1 rounded">CALC</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-semibold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Problem 2 (Calculus)</p>
                      <p className="text-xs text-muted-foreground mt-1">Modified yesterday</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-orange-500" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
