import { describe, expect, test } from 'vitest'
import { isDecimal, sameAnswer } from '@/components/aula/resposta'

describe('respostas decimais', () => {
  test('a vírgula e os zeros no fim', () => {
    expect(sameAnswer('0,25', '0,25')).toBe(true)
    expect(sameAnswer('0,50', '0,5')).toBe(true)
    expect(sameAnswer(',5', '0,5')).toBe(true)
    expect(sameAnswer('0,25', 0.25)).toBe(true)
    expect(sameAnswer('1,3', 1.3)).toBe(true)
    expect(sameAnswer('2,0', '2')).toBe(true)
    expect(sameAnswer('0,25', '0,5')).toBe(false)
    expect(sameAnswer('025', '0,25')).toBe(false)
  })
  test('os inteiros continuam como antes', () => {
    expect(sameAnswer('12.500', 12500)).toBe(true)
    expect(sameAnswer('100', '100')).toBe(true)
    expect(sameAnswer('10', '100')).toBe(false)
  })
  test('quando o teclado mostra a vírgula', () => {
    expect(isDecimal(0.25)).toBe(true)
    expect(isDecimal('3,75')).toBe(true)
    expect(isDecimal(12)).toBe(false)
    expect(isDecimal('12.500')).toBe(false)
  })
})
