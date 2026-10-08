'use client'

import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { cn } from '@/lib/utils'

/**
 * Math notation (KaTeX). Inline by default; `block` centers it on its own
 * line. `say` is how the Vega reads it aloud: the voice uses data-say
 * instead of the rendered glyphs (see readableText in lib/observatory/voice).
 *
 *   <Tex say="x ao quadrado mais 1">x^2 + 1</Tex>
 */
export function Tex({ children, block, say, className }: { children: string; block?: boolean; say?: string; className?: string }) {
  const html = useMemo(
    () => katex.renderToString(children, { displayMode: Boolean(block), throwOnError: false, output: 'html', strict: false }),
    [children, block],
  )
  return (
    <span
      role="math"
      aria-label={say ?? children}
      data-say={say ?? texToSpeech(children)}
      className={cn('tex', block && 'block text-center', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/** A rough spoken form of simple TeX, used when no `say` is given. */
export function texToSpeech(tex: string): string {
  return tex
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, ' $1 sobre $2 ')
    .replace(/\\sqrt\{([^{}]*)\}/g, ' raiz de $1 ')
    .replace(/\^\{?2\}?/g, ' ao quadrado ')
    .replace(/\^\{?3\}?/g, ' ao cubo ')
    .replace(/\^\{([^{}]*)\}/g, ' elevado a $1 ')
    .replace(/\^(\w)/g, ' elevado a $1 ')
    .replace(/_\{([^{}]*)\}/g, ' $1 ')
    .replace(/_(\w)/g, ' $1 ')
    .replace(/\\cdot|\\times/g, ' vezes ')
    .replace(/\\div/g, ' dividido por ')
    .replace(/\\approx/g, ' aproximadamente ')
    .replace(/\\neq/g, ' diferente de ')
    .replace(/\\leq?/g, ' menor ou igual a ')
    .replace(/\\geq?/g, ' maior ou igual a ')
    .replace(/\\to/g, ' tende a ')
    .replace(/\\infty/g, ' infinito ')
    .replace(/\\pi/g, ' pi ')
    .replace(/\\theta/g, ' teta ')
    .replace(/\\Delta\s*/g, ' delta ')
    .replace(/\\int/g, ' integral de ')
    .replace(/\\sum/g, ' soma de ')
    .replace(/\\lim/g, ' limite ')
    .replace(/\\sin/g, ' seno de ')
    .replace(/\\cos/g, ' cosseno de ')
    .replace(/\\tan/g, ' tangente de ')
    .replace(/\\,|\;|\\!|\\quad/g, ' ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[{}]/g, ' ')
    .replace(/=/g, ' igual a ')
    .replace(/\+/g, ' mais ')
    .replace(/(\s)-(\s?)/g, '$1menos ')
    .replace(/\s+/g, ' ')
    .trim()
}
