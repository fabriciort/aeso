import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 4 (somados ao catálogo em erros.ts).
// Reaproveitados de outras unidades: operacao-trocada, inversa-errada,
// troca-incompleta.
export const ERROS_U04: ErroComum[] = [
  {
    id: 'divide-o-menor-pelo-maior',
    nome: 'inverte a ordem da divisão',
    causa: 'Acha que a ordem não importa, como na soma, ou escreve primeiro o número que aparece primeiro no problema, e põe o grupo antes do total.',
    exemplo: '"20 pessoas em vans de 5 lugares" vira 5 ÷ 20.',
    desmonte: 'Perguntar o que está sendo repartido: são as 20 pessoas. O total vem primeiro. 5 ÷ 20 seria repartir 5 coisas entre 20, e ninguém ganharia uma inteira.',
  },
  {
    id: 'troca-quociente-e-resto',
    nome: 'responde o resto quando a pergunta é o quociente, ou o contrário',
    causa: 'Faz a divisão certa, mas não volta à pergunta: dá o número de grupos quando pediram o que sobrou, ou o que sobrou quando pediram os grupos.',
    exemplo: '17 balas em pacotes de 5, "quantas sobram?": responde 3, o número de pacotes.',
    desmonte: 'Mostrar o retângulo: 3 linhas cheias de 5 e 2 quadradinhos soltos ao lado. Apontar cada um e perguntar qual deles a pergunta quer.',
  },
  {
    id: 'resto-maior-que-divisor',
    nome: 'deixa um resto do tamanho de mais um grupo',
    causa: 'Para de formar grupos cedo demais e não confere se o que sobrou ainda forma mais um grupo inteiro.',
    exemplo: '26 ÷ 8 = 2, resto 10.',
    desmonte: 'Com 10 sobrando, cabe mais uma van de 8. O resto é sempre menor que o divisor: 26 ÷ 8 = 3, resto 2. A prova real sozinha não pega: 8 × 2 + 10 também dá 26.',
  },
  {
    id: 'ignora-contexto-do-resto',
    nome: 'não decide o que fazer com o resto',
    causa: 'Para na conta e entrega o quociente, sem voltar à situação: às vezes o resto pede mais um grupo, às vezes fica de fora.',
    exemplo: '26 pessoas em vans de 8 lugares: aluga 3 vans e deixa 2 pessoas em casa. Ou o contrário: conta 4 caixas cheias quando a quarta tem só 2 salgados.',
    desmonte: 'Desenhar as vans: 3 cheias e 2 pessoas na calçada. Elas também vão, então é mais uma van. Já uma caixa com 2 salgados não está cheia.',
  },
  {
    id: 'esquece-zero-no-quociente',
    nome: 'esquece o zero do quociente',
    causa: 'Na divisão longa, quando uma casa não dá para dividir, desce o próximo algarismo sem escrever 0 no quociente. As casas do resultado escorregam.',
    exemplo: '612 ÷ 6 = 12, em vez de 102.',
    desmonte: 'Repartir as notas: cada pessoa recebe 1 nota de 100, nenhuma de 10 e 2 de 1. Isso é R$ 102. A prova real também denuncia: 6 × 12 = 72, longe de 612.',
  },
  {
    id: 'prova-real-sem-resto',
    nome: 'esquece o resto na prova real',
    causa: 'Faz só divisor × quociente e, como não dá o dividendo, acha que a conta está errada, ou ajusta o quociente.',
    exemplo: 'Para conferir 26 ÷ 8 = 3, resto 2, faz 8 × 3 = 24 e diz que não confere.',
    desmonte: 'As 3 vans levam 24 pessoas, e as 2 que sobraram também existem. Juntar todo mundo é 8 × 3 + 2 = 26.',
  },
  {
    id: 'dividir-por-zero-da-zero',
    nome: 'acha que dividir por zero dá zero',
    causa: 'Generaliza "tudo que tem zero dá zero", como na multiplicação.',
    exemplo: '12 ÷ 0 = 0.',
    desmonte: 'Prova real: se 12 ÷ 0 fosse 0, então 0 × 0 daria 12. Dá 0. Nenhum número vezes 0 dá 12.',
  },
  {
    id: 'dividir-por-zero-da-o-dividendo',
    nome: 'acha que dividir por zero deixa o número igual',
    causa: 'Pensa que dividir por zero é "não dividir", como somar zero, e o número fica como estava.',
    exemplo: '12 ÷ 0 = 12.',
    desmonte: 'Prova real: se 12 ÷ 0 fosse 12, então 0 × 12 daria 12. Dá 0. Quem não divide é o 1: 12 ÷ 1 = 12.',
  },
  {
    id: 'zero-dividido-nao-existe',
    nome: 'acha que 0 dividido por um número não existe',
    causa: 'Confunde 0 ÷ 5 com 5 ÷ 0 e trata qualquer divisão com zero como proibida.',
    exemplo: '0 ÷ 5 "não existe", ou "dá erro".',
    desmonte: 'Zero balas para 5 pessoas: cada uma recebe 0. Prova real: 5 × 0 = 0, confere. O proibido é dividir por zero, não dividir o zero.',
  },
]
