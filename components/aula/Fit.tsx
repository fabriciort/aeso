'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { Tex } from '@/components/math/Tex'

/** One line that shrinks its type to fit the width (formulas never scroll sideways). */
export function Fit({ size, min = 12, className, children }: { size: number; min?: number; className?: string; children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [fs, setFs] = useState(size)
  useLayoutEffect(() => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return
    const fit = () => {
      const prev = i.style.fontSize
      i.style.fontSize = `${size}px`
      const ratio = o.clientWidth / Math.max(1, i.scrollWidth)
      i.style.fontSize = prev
      setFs(ratio < 1 ? Math.max(min, Math.floor(size * ratio * 0.98)) : size)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(o)
    return () => ro.disconnect()
  }, [size, min, children])
  return (
    <div ref={outer} className={className}>
      <div ref={inner} className="inline-block whitespace-nowrap" style={{ fontSize: fs }}>
        {children}
      </div>
    </div>
  )
}

/** A notebook line: a formula fits its width; a sentence (one \\text{…}) wraps like text. */
export function LinhaTex({ tex, fala, size }: { tex: string; fala: string; size: number }) {
  const sentence = /^\\text\{([^{}]*)\}$/.exec(tex.trim())
  if (sentence) {
    return (
      <p className="leading-snug" style={{ fontSize: size * 1.1, fontFamily: "KaTeX_Main, Georgia, serif" }}>
        {sentence[1]}
      </p>
    )
  }
  return (
    <Fit size={size}>
      <Tex say={fala}>{tex}</Tex>
    </Fit>
  )
}
