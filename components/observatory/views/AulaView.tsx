'use client'

import { ArrowLeft } from 'lucide-react'
import { getLesson } from '@/lib/math/curriculum'
import { lessonCard, useFormationProgress } from '@/lib/math/formation-progress'
import { useRouter } from '@/lib/observatory/router'
import { Player } from '@/components/aula/Player'
import { useConteudo } from '@/components/aula/useConteudo'
import { Button } from '../ui'

// Uma aula da Formação em Matemática, em tela cheia (sem barra de abas).

export default function AulaView({ id }: { id: string }) {
  const { navigate } = useRouter()
  const conteudo = useConteudo()
  const progress = useFormationProgress()
  const back = () => navigate({ area: 'matematica', unit: getLesson(id)?.unit.id })

  if (!conteudo) {
    return (
      <div className="grid h-[100svh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
      </div>
    )
  }
  const aula = conteudo.getAula(id)
  if (!aula) {
    return (
      <div className="grid min-h-[70vh] place-items-center text-center">
        <div>
          <p className="text-[20px] text-white">{getLesson(id)?.lesson.title ?? 'Aula'}</p>
          <p className="mt-2 text-[16px] text-white/50">Em breve</p>
          <Button variant="secondary" className="mt-6" onClick={back}>
            <ArrowLeft className="h-4 w-4" /> Matemática
          </Button>
        </div>
      </div>
    )
  }
  // A finished lesson starts over; an unfinished one resumes where it stopped.
  const start = progress.lessons[id] ? 0 : lessonCard(progress, id)
  // The next lesson in the order of the formation, when its content is ready.
  const next = conteudo.AULAS[conteudo.AULAS.findIndex((a) => a.id === id) + 1]
  return (
    <Player
      key={id}
      aula={aula}
      getGerador={conteudo.getGerador}
      roteiro={conteudo.ROTEIRO_DIAGNOSTICO_ENTRADA}
      start={start}
      onExit={back}
      next={next && { id: next.id, titulo: next.titulo }}
      onNext={next && (() => navigate({ area: 'aula', id: next.id }))}
    />
  )
}
