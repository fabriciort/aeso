import { CheckCircle2, Rocket, Workflow } from 'lucide-react'

const roadmap = [
  {
    title: 'Catálogos unificados',
    description: 'Consolidação do MAST com catálogos espectrais, radioastronômicos e arquivos proprietários através de federated search.',
    status: 'Em andamento'
  },
  {
    title: 'Laboratório de IA',
    description: 'Modelos de machine learning para classificação morfológica, detecção de transientes e sumarização de observações.',
    status: 'Prototipando'
  },
  {
    title: 'Workflows colaborativos',
    description: 'Playbooks versionados, comentários contextuais e trilhas auditáveis para equipes distribuídas.',
    status: 'Planejado'
  }
]

export default function ObservatoryRoadmap() {
  return (
    <section id="roadmap" className="space-y-8">
      <div className="flex items-center gap-3 text-sm text-emerald-200">
        <Workflow className="h-4 w-4" />
        Roadmap da plataforma
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {roadmap.map((item) => (
          <div key={item.title} className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                {item.status}
              </span>
              <Rocket className="h-4 w-4 text-emerald-200" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-sm text-slate-300">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
