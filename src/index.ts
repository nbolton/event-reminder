import * as ff from "@google-cloud/functions-framework";
import { sendReminders, testReminderServices } from "./remind";

ff.http("check-calendar", (req: ff.Request, res: ff.Response) => {
  console.log("query", req.query);
  if (req.query["integ-test"] !== undefined) {
    testReminderServices();
    res.send("Test");
  } else {
    sendReminders();
    res.send("OK");
  }
});
