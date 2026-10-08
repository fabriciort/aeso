import type { Lab, TrackId } from './types'
import { CIRCULO_TRIGONOMETRICO } from './circulo-trigonometrico'
import { DERIVADA } from './derivada'
import { EQUACOES } from './equacoes'
import { EQUACOES_DIFERENCIAIS } from './equacoes-diferenciais'
import { FUNCAO_QUADRATICA } from './funcao-quadratica'
import { GRADIENTE } from './gradiente'
import { INTEGRAL } from './integral'
import { SERIES_TAYLOR } from './series-taylor'

// Matemática: trilhas (tracks) from matemática básica to Cálculo 4. Each
// trilha is an ordered list of laboratórios; the ones not built yet are
// listed as "em breve" so the student sees the whole path.

export interface Track {
  id: TrackId
  title: string
  /** Who it is for, in a few words. */
  level: string
  /** One sentence: what the student will be able to do. */
  promise: string
  accent: string
  /** Lab slugs, in order. */
  labs: string[]
}

function soon(slug: string, track: TrackId, title: string, subtitle: string, concepts: string[], accent: string, level: Lab['level']): Lab {
  return { slug, title, subtitle, area: 'Matemática', level, track, minutes: 15, status: 'em-breve', concepts, accent, steps: [] }
}

const FRACOES = soon('fracoes', 'basica', 'Frações de pizza', 'Corte, junte e compare pedaços até frações virarem algo que você enxerga.', ['Frações', 'Equivalência', 'Soma de frações'], '#7bd88f', 'Ensino fundamental')
const PORCENTAGEM = soon('porcentagem', 'basica', 'Porcentagem sem susto', 'Descontos, juros e gráficos: tudo é “por cem”.', ['Porcentagem', 'Proporção', 'Regra de três'], '#7bd88f', 'Ensino fundamental')
const FUNCAO_AFIM = soon('funcao-afim', 'ensino-medio', 'A reta da corrida de táxi', 'Bandeirada e preço por km: o que a inclinação de uma reta significa.', ['Função afim', 'Coeficiente angular', 'Gráfico'], '#ffb454', 'Ensino médio')
const EXPONENCIAL = soon('exponencial', 'ensino-medio', 'Dobrar, dobrar, dobrar', 'Por que coisas que crescem em proporção explodem, e como o logaritmo as doma.', ['Função exponencial', 'Logaritmo', 'Juros compostos'], '#ffb454', 'Ensino médio')
const FUNCOES_TRANSFORMACOES = soon('transformacoes', 'pre-calculo', 'Esticar, deslocar, refletir', 'Mexa nos números de f(x) e veja o gráfico obedecer.', ['Funções', 'Translação', 'Composição', 'Inversa'], '#6cc4ff', 'Pré-cálculo')
const LIMITES = soon('limites', 'calculo-1', 'Chegar perto sem chegar', 'O que acontece quando x se aproxima de um valor: a ideia que sustenta todo o Cálculo.', ['Limite', 'Continuidade', 'Assíntotas'], '#ff6b8b', 'Graduação')
const TECNICAS = soon('tecnicas-integracao', 'calculo-2', 'Desmontando integrais', 'Substituição e integração por partes como peças de quebra-cabeça.', ['Substituição', 'Por partes', 'Frações parciais'], '#4dd0c4', 'Graduação')
const MULTIPLAS = soon('integrais-multiplas', 'calculo-3', 'Volume em camadas', 'Empilhe fatias para calcular volumes e massas com integrais duplas e triplas.', ['Integral dupla', 'Integral tripla', 'Mudança de coordenadas'], '#f5d061', 'Graduação')
const CAMPOS = soon('campos-vetoriais', 'calculo-4', 'Ventos e redemoinhos', 'Divergente, rotacional e os teoremas de Green e Stokes num campo de vento.', ['Campos vetoriais', 'Divergente', 'Rotacional', 'Teorema de Green'], '#ff8a5c', 'Graduação')

export const MATH_LABS: Lab[] = [
  FRACOES,
  EQUACOES,
  PORCENTAGEM,
  FUNCAO_AFIM,
  FUNCAO_QUADRATICA,
  EXPONENCIAL,
  FUNCOES_TRANSFORMACOES,
  CIRCULO_TRIGONOMETRICO,
  LIMITES,
  DERIVADA,
  INTEGRAL,
  SERIES_TAYLOR,
  TECNICAS,
  GRADIENTE,
  MULTIPLAS,
  EQUACOES_DIFERENCIAIS,
  CAMPOS,
]

export const TRACKS: Track[] = [
  {
    id: 'basica',
    title: 'Matemática básica',
    level: 'Ensino fundamental',
    promise: 'Frações, equações e porcentagem com as mãos: balanças, pizzas e descontos.',
    accent: '#7bd88f',
    labs: ['fracoes', 'equacoes', 'porcentagem'],
  },
  {
    id: 'ensino-medio',
    title: 'Ensino médio',
    level: 'Funções e gráficos',
    promise: 'Leia um gráfico como uma história: retas, parábolas e crescimento exponencial.',
    accent: '#ffb454',
    labs: ['funcao-afim', 'funcao-quadratica', 'exponencial'],
  },
  {
    id: 'pre-calculo',
    title: 'Pré-cálculo',
    level: 'A ponte para o Cálculo',
    promise: 'Transforme funções e entenda a trigonometria como movimento.',
    accent: '#6cc4ff',
    labs: ['transformacoes', 'circulo-trigonometrico'],
  },
  {
    id: 'calculo-1',
    title: 'Cálculo 1',
    level: 'Diferencial e integral',
    promise: 'Limite, derivada e integral: medir o instante e somar o contínuo.',
    accent: '#ff6b8b',
    labs: ['limites', 'derivada', 'integral'],
  },
  {
    id: 'calculo-2',
    title: 'Cálculo 2',
    level: 'Integração e séries',
    promise: 'Técnicas de integração e séries que imitam qualquer curva.',
    accent: '#4dd0c4',
    labs: ['series-taylor', 'tecnicas-integracao'],
  },
  {
    id: 'calculo-3',
    title: 'Cálculo 3',
    level: 'Várias variáveis',
    promise: 'Superfícies, gradiente e integrais múltiplas em três dimensões.',
    accent: '#f5d061',
    labs: ['gradiente', 'integrais-multiplas'],
  },
  {
    id: 'calculo-4',
    title: 'Cálculo 4',
    level: 'Equações diferenciais e campos',
    promise: 'Equações que descrevem a mudança e campos vetoriais que descrevem o espaço.',
    accent: '#ff8a5c',
    labs: ['equacoes-diferenciais', 'campos-vetoriais'],
  },
]

export function getTrack(id: string | undefined): Track | undefined {
  return TRACKS.find((t) => t.id === id)
}
