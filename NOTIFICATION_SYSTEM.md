# Notification System Documentation

This document describes the comprehensive notification and email system implemented for the CryptVest platform.

## Overview

The notification system provides real-time notifications and email alerts for users and administrators across all major platform events including authentication, transactions, investments, KYC updates, and system events.

## Features

### Notification Types
- **Authentication**: Login, registration, password reset, email verification
- **Transactions**: Deposits, withdrawals, investment confirmations
- **Investments**: Investment completion, balance updates
- **KYC**: Status updates, approvals, rejections
- **Security**: Alerts, suspicious activity
- **System**: Maintenance, updates, announcements
- **Admin**: Action logging, audit trails

### Email Templates
- Welcome emails with verification links
- Login notifications with security details
- Transaction confirmations with details
- Investment updates and completions
- KYC status changes
- Password reset instructions
- System maintenance announcements

## Architecture

### Database Schema
The system uses Convex with the following key tables:
- `notifications`: Stores all user notifications
- `emailQueue`: Manages email sending queue
- `emailTemplates`: Stores email templates

### Components
- **NotificationService**: Core service for creating notifications
- **EmailService**: Handles email sending with nodemailer
- **React Email Templates**: Professional email designs
- **UI Components**: Notification bell, lists, admin panels

## Usage

### Creating Notifications

```typescript
import { NotificationService } from "@/lib/notification-service";

// Login notification
await NotificationService.notifyLogin(userId, {
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  location: "New York, US",
  isNewDevice: false,
});

// Investment completion
await NotificationService.notifyInvestmentCompletion(userId, {
  planName: "Crypto Staking Pro",
  originalAmount: "1.0",
  currency: "ETH",
  totalReturn: "$612.00",
  returnPercentage: "18%",
});
```

### UI Components

```tsx
// Notification bell in navbar
<NotificationBell />

// Full notification page
<NotificationList />

// Admin notification panel
<AdminNotificationPanel />
```

### Email Configuration

Add these environment variables to your `.env.local`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@cryptvest.com

# Site Configuration
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Email Templates

### Available Templates
1. **WelcomeEmail**: New user registration
2. **LoginNotificationEmail**: Security login alerts
3. **DepositConfirmationEmail**: Deposit confirmations
4. **WithdrawalConfirmationEmail**: Withdrawal confirmations
5. **InvestmentConfirmationEmail**: Investment confirmations
6. **InvestmentCompletionEmail**: Investment completions
7. **KycUpdateEmail**: KYC status updates
8. **PasswordResetEmail**: Password reset instructions
9. **EmailVerificationEmail**: Email verification
10. **TransactionStatusEmail**: Transaction status updates

### Customizing Templates
Templates are located in `/emails/` and use React Email components. To customize:

1. Edit the template file
2. Update the email service configuration
3. Test with the email preview tool

## Real-time Updates

The system uses Convex subscriptions for real-time notification updates:

```tsx
const notifications = useQuery(api.notifications.getUserNotifications, {
  userId: user.id,
  limit: 20
});
```

## Admin Features

### Notification Management
- View all notifications across users
- Filter by type, priority, status
- Mark as read/unread
- Delete notifications
- Export notification data

### Email Queue Management
- Monitor email sending status
- Retry failed emails
- Clean up old emails
- View sending statistics

## Security Considerations

### Data Protection
- Notifications are user-scoped
- Sensitive data is not stored in notifications
- Email content is sanitized
- IP addresses are logged for security

### Rate Limiting
- Email sending is queued and rate-limited
- Notification creation is logged
- Admin actions are audited

## Performance

### Optimization
- Notifications are paginated
- Email queue is processed in batches
- Real-time updates use efficient subscriptions
- Database queries are indexed

### Monitoring
- Email delivery status tracking
- Notification read rates
- System performance metrics
- Error logging and alerting

## Testing

### Unit Tests
```bash
npm test -- notification-service
npm test -- email-service
```

### Integration Tests
```bash
npm test -- notification-integration
```

### Email Testing
Use the email preview tool to test templates:
```bash
npm run email:preview
```

## Deployment

### Environment Setup
1. Configure SMTP settings
2. Set up email templates
3. Configure notification preferences
4. Set up monitoring

### Production Considerations
- Use a reliable SMTP provider
- Set up email delivery monitoring
- Configure proper error handling
- Set up backup email providers

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check SMTP configuration
   - Verify email queue status
   - Check error logs

2. **Notifications not appearing**
   - Check user authentication
   - Verify notification creation
   - Check real-time subscriptions

3. **Template rendering issues**
   - Check React Email configuration
   - Verify template syntax
   - Test with preview tool

### Debug Mode
Enable debug logging:
```env
DEBUG_NOTIFICATIONS=true
DEBUG_EMAIL=true
```

## API Reference

### NotificationService Methods
- `createNotification(data)`: Create a notification
- `notifyLogin(userId, data)`: Login notification
- `notifyRegistration(userId, data)`: Registration notification
- `notifyDeposit(userId, data)`: Deposit notification
- `notifyWithdrawal(userId, data)`: Withdrawal notification
- `notifyInvestment(userId, data)`: Investment notification
- `notifyInvestmentCompletion(userId, data)`: Investment completion
- `notifyKycUpdate(userId, data)`: KYC update notification
- `notifySecurityAlert(userId, data)`: Security alert
- `notifySystemUpdate(userId, data)`: System update
- `notifyAdminAction(adminId, data)`: Admin action logging

### Convex Functions
- `notifications.createNotification`: Create notification
- `notifications.getUserNotifications`: Get user notifications
- `notifications.markAsRead`: Mark notification as read
- `notifications.deleteNotification`: Delete notification
- `emailQueue.processEmailQueue`: Process email queue
- `emailQueue.queueEmail`: Queue email for sending

## Contributing

### Adding New Notification Types
1. Update the schema in `convex/schema.ts`
2. Add notification type to `NotificationService`
3. Create email template if needed
4. Update UI components
5. Add tests

### Adding New Email Templates
1. Create template in `/emails/`
2. Export from `/emails/index.ts`
3. Add to `emailTemplates` in `lib/email-service.ts`
4. Test with preview tool

## Support

For issues or questions:
- Check the troubleshooting section
- Review the API documentation
- Contact the development team
- Create an issue in the repository
