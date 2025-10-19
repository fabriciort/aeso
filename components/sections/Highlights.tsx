import { Aperture, Cpu, Database, Sparkles } from 'lucide-react'

const highlights = [
  {
    title: 'Pesquisa inteligente',
    description:
      'Combine filtros por catálogo, instrumento, espectro eletromagnético e faixas temporais em consultas autocompletadas.',
    icon: Aperture
  },
  {
    title: 'Pipeline científica integrada',
    description:
      'Visualize imagens FITS, gere cortes customizados, exporte espectros e sincronize com notebooks Jupyter ou pipelines Python.',
    icon: Cpu
  },
  {
    title: 'Curadoria colaborativa',
    description:
      'Organize coleções, compartilhe anotações e gere relatórios com referências prontas para submissões científicas.',
    icon: Database
  }
]

export default function HighlightsSection() {
  return (
    <section id="catalogs" className="space-y-8">
      <div className="flex items-center gap-3 text-sm text-emerald-200">
        <Sparkles className="h-4 w-4" />
        Ecossistema AESo
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 p-6 text-slate-300 transition hover:border-emerald-300/60 hover:bg-slate-900/80"
          >
            <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
              <div className="absolute -top-24 right-0 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
            </div>
            <item.icon className="h-9 w-9 text-emerald-300" />
            <h3 className="mt-6 text-xl font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-sm text-slate-300">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
