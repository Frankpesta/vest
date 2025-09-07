import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useQuery, useMutation } from 'convex/react'
import DashboardPage from '@/app/(dashboard)/dashboard/page'
import { describe, beforeEach } from 'node:test'
import { it } from 'zod/v4/locales'

// Mock the Convex hooks
jest.mock('convex/react')
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: jest.fn(),
  registerables: [],
}))

// Mock Zustand stores
jest.mock('@/lib/store', () => ({
  useAuthStore: jest.fn(() => ({
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://example.com/avatar.jpg',
    },
    updateUser: jest.fn(),
  })),
  useWalletStore: jest.fn(() => ({
    isConnected: false,
    address: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
  useNotificationStore: jest.fn(() => ({
    notifications: [],
    unreadCount: 0,
    markAllAsRead: jest.fn(),
  })),
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Mock the Convex queries
    mockUseQuery.mockImplementation((query) => {
      if (query.toString().includes('getPortfolioData')) {
        return {
          totalValue: 67420,
          totalInvested: 50000,
          totalReturns: 17420,
          returnPercentage: 34.84,
          activeInvestments: 5,
          totalInvestments: 8,
        }
      }
      if (query.toString().includes('getRecentTransactions')) {
        return [
          {
            id: 1,
            type: 'deposit',
            amount: 2500,
            currency: 'ETH',
            status: 'completed',
            timestamp: Date.now() - 3600000, // 1 hour ago
          },
          {
            id: 2,
            type: 'investment',
            amount: 1000,
            currency: 'USDC',
            status: 'completed',
            timestamp: Date.now() - 7200000, // 2 hours ago
          },
        ]
      }
      if (query.toString().includes('getInvestmentPlans')) {
        return [
          {
            id: 1,
            name: 'Crypto Staking Pool',
            apy: 12.5,
            minInvestment: 100,
            maxInvestment: 10000,
            duration: 30,
            category: 'staking',
            isActive: true,
          },
          {
            id: 2,
            name: 'DeFi Yield Farming',
            apy: 18.0,
            minInvestment: 500,
            maxInvestment: 50000,
            duration: 60,
            category: 'yield',
            isActive: true,
          },
        ]
      }
      return null
    })

    // Mock the Convex mutations
    mockUseMutation.mockImplementation(() => jest.fn())
  })

  it('renders dashboard with overview cards', async () => {
    render(<DashboardPage />)

    // Check if the page title is rendered
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument()
    expect(screen.getByText('Welcome back! Here\'s what\'s happening with your investments.')).toBeInTheDocument()

    // Check if overview cards are displayed
    expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument()
    expect(screen.getByText('Total Invested')).toBeInTheDocument()
    expect(screen.getByText('Total Returns')).toBeInTheDocument()
    expect(screen.getByText('Active Investments')).toBeInTheDocument()
  })

  it('displays portfolio value correctly', async () => {
    render(<DashboardPage />)

    // Check if portfolio value is displayed
    expect(screen.getByText('$67,420')).toBeInTheDocument()
    expect(screen.getByText('+34.84%')).toBeInTheDocument()
  })

  it('displays investment statistics correctly', async () => {
    render(<DashboardPage />)

    // Check if investment stats are displayed
    expect(screen.getByText('$50,000')).toBeInTheDocument()
    expect(screen.getByText('$17,420')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders portfolio chart', async () => {
    render(<DashboardPage />)

    // Check if chart section is displayed
    expect(screen.getByText('Portfolio Performance')).toBeInTheDocument()
    expect(screen.getByText('Last 30 Days')).toBeInTheDocument()
  })

  it('renders recent transactions', async () => {
    render(<DashboardPage />)

    // Check if recent transactions section is displayed
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument()
    expect(screen.getByText('View All')).toBeInTheDocument()

    // Check if transactions are displayed
    expect(screen.getByText('Deposit')).toBeInTheDocument()
    expect(screen.getByText('Investment')).toBeInTheDocument()
  })

  it('renders investment opportunities', async () => {
    render(<DashboardPage />)

    // Check if investment opportunities section is displayed
    expect(screen.getByText('Investment Opportunities')).toBeInTheDocument()
    expect(screen.getByText('View All Plans')).toBeInTheDocument()

    // Check if investment plans are displayed
    expect(screen.getByText('Crypto Staking Pool')).toBeInTheDocument()
    expect(screen.getByText('DeFi Yield Farming')).toBeInTheDocument()
  })

  it('displays APY rates correctly', async () => {
    render(<DashboardPage />)

    // Check if APY rates are displayed
    expect(screen.getByText('12.5% APY')).toBeInTheDocument()
    expect(screen.getByText('18.0% APY')).toBeInTheDocument()
  })

  it('allows viewing all transactions', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)

    // Click on View All transactions
    const viewAllButton = screen.getByText('View All')
    await user.click(viewAllButton)

    // This would typically navigate to the transactions page
    // For now, we just check that the button is clickable
    expect(viewAllButton).toBeInTheDocument()
  })

  it('allows viewing all investment plans', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)

    // Click on View All Plans
    const viewAllPlansButton = screen.getByText('View All Plans')
    await user.click(viewAllPlansButton)

    // This would typically navigate to the investments page
    // For now, we just check that the button is clickable
    expect(viewAllPlansButton).toBeInTheDocument()
  })

  it('displays transaction amounts correctly', async () => {
    render(<DashboardPage />)

    // Check if transaction amounts are displayed
    expect(screen.getByText('2.5 ETH')).toBeInTheDocument()
    expect(screen.getByText('1,000 USDC')).toBeInTheDocument()
  })

  it('shows transaction status badges', async () => {
    render(<DashboardPage />)

    // Check if status badges are displayed
    expect(screen.getAllByText('Completed')).toHaveLength(2)
  })

  it('displays investment plan details', async () => {
    render(<DashboardPage />)

    // Check if investment plan details are displayed
    expect(screen.getByText('$100 - $10,000')).toBeInTheDocument()
    expect(screen.getByText('$500 - $50,000')).toBeInTheDocument()
    expect(screen.getByText('30 days')).toBeInTheDocument()
    expect(screen.getByText('60 days')).toBeInTheDocument()
  })

  it('handles empty state for transactions', async () => {
    // Mock empty transactions
    mockUseQuery.mockImplementation((query) => {
      if (query.toString().includes('getRecentTransactions')) {
        return []
      }
      return null
    })

    render(<DashboardPage />)

    // Check if empty state is handled
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument()
  })

  it('handles empty state for investment plans', async () => {
    // Mock empty investment plans
    mockUseQuery.mockImplementation((query) => {
      if (query.toString().includes('getInvestmentPlans')) {
        return []
      }
      return null
    })

    render(<DashboardPage />)

    // Check if empty state is handled
    expect(screen.getByText('Investment Opportunities')).toBeInTheDocument()
  })

  it('displays quick action buttons', async () => {
    render(<DashboardPage />)

    // Check if quick action buttons are displayed
    expect(screen.getByText('Invest Now')).toBeInTheDocument()
    expect(screen.getByText('Deposit Funds')).toBeInTheDocument()
    expect(screen.getByText('Withdraw')).toBeInTheDocument()
  })

  it('allows quick investment', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)

    // Click on Invest Now button
    const investButton = screen.getByText('Invest Now')
    await user.click(investButton)

    // This would typically open an investment modal or navigate
    // For now, we just check that the button is clickable
    expect(investButton).toBeInTheDocument()
  })
})
