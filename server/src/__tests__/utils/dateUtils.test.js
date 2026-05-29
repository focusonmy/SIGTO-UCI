import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest'
import { getRangoFechasValidas } from '../../utils/dateUtils.js'

describe('getRangoFechasValidas', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function localDate(year, month, day) {
    return new Date(year, month - 1, day)
  }

  it('sabado: solo lunes es valido', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: localDate(2026, 5, 9) })
    const rango = getRangoFechasValidas()
    expect(rango.fechasValidas).toEqual(['2026-05-11'])
    expect(rango.isValid('2026-05-11')).toBe(true)
    expect(rango.isValid('2026-05-12')).toBe(false)
  })

  it('domingo: lunes y martes son validos', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: localDate(2026, 5, 10) })
    const rango = getRangoFechasValidas()
    expect(rango.fechasValidas).toEqual(['2026-05-11', '2026-05-12'])
    expect(rango.isValid('2026-05-11')).toBe(true)
    expect(rango.isValid('2026-05-12')).toBe(true)
    expect(rango.isValid('2026-05-13')).toBe(false)
  })

  it('lunes: lun, mar, mie son validos', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: localDate(2026, 5, 11) })
    const rango = getRangoFechasValidas()
    expect(rango.fechasValidas).toEqual(['2026-05-11', '2026-05-12', '2026-05-13'])
    expect(rango.isValid('2026-05-14')).toBe(false)
  })

  it('viernes: vie, lun, mar son validos', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: localDate(2026, 5, 15) })
    const rango = getRangoFechasValidas()
    expect(rango.fechasValidas).toEqual(['2026-05-15', '2026-05-18', '2026-05-19'])
    expect(rango.isValid('2026-05-20')).toBe(false)
  })

  it('rechaza fines de semana', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: localDate(2026, 5, 11) })
    const rango = getRangoFechasValidas()
    expect(rango.isValid('2026-05-16')).toBe(false)
    expect(rango.isValid('2026-05-17')).toBe(false)
  })
})
