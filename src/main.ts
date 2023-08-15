import { config } from "./config";
import { sendReminders, testReminders } from "./remind";

function main() {
  console.log("event reminder");
  const args = process.argv.slice(2);
  console.debug("args:", args);

  config();

  if (args.includes("--test")) {
    testReminders();
  } else {
    sendReminders();
  }
}

main();
