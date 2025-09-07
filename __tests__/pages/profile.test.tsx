import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useQuery, useMutation } from 'convex/react'
import ProfilePage from '@/app/(dashboard)/dashboard/profile/page'
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

describe('ProfilePage', () => {
  const mockUpdateProfile = jest.fn()

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Mock the Convex queries
    mockUseQuery.mockImplementation((query) => {
      if (query.toString().includes('getCurrentUserProfile')) {
        return {
          id: 'test-user-id',
          name: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '+1234567890',
          address: '123 Main St',
          city: 'New York',
          country: 'USA',
          dateOfBirth: '1990-01-01',
          occupation: 'Software Engineer',
          company: 'Tech Corp',
          bio: 'Passionate about technology and investments',
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
      }
      if (query.toString().includes('getUserVerificationStatus')) {
        return {
          emailVerified: true,
          phoneVerified: false,
          identityVerified: false,
          addressVerified: false,
          kycStatus: 'not_submitted',
        }
      }
      if (query.toString().includes('getUserAccountStats')) {
        return {
          memberSince: 'Dec 2023',
          totalInvestments: 8,
          activeInvestments: 5,
          totalInvested: 25000,
          portfolioValue: 67420,
          verificationLevel: 'Basic',
        }
      }
      return null
    })

    // Mock the Convex mutations
    mockUseMutation.mockImplementation((mutation) => {
      if (mutation.toString().includes('updateUserProfile')) {
        return mockUpdateProfile
      }
      return jest.fn()
    })
  })

  it('renders profile page with user data', async () => {
    render(<ProfilePage />)

    // Check if the page title is rendered
    expect(screen.getByText('Profile Settings')).toBeInTheDocument()
    expect(screen.getByText('Manage your personal information and account details')).toBeInTheDocument()

    // Check if user data is displayed
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument()
    expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument()
    expect(screen.getByDisplayValue('New York')).toBeInTheDocument()
    expect(screen.getByDisplayValue('USA')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1990-01-01')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Tech Corp')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Passionate about technology and investments')).toBeInTheDocument()
  })

  it('shows verification status correctly', async () => {
    render(<ProfilePage />)

    // Check verification status
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
    expect(screen.getByText('Identity')).toBeInTheDocument()
    expect(screen.getByText('Address')).toBeInTheDocument()

    // Check verification states
    expect(screen.getByText('Verified')).toBeInTheDocument()
    expect(screen.getByText('Not verified')).toBeInTheDocument()
  })

  it('shows account statistics correctly', async () => {
    render(<ProfilePage />)

    // Check account statistics
    expect(screen.getByText('Dec 2023')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('$67,420')).toBeInTheDocument()
    expect(screen.getByText('Basic')).toBeInTheDocument()
  })

  it('allows editing profile information', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)

    // Click edit button
    const editButton = screen.getByText('Edit Profile')
    await user.click(editButton)

    // Check if form fields are enabled
    const nameInput = screen.getByDisplayValue('John Doe')
    expect(nameInput).not.toBeDisabled()

    // Check if save and cancel buttons are visible
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('allows updating profile information', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)

    // Click edit button
    const editButton = screen.getByText('Edit Profile')
    await user.click(editButton)

    // Update name field
    const nameInput = screen.getByDisplayValue('John Doe')
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')

    // Click save button
    const saveButton = screen.getByText('Save Changes')
    await user.click(saveButton)

    // Check if updateProfile was called
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        dateOfBirth: '1990-01-01',
        occupation: 'Software Engineer',
        company: 'Tech Corp',
        bio: 'Passionate about technology and investments',
      })
    })
  })

  it('allows canceling profile edit', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)

    // Click edit button
    const editButton = screen.getByText('Edit Profile')
    await user.click(editButton)

    // Update name field
    const nameInput = screen.getByDisplayValue('John Doe')
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')

    // Click cancel button
    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    // Check if form is back to original state
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
  })

  it('shows loading state when saving', async () => {
    const user = userEvent.setup()
    
    // Mock a slow updateProfile
    mockUpdateProfile.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
    
    render(<ProfilePage />)

    // Click edit button
    const editButton = screen.getByText('Edit Profile')
    await user.click(editButton)

    // Click save button
    const saveButton = screen.getByText('Save Changes')
    await user.click(saveButton)

    // Check if saving state is shown
    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('handles tab navigation', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)

    // Check if all tabs are present
    expect(screen.getByText('Personal Info')).toBeInTheDocument()
    expect(screen.getByText('Verification')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('Preferences')).toBeInTheDocument()

    // Click on Verification tab
    await user.click(screen.getByText('Verification'))
    expect(screen.getByText('Identity Verification')).toBeInTheDocument()

    // Click on Security tab
    await user.click(screen.getByText('Security'))
    expect(screen.getByText('Security Settings')).toBeInTheDocument()

    // Click on Preferences tab
    await user.click(screen.getByText('Preferences'))
    expect(screen.getByText('Preferences')).toBeInTheDocument()
  })
})
