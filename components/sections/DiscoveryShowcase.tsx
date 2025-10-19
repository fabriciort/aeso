import Card from '@/components/Card'
import { Sparkles } from 'lucide-react'

const cards = [
  {
    title: 'AstroData Studio',
    description:
      'Monte painéis com filtros dinâmicos, empilhe exposições e compare espectros direto no navegador com latência mínima.',
    link: '#',
    image: 'mast_welcome.jpeg',
    badge: 'Workspace'
  },
  {
    title: 'Insights em tempo real',
    description:
      'Acompanhe filas de observação, receba alertas de transientes e sincronize com webhooks para pipelines personalizados.',
    link: '#',
    image: 'data_card.jpeg',
    badge: 'Streaming'
  },
  {
    title: 'Narrativas científicas',
    description:
      'Transforme descobertas em histórias interativas com Markdown estendido, visualizações e compartilhamento seguro.',
    link: '#',
    image: 'blog.jpg',
    badge: 'Storytelling'
  }
]

export default function DiscoveryShowcase() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 text-sm text-emerald-200">
        <Sparkles className="h-4 w-4" />
        Experiência imersiva
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title} {...card} ctaLabel="Explorar" />
        ))}
      </div>
    </section>
  )
}
