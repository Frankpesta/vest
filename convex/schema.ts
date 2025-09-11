import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Extended User Profiles (Better Auth handles core user data)
  userProfiles: defineTable({
    userId: v.string(), // Better Auth user ID
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    occupation: v.optional(v.string()),
    company: v.optional(v.string()),
    bio: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")),
    phoneVerified: v.boolean(),
    identityVerified: v.boolean(),
    addressVerified: v.boolean(),
    kycStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("not_submitted")
    ),
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_role", ["role"])
    .index("by_kyc_status", ["kycStatus"])
    .index("by_created_at", ["createdAt"]),

  // User Balances
  userBalances: defineTable({
    userId: v.string(),
    mainBalance: v.number(), // USD balance from deposits
    interestBalance: v.number(), // USD balance from investment returns
    investmentBalance: v.number(), // USD balance from completed investments
    totalBalance: v.number(), // Calculated total
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // User Wallets and Addresses
  userWallets: defineTable({
    userId: v.string(), // Changed from v.id("users") to v.string()
    address: v.string(),
    chain: v.string(),
    label: v.optional(v.string()),
    isPrimary: v.boolean(),
    isVerified: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_address", ["address"])
    .index("by_chain", ["chain"])
    .index("by_user_chain", ["userId", "chain"]),

  // Investment Plans
  investmentPlans: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("crypto"),
      v.literal("real-estate"),
      v.literal("reits"),
      v.literal("forex"),
      v.literal("retirement"),
      v.literal("children")
    ),
    tier: v.union(
      v.literal("starter"),
      v.literal("professional"),
      v.literal("enterprise")
    ),
    price: v.string(), // Price in ETH (e.g., "0.1 ETH")
    priceUSD: v.string(), // Price in USD (e.g., "$170")
    apy: v.string(), // Expected returns (e.g., "12-18%")
    minAPY: v.number(), // Minimum APY for calculations
    maxAPY: v.number(), // Maximum APY for calculations
    minInvestment: v.number(), // Minimum investment amount in USD
    maxInvestment: v.number(), // Maximum investment amount in USD
    duration: v.number(), // Duration in days
    riskLevel: v.union(
      v.literal("low"),
      v.literal("low-medium"),
      v.literal("medium"),
      v.literal("medium-high"),
      v.literal("high")
    ),
    features: v.array(v.string()),
    popular: v.boolean(),
    isActive: v.boolean(),
    totalInvested: v.number(),
    totalInvestors: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_tier", ["tier"])
    .index("by_active", ["isActive"])
    .index("by_popular", ["popular"])
    .index("by_created_at", ["createdAt"]),

  // User Investments
  investments: defineTable({
    userId: v.string(), // Better Auth user ID
    planId: v.id("investmentPlans"),
    amount: v.number(), // Investment amount in USD
    currency: v.string(), // Original currency (ETH, BTC, etc.)
    cryptoAmount: v.number(), // Original crypto amount
    usdValue: v.number(), // USD value at time of investment
    expectedReturn: v.number(), // Expected return percentage
    actualReturn: v.optional(v.number()), // Actual return earned
    totalReturn: v.optional(v.number()), // Total return amount in USD
    status: v.union(
      v.literal("pending"), // Waiting for admin confirmation
      v.literal("active"), // Investment is running
      v.literal("paused"), // Admin paused the investment
      v.literal("cancelled"), // Admin cancelled (no refund)
      v.literal("completed"), // Investment reached maturity
      v.literal("failed") // Transaction failed
    ),
    startDate: v.optional(v.number()), // When investment became active
    endDate: v.optional(v.number()), // When investment should complete
    pausedAt: v.optional(v.number()), // When investment was paused
    pausedDuration: v.optional(v.number()), // Total time paused in days
    lastProfitCalculation: v.optional(v.number()), // Last time profits were calculated
    transactionHash: v.optional(v.string()), // Blockchain transaction hash
    confirmations: v.optional(v.number()), // Number of blockchain confirmations
    adminNotes: v.optional(v.string()), // Admin notes
    autoReinvest: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_plan", ["planId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"])
    .index("by_start_date", ["startDate"])
    .index("by_transaction", ["transactionHash"])
    .index("by_created_at", ["createdAt"]),

  // Transactions (Deposits, Withdrawals, Investments)
  transactions: defineTable({
    userId: v.string(), // Changed from v.id("users") to v.string()
    type: v.union(
      v.literal("deposit"),
      v.literal("withdrawal"),
      v.literal("investment"),
      v.literal("return"),
      v.literal("fee"),
      v.literal("refund")
    ),
    amount: v.number(),
    currency: v.string(),
    usdValue: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    txHash: v.optional(v.string()),
    fromAddress: v.optional(v.string()),
    toAddress: v.optional(v.string()),
    network: v.string(),
    gasUsed: v.optional(v.number()),
    gasPrice: v.optional(v.number()),
    blockNumber: v.optional(v.number()),
    confirmationCount: v.optional(v.number()),
    requiredConfirmations: v.optional(v.number()),
    planId: v.optional(v.id("investmentPlans")),
    investmentId: v.optional(v.id("investments")),
    adminNotes: v.optional(v.string()),
    processedBy: v.optional(v.string()), // Changed from v.id("users") to v.string()
    processedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_user_type", ["userId", "type"])
    .index("by_user_status", ["userId", "status"])
    .index("by_tx_hash", ["txHash"])
    .index("by_created_at", ["createdAt"])
    .index("by_processed_by", ["processedBy"]),

  // KYC Documents and Verification
  kycDocuments: defineTable({
    userId: v.string(), // Changed from v.id("users") to v.string()
    documentType: v.union(
      v.literal("passport"),
      v.literal("drivers_license"),
      v.literal("national_id"),
      v.literal("utility_bill"),
      v.literal("bank_statement")
    ),
    documentNumber: v.string(),
    frontImage: v.string(),
    backImage: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    rejectionReason: v.optional(v.string()),
    reviewedBy: v.optional(v.string()), // Changed from v.id("users") to v.string()
    reviewedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_document_type", ["documentType"])
    .index("by_reviewed_by", ["reviewedBy"])
    .index("by_created_at", ["createdAt"]),

  // Notifications
  notifications: defineTable({
    userId: v.string(), // Better Auth user ID
    type: v.union(
      v.literal("login"),
      v.literal("register"),
      v.literal("deposit"),
      v.literal("withdrawal"),
      v.literal("investment"),
      v.literal("investment_completion"),
      v.literal("balance_addition"),
      v.literal("kyc"),
      v.literal("kyc_update"),
      v.literal("kyc_approved"),
      v.literal("kyc_rejected"),
      v.literal("password_reset"),
      v.literal("email_verification"),
      v.literal("transaction_status"),
      v.literal("security"),
      v.literal("system"),
      v.literal("marketing"),
      v.literal("admin_action")
    ),
    title: v.string(),
    message: v.string(),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent")),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    actionUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
    emailSent: v.boolean(),
    emailSentAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_priority", ["priority"])
    .index("by_read_status", ["isRead"])
    .index("by_user_read", ["userId", "isRead"])
    .index("by_email_sent", ["emailSent"])
    .index("by_created_at", ["createdAt"]),

  // Pending Transactions (Deposits/Investments awaiting admin confirmation)
  pendingTransactions: defineTable({
    userId: v.string(), // Better Auth user ID
    type: v.union(v.literal("deposit"), v.literal("investment")),
    planId: v.optional(v.id("investmentPlans")), // Only for investments
    amount: v.number(), // Amount in USD
    currency: v.string(), // Original currency (ETH, BTC, etc.)
    cryptoAmount: v.number(), // Original crypto amount
    usdValue: v.number(), // USD value at time of transaction
    transactionHash: v.string(), // Blockchain transaction hash
    confirmations: v.number(), // Number of blockchain confirmations
    fromAddress: v.string(), // User's wallet address
    toAddress: v.string(), // Company wallet address
    chain: v.string(), // Blockchain network
    status: v.union(
      v.literal("pending"), // Waiting for admin confirmation
      v.literal("confirmed"), // Admin confirmed
      v.literal("rejected") // Admin rejected
    ),
    adminNotes: v.optional(v.string()),
    reviewedBy: v.optional(v.string()), // Admin user ID
    reviewedAt: v.optional(v.number()),
    expiresAt: v.number(), // Transaction expires after 24 hours
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_transaction", ["transactionHash"])
    .index("by_chain", ["chain"])
    .index("by_expires", ["expiresAt"])
    .index("by_created_at", ["createdAt"]),

  // Referral System
  referrals: defineTable({
    referrerId: v.string(), // Changed from v.id("users") to v.string()
    referredId: v.string(), // Changed from v.id("users") to v.string()
    referralCode: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("expired")
    ),
    rewardAmount: v.number(),
    rewardCurrency: v.string(),
    rewardStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("cancelled")
    ),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_referrer", ["referrerId"])
    .index("by_referred", ["referredId"])
    .index("by_code", ["referralCode"])
    .index("by_status", ["status"])
    .index("by_reward_status", ["rewardStatus"])
    .index("by_created_at", ["createdAt"]),

  // Referral Codes
  referralCodes: defineTable({
    userId: v.string(), // Changed from v.id("users") to v.string()
    code: v.string(),
    isActive: v.boolean(),
    usageCount: v.number(),
    maxUsage: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_code", ["code"])
    .index("by_active", ["isActive"])
    .index("by_created_at", ["createdAt"]),

  // System Settings
  systemSettings: defineTable({
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    updatedBy: v.string(), // Changed from v.id("users") to v.string()
    updatedAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_public", ["isPublic"]),

  // Portfolio Analytics
  portfolioAnalytics: defineTable({
    userId: v.string(), // Changed from v.id("users") to v.string()
    totalValue: v.number(),
    totalInvested: v.number(),
    totalReturns: v.number(),
    returnPercentage: v.number(),
    sharpeRatio: v.optional(v.number()),
    beta: v.optional(v.number()),
    alpha: v.optional(v.number()),
    volatility: v.optional(v.number()),
    maxDrawdown: v.optional(v.number()),
    diversificationScore: v.optional(v.number()),
    riskScore: v.optional(v.number()),
    calculatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_calculated_at", ["calculatedAt"]),

  // Admin Actions
  adminActions: defineTable({
    adminId: v.string(), // Changed from v.id("users") to v.string()
    action: v.string(),
    targetType: v.string(),
    targetId: v.string(),
    details: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_admin", ["adminId"])
    .index("by_action", ["action"])
    .index("by_target", ["targetType", "targetId"])
    .index("by_created_at", ["createdAt"]),

  // API Keys and Webhooks
  apiKeys: defineTable({
    name: v.string(),
    key: v.string(),
    permissions: v.array(v.string()),
    isActive: v.boolean(),
    lastUsed: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    createdBy: v.string(), // Changed from v.id("users") to v.string()
    createdAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_active", ["isActive"])
    .index("by_created_by", ["createdBy"]),

  // Rest of the tables remain the same...
  cryptoPrices: defineTable({
    symbol: v.string(),
    name: v.string(),
    price: v.number(),
    priceChange24h: v.number(),
    priceChangePercent24h: v.number(),
    marketCap: v.optional(v.number()),
    volume24h: v.optional(v.number()),
    lastUpdated: v.number(),
  })
    .index("by_symbol", ["symbol"])
    .index("by_last_updated", ["lastUpdated"]),

  auditLogs: defineTable({
    userId: v.optional(v.string()), // Changed from v.id("users") to v.string()
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    details: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_resource", ["resource"])
    .index("by_created_at", ["createdAt"]),

  cronJobs: defineTable({
    name: v.string(),
    description: v.string(),
    schedule: v.string(),
    isActive: v.boolean(),
    lastRun: v.optional(v.number()),
    nextRun: v.optional(v.number()),
    status: v.union(
      v.literal("idle"),
      v.literal("running"),
      v.literal("failed"),
      v.literal("paused")
    ),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_active", ["isActive"])
    .index("by_status", ["status"])
    .index("by_next_run", ["nextRun"]),

  cronExecutions: defineTable({
    jobId: v.id("cronJobs"),
    status: v.union(
      v.literal("started"),
      v.literal("completed"),
      v.literal("failed")
    ),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    duration: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    result: v.optional(v.any()),
  })
    .index("by_job", ["jobId"])
    .index("by_status", ["status"])
    .index("by_started_at", ["startedAt"]),

  investmentReturns: defineTable({
    investmentId: v.id("investments"),
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    returnAmount: v.number(),
    returnPercentage: v.number(),
    periodStart: v.number(),
    periodEnd: v.number(),
    createdAt: v.number(),
  })
    .index("by_investment", ["investmentId"])
    .index("by_period", ["period"])
    .index("by_period_start", ["periodStart"])
    .index("by_created_at", ["createdAt"]),

  emailTemplates: defineTable({
    name: v.string(),
    subject: v.string(),
    htmlContent: v.string(),
    textContent: v.optional(v.string()),
    variables: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_active", ["isActive"]),

  emailQueue: defineTable({
    to: v.string(),
    toName: v.optional(v.string()),
    templateId: v.optional(v.id("emailTemplates")),
    templateName: v.optional(v.string()),
    subject: v.string(),
    htmlContent: v.string(),
    textContent: v.optional(v.string()),
    variables: v.optional(v.any()),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent")),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    scheduledFor: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    retryCount: v.number(),
    maxRetries: v.number(),
    notificationId: v.optional(v.id("notifications")),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_scheduled", ["scheduledFor"])
    .index("by_created_at", ["createdAt"])
    .index("by_notification", ["notificationId"]),

  // Withdrawal Requests
  withdrawalRequests: defineTable({
    userId: v.string(),
    balanceType: v.union(
      v.literal("main"),
      v.literal("interest"),
      v.literal("investment")
    ),
    amount: v.number(), // USD amount
    currency: v.string(), // Crypto currency (ETH, BTC, etc.)
    cryptoAmount: v.number(), // Amount in crypto
    walletAddress: v.string(), // User's wallet address
    chain: v.string(), // Blockchain network
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    adminNotes: v.optional(v.string()),
    transactionHash: v.optional(v.string()), // Admin's transaction hash
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    processedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_balance_type", ["balanceType"])
    .index("by_reviewed_by", ["reviewedBy"])
    .index("by_created_at", ["createdAt"]),

  webhookEndpoints: defineTable({
    url: v.string(),
    events: v.array(v.string()),
    isActive: v.boolean(),
    secret: v.string(),
    lastTriggered: v.optional(v.number()),
    failureCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_url", ["url"])
    .index("by_active", ["isActive"]),

  webhookDeliveries: defineTable({
    endpointId: v.id("webhookEndpoints"),
    event: v.string(),
    payload: v.any(),
    status: v.union(
      v.literal("pending"),
      v.literal("delivered"),
      v.literal("failed")
    ),
    responseCode: v.optional(v.number()),
    responseBody: v.optional(v.string()),
    attempts: v.number(),
    deliveredAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_endpoint", ["endpointId"])
    .index("by_status", ["status"])
    .index("by_event", ["event"])
    .index("by_created_at", ["createdAt"]),

  // Support Tickets
  supportTickets: defineTable({
    userId: v.string(),
    ticketNumber: v.string(), // Auto-generated ticket number
    subject: v.string(),
    category: v.union(
      v.literal("investment"),
      v.literal("transaction"),
      v.literal("account"),
      v.literal("technical"),
      v.literal("billing"),
      v.literal("other")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("waiting_for_user"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    description: v.string(),
    attachments: v.optional(v.array(v.string())), // File URLs
    assignedTo: v.optional(v.string()), // Admin user ID
    lastResponseAt: v.optional(v.number()),
    resolvedAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_category", ["category"])
    .index("by_assigned_to", ["assignedTo"])
    .index("by_created_at", ["createdAt"]),

    // Support Ticket Messages
    supportMessages: defineTable({
      ticketId: v.id("supportTickets"),
      userId: v.string(), // User who sent the message
      message: v.string(),
      isFromAdmin: v.boolean(),
      attachments: v.optional(v.array(v.string())), // File URLs
      createdAt: v.number(),
    })
      .index("by_ticket", ["ticketId"])
      .index("by_user", ["userId"])
      .index("by_created_at", ["createdAt"]),

  // KYC Submissions
  kycSubmissions: defineTable({
    userId: v.string(),
    documentType: v.union(
      v.literal("passport"),
      v.literal("drivers_license"),
      v.literal("national_id"),
      v.literal("state_id"),
      v.literal("military_id")
    ),
    documentNumber: v.string(),
    documentFrontImage: v.string(), // File ID
    documentBackImage: v.optional(v.string()), // File ID
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(), // ISO date string
    nationality: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    country: v.string(),
    postalCode: v.string(),
    addressProofType: v.union(
      v.literal("utility_bill"),
      v.literal("bank_statement"),
      v.literal("government_letter"),
      v.literal("rental_agreement"),
      v.literal("insurance_document")
    ),
    addressProofImage: v.string(), // File ID
    status: v.union(
      v.literal("pending"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    rejectionReason: v.optional(v.string()),
    reviewedBy: v.optional(v.string()), // Admin user ID
    reviewedAt: v.optional(v.number()),
    adminNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"])
    .index("by_reviewed_by", ["reviewedBy"]),

  // Blog Posts
  blogPosts: defineTable({
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    featuredImage: v.optional(v.string()), // File ID
    category: v.string(),
    tags: v.array(v.string()),
    authorId: v.string(), // User ID of the author
    authorName: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    publishedAt: v.optional(v.number()),
    readTime: v.optional(v.number()), // in minutes
    viewCount: v.number(),
    likeCount: v.number(),
    isFeatured: v.boolean(),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_author", ["authorId"])
    .index("by_published_at", ["publishedAt"])
    .index("by_created_at", ["createdAt"])
    .index("by_featured", ["isFeatured"]),

  // File Storage
  files: defineTable({
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    uploadedAt: v.number(),
  })
    .index("by_storage_id", ["storageId"])
    .index("by_uploaded_at", ["uploadedAt"]),
});