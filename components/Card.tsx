import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

interface CardProps {
  title: string
  description: string
  link: string
  image: string
  badge?: string
  ctaLabel?: string
}

export default function Card({ title, description, link, image, badge, ctaLabel = 'Saiba mais' }: CardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 shadow-lg transition duration-500 hover:-translate-y-1 hover:border-emerald-300/60 hover:shadow-emerald-500/20">
      <div className="absolute inset-0">
        <Image
          src={`/assets/card/${image}`}
          alt={title}
          fill
          className="object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
      </div>

      <div className="relative flex h-full flex-col justify-end space-y-4 p-6 text-slate-200">
        {badge && (
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
            {badge}
          </span>
        )}
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-300">{description}</p>
        </div>
        <Link
          href={link}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition hover:text-white"
        >
          {ctaLabel}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
