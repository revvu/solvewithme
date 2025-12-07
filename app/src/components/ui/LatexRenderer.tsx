"use client"
import "katex/dist/katex.min.css"
import Latex from "react-latex-next"

export function LatexRenderer({ children }: { children: string }) {
  // Split by <br /> or <br/> tags and render each part with Latex
  // This allows HTML line breaks to work alongside LaTeX math
  const parts = children.split(/<br\s*\/?>/gi)

  if (parts.length === 1) {
    return <Latex>{children}</Latex>
  }

  return (
    <span>
      {parts.map((part, index) => (
        <span key={index}>
          <Latex>{part.trim()}</Latex>
          {index < parts.length - 1 && <br />}
        </span>
      ))}
    </span>
  )
}
