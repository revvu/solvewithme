"use client"
import React, { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Undo, RotateCcw, Eraser, Highlighter, Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type Tool = 'pen' | 'eraser' | 'highlighter'

interface Point {
  x: number
  y: number
  color: string
  width: number
  tool: Tool
}

interface Stroke {
  points: Point[]
  color: string
  width: number
  tool: Tool
}

const BRUSH_SIZES = {
  pen: { min: 1, max: 10, default: 3 },
  highlighter: { min: 8, max: 20, default: 12 },
  eraser: { min: 10, max: 30, default: 20 }
}

export function CanvasBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [color, setColor] = useState("#000000")
  const [tool, setTool] = useState<Tool>('pen')
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES.pen.default)
  const [isMounted, setIsMounted] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)

  // History management
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [currentStroke, setCurrentStroke] = useState<Point[]>([])

  // Initialize
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Canvas resize handler
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return

    const resizeCanvas = () => {
      const parent = containerRef.current
      const canvas = canvasRef.current
      if (parent && canvas) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
        redraw()
      }
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas() // Initial size

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [strokes]) // Re-bind when strokes change to ensure redraw works

  // Redraw function
  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    strokes.forEach(stroke => {
      if (stroke.points.length === 0) return

      ctx.beginPath()
      ctx.lineWidth = stroke.width

      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.strokeStyle = 'rgba(0,0,0,1)' // Color doesn't matter for erase
      } else if (stroke.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = stroke.color + '40' // Add transparency
      } else {
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = stroke.color
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

      stroke.points.forEach((point, index) => {
        if (index > 0) ctx.lineTo(point.x, point.y)
      })

      ctx.stroke()
    })

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over'
  }, [strokes])

  // Effect to trigger redraw when strokes change
  useEffect(() => {
    redraw()
  }, [strokes, redraw])

  // Update brush size when tool changes
  useEffect(() => {
    setBrushSize(BRUSH_SIZES[tool].default)
  }, [tool])

  // Drawing Handlers
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 }

    const rect = canvasRef.current.getBoundingClientRect()
    let clientX, clientY

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = (e as React.MouseEvent).clientX
      clientY = (e as React.MouseEvent).clientY
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault() // Prevent scrolling on touch
    setIsDrawing(true)
    const { x, y } = getCoordinates(e)
    setCurrentStroke([{ x, y, color, width: brushSize, tool }])
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return
    e.preventDefault()

    const { x, y } = getCoordinates(e)
    const newPoint = { x, y, color, width: brushSize, tool }
    setCurrentStroke(prev => [...prev, newPoint])

    // Live drawing (optimization: just draw the new segment instead of full redraw)
    const ctx = canvasRef.current.getContext('2d')
    if (ctx) {
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = brushSize

      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.strokeStyle = 'rgba(0,0,0,1)'
      } else if (tool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = color + '40'
      } else {
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = color
      }

      const lastPoint = currentStroke[currentStroke.length - 1] || newPoint // Fallback if first point
      ctx.beginPath()
      ctx.moveTo(lastPoint.x, lastPoint.y)
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  const endDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    if (currentStroke.length > 0) {
      setStrokes(prev => [...prev, {
        points: [...currentStroke],
        color,
        width: brushSize,
        tool
      }])
      setCurrentStroke([])
    }
  }

  const undo = () => {
    setStrokes(prev => prev.slice(0, -1))
  }

  const clear = () => {
    setStrokes([])
  }

  const adjustBrushSize = (delta: number) => {
    setBrushSize(prev => {
      const limits = BRUSH_SIZES[tool]
      return Math.min(limits.max, Math.max(limits.min, prev + delta))
    })
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
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
  }, [tool, undo]) // Added undo manually to dependency to be safe, though usually stable

  const handleColorSelect = (newColor: string) => {
    setColor(newColor)
    if (tool === 'eraser') {
      setTool('pen')
    }
  }

  if (!isMounted) return <div className="w-full h-full bg-zinc-50" />

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white cursor-crosshair overflow-hidden touch-none">
      <canvas
        ref={canvasRef}
        className="touch-none absolute inset-0"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
      />

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

        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={undo} title="Undo (Ctrl+Z)">
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={clear} title="Clear canvas">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
