// Example integrations showing how to use the notification system
// with various events in your application

import { NotificationService } from "./notification-service";

// Example: Investment completion handler
export async function handleInvestmentCompletion(
  userId: string,
  investmentData: {
    planName: string;
    originalAmount: string;
    currency: string;
    totalReturn: string;
    returnPercentage: string;
    duration: string;
  }
) {
  // Create notification
  await NotificationService.notifyInvestmentCompletion(userId, investmentData);
  
  // You could also trigger other actions here:
  // - Update user balance
  // - Send admin notification
  // - Log the event
  // - Trigger webhooks
}

// Example: Deposit confirmation handler
export async function handleDepositConfirmation(
  userId: string,
  depositData: {
    amount: string;
    currency: string;
    usdValue: string;
    transactionHash: string;
    status: string;
  }
) {
  // Create notification
  await NotificationService.notifyDeposit(userId, depositData);
  
  // Additional actions:
  // - Update user balance
  // - Log transaction
  // - Trigger compliance checks
}

// Example: KYC status update handler
export async function handleKycStatusUpdate(
  userId: string,
  kycData: {
    status: "pending" | "under_review" | "approved" | "rejected";
    rejectionReason?: string;
  }
) {
  // Create notification
  await NotificationService.notifyKycUpdate(userId, kycData);
  
  // Additional actions based on status:
  if (kycData.status === "approved") {
    // - Unlock premium features
    // - Update user permissions
    // - Send welcome email for premium features
  } else if (kycData.status === "rejected") {
    // - Lock certain features
    // - Send instructions for resubmission
  }
}

// Example: Security alert handler
export async function handleSecurityAlert(
  userId: string,
  alertData: {
    title: string;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
  }
) {
  // Create notification
  await NotificationService.notifySecurityAlert(userId, alertData);
  
  // Additional security actions:
  if (alertData.severity === "critical") {
    // - Temporarily lock account
    // - Require password reset
    // - Notify admin team
    // - Log security event
  }
}

// Example: System maintenance notification
export async function notifySystemMaintenance(
  userIds: string[],
  maintenanceData: {
    title: string;
    message: string;
    scheduledTime: string;
    duration: string;
  }
) {
  // Send to all users
  for (const userId of userIds) {
    await NotificationService.notifySystemUpdate(userId, {
      title: maintenanceData.title,
      message: maintenanceData.message,
      priority: "high",
    });
  }
}

// Example: Admin action logging
export async function logAdminAction(
  adminId: string,
  actionData: {
    action: string;
    targetType: string;
    targetId: string;
    details: any;
  }
) {
  // Create admin notification
  await NotificationService.notifyAdminAction(adminId, actionData);
  
  // Additional logging:
  // - Audit log entry
  // - Database logging
  // - Security monitoring
}
