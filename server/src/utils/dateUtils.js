function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatLocalDate(d) {
  return formatDate(d)
}

export function getHoyLocal() {
  return formatLocalDate(new Date())
}

export function getMananaLocal() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return formatLocalDate(d)
}

export function formatearFechaDisplay(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function getFechaPorHora() {
  const ahora = new Date()
  const hora = ahora.getHours()
  const min = ahora.getMinutes()
  const enTarde = hora > 17 || (hora === 17 && min >= 15)
  const fecha = new Date()
  if (enTarde) fecha.setDate(fecha.getDate() + 1)
  const fechaStr = formatLocalDate(fecha)
  return {
    fecha: fechaStr,
    tipo: enTarde ? 'manana' : 'hoy',
    label: enTarde
      ? `Rutas para mañana ${formatearFechaDisplay(fechaStr)}`
      : `Rutas para hoy ${formatearFechaDisplay(fechaStr)}`
  }
}

export function getRangoFechasValidas() {
  const hoy = new Date()
  const hoyDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const diaSemana = hoyDate.getDay()

  const validDates = []
  const cursor = new Date(hoyDate)

  if (diaSemana === 6) {
    cursor.setDate(cursor.getDate() + 2)
    validDates.push(new Date(cursor))
  } else if (diaSemana === 0) {
    cursor.setDate(cursor.getDate() + 1)
    validDates.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
    validDates.push(new Date(cursor))
  } else {
    while (validDates.length < 3) {
      const dw = cursor.getDay()
      if (dw >= 1 && dw <= 5) {
        validDates.push(new Date(cursor))
      }
      cursor.setDate(cursor.getDate() + 1)
    }
  }

  return {
    minDate: validDates[0],
    maxDate: validDates[validDates.length - 1],
    fechasValidas: validDates.map(formatDate),
    isValid(fechaStr) {
      const d = parseDate(fechaStr)
      const dw = d.getDay()
      if (dw === 0 || dw === 6) return false
      if (d < validDates[0]) return false
      if (d > validDates[validDates.length - 1]) return false
      return true
    }
  }
}
