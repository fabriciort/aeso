'use client'

import { Fragment } from 'react'
import { Tex } from '@/components/math/Tex'

// Texto do conteúdo: **negrito** e $TeX$ inline, como em lib/formation/schema.ts.

export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g).filter(Boolean)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('$') ? (
          <Tex key={i}>{p.slice(1, -1)}</Tex>
        ) : p.startsWith('**') ? (
          <strong key={i} className="font-semibold text-white">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  )
}

/** Plain text for the voice: no markdown, TeX left as written (the voice module reads symbols). */
export function plain(text: string): string {
  return text.replace(/\*\*/g, '').replace(/\$([^$]+)\$/g, '$1')
}
