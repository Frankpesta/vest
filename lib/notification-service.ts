import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export interface NotificationData {
  userId: string;
  type: 
    | "login"
    | "register"
    | "deposit"
    | "withdrawal"
    | "investment"
    | "investment_completion"
    | "balance_addition"
    | "kyc_update"
    | "kyc_approved"
    | "kyc_rejected"
    | "password_reset"
    | "email_verification"
    | "transaction_status"
    | "security"
    | "system"
    | "marketing"
    | "admin_action";
  title: string;
  message: string;
  priority: "low" | "normal" | "high" | "urgent";
  actionUrl?: string;
  metadata?: any;
}

export class NotificationService {
  // Create a notification
  static async createNotification(data: NotificationData) {
    try {
      const notificationId = await convex.mutation(api.notifications.createNotification, data);
      
      // Queue email for this notification
      await this.queueEmail(data);
      
      return notificationId;
    } catch (error) {
      console.error("Failed to create notification:", error);
      throw error;
    }
  }

  // Queue email for notification
  private static async queueEmail(data: NotificationData) {
    try {
      // This would integrate with your email service
      // For now, we'll just log it
      console.log("Email queued for notification:", data);
    } catch (error) {
      console.error("Failed to queue email:", error);
    }
  }

  // Authentication-related notifications
  static async notifyLogin(userId: string, loginData: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    isNewDevice?: boolean;
  }) {
    return this.createNotification({
      userId,
      type: "login",
      title: "New Login Detected",
      message: `New login from ${loginData.location || "unknown location"} at ${new Date().toLocaleString()}`,
      priority: "normal",
      actionUrl: "/dashboard/security",
      metadata: loginData,
    });
  }

  static async notifyRegistration(userId: string, userData: {
    email: string;
    name: string;
  }) {
    return this.createNotification({
      userId,
      type: "register",
      title: "Welcome to CryptVest!",
      message: `Welcome ${userData.name}! Your account has been successfully created.`,
      priority: "high",
      actionUrl: "/dashboard",
      metadata: userData,
    });
  }

  static async notifyPasswordReset(userId: string, resetData: {
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.createNotification({
      userId,
      type: "password_reset",
      title: "Password Reset Requested",
      message: "A password reset has been requested for your account. If this wasn't you, please secure your account immediately.",
      priority: "high",
      actionUrl: "/dashboard/security",
      metadata: resetData,
    });
  }

  static async notifyEmailVerification(userId: string, verificationData: {
    email: string;
  }) {
    return this.createNotification({
      userId,
      type: "email_verification",
      title: "Email Verification Required",
      message: `Please verify your email address (${verificationData.email}) to complete your account setup.`,
      priority: "high",
      actionUrl: "/verify-email",
      metadata: verificationData,
    });
  }

  // Transaction-related notifications
  static async notifyDeposit(userId: string, depositData: {
    amount: string;
    currency: string;
    usdValue: string;
    transactionHash: string;
    status: string;
  }) {
    return this.createNotification({
      userId,
      type: "deposit",
      title: "Deposit Confirmed",
      message: `Deposit of ${depositData.amount} ${depositData.currency} (${depositData.usdValue}) has been confirmed.`,
      priority: "high",
      actionUrl: "/dashboard/transactions",
      metadata: depositData,
    });
  }

  static async notifyWithdrawal(userId: string, withdrawalData: {
    amount: string;
    currency: string;
    usdValue: string;
    walletAddress: string;
    status: string;
  }) {
    return this.createNotification({
      userId,
      type: "withdrawal",
      title: "Withdrawal Confirmed",
      message: `Withdrawal of ${withdrawalData.amount} ${withdrawalData.currency} (${withdrawalData.usdValue}) has been ${withdrawalData.status}.`,
      priority: "high",
      actionUrl: "/dashboard/transactions",
      metadata: withdrawalData,
    });
  }

  static async notifyInvestment(userId: string, investmentData: {
    planName: string;
    amount: string;
    currency: string;
    usdValue: string;
    apy: string;
    status: string;
  }) {
    return this.createNotification({
      userId,
      type: "investment",
      title: "Investment Confirmed",
      message: `Investment in ${investmentData.planName} for ${investmentData.amount} ${investmentData.currency} (${investmentData.usdValue}) has been confirmed.`,
      priority: "high",
      actionUrl: "/dashboard/investments",
      metadata: investmentData,
    });
  }

  static async notifyInvestmentCompletion(userId: string, completionData: {
    planName: string;
    originalAmount: string;
    currency: string;
    totalReturn: string;
    returnPercentage: string;
  }) {
    return this.createNotification({
      userId,
      type: "investment_completion",
      title: "Investment Completed!",
      message: `Your investment in ${completionData.planName} has completed with ${completionData.returnPercentage} return (${completionData.totalReturn}).`,
      priority: "high",
      actionUrl: "/dashboard/investments",
      metadata: completionData,
    });
  }

  // KYC-related notifications
  static async notifyKycUpdate(userId: string, kycData: {
    status: string;
    rejectionReason?: string;
  }) {
    const statusMessages = {
      pending: "Your KYC documents are under review.",
      approved: "Your KYC verification has been approved!",
      rejected: "Your KYC verification was rejected. Please resubmit your documents.",
      under_review: "Your KYC documents are being reviewed by our team.",
    };

    return this.createNotification({
      userId,
      type: "kyc_update",
      title: "KYC Status Update",
      message: statusMessages[kycData.status as keyof typeof statusMessages] || "Your KYC status has been updated.",
      priority: kycData.status === "approved" ? "high" : "normal",
      actionUrl: "/dashboard/kyc",
      metadata: kycData,
    });
  }

  // System notifications
  static async notifySystemUpdate(userId: string, updateData: {
    title: string;
    message: string;
    priority?: "low" | "normal" | "high" | "urgent";
  }) {
    return this.createNotification({
      userId,
      type: "system",
      title: updateData.title,
      message: updateData.message,
      priority: updateData.priority || "normal",
      actionUrl: "/dashboard",
      metadata: updateData,
    });
  }

  // Security notifications
  static async notifySecurityAlert(userId: string, alertData: {
    title: string;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
  }) {
    return this.createNotification({
      userId,
      type: "security",
      title: alertData.title,
      message: alertData.message,
      priority: alertData.severity === "critical" ? "urgent" : alertData.severity === "high" ? "high" : "normal",
      actionUrl: "/dashboard/security",
      metadata: alertData,
    });
  }

  // Admin notifications
  static async notifyAdminAction(adminId: string, actionData: {
    action: string;
    targetType: string;
    targetId: string;
    details: any;
  }) {
    return this.createNotification({
      userId: adminId,
      type: "admin_action",
      title: "Admin Action Performed",
      message: `Action: ${actionData.action} on ${actionData.targetType} (${actionData.targetId})`,
      priority: "low",
      actionUrl: "/admin/audit",
      metadata: actionData,
    });
  }
}
