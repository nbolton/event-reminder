import * as ff from "@google-cloud/functions-framework";
import { sendReminders } from "./remind";
import { testServices } from "./test";
import { config } from "./config";
import { Phone, PhoneCallbackMode } from "./phone";

ff.http("check-calendar", async (req: ff.Request, res: ff.Response) => {
  console.log("check calendar, query:", req.query ? req.query : "none");
  if (req.query["test"] !== undefined) {
    await testServices();
    res.send("Test");
  } else {
    await sendReminders();
    res.send("OK");
  }
});

ff.http("phone-callback", async (req: ff.Request, res: ff.Response) => {
  console.log("phone callback, query:", req.query ? req.query : "none");
  const speechResult: string = req.body.SpeechResult;
  const confidence = req.body.Confidence;
  let mode = PhoneCallbackMode.Default;
  switch (req.query.mode) {
    case "test":
      mode = PhoneCallbackMode.Test;
      break;
  }
  const phone = new Phone();
  res.send(phone.callback(mode, speechResult, confidence));
});
