import '@testing-library/jest-dom'

// Add Jest globals
global.jest = require('jest')
global.describe = global.describe || (() => {})
global.it = global.it || (() => {})
global.beforeEach = global.beforeEach || (() => {})
global.expect = global.expect || (() => {})

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Convex
jest.mock('convex/react', () => ({
  useQuery: jest.fn(() => null),
  useMutation: jest.fn(() => jest.fn()),
  useConvex: jest.fn(() => ({})),
}))

// Mock Sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

// Mock Lucide React
jest.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
  MapPin: () => <div data-testid="mappin-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  CreditCard: () => <div data-testid="creditcard-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Save: () => <div data-testid="save-icon" />,
  Camera: () => <div data-testid="camera-icon" />,
  CheckCircle: () => <div data-testid="checkcircle-icon" />,
  AlertCircle: () => <div data-testid="alertcircle-icon" />,
  Building: () => <div data-testid="building-icon" />,
  Globe: () => <div data-testid="globe-icon" />,
}))

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: jest.fn(),
  registerables: [],
}))

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

global.matchMedia = global.matchMedia || function (query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }
}