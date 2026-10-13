// Comparar a resposta digitada com a certa, inclusive decimais com vírgula e negativos.

/** Is the answer a decimal (0,25 or 0.25 as a number)? Then the keypad shows the comma. */
export const isDecimal = (answer: unknown) => (typeof answer === 'number' ? !Number.isInteger(answer) : /^[−-]?\d[\d.]*,\d+$/.test(String(answer).trim()))

/** Is the answer negative (−3, "-2,5")? Then the keypad shows the minus. */
export const isNegative = (answer: unknown) => (typeof answer === 'number' ? answer < 0 : /^\s*[−-]\s*\d/.test(String(answer)))

/** A number as the student writes it: 0.25 → "0,25", −3 → "−3" (the true minus sign). */
export const written = (answer: string | number) => (typeof answer === 'number' ? String(answer).replace('.', ',') : answer).replace(/^\s*-/, '−')

/** Same number? Ignores the dots and spaces that only group the digits, and zeros at the end of a decimal (0,50 = 0,5). */
export function sameAnswer(typed: string, answer: string | number): boolean {
  return normalizeAnswer(typed).toLowerCase() === normalizeAnswer(written(answer)).toLowerCase()
}

export const normalizeAnswer = (v: string) => {
  const s = v.replace(/[.\s]/g, '').replace(/-/g, '−')
  const neg = s.startsWith('−')
  const t = (neg ? s.slice(1) : s).replace(/^0+(?=\d)/, '')
  const n = t.includes(',') ? t.replace(/0+$/, '').replace(/,$/, '').replace(/^,/, '0,') : t
  // −0 is 0.
  return neg && /[1-9]/.test(n) ? `−${n}` : n
}
