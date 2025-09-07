import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

// Mock Convex client
const mockConvexClient = new ConvexReactClient('https://mock-convex-url')

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConvexProvider client={mockConvexClient}>
      {children}
    </ConvexProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock data generators
export const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  phoneNumber: '+1234567890',
  address: '123 Test St',
  city: 'Test City',
  country: 'Test Country',
  dateOfBirth: '1990-01-01',
  occupation: 'Software Engineer',
  company: 'Test Corp',
  bio: 'Test bio',
  role: 'user',
  emailVerified: true,
  phoneVerified: false,
  identityVerified: false,
  addressVerified: false,
  kycStatus: 'not_submitted',
  image: '',
  isActive: true,
  lastLoginAt: Date.now(),
  createdAt: Date.now() - 86400000,
  updatedAt: Date.now(),
}

export const mockInvestmentPlan = {
  id: 'test-plan-id',
  name: 'Test Investment Plan',
  description: 'A test investment plan',
  apy: 12.5,
  minInvestment: 100,
  maxInvestment: 10000,
  duration: 30,
  category: 'staking',
  isActive: true,
  totalInvestors: 150,
  totalInvested: 500000,
  createdAt: Date.now() - 86400000,
  updatedAt: Date.now(),
}

export const mockTransaction = {
  id: 'test-transaction-id',
  type: 'deposit',
  amount: 1000,
  currency: 'USDC',
  status: 'completed',
  hash: '0x1234567890abcdef',
  fromAddress: '0xabcdef1234567890',
  toAddress: '0x1234567890abcdef',
  timestamp: Date.now() - 3600000,
  createdAt: Date.now() - 3600000,
}

export const mockNotification = {
  id: 'test-notification-id',
  type: 'investment',
  title: 'Test Notification',
  message: 'This is a test notification',
  timestamp: '1 hour ago',
  read: false,
  priority: 'medium',
}

// Mock Convex query responses
export const mockConvexQueries = {
  getCurrentUserProfile: () => mockUser,
  getUserVerificationStatus: () => ({
    emailVerified: true,
    phoneVerified: false,
    identityVerified: false,
    addressVerified: false,
    kycStatus: 'not_submitted',
  }),
  getUserAccountStats: () => ({
    memberSince: 'Dec 2023',
    totalInvestments: 8,
    activeInvestments: 5,
    totalInvested: 25000,
    portfolioValue: 67420,
    verificationLevel: 'Basic',
  }),
  getInvestmentPlans: () => [mockInvestmentPlan],
  getRecentTransactions: () => [mockTransaction],
  getNotifications: () => [mockNotification],
}

// Helper functions
export const createMockUseQuery = (queries: Record<string, any>) => {
  return jest.fn((query) => {
    const queryName = query.toString()
    for (const [key, value] of Object.entries(queries)) {
      if (queryName.includes(key)) {
        return value
      }
    }
    return null
  })
}

export const createMockUseMutation = () => {
  return jest.fn(() => jest.fn())
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
