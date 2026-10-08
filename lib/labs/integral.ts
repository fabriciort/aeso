import type { Lab } from './types'

// Definição do laboratório "integral" (Matemática). Conteúdo em components/labs/integral/.

export const INTEGRAL: Lab = {
  slug: 'integral',
  title: 'Somando fatias infinitas',
  subtitle: 'Corte uma área curva em retângulos cada vez mais finos e descubra a integral, e por que ela desfaz a derivada.',
  area: 'Matemática',
  level: 'Graduação',
  track: 'calculo-1',
  minutes: 20,
  status: 'em-breve',
  concepts: ['Soma de Riemann', 'Integral definida', 'Área sob a curva', 'Teorema fundamental'],
  accent: '#b388ff',
  steps: [],
}
