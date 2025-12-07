import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UploadCloud, History, Settings, ArrowRight, BrainCircuit } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">SolveWithMe</h1>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-10">

          {/* Hero / Upload */}
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center sm:text-left">
              Ready to learn?
            </h2>
            <Card className="group relative overflow-hidden border-2 border-dashed border-zinc-200 bg-zinc-50 transition-all hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary transition-transform group-hover:scale-110 group-hover:bg-primary/10">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">Upload a Problem</h3>
                <p className="mt-2 text-muted-foreground max-w-xs">
                  Drop a screenshot or take a photo. AI will guide you to the solution.
                </p>
                <Button size="lg" className="mt-8 w-full max-w-xs sm:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/30">
                  Choose Image
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                <History className="h-4 w-4" /> Recent Activity
              </h3>
              <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground hover:text-primary">
                View all
              </Button>
            </div>

            <div className="grid gap-3">
              <Link href="/solve/1">
                <Card className="group cursor-pointer border hover:border-primary/50 transition-all hover:shadow-md dark:hover:shadow-primary/5">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400">
                      <span className="font-bold text-xs">AIME</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium group-hover:text-primary transition-colors">Problem 14 (Number Theory)</p>
                      <p className="text-xs text-muted-foreground">Modified 2 hours ago</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </CardContent>
                </Card>
              </Link>

              <Link href="/solve/2">
                <Card className="group cursor-pointer border hover:border-primary/50 transition-all hover:shadow-md dark:hover:shadow-primary/5">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                      <span className="font-bold text-xs">CALC</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium group-hover:text-primary transition-colors">Integration by Parts</p>
                      <p className="text-xs text-muted-foreground">Modified yesterday</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
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
