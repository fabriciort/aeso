import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 19, parte B (aulas 4 a 6: contagem;
// probabilidade; frequência e simulação), somados ao catálogo em erros.ts.
// Reaproveitados: soma-no-lugar-de-multiplicar (unidade 3: 3 camisas e 2
// calças viram 3 + 2), conta-zeros-errado (unidade 3: 10 × 10 × 10 = 100),
// pintadas-sobre-nao-pintadas (unidade 7: 3 azuis contra 5 que não são
// azuis, 3/5), troca-numerador-denominador (unidade 7: 8/3), parte-como-
// porcentagem (unidade 11: 3 bolas viram 3 %), operacao-trocada (unidade 2:
// 600 × 6 no lugar de 600 ÷ 6), esquece-de-dividir (unidade 15: para no
// 600 × 3, sem dividir pelas 10 bolas) e responde-outra-pergunta (unidade 15:
// dá a porcentagem de coroas quando a pergunta é a de caras).
export const ERROS_U19B: ErroComum[] = [
  {
    id: 'esquece-uma-etapa',
    nome: 'conta só uma parte das etapas',
    causa: 'Multiplica as opções de algumas etapas e esquece as outras, ou conta só a primeira escolha, como se as outras não abrissem caminhos novos.',
    exemplo: 'Pão (3), recheio (4) e suco (2) dão 3 × 4 = 12 lanches, sem o suco. Ou 3 camisas e 2 calças dão "3 roupas".',
    desmonte: 'Fazer a árvore crescer uma etapa por vez: depois dos 12 sanduíches, cada ponta ainda abre 2 ramos, um para cada suco. Toda etapa multiplica: 12 × 2 = 24.',
  },
  {
    id: 'ignora-a-ordem-dos-dados',
    nome: 'conta 2 e 5 e 5 e 2 como um resultado só',
    causa: 'Pensa nos dois dados como iguais e junta os pares com os mesmos números. Perde metade dos casos e acha que só há 21 resultados.',
    exemplo: 'Soma 7 com dois dados: conta só 1 e 6, 2 e 5, 3 e 4 (3 casos), e não 6.',
    desmonte: 'Pintar os dados de cores diferentes: amarelo 2 com azul 5 é uma casa da grade; amarelo 5 com azul 2 é outra. A grade tem 6 × 6 = 36 casas, e a soma 7 acende 6 delas.',
  },
  {
    id: 'resultados-como-casos-iguais',
    nome: 'trata resultados diferentes como casos de mesma chance',
    causa: 'Lista os resultados que podem sair (as somas de 2 a 12, as cores do saco) e dá a mesma chance a cada um, sem ver que uns acontecem de mais jeitos que outros.',
    exemplo: 'Dois dados: "as somas são 11, então a soma 7 tem chance 1/11". Ou um saco com 3 azuis, 4 vermelhas e 1 verde: "3 cores, chance 1/3 para cada".',
    desmonte: 'Contar os casos um por um: na grade dos dois dados, a soma 12 acende 1 casa e a soma 7 acende 6, de 36. No saco, cada bola é um caso: a verde é 1 de 8.',
  },
  {
    id: 'chance-maior-que-um',
    nome: 'acha que uma chance pode passar de 1',
    causa: 'Pensa na chance como uma medida que cresce sem limite ("muito provável" seria mais que 1), ou põe os casos possíveis em cima e os favoráveis embaixo.',
    exemplo: 'Diz que a chance de tirar menos que 7 num dado é "mais que 1, porque é muito fácil". Ou escreve 6/3.',
    desmonte: 'Os favoráveis são parte dos possíveis: nunca passam deles. No máximo, todos servem: 6 de 6 = 1, ou 100 %, o certo. Nenhum servindo: 0 de 6 = 0, o impossível.',
  },
  {
    id: 'frequencia-igual-a-chance',
    nome: 'espera que poucas jogadas mostrem a chance exata',
    causa: 'Lê a chance como uma promessa para cada punhado de jogadas: 10 jogadas da moeda teriam de dar 5 caras. Também confia num resultado de poucas jogadas tanto quanto num de muitas.',
    exemplo: 'A moeda deu 7 caras em 10 e a pessoa acha que ela está viciada. Ou o 6 saiu 95 vezes em 600 e "deveria ter saído 100".',
    desmonte: 'Jogar muitas vezes e olhar a curva: com 10 jogadas, 70 % de caras; com 1.000, 49,4 %. A frequência chega perto da chance com muitas jogadas, mas quase nunca fica igual a ela.',
  },
  {
    id: 'falacia-do-jogador',
    nome: 'acha que o que já saiu muda a chance da próxima jogada (a falácia do jogador)',
    causa: 'Imagina que a moeda ou o dado "lembram" o que saiu: depois de 5 caras, a coroa estaria atrasada (ou a cara estaria em alta). Confunde o equilíbrio de muitas jogadas com uma compensação na próxima.',
    exemplo: 'Saíram 5 caras seguidas, e a pessoa aposta tudo na coroa, achando que a chance dela passou de 1/2.',
    desmonte: 'A moeda não tem memória: na próxima jogada, ela tem as mesmas duas faces, 1 de 2. Depois das 5 caras, a curva de 1.000 jogadas volta para perto de 50 % porque as 995 jogadas novas pesam muito mais, não porque a coroa compensa.',
  },
]
