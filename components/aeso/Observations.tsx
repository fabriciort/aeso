'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Download, FileDown, ImageOff, Lock, Terminal } from 'lucide-react'
import type { DataProduct, Observation } from '@/lib/astro/types'
import { curlScript, downloadAll, fetchProducts, saveFile } from '@/lib/client/api'
import { formatBytes, formatDate, formatExposure } from '@/lib/format'
import { missionColor, missionRank } from '@/lib/missions'
import { cn } from '@/lib/utils'

interface ObservationsProps {
  observations: Observation[] | null
  error?: string | null
  targetLabel: string
  highlighted: string | null
  onHighlight: (obsid: string | null) => void
}

const TYPE_LABEL: Record<string, string> = {
  image: 'Imagem',
  spectrum: 'Espectro',
  cube: 'Cubo',
  timeseries: 'Série temporal',
}

const PAGE = 24

export default function Observations({ observations, error, targetLabel, highlighted, onHighlight }: ObservationsProps) {
  const [mission, setMission] = useState<string>('all')
  const [kind, setKind] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [visible, setVisible] = useState(PAGE)

  useEffect(() => {
    setMission('all')
    setKind('all')
    setExpanded(null)
    setVisible(PAGE)
  }, [observations])

  const missions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const o of observations ?? []) counts.set(o.collection, (counts.get(o.collection) ?? 0) + 1)
    return Array.from(counts.entries()).sort((a, b) => missionRank(a[0]) - missionRank(b[0]) || b[1] - a[1])
  }, [observations])

  const kinds = useMemo(() => Array.from(new Set((observations ?? []).map((o) => o.productType).filter(Boolean))) as string[], [observations])

  const filtered = useMemo(() => {
    return (observations ?? [])
      .filter((o) => (mission === 'all' || o.collection === mission) && (kind === 'all' || o.productType === kind))
      .sort(
        (a, b) =>
          missionRank(a.collection) - missionRank(b.collection) ||
          Number(b.isPublic) - Number(a.isPublic) ||
          (b.date ?? '').localeCompare(a.date ?? ''),
      )
  }, [observations, mission, kind])

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Arquivo MAST</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-white">Observações e dados</h2>
        </div>
        {observations && (
          <p className="text-sm text-white/45">
            {observations.length === 0
              ? 'Nenhuma observação'
              : `${filtered.length} de ${observations.length} observaç${observations.length === 1 ? 'ão' : 'ões'}`}
          </p>
        )}
      </div>

      {error && <div className="rounded-3xl border border-rose-400/20 bg-rose-500/[0.06] p-5 text-sm text-rose-100/80">{error}</div>}

      {!observations && !error && <ObservationsSkeleton />}

      {observations && observations.length === 0 && !error && (
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 text-center text-sm text-white/50">
          O MAST não tem observações científicas nesta região do céu.
        </div>
      )}

      {observations && observations.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            <FilterPill active={mission === 'all'} onClick={() => setMission('all')}>
              Todas
            </FilterPill>
            {missions.map(([m, count]) => (
              <FilterPill key={m} active={mission === m} onClick={() => setMission(m)} color={missionColor(m)}>
                {m} <span className="text-white/40">{count}</span>
              </FilterPill>
            ))}
            {kinds.length > 1 && <span className="mx-1 w-px self-stretch bg-white/10" />}
            {kinds.length > 1 &&
              ['all', ...kinds].map((k) => (
                <FilterPill key={k} active={kind === k} onClick={() => setKind(k)}>
                  {k === 'all' ? 'Todos os tipos' : (TYPE_LABEL[k] ?? k)}
                </FilterPill>
              ))}
          </div>

          <motion.ul layout className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false} mode="popLayout">
              {filtered.slice(0, visible).map((o, i) => (
                <ObservationCard
                  key={o.obsid}
                  index={i}
                  observation={o}
                  expanded={expanded === o.obsid}
                  highlighted={highlighted === o.obsid}
                  onToggle={() => setExpanded(expanded === o.obsid ? null : o.obsid)}
                  onHover={(h) => onHighlight(h ? o.obsid : null)}
                  targetLabel={targetLabel}
                />
              ))}
            </AnimatePresence>
          </motion.ul>

          {filtered.length > visible && (
            <div className="flex justify-center">
              <button onClick={() => setVisible((v) => v + PAGE)} className="chip focus-ring px-5 py-2">
                Mostrar mais {Math.min(PAGE, filtered.length - visible)}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function FilterPill({ active, onClick, color, children }: { active: boolean; onClick: () => void; color?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'focus-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-all duration-200',
        active ? 'border-white/25 bg-white/[0.12] text-white' : 'border-white/[0.07] bg-white/[0.03] text-white/60 hover:text-white',
      )}
    >
      {color && <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />}
      {children}
    </button>
  )
}

function ObservationCard({
  observation: o,
  index,
  expanded,
  highlighted,
  onToggle,
  onHover,
  targetLabel,
}: {
  observation: Observation
  index: number
  expanded: boolean
  highlighted: boolean
  onToggle: () => void
  onHover: (h: boolean) => void
  targetLabel: string
}) {
  const color = missionColor(o.collection)
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: Math.min(index, 12) * 0.03, type: 'spring', stiffness: 300, damping: 30 } }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cn(
        'overflow-hidden rounded-3xl border bg-white/[0.025] transition-colors duration-300',
        expanded ? 'md:col-span-2 xl:col-span-3' : '',
        highlighted ? 'border-white/25 bg-white/[0.05]' : 'border-white/[0.06]',
      )}
    >
      <button onClick={onToggle} className="focus-ring flex w-full gap-3.5 p-3 text-left" aria-expanded={expanded}>
        <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-2xl bg-black">
          {o.previewUrl && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={o.previewUrl} alt="" loading="lazy" onError={() => setImgFailed(true)} className="h-full w-full object-cover opacity-90" />
          ) : (
            <div className="grid h-full w-full place-items-center text-white/20">
              <ImageOff className="h-5 w-5" />
            </div>
          )}
          <span className="absolute inset-x-0 bottom-0 h-0.5" style={{ background: color }} />
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold" style={{ color }}>
              {o.collection}
            </span>
            <span className="truncate text-[13px] text-white/75">{o.instrument}</span>
            {!o.isPublic && (
              <span title="Período proprietário: dados ainda não públicos" className="text-amber-300/80">
                <Lock className="h-3 w-3" />
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-white">{o.filters ?? '—'}</p>
          <p className="mt-1 truncate text-xs text-white/40">
            {TYPE_LABEL[o.productType ?? ''] ?? o.productType ?? 'Dados'} · {formatDate(o.date)} · {formatExposure(o.exposure)}
          </p>
        </div>
        <ChevronDown className={cn('mt-1 h-4 w-4 shrink-0 text-white/40 transition-transform duration-300', expanded && 'rotate-180')} />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
            className="overflow-hidden"
          >
            <Products observation={o} targetLabel={targetLabel} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  )
}

function Products({ observation: o, targetLabel }: { observation: Observation; targetLabel: string }) {
  const [products, setProducts] = useState<DataProduct[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [onlyScience, setOnlyScience] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetchProducts(o.obsid, controller.signal)
      .then((p) => {
        setProducts(p)
        setSelected(new Set(p.filter((x) => x.productType === 'SCIENCE' && x.calibLevel && x.calibLevel >= 2).map((x) => x.id)))
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Erro ao listar arquivos')
      })
    return () => controller.abort()
  }, [o.obsid])

  const shown = (products ?? []).filter((p) => !onlyScience || p.productType === 'SCIENCE' || p.productType === 'PREVIEW')
  const chosen = (products ?? []).filter((p) => selected.has(p.id))
  const total = chosen.reduce((s, p) => s + (p.size ?? 0), 0)

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="border-t border-white/[0.06] p-4">
      <div className="mb-3 grid grid-cols-2 gap-3 text-xs text-white/50 sm:grid-cols-4">
        <Meta label="Obs ID" value={o.obsid} mono />
        <Meta label="Alvo" value={o.target ?? '—'} />
        <Meta label="Proposta" value={o.proposalId ?? '—'} mono />
        <Meta label="Região espectral" value={o.wavelengthRegion ?? '—'} />
      </div>

      {error && <p className="text-sm text-rose-200/80">{error}</p>}
      {!products && !error && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      )}

      {products && (
        <>
          <div className="mb-2 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-white/55">
              <input type="checkbox" checked={onlyScience} onChange={(e) => setOnlyScience(e.target.checked)} className="accent-sky-400" />
              Apenas ciência e prévias
            </label>
            <span className="text-xs text-white/40">{products.length} arquivos</span>
          </div>
          <ul className="max-h-72 space-y-1 overflow-y-auto pr-1">
            {shown.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.04]">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                  disabled={!p.isPublic}
                  aria-label={`Selecionar ${p.filename}`}
                  className="accent-sky-400"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[12px] text-white/85">{p.filename}</p>
                  <p className="truncate text-[11px] text-white/40">
                    {[p.productType, p.subgroup, p.description].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] tabular-nums text-white/45">{formatBytes(p.size)}</span>
                {p.isPublic ? (
                  <a
                    href={p.downloadUrl}
                    className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
                    aria-label={`Baixar ${p.filename}`}
                    title="Baixar"
                  >
                    <FileDown className="h-4 w-4" />
                  </a>
                ) : (
                  <Lock className="mx-2 h-3.5 w-3.5 text-amber-300/70" aria-label="Proprietário" />
                )}
              </li>
            ))}
            {shown.length === 0 && <li className="px-2 py-3 text-sm text-white/45">Nenhum arquivo neste filtro.</li>}
          </ul>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
            <p className="text-xs text-white/50">
              {chosen.length} selecionado{chosen.length === 1 ? '' : 's'} · {formatBytes(total)}
            </p>
            <div className="flex gap-2">
              <button
                disabled={!chosen.length}
                onClick={() => saveFile(curlScript(chosen, `${targetLabel}_${o.obsid}`), `aeso_${o.obsid}.sh`, 'text/x-shellscript')}
                className="chip focus-ring disabled:pointer-events-none disabled:opacity-40"
                title="Script bash com curl para baixar tudo de uma vez"
              >
                <Terminal className="h-3.5 w-3.5" /> Script curl
              </button>
              <button
                disabled={!chosen.length}
                onClick={() => downloadAll(chosen.map((p) => p.downloadUrl))}
                className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-black transition hover:bg-white/90 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" /> Baixar selecionados
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="eyebrow !text-[10px]">{label}</p>
      <p className={cn('mt-0.5 truncate text-white/80', mono && 'font-mono')}>{value}</p>
    </div>
  )
}

function ObservationsSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3.5 rounded-3xl border border-white/[0.05] bg-white/[0.02] p-3">
          <div className="relative h-[76px] w-[76px] overflow-hidden rounded-2xl bg-white/[0.04]">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          </div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 w-1/3 rounded bg-white/[0.06]" />
            <div className="h-3 w-2/3 rounded bg-white/[0.05]" />
            <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  )
}
