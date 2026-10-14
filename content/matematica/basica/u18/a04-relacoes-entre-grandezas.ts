import type { Aula, Visual } from '@/lib/formation/schema'

// Relações entre grandezas. A tabela de proporção da unidade 10 (4 pães por
// R$ 6) vira pontos no plano: cada coluna é um par (pães, preço). O momento-
// chave é o Mexa "marcar": o aluno põe os três pontos e eles caem numa reta
// que, seguida para trás, chega ao (0, 0). Depois, a corrida de aplicativo da
// unidade 14 (R$ 5 para começar e R$ 2 por km) também dá uma reta, mas que
// começa em R$ 5: não é proporcional, e dobrar os km não dobra o preço. Por
// fim, a área do quadrado pelo lado: cresce junto, mas os pontos fazem uma
// curva. Os erros a desmontar: chamar toda reta de proporcional, dobrar onde
// há um valor fixo e achar que crescer junto é ser proporcional.

const plano = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'plano', estado, esboco })

/** O pão: R$ 1,50 cada. Os eixos de 1 em 1 pão e de 3 em 3 reais. */
const X_PAO = { de: 0, ate: 9, passo: 1, rotulo: 'pães' }
const Y_PAO = { de: 0, ate: 15, passo: 3, rotulo: 'R$' }
const PAES: [number, number][] = [[2, 3], [4, 6], [6, 9]]
const tabPao = (pares: [number, number][], noPlano = true) => ({ rotulos: ['pães', 'R$'], pares, ...(noPlano ? {} : { noPlano: false }) })
const RETA_PAO = { a: 1.5, de: 0 }
const pao = (extra: Record<string, unknown>, esboco: string) => plano({ x: X_PAO, y: Y_PAO, ...extra }, esboco)

/** A corrida: R$ 5 para começar e R$ 2 por km. */
const X_KM = { de: 0, ate: 9, passo: 1, rotulo: 'km' }
const Y_KM = { de: 0, ate: 24, passo: 4, rotulo: 'R$' }
const CORRIDAS: [number, number][] = [[1, 7], [2, 9], [3, 11], [4, 13]]
const RETA_KM = { a: 2, b: 5, de: 0 }
const corrida = (pares: [number, number][], extra: Record<string, unknown>, esboco: string) =>
  plano({ x: X_KM, y: Y_KM, tabela: { rotulos: ['km', 'R$'], pares }, ...extra }, esboco)
const COMECO = { pontos: { B: [0, 5] }, nomes: { B: 'R$ 5' }, posRotulos: { B: 'direita' } }

/** O quadrado: o lado e a área. */
// O x de meio em meio: com o mesmo passo do y, os quadradinhos seriam quadrados e o plano ficaria estreito.
const X_Q = { de: 0, ate: 5, passo: 0.5, numeros: 2, rotulo: 'lado' }
const Y_Q = { de: 0, ate: 20, passo: 1, numeros: 4, rotulo: 'área' }
const QUADRADOS: [number, number][] = [[0, 0], [1, 1], [2, 4], [3, 9], [4, 16]]
const quadrado = (extra: Record<string, unknown>, esboco: string) => plano({ x: X_Q, y: Y_Q, ...extra }, esboco)
const CURVA = quadrado({
  tabela: { rotulos: ['lado', 'área'], pares: QUADRADOS },
  ligar: true,
  retas: [{ por: [[0, 0], [2, 4]], de: 0, tracejado: true, destaque: 'branco' }],
}, 'Os cinco pontos ligados em azul fazem uma curva que sobe cada vez mais. Uma reta tracejada do (0, 0) ao (2, 4) passa acima do (1, 1) e abaixo do (3, 9).')

/** O estacionamento: R$ 4 fixos e R$ 4 por hora. */
const X_H = { de: 0, ate: 7, passo: 1, rotulo: 'horas' }
const Y_H = { de: 0, ate: 32, passo: 4, rotulo: 'R$' }
const HORAS: [number, number][] = [[1, 8], [2, 12], [3, 16]]
const estac = (pares: [number, number][], extra: Record<string, unknown>, esboco: string) =>
  plano({ x: X_H, y: Y_H, tabela: { rotulos: ['horas', 'R$'], pares }, ...extra }, esboco)

export const aula: Aula = {
  id: 'B.U18.A4',
  titulo: 'Relações entre grandezas',
  objetivo: 'Passar uma tabela de duas grandezas para o plano e reconhecer pelo gráfico quando elas são proporcionais (uma reta que passa pela origem), quando há um valor fixo (uma reta que começa acima do 0) e quando nem há reta.',
  modelo: 'plano',
  esboco: 'Abre na tabela de proporção do pão (4 pães por R$ 6). O aluno marca as colunas como pontos no plano e vê que eles se alinham; seguindo a reta, acha o preço de 8 pães e chega ao (0, 0). Momento-chave: o Mexa "marcar", com os pontos caindo numa reta que sai da origem. Depois, a corrida de aplicativo também dá uma reta, mas que começa em R$ 5: não é proporcional, e 8 km não custam o dobro de 4 km. A área do quadrado pelo lado fecha o contraste: cresce junto, mas os pontos fazem uma curva. Termina com o estacionamento (passo a passo) e o arroz (no papel).',
  vega: 'Ideia central: duas grandezas são proporcionais quando o gráfico é uma reta que passa pela origem, o (0, 0). Cada coluna de uma tabela vira um ponto (x, y). No pão (R$ 1,50 cada), os pontos ficam numa reta que sai do (0, 0): 0 pães, R$ 0; dobrar os pães dobra o preço. Na corrida (R$ 5 para começar e R$ 2 por km), a reta começa em R$ 5: há uma parte fixa, e dobrar os km não dobra o preço (4 km, R$ 13; 8 km, R$ 21). Na área do quadrado, os pontos nem ficam numa reta: lado 2, área 4; lado 4, área 16. Erros esperados: somar o mesmo nas duas grandezas (8 pães por R$ 11); chamar toda reta de proporcional; dobrar o preço de uma relação com valor fixo (R$ 26); esquecer a parte fixa (R$ 16); achar que crescer junto é ser proporcional. Guie com "Siga a reta para trás: onde ela chega com 0?", "Com 0 km você paga alguma coisa?", "Dobrou o lado: a área dobrou?". Os preços são valores de exemplo.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Na padaria, **4 pães** custam **R$ 6**. A tabela mostra três pedidos. Que desenho esses pares fazem no plano?',
      fala: 'Na padaria, quatro pães custam seis reais. A tabela mostra três pedidos. Que desenho esses pares fazem no plano?',
      visual: plano({ tabela: tabPao(PAES) }, 'Só a tabela, grande: pães 2, 4, 6 em cima; R$ 3, 6, 9 embaixo. A tabela de proporção da unidade 10, deitada.'),
      esboco: 'A tabela é velha conhecida. A pergunta nova é que desenho ela faz.',
    },
    {
      tipo: 'mexa',
      texto: 'Cada coluna é um ponto: primeiro os pães, no x; depois o preço, no y. Marque as três colunas.',
      fala: 'Cada coluna é um ponto: primeiro os pães, no x; depois o preço, no y. Marque as três colunas.',
      visual: pao({ tabela: tabPao(PAES, false) }, 'A tabela em cima e o plano embaixo: pães de 0 a 9 no eixo de baixo, R$ de 0 a 15, de 3 em 3, no de pé. Sem pontos ainda.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Marque (2, 3), (4, 6) e (6, 9).',
        sucesso: { pontos: PAES },
        mostre: 'Os três pontos andam da origem até o lugar: 2 para o lado e 3 para cima, e assim por diante.',
      },
      descoberta: 'Os pontos do pão ficam alinhados, um degrau igual depois do outro.',
      esboco: 'O momento-chave: os três pontos caem numa linha reta, que aponta para o canto do (0, 0).',
    },
    {
      tipo: 'aposta',
      pergunta: 'Os pontos ficaram numa reta. Siga a reta: quanto custam **8 pães**?',
      fala: 'Os pontos ficaram numa reta. Siga a reta: quanto custam oito pães?',
      visual: pao({ tabela: tabPao(PAES) }, 'Os três pontos no plano, com a tabela em cima.'),
      opcoes: [
        {
          texto: 'R$ 12', certa: true,
          explica: 'Isso. Cada 2 pães somam R$ 3, e a reta passa pelo (8, 12).',
          fala: 'Isso. Cada dois pães somam três reais, e a reta passa pelo oito, doze.',
          mostra: pao({ tabela: tabPao([...PAES, [8, 12]]), retas: [RETA_PAO] }, 'A reta azul cresce pelos pontos e chega ao (8, 12); a tabela ganha a coluna 8, R$ 12.'),
        },
        {
          texto: 'R$ 11', erro: 'pensa-aditivamente',
          explica: 'De 6 para 8 são 2 pães a mais, mas o preço não sobe R$ 2: sobe R$ 3. A reta chega ao (8, 12).',
          fala: 'De seis para oito são dois pães a mais, mas o preço não sobe dois reais: sobe três. A reta chega ao oito, doze.',
          mostra: pao({ tabela: tabPao([...PAES, [8, 12]]), retas: [RETA_PAO], pontos: { E: [8, 11] }, cores: { E: 'erro' }, nomes: { E: 'R$ 11' }, posRotulos: { E: 'abaixo' } }, 'A reta chega ao (8, 12); o ponto rosa do R$ 11 fica fora dela, um pouco abaixo.'),
        },
      ],
      esboco: 'A reta prevê o que a tabela não tem. A errada soma 2 nos dois, como na unidade 10.',
    },
    {
      tipo: 'ideia',
      texto: 'Para trás, a reta chega ao **(0, 0)**: 0 pães, R$ 0. Dobrou os pães, dobra o preço.',
      fala: 'Para trás, a reta chega ao zero, zero: zero pães, zero reais. Dobrou os pães, dobra o preço.',
      visual: pao({ tabela: tabPao([...PAES, [8, 12]]), retas: [RETA_PAO], pontos: [[0, 0]] }, 'A reta azul inteira, do (0, 0) ao (8, 12). Na origem, um ponto âmbar.'),
      esboco: 'A reta do pão sai da origem. É isso que a proporção da unidade 10 vira no plano.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A corrida de aplicativo: **R$ 5** para começar e **R$ 2** por km. Os pontos fazem uma reta. Ela passa pelo (0, 0)?',
      fala: 'A corrida de aplicativo: cinco reais para começar e dois reais por quilômetro. Os pontos fazem uma reta. Ela passa pelo zero, zero?',
      visual: corrida(CORRIDAS, {}, 'O plano muda: km de 0 a 9, R$ de 0 a 24. A tabela: 1, 2, 3, 4 km; R$ 7, 9, 11, 13. Os quatro pontos alinhados, subindo de 2 em 2.'),
      opcoes: [
        {
          texto: 'Não: com 0 km já são R$ 5', certa: true,
          explica: 'Isso. Os R$ 5 se pagam mesmo sem andar. A reta começa no (0, 5).',
          fala: 'Isso. Os cinco reais se pagam mesmo sem andar. A reta começa no zero, cinco.',
          mostra: corrida(CORRIDAS, { retas: [RETA_KM], ...COMECO }, 'A reta azul cresce pelos pontos e, para trás, para no eixo de pé, no R$ 5. Lá, um ponto âmbar com "R$ 5".'),
        },
        {
          texto: 'Sim: os pontos estão numa reta', erro: 'toda-reta-e-proporcional',
          explica: 'Siga a reta para trás: ela chega no R$ 5, não no 0. Só a reta que sai do (0, 0) é proporcional.',
          fala: 'Siga a reta para trás: ela chega no cinco reais, não no zero. Só a reta que sai do zero, zero é proporcional.',
          mostra: corrida(CORRIDAS, { retas: [RETA_KM], ...COMECO }, 'A reta azul chega ao eixo de pé no R$ 5, acima da origem.'),
        },
      ],
      esboco: 'A corrida tem uma parte fixa. A reta existe, mas não sai do (0, 0).',
    },
    {
      tipo: 'aposta',
      pergunta: 'Uma corrida de **4 km** custa **R$ 13**. Então uma de **8 km** custa o dobro, **R$ 26**?',
      fala: 'Uma corrida de quatro quilômetros custa treze reais. Então uma de oito quilômetros custa o dobro, vinte e seis reais?',
      visual: corrida(CORRIDAS, { retas: [RETA_KM], ...COMECO }, 'A reta da corrida, com os quatro pontos e o R$ 5 no começo.'),
      opcoes: [
        {
          texto: 'Não: custa R$ 21', certa: true,
          explica: 'Isso. Os R$ 5 entram uma vez só: $5 + 8 \\cdot 2 = 21$.',
          fala: 'Isso. Os cinco reais entram uma vez só: cinco mais oito vezes dois, vinte e um.',
          mostra: corrida([...CORRIDAS, [8, 21]], { retas: [RETA_KM], ...COMECO }, 'A tabela ganha a coluna 8 km, R$ 21, e o ponto (8, 21) aparece na reta.'),
        },
        {
          texto: 'Sim: o dobro de km, o dobro do preço', erro: 'regra-de-tres-sem-proporcao',
          explica: 'Dobrar R$ 13 cobra os R$ 5 duas vezes. A reta, no 8 km, marca R$ 21.',
          fala: 'Dobrar treze reais cobra os cinco reais duas vezes. A reta, no oito quilômetros, marca vinte e um reais.',
          mostra: corrida([...CORRIDAS, [8, 21]], { retas: [RETA_KM], ...COMECO }, 'O ponto (8, 21) na reta e a coluna nova na tabela.'),
        },
        {
          texto: 'Não: custa R$ 16', erro: 'esquece-valor-fixo',
          explica: 'R$ 16 são só os km: $8 \\cdot 2$. Os R$ 5 do começo também entram: R$ 21.',
          fala: 'Dezesseis reais são só os quilômetros: oito vezes dois. Os cinco reais do começo também entram: vinte e um reais.',
          mostra: corrida([...CORRIDAS, [8, 21]], { retas: [RETA_KM], ...COMECO }, 'O ponto (8, 21) na reta, 5 acima do 16.'),
        },
      ],
      esboco: 'Por que a origem importa: sem ela, dobrar não dobra.',
    },
    {
      tipo: 'anote',
      titulo: 'Proporcional no gráfico',
      definicao: 'Duas grandezas são **proporcionais** quando o gráfico é uma reta que passa pela origem, o (0, 0).',
      exemplo: { tex: '\\text{pães e preço: } (0, 0),\\ (2, 3),\\ (4, 6),\\ (8, 12)', fala: 'pães e preço: zero, zero; dois, três; quatro, seis; oito, doze' },
      alerta: 'Reta que não passa pelo (0, 0) não é proporcional: na corrida, dobrar os km não dobra o preço.',
      esboco: 'Na página: o plano do pão com a reta saindo da origem, e o da corrida começando em R$ 5.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora a área do quadrado pelo lado. Lado **1**, área **1**; lado **2**, área **4**; lado **3**, área **9**. Marque os três.',
      fala: 'Agora a área do quadrado pelo lado. Lado um, área um; lado dois, área quatro; lado três, área nove. Marque os três.',
      visual: quadrado({ tabela: { rotulos: ['lado', 'área'], pares: [[1, 1], [2, 4], [3, 9]], noPlano: false } }, 'A tabela lado e área em cima; o plano com o lado de 0 a 5 e a área de 0 a 20, de 4 em 4 escritos.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Marque (1, 1), (2, 4) e (3, 9).',
        sucesso: { pontos: [[1, 1], [2, 4], [3, 9]] },
        mostre: 'Os três pontos andam até o lugar: o terceiro sobe bem mais que os outros.',
      },
      descoberta: 'Os degraus não são iguais: a área sobe 3, depois 5.',
      esboco: 'Um terceiro tipo de relação: os dois crescem, mas os pontos não se alinham.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O lado e a área crescem juntos. Eles são proporcionais?',
      fala: 'O lado e a área crescem juntos. Eles são proporcionais?',
      visual: quadrado({ tabela: { rotulos: ['lado', 'área'], pares: [[1, 1], [2, 4], [3, 9]] } }, 'Os três pontos marcados, com a tabela em cima.'),
      opcoes: [
        {
          texto: 'Não: os pontos fazem uma curva', certa: true,
          explica: 'Isso. Lado 2, área 4; lado 4, área 16, não 8. Os pontos se curvam e a reta tracejada não passa por eles.',
          fala: 'Isso. Lado dois, área quatro; lado quatro, área dezesseis, não oito. Os pontos se curvam e a reta tracejada não passa por eles.',
          mostra: CURVA,
        },
        {
          texto: 'Sim: os dois crescem juntos', erro: 'cresce-junto-e-proporcional',
          explica: 'Crescer junto não basta. Dobrar o lado de 2 para 4 leva a área de 4 para 16: quatro vezes. Os pontos se curvam.',
          fala: 'Crescer junto não basta. Dobrar o lado de dois para quatro leva a área de quatro para dezesseis: quatro vezes. Os pontos se curvam.',
          mostra: CURVA,
        },
      ],
      esboco: 'O contraste final: nem toda relação é uma reta. Dobrar o lado não dobra a área.',
    },
    {
      tipo: 'passo',
      problema: 'Um estacionamento: **1 h** custa **R$ 8**; **2 h**, **R$ 12**; **3 h**, **R$ 16**. Quanto custam **6 h**?',
      fala: 'Um estacionamento: uma hora custa oito reais; duas horas, doze reais; três horas, dezesseis reais. Quanto custam seis horas?',
      visual: estac(HORAS, {}, 'Plano novo: horas de 0 a 7, R$ de 0 a 32, de 4 em 4. A tabela 1, 2, 3 h; R$ 8, 12, 16, e os três pontos.'),
      passos: [
        {
          pergunta: 'Siga a reta para trás. Com **0 h**, ela marca quanto?',
          fala: 'Siga a reta para trás. Com zero hora, ela marca quanto?',
          opcoes: [
            {
              texto: 'R$ 4', certa: true,
              explica: 'Isso. Cada hora soma R$ 4, então antes da 1ª hora já eram R$ 4.',
              fala: 'Isso. Cada hora soma quatro reais, então antes da primeira hora já eram quatro reais.',
              mostra: estac(HORAS, { retas: [{ a: 4, b: 4, de: 0 }], pontos: { F: [0, 4] }, nomes: { F: 'R$ 4' }, posRotulos: { F: 'direita' } }, 'A reta cresce pelos pontos e para trás chega ao R$ 4, no eixo de pé.'),
            },
            {
              texto: 'R$ 0', erro: 'toda-reta-e-proporcional',
              explica: 'De 1 h para 0 h, a reta desce só R$ 4: de 8 para 4. Ela não chega ao (0, 0).',
              fala: 'De uma hora para zero hora, a reta desce só quatro reais: de oito para quatro. Ela não chega ao zero, zero.',
              mostra: estac(HORAS, { retas: [{ a: 4, b: 4, de: 0 }], pontos: { F: [0, 4] }, nomes: { F: 'R$ 4' }, posRotulos: { F: 'direita' } }, 'A reta chega ao eixo de pé no R$ 4, acima da origem.'),
            },
          ],
          linha: { tex: '\\text{R\\$ } 4 \\text{ fixos} + \\text{R\\$ } 4 \\text{ por hora}', fala: 'quatro reais fixos mais quatro reais por hora' },
        },
        {
          pergunta: 'Então, quanto custam **6 h**?',
          fala: 'Então, quanto custam seis horas?',
          opcoes: [
            {
              texto: 'R$ 28', certa: true,
              explica: 'Isso. Os R$ 4 fixos, uma vez, e mais 6 horas de R$ 4.',
              fala: 'Isso. Os quatro reais fixos, uma vez, e mais seis horas de quatro reais.',
              mostra: estac([...HORAS, [6, 28]], { retas: [{ a: 4, b: 4, de: 0 }], pontos: { F: [0, 4] }, nomes: { F: 'R$ 4' }, posRotulos: { F: 'direita' } }, 'A coluna 6 h, R$ 28 entra na tabela e o ponto (6, 28) aparece na reta.'),
            },
            {
              texto: 'R$ 32', erro: 'regra-de-tres-sem-proporcao',
              explica: 'O dobro de R$ 16 cobra os R$ 4 fixos duas vezes. Não é proporcional: $4 + 6 \\cdot 4 = 28$.',
              fala: 'O dobro de dezesseis reais cobra os quatro reais fixos duas vezes. Não é proporcional: quatro mais seis vezes quatro, vinte e oito.',
            },
            {
              texto: 'R$ 24', erro: 'esquece-valor-fixo',
              explica: 'R$ 24 são só as 6 horas. Os R$ 4 fixos também entram: R$ 28.',
              fala: 'Vinte e quatro reais são só as seis horas. Os quatro reais fixos também entram: vinte e oito reais.',
            },
          ],
          linha: { tex: '4 + 6 \\cdot 4 = 28', fala: 'quatro mais seis vezes quatro, vinte e oito' },
        },
      ],
      esboco: 'A origem diz se há parte fixa; a parte fixa diz como calcular. As erradas: dobrar e esquecer o fixo.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: **3 kg** de arroz custam **R$ 18**, e o preço é proporcional. Quanto custam **5 kg**, em reais?',
      fala: 'No papel: três quilos de arroz custam dezoito reais, e o preço é proporcional. Quanto custam cinco quilos, em reais?',
      resposta: 30,
      resolucao: [
        { tex: '18 \\div 3 = 6 \\text{ reais por kg}', fala: 'dezoito dividido por três, seis reais por quilo' },
        { tex: '5 \\cdot 6 = 30', fala: 'cinco vezes seis, trinta' },
        { tex: '\\text{a reta passa por } (0, 0),\\ (3, 18),\\ (5, 30)', fala: 'a reta passa por zero, zero; três, dezoito; cinco, trinta' },
      ],
      esboco: 'Proporcional: dá para ir pelo preço de 1 kg. A última linha liga a conta ao gráfico.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['relacoes-n1', 'relacoes-n2', 'relacoes-n3'],
      esboco: 'Nível 1: o gráfico na tela, e o aluno diz se é proporcional, se tem parte fixa ou se nem é reta. Nível 2: só com palavras, o preço de uma quantidade nova, proporcional ou com valor fixo. Nível 3: dois pedidos de um estacionamento, achar o valor fixo ou o preço de outro tempo.',
    },
    {
      tipo: 'fecho',
      texto: 'O pão faz uma reta que sai do **(0, 0)**: é proporcional. A corrida começa em **R$ 5**, e o quadrado faz curva.',
      fala: 'O pão faz uma reta que sai do zero, zero: é proporcional. A corrida começa em cinco reais, e o quadrado faz curva.',
      visual: pao({ tabela: tabPao([...PAES, [8, 12]]), retas: [RETA_PAO] }, 'Volta o plano do pão, com a reta saindo da origem.'),
      esboco: 'Responde ao gancho: os pares fazem uma reta pela origem. Anuncia a máquina da próxima aula.',
    },
  ],
}
