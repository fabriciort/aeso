import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 14: linguagem algébrica (aulas 1 a 3). Uma letra no lugar de um
// número, valor numérico e termos semelhantes. As letras e as contas
// aparecem em TeX, com a fórmula inteira entre chaves para a linha não
// quebrar no meio (${3x + 2}$). O teclado só digita números: os itens pedem
// um valor numérico ou o número que vai no quadradinho (${3x + 4x = \square x}$),
// e usam "escolha" para expressões (5x, 2x + 3, x²). Nos visuais, os
// azulejos (barra = x, quadradinho = 1) e as expressões em linhas.

// ---------------------------------------------------------------- ajudas

/** Uma fórmula inteira em TeX, entre chaves para não quebrar a linha. */
/** O espaço que não quebra, depois de "R$" e entre o número e a unidade. */
const NB = '\u00a0'
const tex = (f: string) => `\${${f}}$`
/** A mesma fórmula com o ponto de interrogação dentro do TeX. */
const texQ = (f: string) => `\${${f}}\\text{?}$`
/** O número com o menos verdadeiro, para o texto fora do TeX: −3. */
const num = (n: number) => (n < 0 ? `−${-n}` : String(n))
/** A letra somada n vezes: x + x + x. */
const soma = (n: number, l = 'x') => Array.from({ length: n }, () => l).join(' + ')

/** Erros previsíveis (respostas digitadas), sem nunca marcar a certa e sem repetir. */
function mapa(certa: number, pares: [number | null, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  const vistos = new Set([String(certa)])
  for (const [valor, erro] of pares) {
    if (valor === null) continue
    const k = String(valor)
    if (vistos.has(k)) continue
    vistos.add(k)
    erros[k] = erro
  }
  return erros
}

type Op = { texto: string; certa?: boolean; erro?: string }
/** As opções em ordem aleatória (sem repetir texto), com a resposta e o mapa de erros pelo índice. */
function embaralhar(r: Rng, opcoes: Op[]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const vistos = new Set<string>()
  const resto = opcoes.filter((o) => !vistos.has(o.texto) && vistos.add(o.texto))
  const ordem: Op[] = []
  while (resto.length) ordem.push(resto.splice(r.int(0, resto.length - 1), 1)[0])
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => o.erro && (erros[String(i)] = o.erro))
  return { opcoes: ordem.map((o) => o.texto), resposta: ordem.findIndex((o) => o.certa), erros }
}

/** "35" a partir de 3 e 5: os algarismos colados. */
const colado = (a: number, b: number) => Number(`${a}${b}`)

const az = (pecas: string[], extra: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { azulejos: { pecas, ...extra } }, esboco })
const exp = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })
const barras = (n: number, l = 'x') => Array.from({ length: n }, () => l)
/** Peças misturadas: a barras e b quadradinhos, alternando. */
function mistura(a: number, b: number): string[] {
  const p: string[] = []
  for (let i = 0; i < Math.max(a, b); i++) {
    if (i < a) p.push('x')
    if (i < b) p.push('1')
  }
  return p
}

const LETRAS = ['x', 'y', 'a', 'n'] as const

// ---------------------------------------------------------------- aula 1: uma letra no lugar de um número

/** Coisas com um número que muda: a letra, o singular, o plural, a grandeza e a unidade. */
const COISAS = [
  { l: 'm', artigo: 'Uma', um: 'maçã', varios: 'maçãs', o: 'O peso', verbo: 'pesa', unidade: 'gramas' },
  { l: 'c', artigo: 'Um', um: 'caderno', varios: 'cadernos', o: 'O preço', verbo: 'custa', unidade: 'reais' },
  { l: 'p', artigo: 'Um', um: 'pão', varios: 'pães', o: 'O preço', verbo: 'custa', unidade: 'reais' },
  { l: 'g', artigo: 'Uma', um: 'garrafa', varios: 'garrafas', o: 'O volume', verbo: 'tem', unidade: 'mL' },
] as const

export const letraNumeroN1: Gerador = {
  id: 'letra-numero-n1',
  aula: 'B.U14.A1',
  nivel: 1,
  gerar(r) {
    const tipo = r.int(0, 2)
    const l = r.pick(LETRAS)
    if (tipo === 0) {
      // Quantas barras: x + x + x = □x.
      const n = r.int(2, 6)
      return {
        enunciado: `Complete: ${tex(`${soma(n, l)} = \\square ${l}`)}. Que número vai no quadradinho?`,
        fala: `Complete: ${soma(n, l).replace(/\+/g, 'mais')} é igual a quantos ${l}?`,
        formato: 'numero',
        resposta: n,
        erros: {},
        dicas: [
          `Cada ${tex(l)} somado é uma barra. Conte as barras.`,
          `São ${n} barras de ${tex(l)}: ${n} vezes ${tex(l)}.`,
          `${tex(`${soma(n, l)} = ${n}${l}`)}. Vai o ${n}.`,
        ],
        visual: az(barras(n, l), { letra: l }, `${n} barras soltas, cada uma com "${l}".`),
      }
    }
    if (tipo === 1) {
      // kx com x pequeno, com as barras na tela.
      const k = r.int(2, 5)
      const v = r.int(2, 9)
      const certa = k * v
      return {
        enunciado: `Quanto vale ${tex(`${k}${l}`)} com ${texQ(`${l} = ${v}`)}`,
        fala: `Quanto vale ${k} ${l}, com ${l} igual a ${v}?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [colado(k, v), 'junta-algarismos-com-a-letra'],
          [k + v, 'soma-no-lugar-de-multiplicar'],
        ]),
        dicas: [
          `${tex(`${k}${l}`)} quer dizer ${tex(`${k} \\times ${l}`)}: ${k} barras de ${tex(l)}.`,
          `Cada barra vale ${v}. São ${k} barras: ${tex(`${k} \\times ${v}`)}.`,
          `${tex(`${k}${l} = ${k} \\times ${v} = ${certa}`)}.`,
        ],
        visual: az(barras(k, l), { letra: l, agrupado: true, rotulo: `${l} = ${v}` }, `${k} barras juntas, com ${k}${l} embaixo. Embaixo de tudo: ${l} = ${v}.`),
      }
    }
    // O que quer dizer 4m: um número, não um objeto.
    const c = r.pick(COISAS)
    const k = r.int(2, 6)
    return {
      enunciado: `${c.artigo} ${c.um} ${c.verbo} ${tex(c.l)}${NB}${c.unidade}. O que quer dizer ${texQ(`${k}${c.l}`)}`,
      fala: `${c.artigo} ${c.um} ${c.verbo} ${c.l} ${c.unidade === 'mL' ? 'mililitros' : c.unidade}. O que quer dizer ${k} ${c.l}?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: `${c.o} de ${k} ${c.varios}, em ${c.unidade}`, certa: true },
        { texto: `${k} ${c.varios}`, erro: 'letra-como-objeto' },
        { texto: `${c.o} de 1 ${c.um} e mais ${k}${NB}${c.unidade}`, erro: 'soma-no-lugar-de-multiplicar' },
      ]),
      dicas: [
        `A letra ${tex(c.l)} guarda um número: ${c.o.toLowerCase()} de 1 ${c.um}.`,
        `${tex(`${k}${c.l}`)} é ${tex(`${k} \\times ${c.l}`)}: ${k} vezes esse número.`,
        `${tex(`${k}${c.l}`)} é ${c.o.toLowerCase()} de ${k} ${c.varios}, em ${c.unidade}.`,
      ],
      visual: az(barras(k, c.l), { letra: c.l }, `${k} barras soltas, cada uma com "${c.l}".`),
    }
  },
}

export const letraNumeroN2: Gerador = {
  id: 'letra-numero-n2',
  aula: 'B.U14.A1',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 2)
    const l = r.pick(LETRAS)
    if (tipo === 1) {
      // a + a + a é 3a, não a³.
      const n = r.int(3, 6)
      return {
        enunciado: `${tex(soma(n, l))} é igual a quê?`,
        fala: `${soma(n, l).replace(/\+/g, 'mais')} é igual a quê?`,
        formato: 'escolha',
        ...embaralhar(r, [
          { texto: tex(`${n}${l}`), certa: true },
          { texto: tex(`${l}^{${n}}`), erro: 'x-mais-x-da-x2' },
          { texto: tex(`${l} + ${n}`), erro: 'soma-no-lugar-de-multiplicar' },
        ]),
        dicas: [
          `Somar ${tex(l)} várias vezes é juntar barras iguais.`,
          `Conte quantas vezes o ${tex(l)} aparece: ${n}.`,
          `${tex(`${soma(n, l)} = ${n}${l}`)}. A potência ${tex(`${l}^{${n}}`)} seria multiplicar.`,
        ],
      }
    }
    // kx com algarismos que tentam a colar; às vezes com o ponto, às vezes com x de dois algarismos.
    const k = r.int(2, tipo === 0 ? 9 : 6)
    const v = tipo === 0 ? r.int(2, 9) : r.int(11, 25)
    const ponto = tipo === 0 && r.int(0, 1) === 1
    const f = ponto ? `${k} \\cdot ${l}` : `${k}${l}`
    const certa = k * v
    return {
      enunciado: `Quanto vale ${tex(f)} com ${texQ(`${l} = ${v}`)}`,
      fala: `Quanto vale ${k} ${ponto ? 'vezes ' : ''}${l}, com ${l} igual a ${v}?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [colado(k, v), 'junta-algarismos-com-a-letra'],
        [k + v, 'soma-no-lugar-de-multiplicar'],
      ]),
      dicas: [
        ponto ? `O ponto é o sinal de vezes: ${tex(f)} é ${tex(`${k} \\times ${l}`)}.` : `${tex(f)} tem um vezes escondido: ${tex(`${k} \\times ${l}`)}.`,
        `Troque a letra pelo número: ${tex(`${k} \\times ${v}`)}.`,
        `${tex(`${k} \\times ${v} = ${certa}`)}.`,
      ],
    }
  },
}

export const letraNumeroN3: Gerador = {
  id: 'letra-numero-n3',
  aula: 'B.U14.A1',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      const k = r.int(2, 9)
      const v = r.pick([6, 10, 12, 15, 20, 30])
      const certa = k * v
      const enunciado = `Uma caixa tem $x$ ovos. Você compra **${k}** caixas. Com ${tex(`x = ${v}`)}, quantos ovos são?`
      return {
        enunciado,
        fala: `Uma caixa tem x ovos. Você compra ${k} caixas. Com x igual a ${v}, quantos ovos são?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[colado(k, v), 'junta-algarismos-com-a-letra'], [k + v, 'soma-no-lugar-de-multiplicar']]),
        dicas: [
          `${k} caixas de ${tex('x')} ovos são ${tex(`${k}x`)} ovos.`,
          `Troque o ${tex('x')} por ${v}: ${tex(`${k} \\times ${v}`)}.`,
          `${tex(`${k}x = ${k} \\times ${v} = ${certa}`)} ovos.`,
        ],
      }
    }
    if (tipo === 1) {
      const a = r.int(2, 5)
      const d = r.int(4, 15)
      const certa = a * d
      return {
        enunciado: `Um aplicativo cobra ${tex(`${a}x`)} reais por uma corrida de $x$${NB}km. Quanto custa a corrida de **${d}**${NB}km?`,
        fala: `Um aplicativo cobra ${a} x reais por uma corrida de x quilômetros. Quanto custa a corrida de ${d} quilômetros?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[colado(a, d), 'junta-algarismos-com-a-letra'], [a + d, 'soma-no-lugar-de-multiplicar']]),
        dicas: [
          `O ${tex('x')} são os km da corrida. Aqui, ${tex(`x = ${d}`)}.`,
          `${tex(`${a}x`)} é ${tex(`${a} \\times x`)}: ${tex(`${a} \\times ${d}`)}.`,
          `${tex(`${a} \\times ${d} = ${certa}`)}: R$${NB}${certa}.`,
        ],
      }
    }
    // Qual expressão dá o preço de k canetas.
    const k = r.int(3, 8)
    return {
      enunciado: `Uma caneta custa $c$ reais. Qual expressão dá o preço de **${k}** canetas?`,
      fala: `Uma caneta custa c reais. Qual expressão dá o preço de ${k} canetas?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: tex(`${k}c`), certa: true },
        { texto: tex(`${k} + c`), erro: 'soma-no-lugar-de-multiplicar' },
        { texto: tex(`c^{${k}}`), erro: 'x-mais-x-da-x2' },
      ]),
      dicas: [
        `O ${tex('c')} é o preço de uma caneta, um número.`,
        `${k} canetas: ${tex(soma(k, 'c'))}.`,
        `${tex(`${soma(k, 'c')} = ${k}c`)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: expressões e valor numérico

export const valorNumericoN1: Gerador = {
  id: 'valor-numerico-n1',
  aula: 'B.U14.A2',
  nivel: 1,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 2) {
      // x² com x pequeno.
      const v = r.int(3, 9)
      const certa = v * v
      return {
        enunciado: `Quanto vale ${tex('x^2')} com ${texQ(`x = ${v}`)}`,
        fala: `Quanto vale x ao quadrado, com x igual a ${v}?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[2 * v, 'potencia-multiplica-base-pelo-expoente']]),
        dicas: [
          `${tex('x^2')} é ${tex('x \\cdot x')}.`,
          `Troque o ${tex('x')} por ${v}: ${tex(`${v} \\cdot ${v}`)}.`,
          `${tex(`${v}^2 = ${v} \\cdot ${v} = ${certa}`)}.`,
        ],
        visual: exp(['x²', `${v} · ${v}`], `x² e, embaixo, grande, ${v} · ${v}.`),
      }
    }
    const a = r.int(2, 6)
    const v = r.int(1, 6)
    const b = r.int(1, 9)
    const certa = a * v + b
    if (tipo === 0) {
      // ax + b.
      return {
        enunciado: `Quanto vale ${tex(`${a}x + ${b}`)} com ${texQ(`x = ${v}`)}`,
        fala: `Quanto vale ${a} x mais ${b}, com x igual a ${v}?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [colado(a, v) + b, 'junta-algarismos-com-a-letra'],
          [(a + b) * v, 'ignora-prioridade'],
        ]),
        dicas: [
          `Troque o ${tex('x')} por ${v}. O ${tex(`${a}x`)} vira ${tex(`${a} \\cdot ${v}`)}.`,
          `Primeiro a multiplicação: ${tex(`${a} \\cdot ${v} = ${a * v}`)}.`,
          `${tex(`${a * v} + ${b} = ${certa}`)}.`,
        ],
        visual: exp([`${a}x + ${b}`, `${a} · ${v} + ${b}`], `${a}x + ${b} e, embaixo, grande, a conta com o ${v} no lugar do x.`),
      }
    }
    // b + ax: a letra no fim tenta a fazer da esquerda para a direita.
    return {
      enunciado: `Quanto vale ${tex(`${b} + ${a}x`)} com ${texQ(`x = ${v}`)}`,
      fala: `Quanto vale ${b} mais ${a} x, com x igual a ${v}?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [(b + a) * v, 'ignora-prioridade'],
        [b + colado(a, v), 'junta-algarismos-com-a-letra'],
      ]),
      dicas: [
        `Troque o ${tex('x')} por ${v}, e faça a multiplicação antes da soma.`,
        `${tex(`${a}x = ${a} \\cdot ${v} = ${a * v}`)}.`,
        `${tex(`${b} + ${a * v} = ${certa}`)}.`,
      ],
      visual: exp([`${b} + ${a}x`, `${b} + ${a} · ${v}`], `${b} + ${a}x e, embaixo, grande, a conta com o ${v} no lugar do x.`),
    }
  },
}

export const valorNumericoN2: Gerador = {
  id: 'valor-numerico-n2',
  aula: 'B.U14.A2',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // ax com x negativo: o número entra entre parênteses.
      const a = r.int(2, 9)
      const w = r.int(1, 9)
      const certa = -a * w
      return {
        enunciado: `Quanto vale ${tex(`${a}x`)} com ${texQ(`x = -${w}`)}`,
        fala: `Quanto vale ${a} x, com x igual a menos ${w}?`,
        formato: 'numero',
        sinal: true,
        resposta: certa,
        erros: mapa(certa, [
          [a - w, 'letra-negativa-sem-parenteses'],
          [a * w, 'esquece-sinal-do-resultado'],
        ]),
        dicas: [
          'Um número negativo entra no lugar da letra entre parênteses.',
          `${tex(`${a}x = ${a} \\cdot (-${w})`)}. Positivo vezes negativo dá negativo.`,
          `${tex(`${a} \\cdot (-${w}) = ${-a * w}`)}.`,
        ],
      }
    }
    if (tipo === 1) {
      // b − ax com x negativo: parênteses, a ordem e tirar um negativo.
      const b = r.int(1, 9)
      const a = r.int(2, 5)
      const w = r.int(1, 6)
      const certa = b + a * w
      return {
        enunciado: `Quanto vale ${tex(`${b} - ${a}x`)} com ${texQ(`x = -${w}`)}`,
        fala: `Quanto vale ${b} menos ${a} x, com x igual a menos ${w}?`,
        formato: 'numero',
        sinal: true,
        resposta: certa,
        erros: mapa(certa, [
          [b - a - w, 'letra-negativa-sem-parenteses'],
          [b - a * w, 'tirar-negativo-subtrai'],
        ]),
        dicas: [
          `Troque o ${tex('x')} com parênteses: ${tex(`${b} - ${a} \\cdot (-${w})`)}.`,
          `Primeiro a multiplicação: ${tex(`${a} \\cdot (-${w}) = -${a * w}`)}.`,
          `${tex(`${b} - (-${a * w}) = ${b} + ${a * w} = ${certa}`)}.`,
        ],
      }
    }
    // x² com x negativo.
    const w = r.int(2, 9)
    const certa = w * w
    return {
      enunciado: `Quanto vale ${tex('x^2')} com ${texQ(`x = -${w}`)}`,
      fala: `Quanto vale x ao quadrado, com x igual a menos ${w}?`,
      formato: 'numero',
      sinal: true,
      resposta: certa,
      erros: mapa(certa, [
        [-certa, 'potencia-sinal-fora-dos-parenteses'],
        [-2 * w, 'potencia-multiplica-base-pelo-expoente'],
      ]),
      dicas: [
        `O −${w} entra entre parênteses: ${tex(`(-${w})^2`)}.`,
        `${tex(`(-${w})^2 = (-${w}) \\cdot (-${w})`)}. Sinais iguais dão positivo.`,
        `${tex(`(-${w}) \\cdot (-${w}) = ${certa}`)}.`,
      ],
    }
  },
}

export const valorNumericoN3: Gerador = {
  id: 'valor-numerico-n3',
  aula: 'B.U14.A2',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // O táxi: ax + b com x = d.
      const a = r.int(2, 4)
      const b = r.int(3, 6)
      const d = r.int(3, 12)
      const certa = a * d + b
      return {
        enunciado: `Um táxi cobra R$${NB}${b} para começar e R$${NB}${a} por km. A corrida de $x$${NB}km custa ${tex(`${a}x + ${b}`)} reais. E a de **${d}**${NB}km?`,
        fala: `Um táxi cobra ${b} reais para começar e ${a} reais por quilômetro. A corrida de x quilômetros custa ${a} x mais ${b} reais. E a de ${d} quilômetros?`,
        formato: 'numero',
        sinal: true,
        resposta: certa,
        erros: mapa(certa, [
          [(a + b) * d, 'ignora-prioridade'],
          [colado(a, d) + b, 'junta-algarismos-com-a-letra'],
        ]),
        dicas: [
          `Troque o ${tex('x')} por ${d}: ${tex(`${a} \\cdot ${d} + ${b}`)}.`,
          `Primeiro a multiplicação: ${tex(`${a} \\cdot ${d} = ${a * d}`)}.`,
          `${tex(`${a * d} + ${b} = ${certa}`)}: R$${NB}${certa}.`,
        ],
      }
    }
    if (tipo === 1) {
      // A câmara fria: t − kh, que pode passar do zero.
      const t = r.int(6, 12)
      const k = r.int(2, 4)
      const h = r.int(2, 6)
      const certa = t - k * h
      return {
        enunciado: `Depois de $h$ horas ligada, uma câmara fria marca ${tex(`${t} - ${k}h`)} graus. Quanto marca depois de **${h}** horas?`,
        fala: `Depois de h horas ligada, uma câmara fria marca ${t} menos ${k} h graus. Quanto marca depois de ${h} horas?`,
        formato: 'numero',
        sinal: true,
        resposta: certa,
        erros: mapa(certa, [
          [(t - k) * h, 'ignora-prioridade'],
          [certa < 0 ? -certa : null, 'esquece-sinal-do-resultado'],
        ]),
        dicas: [
          `Troque o ${tex('h')} por ${h}: ${tex(`${t} - ${k} \\cdot ${h}`)}.`,
          `Primeiro a multiplicação: ${tex(`${k} \\cdot ${h} = ${k * h}`)}.`,
          `${tex(`${t} - ${k * h} = ${certa}`)} graus.`,
        ],
      }
    }
    // O perímetro: duas letras.
    const p = r.int(3, 9)
    const q = r.int(2, 8)
    const certa = 2 * p + 2 * q
    return {
      enunciado: `Um retângulo tem lados $a$ e $b$, e o perímetro é ${tex('2a + 2b')}. Quanto dá com ${tex(`a = ${p}`)} e ${texQ(`b = ${q}`)}`,
      fala: `Um retângulo tem lados a e b, e o perímetro é 2 a mais 2 b. Quanto dá com a igual a ${p} e b igual a ${q}?`,
      formato: 'numero',
      sinal: true,
      resposta: certa,
      erros: mapa(certa, [
        [colado(2, p) + colado(2, q), 'junta-algarismos-com-a-letra'],
        [p * q, 'confunde-area-perimetro'],
      ]),
      dicas: [
        `Cada letra vale o seu número: ${tex(`2 \\cdot ${p} + 2 \\cdot ${q}`)}.`,
        `Primeiro as multiplicações: ${tex(`${2 * p} + ${2 * q}`)}.`,
        `${tex(`${2 * p} + ${2 * q} = ${certa}`)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 3: termos semelhantes

export const termosN1: Gerador = {
  id: 'termos-semelhantes-n1',
  aula: 'B.U14.A3',
  nivel: 1,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // ax + bx = □x.
      const a = r.int(2, 5)
      const b = r.int(2, 5)
      const certa = a + b
      return {
        enunciado: `Complete: ${tex(`${a}x + ${b}x = \\square x`)}. Que número vai no quadradinho?`,
        fala: `Complete: ${a} x mais ${b} x é igual a quantos x?`,
        formato: 'numero',
        resposta: certa,
        erros: {},
        dicas: [
          `${tex(`${a}x`)} são ${a} barras e ${tex(`${b}x`)} são ${b} barras. Junte as barras.`,
          `Some os números da frente: ${tex(`${a} + ${b}`)}.`,
          `${tex(`${a}x + ${b}x = ${certa}x`)}. Vai o ${certa}.`,
        ],
        visual: az([...barras(a), ...barras(b)], { agrupado: true }, `${a + b} barras, todas juntas, com ${certa}x embaixo do grupo.`),
      }
    }
    if (tipo === 1) {
      // x + bx: o x sozinho é 1x.
      const b = r.int(2, 6)
      const certa = b + 1
      const antes = r.int(0, 1) === 0
      const f = antes ? `x + ${b}x` : `${b}x + x`
      return {
        enunciado: `Complete: ${tex(`${f} = \\square x`)}. Que número vai no quadradinho?`,
        fala: `Complete: ${antes ? `x mais ${b} x` : `${b} x mais x`} é igual a quantos x?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[b, 'letra-sozinha-sem-o-um']]),
        dicas: [
          `O ${tex('x')} sozinho é uma barra: ${tex('x = 1x')}.`,
          `São ${b} barras e mais 1: ${tex(`${b} + 1`)}.`,
          `${tex(`${f} = ${certa}x`)}. Vai o ${certa}.`,
        ],
        visual: az(barras(b + 1), {}, `${b + 1} barras soltas: ${b} e mais uma.`),
      }
    }
    // ax + b não vira um termo só.
    const a = r.int(2, 5)
    const b = r.int(1, 5)
    return {
      enunciado: `Juntando as peças iguais, ${tex(`${a}x + ${b}`)} vira o quê?`,
      fala: `Juntando as peças iguais, ${a} x mais ${b} vira o quê?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: `${tex(`${a}x + ${b}`)}: fica como está`, certa: true },
        { texto: tex(`${a + b}x`), erro: 'junta-termos-nao-semelhantes' },
        { texto: tex(String(a + b)), erro: 'junta-termos-nao-semelhantes' },
      ]),
      dicas: [
        'Só se juntam peças iguais: barras com barras, quadradinhos com quadradinhos.',
        `${tex(`${a}x`)} são barras; o ${b} são quadradinhos. Não há o que juntar.`,
        `${tex(`${a}x + ${b}`)} já está pronto. Com ${tex('x = 10')}, dá ${10 * a + b}, e não ${10 * (a + b)}.`,
      ],
      visual: az(mistura(a, b), { agrupado: true }, `${a} barras e ${b} quadradinhos, em dois grupos: ${a}x e ${b}.`),
    }
  },
}

export const termosN2: Gerador = {
  id: 'termos-semelhantes-n2',
  aula: 'B.U14.A3',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // ax − bx, às vezes negativo.
      const a = r.int(2, 9)
      let b = r.int(2, 9)
      if (b === a) b = a === 9 ? 2 : a + 1
      const certa = a - b
      return {
        enunciado: `Complete: ${tex(`${a}x - ${b}x = \\square x`)}. Que número vai no quadradinho?`,
        fala: `Complete: ${a} x menos ${b} x é igual a quantos x?`,
        formato: 'numero',
        sinal: true,
        resposta: certa,
        erros: mapa(certa, [[certa < 0 ? -certa : null, 'esquece-sinal-do-resultado']]),
        dicas: [
          `${tex(`${a}x`)} e ${tex(`${b}x`)} são semelhantes: faça a conta com os números da frente.`,
          `${tex(`${a} - ${b}`)}.`,
          `${tex(`${a}x - ${b}x = ${termoTex(certa)}`)}. Vai o ${num(certa)}.`,
        ],
      }
    }
    if (tipo === 1) {
      // ax − x: o x sozinho é 1x.
      const a = r.int(3, 9)
      const certa = a - 1
      return {
        enunciado: `Complete: ${tex(`${a}x - x = \\square x`)}. Que número vai no quadradinho?`,
        fala: `Complete: ${a} x menos x é igual a quantos x?`,
        formato: 'numero',
        sinal: true,
        resposta: certa,
        erros: mapa(certa, [[a, 'letra-sozinha-sem-o-um']]),
        dicas: [
          `O ${tex('x')} sozinho é ${tex('1x')}: uma barra.`,
          `De ${a} barras, sai 1: ${tex(`${a} - 1`)}.`,
          `${tex(`${a}x - x = ${certa}x`)}. Vai o ${certa}.`,
        ],
      }
    }
    // x · x contra x + x (e kx · x).
    const caso = r.int(0, 2)
    if (caso === 0) {
      return {
        enunciado: `${tex('x \\cdot x')} é igual a quê?`,
        fala: 'x vezes x é igual a quê?',
        formato: 'escolha',
        ...embaralhar(r, [
          { texto: tex('x^2'), certa: true },
          { texto: tex('2x'), erro: 'x-vezes-x-da-2x' },
          { texto: tex('x') },
        ]),
        dicas: [
          `${tex('x \\cdot x')} é a área do quadrado de lado ${tex('x')}.`,
          `${tex('2x')} seria ${tex('x + x')}, duas barras. Aqui é multiplicar.`,
          `${tex('x \\cdot x = x^2')}, x ao quadrado.`,
        ],
      }
    }
    if (caso === 1) {
      return {
        enunciado: `${tex('x + x')} é igual a quê?`,
        fala: 'x mais x é igual a quê?',
        formato: 'escolha',
        ...embaralhar(r, [
          { texto: tex('2x'), certa: true },
          { texto: tex('x^2'), erro: 'x-mais-x-da-x2' },
          { texto: tex('2') },
        ]),
        dicas: [
          `${tex('x + x')} são duas barras lado a lado.`,
          `${tex('x^2')} seria ${tex('x \\cdot x')}, o quadrado grande. Aqui é somar.`,
          `${tex('x + x = 2x')}.`,
        ],
      }
    }
    const k = r.int(2, 6)
    return {
      enunciado: `${tex(`${k}x \\cdot x`)} é igual a quê?`,
      fala: `${k} x vezes x é igual a quê?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: tex(`${k}x^2`), certa: true },
        { texto: tex(`${k + 1}x`), erro: 'x-vezes-x-da-2x' },
        { texto: tex(`${k}x`) },
      ]),
      dicas: [
        `${tex(`${k}x \\cdot x`)} é ${tex(`${k} \\cdot x \\cdot x`)}.`,
        `${tex('x \\cdot x = x^2')}: sobra o ${k} na frente.`,
        `${tex(`${k}x \\cdot x = ${k}x^2`)}.`,
      ],
    }
  },
}

/** O termo em TeX com coeficiente com sinal: 1 → x, −1 → -x, −3 → -3x, 0 → 0. */
function termoTex(k: number): string {
  if (k === 0) return '0'
  if (k === 1) return 'x'
  if (k === -1) return '-x'
  return `${k}x`
}

export const termosN3: Gerador = {
  id: 'termos-semelhantes-n3',
  aula: 'B.U14.A3',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // Simplificar ax + b + cx ± d.
      const a = r.int(2, 6)
      const c = r.int(2, 6)
      const d = r.int(1, 5)
      const menos = r.int(0, 1) === 1
      const b = menos ? r.int(d + 1, 9) : r.int(1, 9)
      const n = menos ? b - d : b + d
      const outro = menos ? b + d : Math.abs(b - d) || b + d + 1
      const f = `${a}x + ${b} + ${c}x ${menos ? '-' : '+'} ${d}`
      return {
        enunciado: `Simplifique ${tex(f)}. Qual expressão sobra?`,
        fala: `Simplifique ${a} x mais ${b} mais ${c} x ${menos ? 'menos' : 'mais'} ${d}. Qual expressão sobra?`,
        formato: 'escolha',
        ...embaralhar(r, [
          { texto: tex(`${a + c}x + ${n}`), certa: true },
          { texto: tex(`${a + c + n}x`), erro: 'junta-termos-nao-semelhantes' },
          { texto: tex(`${a + c}x^2 + ${n}`), erro: 'x-mais-x-da-x2' },
          { texto: tex(`${a + c}x + ${outro}`) },
        ]),
        dicas: [
          'Junte as barras com as barras e os números com os números.',
          `Os termos com ${tex('x')}: ${tex(`${a}x + ${c}x = ${a + c}x`)}.`,
          `Os números: ${tex(`${b} ${menos ? '-' : '+'} ${d} = ${n}`)}. Fica ${tex(`${a + c}x + ${n}`)}.`,
        ],
      }
    }
    if (tipo === 1) {
      // O perímetro de um terreno de lados x e k.
      const k = r.int(3, 9)
      return {
        enunciado: `Um terreno retangular tem lados de $x$${NB}m e **${k}**${NB}m. Qual expressão dá o perímetro, em metros?`,
        fala: `Um terreno retangular tem lados de x metros e ${k} metros. Qual expressão dá o perímetro, em metros?`,
        formato: 'escolha',
        ...embaralhar(r, [
          { texto: tex(`2x + ${2 * k}`), certa: true },
          { texto: tex(`${2 + 2 * k}x`), erro: 'junta-termos-nao-semelhantes' },
          { texto: tex(`${k}x`), erro: 'confunde-area-perimetro' },
          { texto: tex(`x^2 + ${2 * k}`), erro: 'x-mais-x-da-x2' },
        ]),
        dicas: [
          'O perímetro é a volta: some os quatro lados.',
          `${tex(`x + ${k} + x + ${k}`)}.`,
          `${tex(`x + x = 2x`)} e ${tex(`${k} + ${k} = ${2 * k}`)}: ${tex(`2x + ${2 * k}`)}.`,
        ],
      }
    }
    // ax + bx − cx, que pode dar negativo.
    const a = r.int(2, 7)
    const b = r.int(2, 7)
    let c = r.int(2, 15)
    if (c === a + b) c += 1
    const certa = a + b - c
    return {
      enunciado: `Complete: ${tex(`${a}x + ${b}x - ${c}x = \\square x`)}. Que número vai no quadradinho?`,
      fala: `Complete: ${a} x mais ${b} x menos ${c} x é igual a quantos x?`,
      formato: 'numero',
      sinal: true,
      resposta: certa,
      erros: mapa(certa, [[certa < 0 ? -certa : null, 'esquece-sinal-do-resultado']]),
      dicas: [
        'Os três termos são semelhantes: faça a conta com os números da frente.',
        `${tex(`${a} + ${b} = ${a + b}`)}, e depois ${tex(`${a + b} - ${c}`)}.`,
        `${tex(`${a}x + ${b}x - ${c}x = ${termoTex(certa)}`)}. Vai o ${num(certa)}.`,
      ],
    }
  },
}

export const GERADORES_U14A: Gerador[] = [letraNumeroN1, letraNumeroN2, letraNumeroN3, valorNumericoN1, valorNumericoN2, valorNumericoN3, termosN1, termosN2, termosN3]
