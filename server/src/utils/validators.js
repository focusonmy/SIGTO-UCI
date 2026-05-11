export function isValidUUID(id) {
  if (!id || typeof id !== 'string') return false
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidPattern.test(id)
}

export function sanitizeString(str, maxLength = 100) {
  if (typeof str !== 'string') return ''
  return str.slice(0, maxLength).replace(/[<>]/g, '')
}

export function getClientIP(req) {
  return req.ip || req.headers?.['x-forwarded-for']?.split(',')[0] || 'unknown'
}