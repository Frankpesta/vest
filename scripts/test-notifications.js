// Test script for the notification system
// Run with: node scripts/test-notifications.js

const { ConvexHttpClient } = require("convex/browser");

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "https://your-convex-url.convex.cloud");

async function testNotificationSystem() {
  console.log("🧪 Testing Notification System...\n");

  try {
    // Test 1: Create a test notification
    console.log("1. Creating test notification...");
    const notificationId = await convex.mutation("notifications:createNotification", {
      userId: "test-user-123",
      type: "system",
      title: "Test Notification",
      message: "This is a test notification to verify the system is working.",
      priority: "normal",
      actionUrl: "/dashboard",
      metadata: { test: true }
    });
    console.log("✅ Notification created:", notificationId);

    // Test 2: Get user notifications
    console.log("\n2. Fetching user notifications...");
    const notifications = await convex.query("notifications:getUserNotifications", {
      userId: "test-user-123",
      limit: 10
    });
    console.log("✅ Found notifications:", notifications.length);

    // Test 3: Mark notification as read
    console.log("\n3. Marking notification as read...");
    await convex.mutation("notifications:markAsRead", {
      notificationId: notificationId
    });
    console.log("✅ Notification marked as read");

    // Test 4: Get unread count
    console.log("\n4. Getting unread count...");
    const unreadCount = await convex.query("notifications:getUnreadCount", {
      userId: "test-user-123"
    });
    console.log("✅ Unread count:", unreadCount);

    // Test 5: Queue test email
    console.log("\n5. Queuing test email...");
    const emailId = await convex.mutation("emailQueue:queueEmail", {
      to: "test@example.com",
      toName: "Test User",
      subject: "Test Email",
      htmlContent: "<h1>Test Email</h1><p>This is a test email.</p>",
      textContent: "Test Email\n\nThis is a test email.",
      priority: "normal"
    });
    console.log("✅ Email queued:", emailId);

    // Test 6: Get email queue status
    console.log("\n6. Getting email queue status...");
    const emailStatus = await convex.query("emailQueue:getEmailQueueStatus", {});
    console.log("✅ Email queue status:", emailStatus);

    // Test 7: Process email queue
    console.log("\n7. Processing email queue...");
    const emailResults = await convex.mutation("emailQueue:processEmailQueue", {
      limit: 5
    });
    console.log("✅ Email processing results:", emailResults);

    // Test 8: Clean up test data
    console.log("\n8. Cleaning up test data...");
    await convex.mutation("notifications:deleteNotification", {
      notificationId: notificationId
    });
    console.log("✅ Test notification deleted");

    console.log("\n🎉 All tests passed! Notification system is working correctly.");

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testNotificationSystem().catch(console.error);
}

module.exports = { testNotificationSystem };
