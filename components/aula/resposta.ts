// Comparar a resposta digitada com a certa, inclusive decimais com vírgula.

/** Is the answer a decimal (0,25 or 0.25 as a number)? Then the keypad shows the comma. */
export const isDecimal = (answer: unknown) => (typeof answer === 'number' ? !Number.isInteger(answer) : /^\d[\d.]*,\d+$/.test(String(answer).trim()))

/** A number as the student writes it: 0.25 → "0,25". */
const written = (answer: string | number) => (typeof answer === 'number' ? String(answer).replace('.', ',') : answer)

/** Same number? Ignores the dots and spaces that only group the digits, and zeros at the end of a decimal (0,50 = 0,5). */
export function sameAnswer(typed: string, answer: string | number): boolean {
  return normalizeAnswer(typed).toLowerCase() === normalizeAnswer(written(answer)).toLowerCase()
}

export const normalizeAnswer = (v: string) => {
  const t = v.replace(/[.\s]/g, '').replace(/^0+(?=\d)/, '')
  return t.includes(',') ? t.replace(/0+$/, '').replace(/,$/, '').replace(/^,/, '0,') : t
}
