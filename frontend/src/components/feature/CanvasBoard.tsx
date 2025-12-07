"use client"
import React, { useRef, useState, useEffect } from "react"
import CanvasDraw from "react-canvas-draw"
import { Button } from "@/components/ui/button"
import { Undo, RotateCcw, Palette } from "lucide-react"

export function CanvasBoard() {
  const canvasRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [color, setColor] = useState("#000000") // Default black for light mode
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!containerRef.current) return

    // Initial size
    setDimensions({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight
    })

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  if (!isMounted) return <div className="w-full h-full bg-white dark:bg-zinc-900" />

  // Handle dark mode color switch logic if needed, but keeping simple for now

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white dark:bg-zinc-950 cursor-crosshair overflow-hidden touch-none">
      {dimensions.width > 0 && (
        <CanvasDraw
          ref={canvasRef}
          brushColor={color}
          brushRadius={3}
          lazyRadius={2}
          canvasWidth={dimensions.width}
          canvasHeight={dimensions.height}
          hideGrid={false}
          gridColor="rgba(150,150,150,0.1)"
          className="touch-none"
          backgroundColor="transparent"
        />
      )}

      {/* Floating Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-3 bg-white/90 dark:bg-zinc-800/90 backdrop-blur border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl z-10 transition-all hover:scale-105">
        <button
          onClick={() => setColor("#000000")}
          className={`w-6 h-6 rounded-full border-2 ${color === "#000000" ? "border-zinc-900 scale-110" : "border-transparent"} bg-black transition-all`}
          aria-label="Black pen"
        />
        <button
          onClick={() => setColor("#ef4444")}
          className={`w-6 h-6 rounded-full border-2 ${color === "#ef4444" ? "border-zinc-900 scale-110" : "border-transparent"} bg-red-500 transition-all`}
          aria-label="Red pen"
        />
        <button
          onClick={() => setColor("#3b82f6")}
          className={`w-6 h-6 rounded-full border-2 ${color === "#3b82f6" ? "border-zinc-900 scale-110" : "border-transparent"} bg-blue-500 transition-all`}
          aria-label="Blue pen"
        />

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700" />

        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => canvasRef.current?.undo()} title="Undo">
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => canvasRef.current?.clear()} title="Clear">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
