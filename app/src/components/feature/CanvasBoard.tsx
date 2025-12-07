"use client"
import React, { useRef, useState, useEffect } from "react"
import CanvasDraw from "react-canvas-draw"
import { Button } from "@/components/ui/button"
import { Undo, RotateCcw, Eraser, Highlighter } from "lucide-react"

type Tool = 'pen' | 'eraser' | 'highlighter'

export function CanvasBoard() {
  const canvasRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [color, setColor] = useState("#000000") // Default black for light mode
  const [tool, setTool] = useState<Tool>('pen')
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

  // Determine brush color and size based on tool
  const getBrushColor = () => {
    if (tool === 'eraser') return '#ffffff'
    if (tool === 'highlighter') return color + '40' // 25% opacity
    return color
  }

  const getBrushRadius = () => {
    if (tool === 'eraser') return 15
    if (tool === 'highlighter') return 12
    return 3
  }

  const handleColorSelect = (newColor: string) => {
    setColor(newColor)
    if (tool === 'eraser') {
      setTool('pen')
    }
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white dark:bg-zinc-950 cursor-crosshair overflow-hidden touch-none">
      {dimensions.width > 0 && (
        <CanvasDraw
          ref={canvasRef}
          brushColor={getBrushColor()}
          brushRadius={getBrushRadius()}
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
        {/* Color buttons */}
        <button
          onClick={() => handleColorSelect("#000000")}
          className={`w-6 h-6 rounded-full border-2 ${color === "#000000" && tool !== 'eraser' ? "border-zinc-900 scale-110" : "border-transparent"} bg-black transition-all`}
          aria-label="Black pen"
        />
        <button
          onClick={() => handleColorSelect("#ef4444")}
          className={`w-6 h-6 rounded-full border-2 ${color === "#ef4444" && tool !== 'eraser' ? "border-zinc-900 scale-110" : "border-transparent"} bg-red-500 transition-all`}
          aria-label="Red pen"
        />
        <button
          onClick={() => handleColorSelect("#3b82f6")}
          className={`w-6 h-6 rounded-full border-2 ${color === "#3b82f6" && tool !== 'eraser' ? "border-zinc-900 scale-110" : "border-transparent"} bg-blue-500 transition-all`}
          aria-label="Blue pen"
        />
        <button
          onClick={() => handleColorSelect("#22c55e")}
          className={`w-6 h-6 rounded-full border-2 ${color === "#22c55e" && tool !== 'eraser' ? "border-zinc-900 scale-110" : "border-transparent"} bg-green-500 transition-all`}
          aria-label="Green pen"
        />
        <button
          onClick={() => handleColorSelect("#fbbf24")}
          className={`w-6 h-6 rounded-full border-2 ${color === "#fbbf24" && tool !== 'eraser' ? "border-zinc-900 scale-110" : "border-transparent"} bg-amber-400 transition-all`}
          aria-label="Yellow pen"
        />

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700" />

        {/* Tool buttons */}
        <Button
          variant={tool === 'highlighter' ? 'secondary' : 'ghost'}
          size="icon"
          className={`h-8 w-8 rounded-full ${tool === 'highlighter' ? 'bg-amber-100 dark:bg-amber-900/30' : ''}`}
          onClick={() => setTool(tool === 'highlighter' ? 'pen' : 'highlighter')}
          title="Highlighter"
        >
          <Highlighter className="w-4 h-4" />
        </Button>
        <Button
          variant={tool === 'eraser' ? 'secondary' : 'ghost'}
          size="icon"
          className={`h-8 w-8 rounded-full ${tool === 'eraser' ? 'bg-zinc-200 dark:bg-zinc-600' : ''}`}
          onClick={() => setTool(tool === 'eraser' ? 'pen' : 'eraser')}
          title="Eraser"
        >
          <Eraser className="w-4 h-4" />
        </Button>

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
