import * as ff from "@google-cloud/functions-framework";
import { sendReminders } from "./remind";
import { testServices } from "./test";

ff.http("check-calendar", async (req: ff.Request, res: ff.Response) => {
  console.log("query", req.query);
  if (req.query["test"] !== undefined) {
    await testServices();
    res.send("Test");
  } else {
    await sendReminders();
    res.send("OK");
  }
});
