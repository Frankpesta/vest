# Authentication Setup Guide

This project uses Better Auth with Convex for authentication. Here's how to set it up:

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Site Configuration
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here
CONVEX_SITE_URL=your_convex_site_url_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Better Auth Configuration
BETTER_AUTH_SECRET=your_better_auth_secret_here
BETTER_AUTH_URL=http://localhost:3000
```

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Copy the Client ID and Client Secret to your environment variables

## Features Implemented

### Authentication Methods

- ✅ Email/Password registration and login
- ✅ Google OAuth sign-in/sign-up
- ✅ Email verification
- ✅ Password reset functionality

### Route Protection

- ✅ Middleware for protecting dashboard and admin routes
- ✅ Role-based access control (user/admin)
- ✅ Email verification requirement

### Pages Created

- ✅ `/login` - Login page with Google OAuth
- ✅ `/register` - Registration page with Google OAuth
- ✅ `/forgot-password` - Password reset request
- ✅ `/reset-password` - Password reset form
- ✅ `/verify-email` - Email verification
- ✅ `/dashboard` - Protected user dashboard
- ✅ `/admin` - Protected admin dashboard

### State Management

- ✅ Zustand store for authentication state
- ✅ Session persistence
- ✅ Loading states and error handling

## Usage

1. Start your development server: `npm run dev`
2. Navigate to `/register` to create an account
3. Check your email for verification (if email verification is enabled)
4. Login at `/login` or use Google OAuth
5. Access protected routes like `/dashboard` or `/admin`

## Security Features

- Password minimum length requirement (8 characters)
- Email verification required for account activation
- Role-based access control
- Secure session management
- CSRF protection via Better Auth
- Rate limiting and brute force protection

## Admin Access

To create an admin user, you'll need to manually update the user's role in your Convex database or create a seed script to set up admin users.
