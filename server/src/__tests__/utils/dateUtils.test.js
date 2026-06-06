import { expect, describe, it, vi, afterEach } from 'vitest'
import {
  getRangoFechasValidas,
  formatLocalDate,
  getHoyLocal,
  getMananaLocal
} from '../../utils/dateUtils.js'

function localDate(year, month, day, hour = 0, minute = 0) {
  return new Date(year, month - 1, day, hour, minute)
}

describe('getRangoFechasValidas', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

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

describe('formatLocalDate', () => {
  it('formatea con ceros a la izquierda', () => {
    expect(formatLocalDate(localDate(2026, 3, 5))).toBe('2026-03-05')
    expect(formatLocalDate(localDate(2026, 12, 31))).toBe('2026-12-31')
    expect(formatLocalDate(localDate(2026, 1, 1))).toBe('2026-01-01')
  })

  it('usa la hora local, no UTC (regresion bug desfase)', () => {
    expect(formatLocalDate(localDate(2026, 6, 4, 23, 59))).toBe('2026-06-04')
    expect(formatLocalDate(localDate(2026, 6, 4, 0, 0))).toBe('2026-06-04')
  })
})

describe('getHoyLocal', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('devuelve la fecha actual en formato YYYY-MM-DD', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: localDate(2026, 6, 4, 10, 0) })
    expect(getHoyLocal()).toBe('2026-06-04')
  })

  it('regresion: a las 22:00 local sigue siendo el mismo dia (no desfasa por toISOString)', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: localDate(2026, 6, 4, 22, 0) })
    expect(getHoyLocal()).toBe('2026-06-04')
  })

  it('regresion: a las 23:59 local sigue siendo el mismo dia', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: localDate(2026, 6, 4, 23, 59) })
    expect(getHoyLocal()).toBe('2026-06-04')
  })

  it('cambia al dia siguiente despues de medianoche', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: localDate(2026, 6, 4, 0, 1) })
    expect(getHoyLocal()).toBe('2026-06-04')
    vi.useFakeTimers({ toFake: ['Date'], now: localDate(2026, 6, 5, 0, 0) })
    expect(getHoyLocal()).toBe('2026-06-05')
  })
})

describe('getMananaLocal', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('suma un dia correctamente', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: localDate(2026, 6, 4, 10, 0) })
    expect(getMananaLocal()).toBe('2026-06-05')
  })

  it('regresion: a las 22:00 devuelve el dia siguiente, no dos dias despues', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: localDate(2026, 6, 4, 22, 0) })
    expect(getMananaLocal()).toBe('2026-06-05')
  })

  it('cambia de mes correctamente', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: localDate(2026, 6, 30, 10, 0) })
    expect(getMananaLocal()).toBe('2026-07-01')
  })

  it('cambia de ano correctamente', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: localDate(2026, 12, 31, 10, 0) })
    expect(getMananaLocal()).toBe('2027-01-01')
  })
})
