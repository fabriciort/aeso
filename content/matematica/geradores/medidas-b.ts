import type { Gerador, Item, Resposta, Rng, Visual } from '@/lib/formation/schema'

// Unidade 9: medidas (aulas 4 a 6). Volume e o litro, tempo (base 60) e
// unidades de outros sistemas, convertidas com um fator.
//
// Toda conta é feita em inteiros: um decimal é guardado como a quantidade
// de décimos, centésimos ou milésimos (2,54 é 254 centésimos), e só vira
// texto com vírgula no fim. Respostas decimais vão como texto com vírgula
// ('5,08'); respostas inteiras, como número. Horas e minutos nunca são a
// resposta digitada: pede-se um número só (os minutos) ou usa-se escolha.
// Cada gerador escolhe direto a partir do rng, sem laços de tentativa.

/** n em unidades de 10^-casas, com vírgula e sem zeros no fim: (508, 2) → '5,08'; (1270, 2) → '12,7'; (500, 2) → '5'. */
function dec(n: number, casas: number): string {
  const s = String(n).padStart(casas + 1, '0')
  const inteira = s.slice(0, s.length - casas)
  const resto = s.slice(s.length - casas).replace(/0+$/, '')
  return resto ? `${inteira},${resto}` : inteira
}
/** Milhar com ponto, para o enunciado: 72000 → 72.000. */
const mil = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
/** Um decimal com milhar: (1852000, 3) → '1.852'. */
const decMil = (n: number, casas: number) => {
  const [a, b] = dec(n, casas).split(',')
  return b ? `${mil(Number(a))},${b}` : mil(Number(a))
}
/** A resposta como o aluno digita: inteiro vira número; decimal, texto com vírgula. */
function resposta(n: number, casas: number): Resposta {
  const t = dec(n, casas)
  return t.includes(',') ? t : Number(t)
}

/** Erros previsíveis, sem marcar a certa e sem repetir. */
function mapa(certa: Resposta, pares: [string, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (valor !== String(certa) && !(valor in erros)) erros[valor] = erro
  }
  return erros
}

type Op = { texto: string; certa?: boolean; erro?: string }
/** Opções em ordem embaralhada pela semente; a resposta é o índice da certa. */
function embaralhar(r: Rng, opcoes: Op[]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const resto = [...opcoes]
  const ordem: Op[] = []
  while (resto.length) ordem.push(resto.splice(r.int(0, resto.length - 1), 1)[0])
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => o.erro && (erros[String(i)] = o.erro))
  return { opcoes: ordem.map((o) => o.texto), resposta: ordem.findIndex((o) => o.certa), erros }
}

const VOLUME = ['m³', 'dm³', 'cm³']
const quadro = (numero: string, de: string, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { medida: { casas: VOLUME, porCasa: 3, numero, de } }, esboco })

// ---------------------------------------------------------------- aula 4: volume e o litro

export const volumeLitroN1: Gerador = {
  id: 'volume-litro-n1',
  aula: 'B.U9.A4',
  nivel: 1,
  gerar(r) {
    // Litros em décimos (1,5 L são 15 décimos); 1 L = 1.000 mL = 1.000 cm³.
    const t = r.pick([2, 3, 5, 6, 8, 12, 15, 18, 20, 25, 35, 50])
    const x = dec(t, 1)
    const certa = t * 100
    const ml = r.int(0, 1) === 0
    const u = ml ? 'mL' : 'cm³'
    return {
      enunciado: ml ? `Uma garrafa tem ${x} L. Quantos mL cabem nela?` : `Quantos cm³ cabem em ${x} L?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(t * 10), 'converte-volume-como-comprimento'],
        [String(t), 'converte-volume-como-comprimento'],
        [dec(t, 4), 'converte-no-sentido-errado'],
      ]),
      dicas: [
        '1 L é o cubo de 10 cm: 1.000 cubinhos de 1 cm³, e cada cubinho é 1 mL.',
        `Do litro para o ${u}, a vírgula anda 3 algarismos: ${x} × 1.000.`,
        `${x} L = ${mil(certa)} ${u}.`,
      ],
      visual: quadro(x, 'dm³', `O quadro de volume com ${x} na casa do dm³, que é o litro. Ao conferir, a vírgula pula 3 algarismos até o cm³.`),
    }
  },
}

export const volumeLitroN2: Gerador = {
  id: 'volume-litro-n2',
  aula: 'B.U9.A4',
  nivel: 2,
  gerar(r) {
    // m³ em décimos (2,5 m³ são 25 décimos); 1 m³ = 1.000 L.
    const c = r.int(2, 40)
    const x = dec(c, 1)
    const litros = c * 100
    if (r.int(0, 1) === 0) {
      const certa = litros
      return {
        enunciado: `Uma caixa-d'água tem ${x} m³. Quantos litros cabem nela?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [String(c), 'converte-volume-como-comprimento'],
          [String(c * 10), 'converte-volume-como-comprimento'],
          [x, 'confunde-m3-com-litro'],
        ]),
        dicas: [
          '1 m³ é um cubo de 1 m de lado: cabem nele 10 × 10 × 10 cubos de 10 cm, de 1 L cada.',
          `1 m³ = 1.000 L. Faça ${x} × 1.000.`,
          `${x} m³ = ${mil(certa)} L.`,
        ],
        visual: quadro(x, 'm³', `O quadro de volume com ${x} na casa do m³. Ao conferir, a vírgula pula 3 algarismos até o dm³, o litro.`),
      }
    }
    const certa = resposta(c, 1)
    return {
      enunciado: `Uma caixa-d'água tem ${mil(litros)} L. Quantos m³ é isso?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(c * 10), 'converte-volume-como-comprimento'],
        [String(c), 'converte-volume-como-comprimento'],
        [String(litros), 'confunde-m3-com-litro'],
        [String(litros * 1000), 'converte-no-sentido-errado'],
      ]),
      dicas: [
        'O m³ é maior que o litro: em m³, o número diminui.',
        `Cada 1.000 L fazem 1 m³. Faça ${mil(litros)} ÷ 1.000.`,
        `${mil(litros)} L = ${x} m³.`,
      ],
      visual: quadro(String(litros), 'dm³', `O quadro de volume com ${mil(litros)} terminando na casa do dm³, o litro. Ao conferir, a vírgula volta 3 algarismos até o m³.`),
    }
  },
}

const CAIXAS = ['Um aquário', 'Uma caixa térmica', 'Uma floreira', 'Um baú']

export const volumeLitroN3: Gerador = {
  id: 'volume-litro-n3',
  aula: 'B.U9.A4',
  nivel: 3,
  gerar(r) {
    // Três medidas em dezenas de cm: o volume em cm³ é sempre um número de litros inteiro.
    const a = r.pick([20, 30, 40, 50, 60, 80])
    const b = r.pick([20, 30, 40, 50])
    const h = r.pick([10, 20, 30, 40, 50])
    const cm3 = a * b * h
    const certa = cm3 / 1000
    return {
      enunciado: `${r.pick(CAIXAS)} tem ${a} cm × ${b} cm × ${h} cm por dentro. Quantos litros cabem?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(cm3 / 100), 'converte-volume-como-comprimento'],
        [String(cm3 / 10), 'converte-volume-como-comprimento'],
        [String(a + b + h), 'soma-no-lugar-de-multiplicar'],
      ]),
      dicas: [
        'Conte em cubinhos de 1 cm³: quantos no fundo, e quantas camadas. Depois, 1.000 cm³ fazem 1 L.',
        `O fundo tem ${a} × ${b} = ${mil(a * b)} cubinhos, em ${h} camadas.`,
        `${mil(a * b)} × ${h} = ${mil(cm3)} cm³, e ${mil(cm3)} ÷ 1.000 = ${certa} L.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 5: tempo

const QUARTOS = ['', 'um quarto de hora, 15 min', 'meia hora, 30 min', 'três quartos de hora, 45 min']
/** Minutos de relógio com 2 algarismos: 5 → '05'. */
const mm = (m: number) => String(m).padStart(2, '0')
/** Um horário como se lê no texto: 19 h 40; 21 h na hora cheia. */
const hora = (h: number, m: number) => (m === 0 ? `${h} h` : `${h} h ${mm(m)}`)

export const tempoN1: Gerador = {
  id: 'tempo-n1',
  aula: 'B.U9.A5',
  nivel: 1,
  gerar(r) {
    // Horas em quartos (1,5 h são 6 quartos), sem as horas cheias.
    const q = r.pick([1, 2, 3, 5, 6, 7, 9, 10, 11])
    const inteiras = Math.floor(q / 4)
    const resto = q % 4
    const x = dec(q * 25, 2)
    const certa = q * 15
    // Quem lê o depois da vírgula como minutos: 1,5 → 1 h 50 (ou 1 h 5); 1,25 → 1 h 25.
    const comoMinutos = inteiras * 60 + resto * 25
    const algarismos = inteiras * 60 + Number(x.split(',')[1])
    const ate = (inteiras + 1) * 60
    return {
      enunciado: r.int(0, 1) === 0 ? `Quantos minutos tem ${x} h?` : `O trajeto leva ${x} h. Quantos minutos são?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(comoMinutos), 'hora-decimal-como-minutos'],
        [String(algarismos), 'hora-decimal-como-minutos'],
        [String(q * 25), 'tempo-em-base-cem'],
      ]),
      dicas: [
        'A hora tem 60 min. O que vem depois da vírgula é um pedaço da hora: 0,5 h é meia hora.',
        inteiras > 0 ? `${inteiras} h são ${inteiras * 60} min. O resto, 0,${x.split(',')[1]} h, é ${QUARTOS[resto]}.` : `0,${x.split(',')[1]} h é ${QUARTOS[resto]}.`,
        inteiras > 0 ? `${inteiras * 60} + ${resto * 15} = ${certa} min.` : `${x} h = ${certa} min.`,
      ],
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate, passo: 15, marcas: Array.from({ length: inteiras + 2 }, (_, i) => i * 60), unidade: 'min' },
        esboco: `A reta dos minutos de 0 a ${ate}, com traços de 15 em 15 e as horas cheias escritas. Ao conferir, um salto de 0 até ${certa}.`,
      },
    }
  },
}

const SOMAS: ((inicio: string, d: number) => string)[] = [
  (inicio, d) => `O bolo entrou no forno às ${inicio} e leva ${d} min. A que horas sai?`,
  (inicio, d) => `A reunião começa às ${inicio} e dura ${d} min. A que horas termina?`,
  (inicio, d) => `O ônibus sai às ${inicio} e a viagem leva ${d} min. A que horas chega?`,
]

export const tempoN2: Gerador = {
  id: 'tempo-n2',
  aula: 'B.U9.A5',
  nivel: 2,
  gerar(r) {
    // Minutos de 5 em 5 que, somados, passam da hora: 35 a 55 min mais 20 a 55 min.
    const h = r.int(6, 20)
    const m = r.int(7, 11) * 5
    const d = r.int(Math.max(4, 13 - m / 5), 11) * 5
    const soma = m + d
    const sobra = soma - 60
    return {
      enunciado: r.pick(SOMAS)(hora(h, m), d),
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: hora(h + 1, sobra), certa: true },
        { texto: `${h} h ${soma}`, erro: 'tempo-em-base-cem' },
        { texto: hora(h, sobra), erro: 'esquece-reserva' },
      ]),
      dicas: [
        'A hora tem 60 min. Quando os minutos passam de 60, 60 deles viram 1 hora.',
        `${m} min + ${d} min = ${soma} min. Isso passa de 60.`,
        `${soma} min = 1 h ${mm(sobra)} min. Então: ${hora(h + 1, sobra)}.`,
      ],
      visual: {
        modelo: 'barra',
        estado: { partes: 12, inteiros: 2, pintadas: soma / 5, rotulo: `+ ${d} min` },
        esboco: `Duas horas lado a lado, das ${h} h às ${h + 2} h, cada uma em 12 partes de 5 min. O pintado começa no 0 e vai até ${m} + ${d} min, passando da primeira hora.`,
      },
    }
  },
}

const DURACOES: ((inicio: string, fim: string) => string)[] = [
  (inicio, fim) => `O filme começa às ${inicio} e acaba às ${fim}. Quantos minutos dura?`,
  (inicio, fim) => `O voo sai às ${inicio} e pousa às ${fim}. Quantos minutos dura a viagem?`,
  (inicio, fim) => `Você estacionou às ${inicio} e saiu às ${fim}. Quantos minutos o carro ficou?`,
]

export const tempoN3: Gerador = {
  id: 'tempo-n3',
  aula: 'B.U9.A5',
  nivel: 3,
  gerar(r) {
    // Os minutos do fim são menos que os do começo: a conta passa por uma hora cheia.
    const h1 = r.int(7, 19)
    const dh = r.int(1, 3)
    const m1 = r.int(4, 11) * 5
    const m2 = r.int(0, m1 / 5 - 1) * 5
    const h2 = h1 + dh
    const ateCheia = 60 - m1
    const certa = ateCheia + (dh - 1) * 60 + m2
    return {
      enunciado: r.pick(DURACOES)(hora(h1, m1), hora(h2, m2)),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(h2 * 100 + m2 - (h1 * 100 + m1)), 'tempo-em-base-cem'],
        [String(dh * 60 + m1 - m2), 'subtrai-menor-do-maior'],
      ]),
      dicas: [
        'Vá até a hora cheia, conte as horas inteiras e some o que passa delas.',
        `De ${hora(h1, m1)} até ${h1 + 1} h são ${ateCheia} min.`,
        `${ateCheia} + ${(dh - 1) * 60} + ${m2} = ${certa} min.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 6: outras unidades

/** n polegadas em saltos de 2,54 cm na régua. */
function reguaPolegadas(n: number, esboco: string): Visual {
  const fim = (i: number) => (i * 254) / 100
  return {
    modelo: 'reta',
    estado: { de: 0, ate: Math.ceil(fim(n)), passo: 1, marcas: [0], unidade: 'cm', saltos: Array.from({ length: n }, (_, i) => [fim(i), fim(i + 1), '1 pol']) },
    esboco,
  }
}

/** n ÷ fator, arredondado a 1 casa, em décimos (para o erro de dividir no lugar de multiplicar). */
const divididoEmDecimos = (n: number, fatorEmMilesimos: number) => Math.round((n * 10000) / fatorEmMilesimos)

export const fatorConversaoN1: Gerador = {
  id: 'fator-conversao-n1',
  aula: 'B.U9.A6',
  nivel: 1,
  gerar(r) {
    const n = r.int(2, 6)
    const certa = resposta(n * 254, 2)
    return {
      enunciado: r.int(0, 1) === 0
        ? `Um parafuso tem ${n} polegadas de comprimento. Quantos cm? (1 pol = 2,54 cm)`
        : `A tela do celular tem ${n} polegadas na diagonal. Quantos cm? (1 pol = 2,54 cm)`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [dec(divididoEmDecimos(n, 2540), 1), 'converte-no-sentido-errado'],
        [dec(n * 100 + 254, 2), 'soma-no-lugar-de-multiplicar'],
        [dec(n * 254, 1), 'fator-de-conversao-errado'],
      ]),
      dicas: [
        'Cada polegada tem 2,54 cm. O cm é menor: em cm, o número cresce.',
        `São ${n} polegadas, ${n} saltos de 2,54 cm: faça ${n} × 2,54.`,
        `${n} × 2,54 = ${dec(n * 254, 2)} cm.`,
      ],
      visual: reguaPolegadas(n, `A régua em cm com ${n} saltos de 2,54 cm, cada um com "1 pol" em cima.`),
    }
  },
}

const MILHAS_NA_RETA: Visual = {
  modelo: 'reta',
  estado: { de: 0, ate: 2, passo: 0.1, marcas: [0, 1, 1.6, 1.852], unidade: 'km' },
  esboco: 'A reta de 0 a 2 km com as duas milhas: a da estrada em 1,6 e a náutica em 1,852.',
}

export const fatorConversaoN2: Gerador = {
  id: 'fator-conversao-n2',
  aula: 'B.U9.A6',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // O sentido de volta: centímetros em polegadas, dividindo.
      const n = r.int(2, 9)
      const x = dec(n * 254, 2)
      return {
        enunciado: `Um cano tem ${x} cm de diâmetro. Quantas polegadas? (1 pol = 2,54 cm)`,
        formato: 'numero',
        resposta: n,
        erros: mapa(n, [
          [dec(n * 254 * 254, 4), 'converte-no-sentido-errado'],
          [dec(n, 1), 'fator-de-conversao-errado'],
        ]),
        dicas: [
          'A polegada é maior que o cm: em polegadas, o número diminui. Divida pelo fator.',
          `Quantas vezes 2,54 cabe em ${x}? Faça ${x} ÷ 2,54.`,
          `${x} ÷ 2,54 = ${n} polegadas. Confira: ${n} × 2,54 = ${x}.`,
        ],
        visual: reguaPolegadas(n, `A régua em cm até ${x}, coberta por ${n} saltos de 2,54 cm.`),
      }
    }
    // A milha náutica: 1,852 km, não o 1,6 da milha da estrada.
    const n = r.int(2, 20)
    const certa = resposta(n * 1852, 3)
    return {
      enunciado: `Um barco navegou ${n} milhas náuticas. Quantos km? (1 milha náutica = 1,852 km)`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [dec(n * 16, 1), 'milha-nautica-igual-milha'],
        [dec(divididoEmDecimos(n, 1852), 1), 'converte-no-sentido-errado'],
      ]),
      dicas: [
        'A milha náutica, do mar e do ar, tem 1,852 km. Não é a milha da estrada.',
        `O km é menor: o número cresce. Faça ${n} × 1,852.`,
        `${n} × 1,852 = ${decMil(n * 1852, 3)} km.`,
      ],
      visual: MILHAS_NA_RETA,
    }
  },
}

export const fatorConversaoN3: Gerador = {
  id: 'fator-conversao-n3',
  aula: 'B.U9.A6',
  nivel: 3,
  gerar(r) {
    const modo = r.int(0, 3)
    if (modo === 0) {
      const n = r.pick([32, 40, 43, 50, 55, 65, 75])
      const certa = resposta(n * 254, 2)
      return {
        enunciado: `A TV tem ${n} polegadas na diagonal. Quantos cm são? (1 pol = 2,54 cm)`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [dec(divididoEmDecimos(n, 2540), 1), 'converte-no-sentido-errado'],
          [dec(n * 100 + 254, 2), 'soma-no-lugar-de-multiplicar'],
          [dec(n * 254, 1), 'fator-de-conversao-errado'],
        ]),
        dicas: [
          'Da polegada para o cm, o número cresce: multiplique pelo fator.',
          `Faça ${n} × 2,54.`,
          `${n} × 2,54 = ${dec(n * 254, 2)} cm.`,
        ],
      }
    }
    if (modo === 1) {
      // Altitudes de 5.000 em 5.000 pés: em metros, sempre um número inteiro.
      const n = r.int(1, 8) * 5000
      const certa = (n * 3048) / 10000
      return {
        enunciado: `O avião voa a ${mil(n)} pés de altitude. Quantos metros? (1 pé = 0,3048 m)`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [String(Math.round((n * 10000) / 3048)), 'converte-no-sentido-errado'],
          [String((n * 3048) / 100), 'fator-de-conversao-errado'],
        ]),
        dicas: [
          'O pé é menor que o metro: em metros, o número diminui. Mesmo assim, multiplica-se pelo fator.',
          `Faça ${mil(n)} × 0,3048.`,
          `${mil(n)} × 0,3048 = ${mil(certa)} m.`,
        ],
      }
    }
    if (modo === 2) {
      const n = r.int(10, 60)
      const certa = resposta(n * 1852, 3)
      return {
        enunciado: `O navio percorreu ${n} milhas náuticas. Quantos km? (1 milha náutica = 1,852 km)`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [dec(n * 16, 1), 'milha-nautica-igual-milha'],
          [dec(divididoEmDecimos(n, 1852), 1), 'converte-no-sentido-errado'],
        ]),
        dicas: [
          'A milha náutica tem 1,852 km, mais que a milha da estrada.',
          `Faça ${n} × 1,852.`,
          `${n} × 1,852 = ${decMil(n * 1852, 3)} km.`,
        ],
      }
    }
    // Estradas de 5 em 5 milhas: com 1,6 km por milha, sempre um número inteiro de km.
    const n = r.int(4, 40) * 5
    const certa = (n * 16) / 10
    return {
      enunciado: `A estrada tem ${n} milhas. Quantos km, mais ou menos? (1 milha ≈ 1,6 km)`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [dec(divididoEmDecimos(n, 1600), 1), 'converte-no-sentido-errado'],
        [dec(n * 10 + 16, 1), 'soma-no-lugar-de-multiplicar'],
      ]),
      dicas: [
        'A milha é maior que o km: em km, o número cresce.',
        `Faça ${n} × 1,6.`,
        `${n} × 1,6 = ${certa} km.`,
      ],
    }
  },
}

export const GERADORES_U9B: Gerador[] = [
  volumeLitroN1,
  volumeLitroN2,
  volumeLitroN3,
  tempoN1,
  tempoN2,
  tempoN3,
  fatorConversaoN1,
  fatorConversaoN2,
  fatorConversaoN3,
]
