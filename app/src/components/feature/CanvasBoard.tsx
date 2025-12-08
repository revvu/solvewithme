"use client"
import React, { useRef, useState, useEffect, useCallback } from "react"
import CanvasDraw from "react-canvas-draw"
import { Button } from "@/components/ui/button"
import { Undo, RotateCcw, Eraser, Highlighter, Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type Tool = 'pen' | 'eraser' | 'highlighter'

const BRUSH_SIZES = {
  pen: { min: 1, max: 10, default: 3 },
  highlighter: { min: 8, max: 20, default: 12 },
  eraser: { min: 10, max: 30, default: 15 }
}

export function CanvasBoard() {
  const canvasRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [color, setColor] = useState("#000000")
  const [tool, setTool] = useState<Tool>('pen')
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES.pen.default)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!containerRef.current) return

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        canvasRef.current?.undo()
      }
      // Number keys for colors
      if (e.key === '1') setColor("#000000")
      if (e.key === '2') setColor("#ef4444")
      if (e.key === '3') setColor("#3b82f6")
      if (e.key === '4') setColor("#22c55e")
      if (e.key === '5') setColor("#fbbf24")
      // E for eraser, H for highlighter, P for pen
      if (e.key === 'e') setTool('eraser')
      if (e.key === 'h') setTool('highlighter')
      if (e.key === 'p') setTool('pen')
      // [ and ] for brush size
      if (e.key === '[') adjustBrushSize(-1)
      if (e.key === ']') adjustBrushSize(1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tool])

  // Update brush size when tool changes
  useEffect(() => {
    setBrushSize(BRUSH_SIZES[tool].default)
  }, [tool])

  const adjustBrushSize = useCallback((delta: number) => {
    setBrushSize(prev => {
      const limits = BRUSH_SIZES[tool]
      return Math.min(limits.max, Math.max(limits.min, prev + delta))
    })
  }, [tool])

  if (!isMounted) return <div className="w-full h-full bg-zinc-50" />

  // Determine brush color based on tool
  const getBrushColor = () => {
    if (tool === 'eraser') return 'rgba(255,255,255,1)' // Will be handled by canvas background
    if (tool === 'highlighter') return color + '40' // 25% opacity
    return color
  }

  const getBrushRadius = () => brushSize

  const handleColorSelect = (newColor: string) => {
    setColor(newColor)
    if (tool === 'eraser') {
      setTool('pen')
    }
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white cursor-crosshair overflow-hidden touch-none">
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
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl z-10 transition-all">
        {/* Color buttons */}
        {[
          { color: "#000000", key: "1" },
          { color: "#ef4444", key: "2" },
          { color: "#3b82f6", key: "3" },
          { color: "#22c55e", key: "4" },
          { color: "#fbbf24", key: "5" },
        ].map(({ color: c, key }) => (
          <button
            key={c}
            onClick={() => handleColorSelect(c)}
            className={cn(
              "w-6 h-6 rounded-full transition-all ring-offset-2 ring-offset-white dark:ring-offset-zinc-800",
              color === c && tool !== 'eraser'
                ? "ring-2 ring-primary scale-110"
                : "hover:scale-110"
            )}
            style={{ backgroundColor: c }}
            aria-label={`Color ${key}`}
            title={`Color (${key})`}
          />
        ))}

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700" />

        {/* Tool buttons */}
        <Button
          variant={tool === 'highlighter' ? 'secondary' : 'ghost'}
          size="icon"
          className={cn("h-8 w-8 rounded-full", tool === 'highlighter' && 'bg-amber-100 dark:bg-amber-900/30')}
          onClick={() => setTool(tool === 'highlighter' ? 'pen' : 'highlighter')}
          title="Highlighter (H)"
        >
          <Highlighter className="w-4 h-4" />
        </Button>
        <Button
          variant={tool === 'eraser' ? 'secondary' : 'ghost'}
          size="icon"
          className={cn("h-8 w-8 rounded-full", tool === 'eraser' && 'bg-zinc-200 dark:bg-zinc-600')}
          onClick={() => setTool(tool === 'eraser' ? 'pen' : 'eraser')}
          title="Eraser (E)"
        >
          <Eraser className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700" />

        {/* Brush size controls */}
        <div className="hidden sm:flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => adjustBrushSize(-1)}
            title="Decrease size ([)"
          >
            <Minus className="w-3 h-3" />
          </Button>
          <div className="w-8 text-center text-xs font-medium text-muted-foreground">
            {brushSize}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => adjustBrushSize(1)}
            title="Increase size (])"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-700" />

        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => canvasRef.current?.undo()} title="Undo (Ctrl+Z)">
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => canvasRef.current?.clear()} title="Clear canvas">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
