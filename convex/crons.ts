import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Runs at the top of every hour; dueRecipients decides who is actually due,
// so a user is nudged at their own local reminder day + hour, once per week.
crons.cron(
  "weekly reminders",
  "0 * * * *",
  internal.pushActions.sendDueReminders,
  {}
);

export default crons;
