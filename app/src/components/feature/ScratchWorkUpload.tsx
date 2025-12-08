"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, X, ImagePlus, Sparkles, FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ScratchWorkUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
}

export function ScratchWorkUpload({ images, onImagesChange }: ScratchWorkUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))

    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        if (base64) {
          onImagesChange([...images, base64])
        }
      }
      reader.readAsDataURL(file)
    })
  }, [images, onImagesChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleRemoveImage = useCallback((index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }, [images, onImagesChange])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Show graph paper upload zone if no images
  if (images.length === 0) {
    return (
      <div className="w-full flex-1 p-4 sm:p-6">
        <div
          className={cn(
            "w-full h-full min-h-[300px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 rounded-xl border-2 border-dashed relative overflow-hidden group",
            isDragging
              ? "border-primary bg-primary/5 scale-[0.995]"
              : "border-border/60 hover:border-primary/40 bg-card/30"
          )}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          {/* Graph paper grid background - edges only with center fade */}
          <div className="absolute inset-0 bg-grid-pattern text-border/10 dark:text-border/5 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black_80%)]" />

          {/* Warm glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="flex flex-col items-center gap-5 relative z-10 p-6 text-center max-w-sm mx-auto bg-background/60 dark:bg-background/40 rounded-2xl backdrop-blur-sm">
            <div className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 border-2",
              isDragging
                ? "bg-primary text-primary-foreground border-primary scale-105"
                : "bg-card text-muted-foreground border-border/60 group-hover:text-primary group-hover:border-primary/40"
            )}>
              {isDragging ? (
                <Sparkles className="w-7 h-7 animate-pulse" />
              ) : (
                <Upload className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-serif font-semibold tracking-tight">Upload your scratch work</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Show your thinking process! Upload photos of your handwritten notes or diagrams.
              </p>
            </div>

            <Button variant="outline" className="mt-1 rounded-lg px-5 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all">
              <FileImage className="w-4 h-4 mr-2" />
              Select Files
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show images grid with warm scholar styling
  return (
    <div
      className={cn(
        "w-full flex-1 flex flex-col relative",
        isDragging && "after:content-[''] after:absolute after:inset-0 after:bg-primary/5 after:z-50 after:border-2 after:border-primary after:border-dashed after:m-4 after:rounded-xl"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Header */}
      <div className="px-6 py-3 border-b border-border/50 bg-card/60 flex items-center justify-between sticky top-0 z-20">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Your Work ({images.length})
        </h3>
        <Button size="sm" variant="ghost" onClick={handleClick} className="text-xs h-8 hover:bg-primary/10 hover:text-primary">
          <ImagePlus className="w-3.5 h-3.5 mr-1.5" />
          Add Page
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 auto-rows-max">
          {images.map((image, index) => (
            <div key={index} className="group relative aspect-[4/5] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/30 bg-card">
              <img
                src={image}
                alt={`Scratch work ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <span className="text-white text-xs font-medium translate-y-2 group-hover:translate-y-0 transition-transform duration-300">Page {index + 1}</span>
              </div>

              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 rounded-md shadow-md translate-y-[-8px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10"
                onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}

          {/* Add more card */}
          <button
            onClick={handleClick}
            className="flex flex-col items-center justify-center gap-3 aspect-[4/5] rounded-lg border-2 border-dashed border-border/50 hover:border-primary/40 bg-card/30 hover:bg-primary/5 transition-all group/add"
          >
            <div className="w-11 h-11 rounded-lg bg-card flex items-center justify-center group-hover/add:bg-primary/10 transition-all border border-border/50 group-hover/add:border-primary/30">
              <ImagePlus className="w-5 h-5 text-muted-foreground group-hover/add:text-primary transition-colors" />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover/add:text-primary transition-colors">Add another page</span>
          </button>
        </div>
      </div>
    </div>
  )
}
