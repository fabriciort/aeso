import { describe, expect, test } from 'vitest'
import { isDecimal, isNegative, sameAnswer, written } from '@/components/aula/resposta'

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

describe('respostas negativas', () => {
  test('o menos do teclado, o hífen e o número', () => {
    expect(sameAnswer('−3', -3)).toBe(true)
    expect(sameAnswer('-3', -3)).toBe(true)
    expect(sameAnswer('−3', '−3')).toBe(true)
    expect(sameAnswer('−2,50', -2.5)).toBe(true)
    expect(sameAnswer('3', -3)).toBe(false)
    expect(sameAnswer('−3', 3)).toBe(false)
    expect(sameAnswer('−0', 0)).toBe(true)
  })
  test('quando o teclado mostra o menos', () => {
    expect(isNegative(-3)).toBe(true)
    expect(isNegative('−2,5')).toBe(true)
    expect(isNegative(0)).toBe(false)
    expect(isNegative('3')).toBe(false)
    expect(isDecimal(-2.5)).toBe(true)
    expect(isDecimal('−2,5')).toBe(true)
  })
  test('a resposta escrita com o sinal de menos', () => {
    expect(written(-3)).toBe('−3')
    expect(written(-0.5)).toBe('−0,5')
    expect(written('-4')).toBe('−4')
  })
})
