import * as ff from "@google-cloud/functions-framework";
import { sendReminders, testReminderServices } from "./remind";
import { config } from "./config";

ff.http("check-calendar", async (req: ff.Request, res: ff.Response) => {
  console.log("query", req.query);
  if (req.query["test"] !== undefined) {
    await testReminderServices();
    res.send("Test");
  } else {
    await sendReminders();
    res.send("OK");
  }
});
