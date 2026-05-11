import '@testing-library/jest-dom'

Object.defineProperty(window, 'location', {
  value: { href: 'http://localhost/', pathname: '/', replace: vi.fn() },
  writable: true,
})

window.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}