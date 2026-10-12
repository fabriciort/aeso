import type { Aula, Visual } from '@/lib/formation/schema'

// Proporção e regra de três, entendidas e não decoradas. A tabela de
// proporção é o modelo: cada coluna é a receita repetida, e uma razão igual
// nasce de multiplicar os dois números pelo mesmo número (as setas × 4 em
// cima e embaixo). Quando a coluna nova não é um múltiplo da primeira
// (3 kg → 5 kg), passa-se pelo 1 (÷ 3, depois × 5), e só então aparece o
// atalho: 18 × 5 ÷ 3, a regra de três. A multiplicação cruzada não entra.
// Os erros a desmontar: somar nos dois (pensa-aditivamente), mudar só um
// (muda-so-um-termo) e inverter a conta do atalho (razao-invertida).

const tabela = (t: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela: t }, esboco })

const BOLO = (farinha: (number | string)[], ovos: (number | string)[]) => [
  { rotulo: 'farinha (xícaras)', valores: farinha },
  { rotulo: 'ovos', valores: ovos },
]
const ARROZ = (kg: (number | string)[], preco: (number | string)[]) => [
  { rotulo: 'arroz (kg)', valores: kg },
  { rotulo: 'preço (R$)', valores: preco },
]
const X4 = [{ de: 0, para: 3, rotulo: '× 4' }, { de: 0, para: 3, rotulo: '× 4', embaixo: true }]

export const aula: Aula = {
  id: 'B.U10.A3',
  titulo: 'Proporção e regra de três',
  objetivo: 'Reconhecer duas razões iguais (uma proporção), obter uma razão igual multiplicando os dois números pelo mesmo número e achar o valor que falta, passando pelo 1 ou pelo atalho da regra de três.',
  modelo: 'livre',
  esboco: 'A receita do bolo (2 xícaras de farinha para 3 ovos) vira uma tabela de proporção. O aluno completa as colunas da receita dobrada, triplicada, quadruplicada. Momento-chave: as setas × 4 aparecem em cima e embaixo da coluna das 8 xícaras; os dois números foram vezes o mesmo número. Depois, o arroz (3 kg por R$ 18, quanto custam 5 kg?): passar pelo 1 kg (÷ 3) e ir até 5 (× 5). O atalho 18 × 5 ÷ 3 é a regra de três, as duas setas numa conta só. A seta à direita (× 6, o preço do quilo) mostra a outra razão que fica igual.',
  vega: 'Ideia central: proporção é a igualdade de duas razões (2 : 3 = 8 : 12). Uma razão igual se obtém multiplicando (ou dividindo) os dois números pelo mesmo número: numa tabela de proporção, a seta de cima e a de baixo dizem a mesma conta. A regra de três é achar o quarto número quando se conhecem três: dá para ir pela coluna (o fator × 4, ou ÷ 3 e × 5 passando pelo 1) ou pela linha (o fator que leva uma linha à outra, × 6 reais por quilo). O atalho 18 × 5 ÷ 3 são as duas setas numa conta só. Não ensine a multiplicação cruzada como receita; se o aluno a trouxer, mostre que ela dá a mesma conta. Erros esperados: somar o mesmo nos dois (de 2 para 8 são 6 a mais, então 3 + 6 = 9 ovos), mudar só um (8 xícaras e 3 ovos), inverter o atalho (18 × 3 ÷ 5). Guie com "A coluna nova é a receita vezes quanto?", "E se passar pelo 1?", "Mais quilos, mais caro: o resultado cresceu?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'O bolo leva **2 xícaras de farinha e 3 ovos**. Para a festa, você vai usar **8 xícaras**. Quantos ovos?',
      fala: 'O bolo leva duas xícaras de farinha e três ovos. Para a festa, você vai usar oito xícaras. Quantos ovos?',
      visual: tabela({ linhas: BOLO([2, 8], [3, '?']) }, 'A tabela de proporção: 2 xícaras e 3 ovos na primeira coluna; 8 xícaras e "?" na segunda, em âmbar tracejado.'),
      esboco: 'Uma receita aumentada, de festa. A pergunta fica aberta; a tentação é 9 ovos (6 a mais).',
    },
    {
      tipo: 'mexa',
      texto: 'Cada coluna é a receita uma vez a mais. Toque para fazer o bolo dobrado, triplicado… até as 8 xícaras.',
      fala: 'Cada coluna é a receita uma vez a mais. Toque para fazer o bolo dobrado, triplicado, até as oito xícaras.',
      visual: tabela(
        { linhas: BOLO([2, 4, 6, 8], [3, 6, 9, 12]), mostradas: 1, completar: true },
        'A tabela com só a primeira coluna (2 e 3). Três caixas vazias à direita; a próxima com a borda âmbar e um +.',
      ),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na próxima coluna vazia, até a quarta.',
        sucesso: { colunas: 4 },
        mostre: 'As colunas se preenchem: 4 e 6, 6 e 9, 8 e 12.',
      },
      descoberta: 'Cada coluna é a receita repetida: 2 vezes, 3 vezes, 4 vezes. As 8 xícaras pedem 12 ovos.',
      esboco: 'O aluno constrói a tabela, sem conta: a receita repetida. Responde ao gancho: 12 ovos.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A coluna das 8 xícaras é a receita vezes quanto?',
      fala: 'A coluna das oito xícaras é a receita vezes quanto?',
      visual: tabela({ linhas: BOLO([2, 4, 6, 8], [3, 6, 9, 12]), destaque: [0, 3] }, 'A tabela completa, com a primeira e a última coluna emolduradas em âmbar.'),
      opcoes: [
        {
          texto: '× 4, nos dois números', certa: true,
          fala: 'Vezes quatro, nos dois números.',
          explica: 'Isso. $2 \\times 4 = 8$ xícaras e $3 \\times 4 = 12$ ovos. A mesma seta em cima e embaixo.',
          mostra: tabela({ linhas: BOLO([2, 4, 6, 8], [3, 6, 9, 12]), destaque: [0, 3], setas: X4 }, 'Duas setas âmbar saem da primeira coluna e chegam à última: "× 4" em cima e "× 4" embaixo.'),
        },
        {
          texto: '+ 6, nos dois números', erro: 'pensa-aditivamente',
          fala: 'Mais seis, nos dois números.',
          explica: 'De 2 para 8 são 6 a mais, mas 3 + 6 = 9, não 12. Somar dá um bolo seco. É a receita 4 vezes.',
          mostra: tabela({ linhas: BOLO([2, 4, 6, 8], [3, 6, 9, 12]), destaque: [0, 3], setas: X4 }, 'As setas "× 4" em cima e embaixo: 12 ovos, não 9.'),
        },
        {
          texto: '× 4 na farinha; os ovos ficam 3', erro: 'muda-so-um-termo',
          fala: 'Vezes quatro na farinha; os ovos ficam três.',
          explica: 'Com 3 ovos para 8 xícaras, a massa não liga. O que se faz na farinha se faz nos ovos.',
          mostra: tabela({ linhas: BOLO([2, 4, 6, 8], [3, 6, 9, 12]), destaque: [0, 3], setas: X4 }, 'A seta "× 4" aparece também embaixo, nos ovos.'),
        },
      ],
      esboco: 'O momento-chave: a mesma seta × 4 em cima e embaixo. Uma razão igual é os dois números vezes o mesmo número.',
    },
    {
      tipo: 'passo',
      problema: 'No mercado, **3 kg** de arroz custam **R$ 18**. Quanto custam **5 kg**?',
      fala: 'No mercado, três quilos de arroz custam dezoito reais. Quanto custam cinco quilos?',
      visual: tabela(
        { linhas: ARROZ([3, 1, 5], [18, '?', '?']), setas: [{ de: 0, para: 1, rotulo: '÷ 3' }, { de: 1, para: 2, rotulo: '× 5' }] },
        'A tabela do arroz: 3 kg e R$ 18; no meio, 1 kg e "?"; à direita, 5 kg e "?". Em cima, as setas "÷ 3" (de 3 para 1) e "× 5" (de 1 para 5). Embaixo, ainda sem setas.',
      ),
      passos: [
        {
          pergunta: 'De 3 para 5 não é vezes um número inteiro. Passe pelo **1 kg**: quanto custa?',
          fala: 'De três para cinco não é vezes um número inteiro. Passe pelo um quilo: quanto custa?',
          opcoes: [
            { texto: '$18 \\div 3 = 6$ reais', fala: 'dezoito dividido por três: seis reais', certa: true, explica: 'Isso. Os quilos foram ÷ 3; o preço também.' },
            { texto: '$18 - 2 = 16$ reais', fala: 'dezoito menos dois: dezesseis reais', erro: 'pensa-aditivamente', explica: 'De 3 para 1 kg sobra um terço do arroz. Então sobra um terço do preço: $18 \\div 3$.' },
          ],
          linha: { tex: '3 \\text{ kg} \\div 3 = 1 \\text{ kg}: \\quad 18 \\div 3 = 6', fala: 'três quilos dividido por três é um quilo: dezoito dividido por três dá seis' },
        },
        {
          pergunta: 'Agora de 1 kg para 5 kg.',
          fala: 'Agora de um quilo para cinco quilos.',
          opcoes: [
            { texto: '$6 \\times 5 = 30$ reais', fala: 'seis vezes cinco: trinta reais', certa: true, explica: 'Isso. 5 kg custam 5 vezes o preço de 1 kg.' },
            { texto: '$6 + 4 = 10$ reais', fala: 'seis mais quatro: dez reais', erro: 'pensa-aditivamente', explica: 'Cada quilo custa R$ 6. Cinco quilos são 5 vezes isso, não 4 reais a mais.' },
          ],
          linha: { tex: '1 \\text{ kg} \\times 5 = 5 \\text{ kg}: \\quad 6 \\times 5 = 30', fala: 'um quilo vezes cinco são cinco quilos: seis vezes cinco dá trinta' },
        },
      ],
      esboco: 'Passar pelo 1 é a ideia que resolve qualquer caso. As setas de cima dizem o caminho dos quilos; o aluno leva a mesma conta ao preço.',
    },
    {
      tipo: 'aposta',
      pergunta: 'As duas setas cabem numa conta só. Qual é?',
      fala: 'As duas setas cabem numa conta só. Qual é?',
      visual: tabela(
        { linhas: ARROZ([3, 1, 5], [18, 6, 30]), setas: [{ de: 0, para: 1, rotulo: '÷ 3' }, { de: 1, para: 2, rotulo: '× 5' }, { de: 0, para: 1, rotulo: '÷ 3', embaixo: true }, { de: 1, para: 2, rotulo: '× 5', embaixo: true }] },
        'A tabela do arroz completa: 3, 1, 5 kg e R$ 18, 6, 30, com as setas ÷ 3 e × 5 em cima e embaixo.',
      ),
      opcoes: [
        {
          texto: '$18 \\times 5 \\div 3 = 30$', fala: 'dezoito vezes cinco dividido por três: trinta', certa: true,
          explica: 'Isso. Essa é a **regra de três**: o preço anda como os quilos, × 5 e ÷ 3.',
          mostra: tabela({ linhas: ARROZ([3, 5], [18, 30]), setas: [{ de: 0, para: 1, rotulo: '× 5 ÷ 3' }, { de: 0, para: 1, rotulo: '× 5 ÷ 3', embaixo: true }] }, 'A coluna do meio some: de 3 kg direto a 5 kg, com "× 5 ÷ 3" em cima e embaixo.'),
        },
        {
          texto: '$18 \\times 3 \\div 5 = 10{,}8$', fala: 'dezoito vezes três dividido por cinco: dez vírgula oito', erro: 'razao-invertida',
          explica: 'Assim 5 kg custariam menos que 3 kg. Os quilos foram ÷ 3 e × 5: o preço também.',
          mostra: tabela({ linhas: ARROZ([3, 5], [18, 30]), setas: [{ de: 0, para: 1, rotulo: '× 5 ÷ 3' }, { de: 0, para: 1, rotulo: '× 5 ÷ 3', embaixo: true }] }, 'De 3 kg a 5 kg, "× 5 ÷ 3" em cima e embaixo: R$ 30.'),
        },
        {
          texto: '$18 + 5 - 3 = 20$', fala: 'dezoito mais cinco menos três: vinte', erro: 'pensa-aditivamente',
          explica: 'Somar e tirar não mantém a razão. As setas dizem ÷ 3 e × 5: $18 \\times 5 \\div 3 = 30$.',
          mostra: tabela({ linhas: ARROZ([3, 5], [18, 30]), setas: [{ de: 0, para: 1, rotulo: '× 5 ÷ 3' }, { de: 0, para: 1, rotulo: '× 5 ÷ 3', embaixo: true }] }, 'De 3 kg a 5 kg, "× 5 ÷ 3" em cima e embaixo.'),
        },
      ],
      esboco: 'O atalho nasce das setas, não de uma receita. A conferência "mais quilos, mais caro" desmonta a inversão.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora de cima para baixo: 3 kg, R$ 18; 1 kg, R$ 6. Que conta leva os quilos ao preço?',
      fala: 'Agora de cima para baixo: três quilos, dezoito reais; um quilo, seis reais. Que conta leva os quilos ao preço?',
      visual: tabela({ linhas: ARROZ([3, 1, 5], [18, 6, 30]) }, 'A tabela do arroz completa, sem setas.'),
      opcoes: [
        {
          texto: '× 6, em toda coluna', certa: true, fala: 'Vezes seis, em toda coluna.',
          explica: 'Isso. R$ 6 o quilo: $3 \\times 6 = 18$, $5 \\times 6 = 30$. A outra razão também fica igual.',
          mostra: tabela({ linhas: ARROZ([3, 1, 5], [18, 6, 30]), fator: '× 6' }, 'A seta âmbar à direita, de cima para baixo: "× 6".'),
        },
        {
          texto: '+ 15, em toda coluna', erro: 'pensa-aditivamente', fala: 'Mais quinze, em toda coluna.',
          explica: '$3 + 15 = 18$, mas $1 + 15 = 16$, não 6. Só a multiplicação serve para todas as colunas: × 6.',
          mostra: tabela({ linhas: ARROZ([3, 1, 5], [18, 6, 30]), fator: '× 6' }, 'A seta "× 6" à direita vale para as três colunas.'),
        },
      ],
      esboco: 'O outro caminho da regra de três: o fator de linha a linha (o preço do quilo). Ele volta na aula de taxa unitária.',
    },
    {
      tipo: 'anote',
      titulo: 'Proporção e regra de três',
      definicao: '**Proporção**: duas razões iguais, com os dois números vezes o mesmo número. **Regra de três**: achar o número que falta numa proporção.',
      exemplo: { tex: '3 \\text{ kg} \\to \\text{R\\$}\\,18 \\qquad 5 \\text{ kg} \\to 18 \\times 5 \\div 3 = \\text{R\\$}\\,30', fala: 'três quilos custam dezoito reais; cinco quilos custam dezoito vezes cinco dividido por três: trinta reais' },
      alerta: 'Somar o mesmo nos dois não mantém a razão: $2 : 3$ não é $8 : 9$. Confira: mais quilos, mais caro.',
      esboco: 'Na página: a tabela do bolo com as setas × 4 em cima e embaixo, e a do arroz passando pelo 1 kg (÷ 3, × 5).',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: **4 pães** custam **R$ 6**. Quanto custam **10 pães**, em reais?',
      fala: 'No papel: quatro pães custam seis reais. Quanto custam dez pães, em reais?',
      resposta: 15,
      resolucao: [
        { tex: '4 \\text{ pães} \\div 2 = 2 \\text{ pães}: \\quad 6 \\div 2 = 3', fala: 'quatro pães dividido por dois são dois pães: seis dividido por dois dá três reais' },
        { tex: '2 \\text{ pães} \\times 5 = 10 \\text{ pães}: \\quad 3 \\times 5 = 15', fala: 'dois pães vezes cinco são dez pães: três vezes cinco dá quinze reais' },
        { tex: '\\text{atalho: } 6 \\times 10 \\div 4 = 15', fala: 'pelo atalho: seis vezes dez dividido por quatro dá quinze' },
      ],
      esboco: 'Dois caminhos que dão o mesmo: passar pelo 2 (ou pelo 1, R$ 1,50) e o atalho.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['regra-de-tres-n1', 'regra-de-tres-n2', 'regra-de-tres-n3'],
      esboco: 'Nível 1: a coluna nova é a primeira vezes um número inteiro, com a tabela. Nível 2: não é (3 kg → 5 kg), com a tabela e sem setas. Nível 3: sozinho, com contexto, às vezes com resposta decimal.',
    },
    {
      tipo: 'fecho',
      texto: 'Com 8 xícaras, o bolo leva **12 ovos**: × 4 nos dois. Na próxima aula, quando um aumenta e o outro diminui.',
      fala: 'Com oito xícaras, o bolo leva doze ovos: vezes quatro nos dois. Na próxima aula, quando um aumenta e o outro diminui.',
      visual: tabela({ linhas: BOLO([2, 8], [3, 12]), setas: [{ de: 0, para: 1, rotulo: '× 4' }, { de: 0, para: 1, rotulo: '× 4', embaixo: true }] }, 'A tabela do gancho, agora com 12 ovos e as setas × 4 em cima e embaixo.'),
      esboco: 'Responde ao gancho com a tabela do começo, completa.',
    },
  ],
}
