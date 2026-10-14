import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 20: o projeto (a reforma do quarto) e a
// avaliação final (somados ao catálogo em erros.ts). Reaproveitados, no
// projeto: confunde-area-perimetro, soma-no-lugar-de-multiplicar,
// ignora-contexto-do-resto (as caixas e as latas arredondadas para baixo),
// porcentagem-como-numero-inteiro, desconto-como-preco-final,
// conta-so-o-que-ve, pinta-faces-a-mais, operacao-trocada,
// esquece-valor-fixo, esquece-de-dividir. Na avaliação, um erro comum de
// cada unidade: ignora-contexto-do-resto, troca-quociente-e-resto,
// responde-outra-pergunta, pintadas-sobre-nao-pintadas,
// troca-numerador-denominador, fator-de-conversao-errado,
// pensa-aditivamente, razao-invertida, tirar-negativo-subtrai,
// raiz-e-a-metade, equacao-diferente-do-problema,
// desfaz-com-a-mesma-operacao, confunde-m3-com-litro,
// confunde-volume-superficie, troca-media-mediana-moda,
// media-do-menor-e-do-maior, media-esquece-valores, parte-como-porcentagem,
// resultados-como-casos-iguais, decimal-mais-casas-maior.
export const ERROS_U20: ErroComum[] = [
  {
    id: 'esquece-a-sobra',
    nome: 'compra o material na medida exata, sem a sobra',
    causa: 'Faz a conta com a área do chão e para, sem lembrar que o piso se corta nas bordas e algumas peças quebram. A loja e o pedreiro pedem uma porcentagem a mais (em geral 10 %).',
    exemplo: 'Chão de 15 m², caixas de 2 m², 10 % de sobra: compra 8 caixas (15 ÷ 2 = 7,5). Com a sobra, são 16,5 m² e 9 caixas.',
    desmonte: 'Desenhar o chão coberto de caixas: as peças da borda são cortadas, e o pedaço que sobra do corte não cobre outro lugar. Somar os 10 % antes de dividir: 15 + 1,5 = 16,5 m².',
  },
  {
    id: 'esquece-de-descontar-aberturas',
    nome: 'pinta a porta e a janela',
    causa: 'Calcula a área das paredes inteiras e compra tinta para ela, sem tirar a porta e a janela, que não levam tinta.',
    exemplo: 'Paredes de 40 m², porta de 2 m² e janela de 2 m²: compra tinta para 40 m² (são 36 m²).',
    desmonte: 'Desenhar a parede de frente, com a porta e a janela em outra cor: são buracos na parede. A área de cada uma sai da conta: 40 − 2 − 2 = 36 m².',
  },
  {
    id: 'esquece-a-quantidade',
    nome: 'soma os preços sem multiplicar pela quantidade',
    causa: 'No orçamento, junta os preços de cada coisa (o da caixa, o do metro, o da lata) como se fosse comprar uma de cada.',
    exemplo: '9 caixas a R$ 60, 16 m de rodapé a R$ 15 e 4 latas a R$ 105 viram 60 + 15 + 105 = R$ 180 (são R$ 1.200).',
    desmonte: 'Montar a tabela do orçamento: uma linha com a quantidade, outra com o preço e a do total, quantidade vezes preço. A obra é a soma da última linha.',
  },
]
