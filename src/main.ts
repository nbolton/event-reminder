import { sendReminders, testReminderServices } from "./remind";

function main() {
  console.log("event reminder");
  const args = process.argv.slice(2);
  console.debug("args:", args);

  if (args.includes("--integ-test")) {
    testReminderServices();
  } else {
    sendReminders();
  }
}

main();
