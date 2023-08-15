import * as ff from "@google-cloud/functions-framework";
import { config } from "./config";
import { sendReminders, testReminders } from "./remind";

ff.http("check-calendar", (req: ff.Request, res: ff.Response) => {
  console.log("query", req.query);
  config();
  if (req.query.test !== undefined) {
    testReminders();
    res.send("Test");
  } else {
    sendReminders();
    res.send("OK");
  }
});
