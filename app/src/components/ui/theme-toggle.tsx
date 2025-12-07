"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "./button"
import { useTheme } from "./theme-provider"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Simple toggle between light and dark
  const handleClick = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className="rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all duration-300"
        title={`Theme: ${theme} (click to change)`}
      >
        {theme === "system" ? (
          <Monitor className="h-5 w-5" />
        ) : resolvedTheme === "dark" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}
