import { sendReminders } from "./remind";
import { testServices } from "./test";

function main() {
  console.log("event reminder");
  const args = process.argv.slice(2);
  console.debug("args:", args);

  var test = false;
  args.forEach((opt, i) => {
    const arg = args[i + 1];
    if (opt == "--test") {
      test = true;
      testServices(arg);
    }
  });

  if (!test) {
    sendReminders();
  }
}

main();
