"use client"
import "katex/dist/katex.min.css"
import Latex from "react-latex-next"

export function LatexRenderer({ children }: { children: string }) {
  return (
    <Latex>{children}</Latex>
  )
}
