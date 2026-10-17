import type { ErroComum } from '@/lib/formation/schema'

export const ERROS_AF_U03A: ErroComum[] = [
  {
    "id": "equacao-esquece-raiz-negativa",
    "nome": "esquece a segunda raiz",
    "causa": "Desfaz o quadrado usando apenas a raiz principal.",
    "exemplo": "x² = 25 dá só x = 5.",
    "desmonte": "Confira (−5) · (−5): também dá 25. A equação pede todos os valores que funcionam."
  },
  {
    "id": "raiz-equacao-confunde-radical",
    "nome": "confunde radical e raízes da equação",
    "causa": "Trata √25 como uma pergunta pelas duas soluções de x² = 25.",
    "exemplo": "√25 = ±5.",
    "desmonte": "O símbolo √ escolhe o valor não negativo. A equação x² = 25 aceita dois valores: −5 e 5."
  },
  {
    "id": "raizes-iguais-contadas-duas",
    "nome": "conta uma raiz repetida como dois valores",
    "causa": "Vê o sinal ± mesmo quando a parcela é zero e conta as duas escritas.",
    "exemplo": "x² = 0 tem raízes +0 e −0 diferentes.",
    "desmonte": "Marque +0 e −0 na reta: chegam ao mesmo ponto. Há uma raiz distinta, mesmo que a fórmula a repita."
  },
  {
    "id": "quadrado-negativo-tem-raiz-real",
    "nome": "aceita raiz real de quadrado negativo",
    "causa": "Imagina que basta pôr menos na raiz de um radicando negativo.",
    "exemplo": "x² = −9 dá x = −3.",
    "desmonte": "(−3)² = +9. O quadrado de um real nunca é negativo."
  },
  {
    "id": "equacao-deslocamento-troca-sinal",
    "nome": "aplica o mais ou menos depois do deslocamento",
    "causa": "Obtém um ramo e toma seu oposto, sem resolver o outro ramo.",
    "exemplo": "(x − 1)² = 16 dá 5 e −5.",
    "desmonte": "Resolva x − 1 = 4 e x − 1 = −4 separadamente. Some 1 nos dois casos: 5 e −3."
  },
  {
    "id": "produto-zero-exige-dois",
    "nome": "exige os dois fatores iguais a zero",
    "causa": "Interpreta a regra como duas condições simultâneas em vez de alternativas.",
    "exemplo": "(x − 2)(x + 3) = 0 exige x = 2 e x = −3 ao mesmo tempo.",
    "desmonte": "Com x = 2, o produto é 0 · 5 = 0. Um único fator zero basta."
  },
  {
    "id": "produto-zero-aplicado-a-soma",
    "nome": "aplica produto nulo a uma soma",
    "causa": "Vê o resultado zero e ignora a operação entre os termos.",
    "exemplo": "(x − 2) + (x + 2) = 0 dá 2 e −2.",
    "desmonte": "x = 0 dá −2 + 2 = 0 sem nenhuma parcela zero. A regra é para multiplicação."
  },
  {
    "id": "produto-nulo-sem-zero",
    "nome": "aplica produto nulo com resultado diferente de zero",
    "causa": "Acredita que todo produto se resolve zerando seus fatores.",
    "exemplo": "(x − 2)(x + 3) = 6 dá 2 ou −3.",
    "desmonte": "Esses valores dão produto 0, não 6. Reúna os termos para obter zero antes de fatorar."
  },
  {
    "id": "equacao-fator-esquece-coeficiente",
    "nome": "esquece o coeficiente ao zerar um fator",
    "causa": "Lê a constante do fator como resposta sem desfazer a multiplicação.",
    "exemplo": "2x − 6 = 0 dá x = 6.",
    "desmonte": "2 · 6 − 6 = 6. Para zerar, 2x = 6, então x = 3."
  },
  {
    "id": "equacao-raiz-copia-sinal",
    "nome": "copia o sinal do fator para a raiz",
    "causa": "Lê o número dentro do parêntese como solução pronta.",
    "exemplo": "(x + 3)(x − 2) = 0 dá x = 3 ou −2.",
    "desmonte": "Substitua: x + 3 só zera com −3; x − 2 só zera com +2."
  },
  {
    "id": "equacao-divide-por-x",
    "nome": "divide por x e perde a raiz zero",
    "causa": "Cancela x sem verificar a condição de divisão por número diferente de zero.",
    "exemplo": "x² − 4x = 0 vira só x = 4.",
    "desmonte": "Coloque x em evidência: x(x − 4) = 0. O fator x revela a raiz 0. Não se pode dividir por ela."
  },
  {
    "id": "completar-so-um-lado",
    "nome": "completa o quadrado de um lado só",
    "causa": "Confunde mover peças com acrescentar uma área nova.",
    "exemplo": "x² + 6x = 16 vira (x + 3)² = 16.",
    "desmonte": "O canto acrescentado vale 9. Para manter a igualdade, o 16 também recebe 9 e vira 25."
  },
  {
    "id": "completar-metade-sem-quadrado",
    "nome": "soma a metade do coeficiente sem elevá-la ao quadrado",
    "causa": "Usa o lado do canto como se fosse sua área.",
    "exemplo": "x² + 6x precisa de +3 para completar.",
    "desmonte": "Metade de 6 é 3: cada lado do canto mede 3. A área que falta é 3 · 3 = 9."
  },
  {
    "id": "completar-dobra-coeficiente",
    "nome": "dobra o coeficiente em vez de tomar metade",
    "causa": "Põe duas faixas com a largura inteira em vez de repartir a faixa existente.",
    "exemplo": "x² + 6x vira (x + 6)².",
    "desmonte": "(x + 6)² traz 12x, não 6x. Divida as seis barras em três de cada lado."
  }
]
