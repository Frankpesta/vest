import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run profit calculations daily at 2 AM UTC
crons.daily(
  "calculate investment profits",
  { hourUTC: 2, minuteUTC: 0 },
  internal.cronFunctions.calculateInvestmentProfits
);

// Clean up expired pending transactions every 6 hours
crons.interval(
  "cleanup expired transactions",
  { hours: 6 },
  internal.cronFunctions.cleanupExpiredTransactions
);

// Check for completed investments every hour
crons.interval(
  "check completed investments",
  { hours: 1 },
  internal.cronFunctions.checkCompletedInvestments
);

export default crons;
