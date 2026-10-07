'use client'

import { motion } from 'framer-motion'
import type { Lab } from '@/lib/labs/types'
import { cn } from '@/lib/utils'

/** Generative cover art per lab (SVG, no image assets). */
export function LabCover({ lab, className, big }: { lab: Lab; className?: string; big?: boolean }) {
  const a = lab.accent
  return (
    <div className={cn('relative overflow-hidden bg-[#05060b]', className)} aria-hidden>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 70% 60% at 50% 45%, ${a}2e, transparent 70%)` }} />
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {Array.from({ length: 40 }).map((_, i) => (
          <circle key={i} cx={(i * 97) % 400} cy={(i * 53) % 260} r={i % 7 === 0 ? 1.2 : 0.6} fill="#fff" opacity={0.25 + ((i * 13) % 10) / 20} />
        ))}
        {lab.slug === 'exoplaneta' && (
          <g>
            <defs>
              <radialGradient id="cov-star">
                <stop offset="0%" stopColor="#fff7e0" />
                <stop offset="70%" stopColor="#ffd27a" />
                <stop offset="100%" stopColor="#e88a2c" />
              </radialGradient>
            </defs>
            <circle cx="200" cy="112" r="64" fill="url(#cov-star)" />
            <motion.circle
              cy="118"
              r="13"
              fill="#05060a"
              stroke="rgba(160,200,255,0.6)"
              initial={{ cx: 120 }}
              animate={big ? { cx: [120, 280] } : { cx: 214 }}
              transition={big ? { duration: 7, repeat: Infinity, ease: 'linear' } : undefined}
            />
            <path d="M40 220 H150 C165 220 168 236 180 236 H220 C232 236 235 220 250 220 H360" stroke={a} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        )}
        {lab.slug === 'cor-das-estrelas' && (
          <g>
            {[
              ['#ff7a45', 110, 38],
              ['#fff1d6', 200, 30],
              ['#9cc8ff', 285, 24],
            ].map(([c, x, r]) => (
              <g key={String(x)}>
                <circle cx={Number(x)} cy="130" r={Number(r) * 1.8} fill={String(c)} opacity="0.15" />
                <circle cx={Number(x)} cy="130" r={Number(r)} fill={String(c)} />
              </g>
            ))}
          </g>
        )}
        {lab.slug === 'diagrama-hr' && (
          <g>
            {Array.from({ length: 120 }).map((_, i) => {
              const t = (i * 37) % 100
              const x = 60 + t * 2.8
              const y = 60 + t * 1.5 + (((i * 71) % 30) - 15)
              const giant = i % 9 === 0
              return <circle key={i} cx={giant ? 300 + ((i * 7) % 40) : x} cy={giant ? 70 + ((i * 11) % 40) : y} r={giant ? 3 : 1.6} fill={t < 30 ? '#9cc8ff' : t < 70 ? '#fff1d6' : '#ff9a6a'} opacity="0.85" />
            })}
          </g>
        )}
        {lab.slug === 'universo-em-expansao' && (
          <g>
            {[
              [120, 90, 0.9],
              [250, 70, 0.7],
              [300, 170, 0.8],
              [160, 190, 0.6],
            ].map(([x, y, s], i) => (
              <g key={i} transform={`translate(${x} ${y}) rotate(${i * 40}) scale(${s})`}>
                <ellipse rx="26" ry="9" fill={a} opacity="0.35" />
                <ellipse rx="10" ry="4" fill="#fff" opacity="0.8" />
              </g>
            ))}
            <circle cx="200" cy="130" r="4" fill="#fff" />
          </g>
        )}
        {lab.slug === 'orbitas' && (
          <g>
            <ellipse cx="200" cy="130" rx="130" ry="70" fill="none" stroke={a} strokeOpacity="0.6" strokeDasharray="3 5" />
            <circle cx="170" cy="130" r="20" fill="#ffd27a" />
            <circle cx="326" cy="118" r="8" fill="#5eb0ff" />
          </g>
        )}
      </svg>
    </div>
  )
}
