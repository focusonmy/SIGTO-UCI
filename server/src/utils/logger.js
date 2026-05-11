const IS_DEV = process.env.NODE_ENV !== 'production'

const logger = {
  info: (...args) => {
    if (IS_DEV) console.log('[INFO]', ...args)
  },
  warn: (...args) => {
    if (IS_DEV) console.warn('[WARN]', ...args)
  },
  error: (...args) => {
    // In production, only log to file, not console
    if (IS_DEV) console.error('[ERROR]', ...args)
  }
}

export default logger
