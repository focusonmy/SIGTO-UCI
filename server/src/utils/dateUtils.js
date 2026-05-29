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
