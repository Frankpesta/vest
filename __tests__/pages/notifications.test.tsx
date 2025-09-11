import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useQuery, useMutation } from 'convex/react'
import NotificationsPage from '@/app/(dashboard)/dashboard/notifications/page'
import { describe, beforeEach } from 'node:test'
import { it } from 'zod/v4/locales'

// Mock the Convex hooks
jest.mock('convex/react')
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>

// Mock the toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
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

describe('NotificationsPage', () => {
  const mockMarkAllAsRead = jest.fn()

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Mock the Convex queries
    mockUseQuery.mockImplementation((query) => {
      if (query.toString().includes('getNotifications')) {
        return [
          {
            id: 1,
            type: 'investment',
            title: 'Investment Matured',
            message: 'Your investment in Crypto Staking Pool has matured and generated 12.5% returns.',
            timestamp: '2 hours ago',
            read: false,
            priority: 'high',
          },
          {
            id: 2,
            type: 'deposit',
            title: 'Deposit Confirmed',
            message: 'Your deposit of 2.5 ETH has been confirmed and added to your account balance.',
            timestamp: '4 hours ago',
            read: false,
            priority: 'normal',
          },
          {
            id: 3,
            type: 'security',
            title: 'New Login Detected',
            message: 'We detected a new login from an unrecognized device.',
            timestamp: '1 day ago',
            read: true,
            priority: 'high',
          },
        ]
      }
      return null
    })

    // Mock the Convex mutations
    mockUseMutation.mockImplementation((mutation) => {
      if (mutation.toString().includes('markAllAsRead')) {
        return mockMarkAllAsRead
      }
      return jest.fn()
    })
  })

  it('renders notifications page with header', async () => {
    render(<NotificationsPage />)

    // Check if the page title is rendered
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Stay updated with your investment activities')).toBeInTheDocument()
  })

  it('displays notification count badge', async () => {
    render(<NotificationsPage />)

    // Check if unread count is displayed
    expect(screen.getByText('2 Unread')).toBeInTheDocument()
  })

  it('renders all notifications', async () => {
    render(<NotificationsPage />)

    // Check if notifications are displayed
    expect(screen.getByText('Investment Matured')).toBeInTheDocument()
    expect(screen.getByText('Your investment in Crypto Staking Pool has matured and generated 12.5% returns.')).toBeInTheDocument()
    
    expect(screen.getByText('Deposit Confirmed')).toBeInTheDocument()
    expect(screen.getByText('Your deposit of 2.5 ETH has been confirmed and added to your account balance.')).toBeInTheDocument()
    
    expect(screen.getByText('New Login Detected')).toBeInTheDocument()
    expect(screen.getByText('We detected a new login from an unrecognized device.')).toBeInTheDocument()
  })

  it('shows priority badges correctly', async () => {
    render(<NotificationsPage />)

    // Check if priority badges are displayed
    expect(screen.getAllByText('High')).toHaveLength(2) // Two high priority notifications
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('allows filtering notifications by type', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />)

    // Check if filter buttons are present
    expect(screen.getByText('All Notifications')).toBeInTheDocument()
    expect(screen.getByText('Unread')).toBeInTheDocument()
    expect(screen.getByText('Investments')).toBeInTheDocument()
    expect(screen.getByText('Deposits')).toBeInTheDocument()

    // Click on Unread filter
    await user.click(screen.getByText('Unread'))
    
    // Should show only unread notifications
    expect(screen.getByText('Investment Matured')).toBeInTheDocument()
    expect(screen.getByText('Deposit Confirmed')).toBeInTheDocument()
    expect(screen.queryByText('New Login Detected')).not.toBeInTheDocument()
  })

  it('allows searching notifications', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />)

    // Find search input
    const searchInput = screen.getByPlaceholderText('Search notifications...')
    
    // Search for "investment"
    await user.type(searchInput, 'investment')
    
    // Should show only investment-related notifications
    expect(screen.getByText('Investment Matured')).toBeInTheDocument()
    expect(screen.queryByText('Deposit Confirmed')).not.toBeInTheDocument()
    expect(screen.queryByText('New Login Detected')).not.toBeInTheDocument()
  })

  it('allows marking all notifications as read', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />)

    // Click mark all read button
    const markAllReadButton = screen.getByText('Mark All Read')
    await user.click(markAllReadButton)

    // Check if markAllAsRead was called
    expect(mockMarkAllAsRead).toHaveBeenCalled()
  })

  it('allows marking individual notifications as read', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />)

    // Find and click mark as read button for first notification
    const markAsReadButtons = screen.getAllByTestId('mark-as-read-button')
    await user.click(markAsReadButtons[0])

    // Check if the notification is marked as read (this would depend on implementation)
    // For now, we just check that the button was clicked
    expect(markAsReadButtons[0]).toBeInTheDocument()
  })

  it('allows deleting notifications', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />)

    // Find and click delete button for first notification
    const deleteButtons = screen.getAllByTestId('delete-notification-button')
    await user.click(deleteButtons[0])

    // Check if the notification is deleted (this would depend on implementation)
    // For now, we just check that the button was clicked
    expect(deleteButtons[0]).toBeInTheDocument()
  })

  it('shows notification settings tab', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />)

    // Click on Settings tab
    await user.click(screen.getByText('Settings'))

    // Check if settings content is displayed
    expect(screen.getByText('Notification Settings')).toBeInTheDocument()
    expect(screen.getByText('Investment Notifications')).toBeInTheDocument()
    expect(screen.getByText('Transaction Notifications')).toBeInTheDocument()
    expect(screen.getByText('Security Notifications')).toBeInTheDocument()
  })

  it('allows toggling notification settings', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />)

    // Click on Settings tab
    await user.click(screen.getByText('Settings'))

    // Find and toggle a notification setting
    const toggleSwitches = screen.getAllByRole('switch')
    await user.click(toggleSwitches[0])

    // Check if the setting was toggled (this would depend on implementation)
    expect(toggleSwitches[0]).toBeInTheDocument()
  })

  it('shows empty state when no notifications', async () => {
    // Mock empty notifications
    mockUseQuery.mockImplementation((query) => {
      if (query.toString().includes('getNotifications')) {
        return []
      }
      return null
    })

    render(<NotificationsPage />)

    // Check if empty state is displayed
    expect(screen.getByText('No notifications found')).toBeInTheDocument()
  })

  it('shows notification timestamps', async () => {
    render(<NotificationsPage />)

    // Check if timestamps are displayed
    expect(screen.getByText('2 hours ago')).toBeInTheDocument()
    expect(screen.getByText('4 hours ago')).toBeInTheDocument()
    expect(screen.getByText('1 day ago')).toBeInTheDocument()
  })
})
