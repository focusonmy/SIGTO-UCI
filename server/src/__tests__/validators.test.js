import { expect, describe, it } from 'vitest'
import { isValidUUID, sanitizeString, getClientIP } from '../utils/validators.js'

describe('isValidUUID', () => {
  it('devuelve true para UUID válido', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    expect(isValidUUID('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true)
    expect(isValidUUID('AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE')).toBe(true)
  })

  it('devuelve false para UUID inválido', () => {
    expect(isValidUUID('no-es-uuid')).toBe(false)
    expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false)
    expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false)
    expect(isValidUUID('550e8400-e29b-41d4-a716-44665544000g')).toBe(false)
    expect(isValidUUID('')).toBe(false)
    expect(isValidUUID(' ')).toBe(false)
  })

  it('devuelve false para null y undefined', () => {
    expect(isValidUUID(null)).toBe(false)
    expect(isValidUUID(undefined)).toBe(false)
  })

  it('devuelve false para tipos no string', () => {
    expect(isValidUUID(12345)).toBe(false)
    expect(isValidUUID({})).toBe(false)
    expect(isValidUUID([])).toBe(false)
  })
})

describe('sanitizeString', () => {
  it('elimina etiquetas HTML < >', () => {
    expect(sanitizeString('<script>alert(1)</script>')).toBe('scriptalert(1)/script')
    expect(sanitizeString('<b>texto</b>')).toBe('btexto/b')
    expect(sanitizeString('texto <br> normal')).toBe('texto br normal')
  })

  it('devuelve cadena vacía para tipos no string', () => {
    expect(sanitizeString(null)).toBe('')
    expect(sanitizeString(undefined)).toBe('')
    expect(sanitizeString(123)).toBe('')
    expect(sanitizeString({})).toBe('')
  })

  it('respecta el límite de longitud', () => {
    const input = 'a'.repeat(200)
    expect(sanitizeString(input, 50)).toBe('a'.repeat(50))
    expect(sanitizeString(input, 100)).toBe('a'.repeat(100))
  })

  it('usa límite por defecto de 100', () => {
    const input = 'b'.repeat(150)
    expect(sanitizeString(input).length).toBe(100)
  })

  it('devuelve strings limpios sin cambios', () => {
    expect(sanitizeString('Texto normal sin HTML')).toBe('Texto normal sin HTML')
    expect(sanitizeString('Ruta: UCI → CUJAE')).toBe('Ruta: UCI → CUJAE')
    expect(sanitizeString('')).toBe('')
  })
})

describe('getClientIP', () => {
  it('devuelve req.ip si existe', () => {
    const req = { ip: '192.168.1.100' }
    expect(getClientIP(req)).toBe('192.168.1.100')
  })

  it('extrae IP de x-forwarded-for si no hay req.ip', () => {
    const req = { headers: { 'x-forwarded-for': '10.0.0.1, 10.0.0.2' } }
    expect(getClientIP(req)).toBe('10.0.0.1')
  })

  it('devuelve "unknown" si no hay IP', () => {
    expect(getClientIP({ headers: {} })).toBe('unknown')
    expect(getClientIP({ ip: null, headers: {} })).toBe('unknown')
  })
})