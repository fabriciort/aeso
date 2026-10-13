'use client'

import { Fragment } from 'react'
import { Tex } from '@/components/math/Tex'

// Texto do conteúdo: **negrito** e $TeX$ inline, como em lib/formation/schema.ts.
// O "R$" do real não abre nem fecha TeX: ele é guardado antes de procurar os $.

const REAL = '\u0000'
const guarda = (t: string) => t.replace(/R\$/g, `R${REAL}`)
const solta = (t: string) => t.replaceAll(REAL, '$')
// Frações no meio do texto ficam do tamanho da letra, não miúdas (3/4 se lê de longe).
const grande = (tex: string) => tex.replace(/\\frac(?=\{)/g, '\\dfrac')

export function Rich({ text }: { text: string }) {
  const parts = guarda(text).split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g).filter(Boolean).map(solta)
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('$')) {
          const f = <Tex className={p.includes('\\frac') ? 'inline-block py-0.5' : undefined}>{grande(p.slice(1, -1))}</Tex>
          // The punctuation right after a formula stays on its line ("vale $2^3$?" never leaves the "?" alone below).
          const pont = parts[i + 1]?.match(/^[?!.,:;)]+/)?.[0]
          return pont ? (
            <span key={i} className="whitespace-nowrap">
              {f}
              {pont}
            </span>
          ) : (
            <Fragment key={i}>{f}</Fragment>
          )
        }
        const prev = parts[i - 1]
        const t = prev?.startsWith('$') ? p.replace(/^[?!.,:;)]+/, '') : p
        return p.startsWith('**') ? (
          <strong key={i} className="font-semibold text-inherit">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{t}</Fragment>
        )
      })}
    </>
  )
}

/** Plain text for the voice: no markdown, TeX left as written (the voice module reads symbols). */
export function plain(text: string): string {
  return solta(guarda(text).replace(/\*\*/g, '').replace(/\$([^$]+)\$/g, '$1'))
}
