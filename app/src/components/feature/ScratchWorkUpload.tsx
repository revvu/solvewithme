"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, X, ImagePlus } from "lucide-react"
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

  // Show upload zone if no images
  if (images.length === 0) {
    return (
      <div
        className={cn(
          "w-full flex-1 flex flex-col items-center justify-center cursor-pointer transition-all",
          "bg-zinc-100 dark:bg-zinc-800",
          isDragging && "bg-primary/5 border-2 border-dashed border-primary"
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
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="p-4 rounded-full bg-muted/50">
            <Upload className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="font-medium">Upload your scratch work</p>
            <p className="text-sm mt-1">Drag and drop or click to browse</p>
          </div>
        </div>
      </div>
    )
  }

  // Show images grid
  return (
    <div
      className={cn(
        "w-full flex-1 overflow-auto p-4 bg-zinc-100 dark:bg-zinc-800",
        isDragging && "bg-primary/5"
      )}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
        {images.map((image, index) => (
          <div key={index} className="relative group rounded-lg overflow-hidden border border-border bg-background shadow-sm">
            <img
              src={image}
              alt={`Scratch work ${index + 1}`}
              className="w-full h-auto object-contain"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveImage(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {/* Add more button */}
        <button
          onClick={handleClick}
          className="flex flex-col items-center justify-center gap-2 min-h-[150px] rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
        >
          <ImagePlus className="w-6 h-6" />
          <span className="text-sm font-medium">Add more</span>
        </button>
      </div>
    </div>
  )
}
