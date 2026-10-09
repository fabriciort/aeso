'use client'

import { motion } from 'framer-motion'
import type { Lab } from '@/lib/labs/types'
import { cn } from '@/lib/utils'

/** Generative cover art per lab (SVG, no image assets). */
export function LabCover({ lab, className, big }: { lab: Lab; className?: string; big?: boolean }) {
  const a = lab.accent
  if (lab.area === 'Matemática') return <MathCover lab={lab} className={className} big={big} />
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

// ---------------------------------------------------------------- Matemática

const W = 400
const H = 260

/** Polyline path of y = f(x) over [x0, x1] in cover coordinates. */
function curve(f: (x: number) => number, x0 = 20, x1 = 380, n = 90): string {
  let d = ''
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n
    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${f(x).toFixed(1)}`
  }
  return d
}

function MathCover({ lab, className, big }: { lab: Lab; className?: string; big?: boolean }) {
  const a = lab.accent
  const loop = (duration: number) => (big ? { duration, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const } : { duration: 0 })
  return (
    <div className={cn('relative overflow-hidden bg-[#05060b]', className)} aria-hidden>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${a}26, transparent 72%)` }} />
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g stroke="#fff" strokeOpacity="0.05">
          {Array.from({ length: 21 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2={H} />
          ))}
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 20} x2={W} y2={i * 20} />
          ))}
        </g>
        <g stroke="#fff" strokeOpacity="0.16">
          <line x1="20" y1="200" x2="380" y2="200" />
          <line x1="60" y1="20" x2="60" y2="240" />
        </g>
        <MathArt slug={lab.slug} a={a} loop={loop} />
      </svg>
    </div>
  )
}

type Loop = (duration: number) => object

function MathArt({ slug, a, loop }: { slug: string; a: string; loop: Loop }) {
  switch (slug) {
    case 'equacoes':
      return (
        <motion.g initial={{ rotate: -6 }} animate={{ rotate: 6 }} transition={loop(3)} style={{ originX: '200px', originY: '96px' }}>
          <line x1="110" y1="96" x2="290" y2="96" stroke="#fff" strokeOpacity="0.8" strokeWidth="3" />
          <path d="M110 96 L92 140 H128 Z M290 96 L272 140 H308 Z" stroke={a} strokeWidth="2" fill={`${a}22`} />
          <rect x="99" y="116" width="22" height="22" rx="5" fill={a} />
          <circle cx="290" cy="128" r="10" fill="#fff" fillOpacity="0.85" />
          <circle cx="303" cy="130" r="6" fill="#fff" fillOpacity="0.6" />
        </motion.g>
      )
    case 'fracoes':
      return (
        <g transform="translate(200 120)">
          <circle r="70" stroke="#fff" strokeOpacity="0.4" />
          <path d="M0 0 L0 -70 A70 70 0 0 1 70 0 Z" fill={a} fillOpacity="0.8" />
          <path d="M0 0 L70 0 A70 70 0 0 1 0 70 Z" fill={a} fillOpacity="0.45" />
          <path d="M0 -70 V70 M-70 0 H70" stroke="#05060b" strokeWidth="3" />
        </g>
      )
    case 'porcentagem':
      return (
        <g transform="translate(130 40)">
          {Array.from({ length: 100 }).map((_, i) => (
            <rect key={i} x={(i % 10) * 14} y={Math.floor(i / 10) * 14} width="11" height="11" rx="2" fill={i < 37 ? a : '#fff'} fillOpacity={i < 37 ? 0.85 : 0.08} />
          ))}
        </g>
      )
    case 'funcao-afim':
      return <path d="M60 190 L360 60" stroke={a} strokeWidth="3" />
    case 'funcao-quadratica': {
      const f = (x: number) => 200 - 150 * (1 - ((x - 210) / 140) ** 2)
      return (
        <g>
          <path d={curve(f, 70, 350)} stroke={a} strokeWidth="3" strokeDasharray="2 7" />
          <motion.circle r="9" fill="#fff" initial={{ cx: 70, cy: 200 }} animate={{ cx: [70, 140, 210, 280, 350], cy: [200, 87.5, 50, 87.5, 200] }} transition={loop(2.6)} />
        </g>
      )
    }
    case 'exponencial':
      return <path d={curve((x) => 200 - 6 * Math.exp((x - 60) / 70), 60, 300)} stroke={a} strokeWidth="3" />
    case 'transformacoes':
      return (
        <g strokeWidth="3">
          <path d={curve((x) => 170 - 40 * Math.sin((x - 60) / 30))} stroke="#fff" strokeOpacity="0.3" />
          <motion.path d={curve((x) => 130 - 60 * Math.sin((x - 60) / 30))} stroke={a} initial={{ x: 0 }} animate={{ x: 40 }} transition={loop(3)} />
        </g>
      )
    case 'circulo-trigonometrico':
      return (
        <g>
          <circle cx="110" cy="130" r="60" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />
          <path d={curve((x) => 130 - 60 * Math.sin((x - 180) / 32), 180, 385)} stroke={a} strokeWidth="3" />
          <line x1="110" y1="130" x2="152" y2="87" stroke={a} strokeWidth="2" />
          <circle cx="152" cy="87" r="6" fill="#fff" />
          <line x1="152" y1="87" x2="180" y2="87" stroke="#fff" strokeOpacity="0.4" strokeDasharray="3 4" />
        </g>
      )
    case 'limites': {
      const f = (x: number) => 180 - 0.004 * (x - 60) ** 2
      return (
        <g>
          <path d={curve(f, 60, 380)} stroke={a} strokeWidth="3" />
          <circle cx="230" cy={f(230)} r="7" fill="#05060b" stroke="#fff" strokeWidth="2.5" />
        </g>
      )
    }
    case 'derivada': {
      const f = (x: number) => 190 - 120 / (1 + Math.exp(-(x - 200) / 45))
      return (
        <g>
          <path d={curve(f, 60, 380)} stroke="#fff" strokeOpacity="0.85" strokeWidth="3" />
          <motion.g initial={{ rotate: -14 }} animate={{ rotate: 0 }} transition={loop(2.4)} style={{ originX: '200px', originY: `${f(200)}px` }}>
            <line x1="90" y1={f(200) + 73} x2="310" y2={f(200) - 73} stroke={a} strokeWidth="3" />
          </motion.g>
          <circle cx="200" cy={f(200)} r="7" fill={a} />
        </g>
      )
    }
    case 'integral': {
      const f = (x: number) => 160 - 70 * Math.sin((x - 60) / 90)
      return (
        <g>
          {Array.from({ length: 12 }).map((_, i) => {
            const x = 80 + i * 22
            return <rect key={i} x={x} y={f(x + 11)} width="20" height={200 - f(x + 11)} fill={a} fillOpacity={0.25 + (i % 2) * 0.15} />
          })}
          <path d={curve(f, 60, 380)} stroke="#fff" strokeOpacity="0.9" strokeWidth="3" />
        </g>
      )
    }
    case 'tecnicas-integracao':
      return (
        <text x="200" y="160" textAnchor="middle" fontSize="120" fill={a} fillOpacity="0.85" fontFamily="serif" fontStyle="italic">
          ∫
        </text>
      )
    case 'series-taylor': {
      const s = (x: number) => 130 - 60 * Math.sin((x - 200) / 40)
      const p = (x: number) => {
        const t = (x - 200) / 40
        return 130 - 60 * (t - t ** 3 / 6 + t ** 5 / 120)
      }
      return (
        <g strokeWidth="3">
          <path d={curve(s)} stroke="#fff" strokeOpacity="0.5" />
          <path d={curve(p, 80, 320)} stroke={a} />
        </g>
      )
    }
    case 'gradiente':
      return (
        <g>
          {[100, 78, 56, 34].map((r, i) => (
            <ellipse key={r} cx="210" cy="130" rx={r * 1.5} ry={r} stroke={a} strokeOpacity={0.3 + i * 0.18} strokeWidth="2" />
          ))}
          <path d="M110 190 L170 150" stroke="#fff" strokeWidth="3" />
          <path d="M170 150 l-14 1 l6 -12 Z" fill="#fff" />
        </g>
      )
    case 'integrais-multiplas':
      return (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M120 ${170 - i * 22} L200 ${140 - i * 22} L300 ${160 - i * 22} L220 ${190 - i * 22} Z`} fill={a} fillOpacity={0.15 + i * 0.12} stroke={a} strokeOpacity="0.7" />
          ))}
        </g>
      )
    case 'equacoes-diferenciais': {
      const segs = []
      for (let i = 0; i < 9; i++)
        for (let j = 0; j < 6; j++) {
          const x = 80 + i * 36
          const y = 40 + j * 32
          const slope = -(y - 130) / 60
          const ang = Math.atan(slope)
          segs.push(<line key={`${i}-${j}`} x1={x - 10 * Math.cos(ang)} y1={y + 10 * Math.sin(ang)} x2={x + 10 * Math.cos(ang)} y2={y - 10 * Math.sin(ang)} stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />)
        }
      return (
        <g>
          {segs}
          <path d={curve((x) => 130 + 80 * Math.exp(-(x - 60) / 60), 60, 380)} stroke={a} strokeWidth="3" />
        </g>
      )
    }
    case 'campos-vetoriais':
      return (
        <g stroke={a} strokeWidth="2">
          {Array.from({ length: 24 }).map((_, k) => {
            const i = k % 6
            const j = Math.floor(k / 6)
            const x = 90 + i * 44
            const y = 50 + j * 50
            const dx = -(y - 125) * 0.18
            const dy = (x - 200) * 0.18
            return <line key={k} x1={x} y1={y} x2={x + dx} y2={y + dy} strokeOpacity="0.8" />
          })}
        </g>
      )
    default:
      return <path d={curve((x) => 130 - 50 * Math.sin((x - 60) / 40), 60, 380)} stroke={a} strokeWidth="3" />
  }
}
