import * as ff from "@google-cloud/functions-framework";
import { Phone } from "./phone";
import { sendReminders } from "./remind";
import { testServices } from "./test";

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
  const path = req.path.split("/").filter((e) => e);
  console.log("phone callback, path:", path);
  const speechResult: string | null = req.body.SpeechResult || null;
  const confidence: number | null = req.body.Confidence || null;

  const phone = new Phone();
  switch (path[0]) {
    case "test":
      res.send(await phone.callbackTest(speechResult, confidence));
      break;

    case "remind": {
      const eventId = path[1];
      if (!eventId) {
        throw Error("missing error id");
      }
      res.send(await phone.callbackRemind(speechResult, confidence, eventId));
      break;
    }

    case "action": {
      const eventId = path[1];
      if (!eventId) {
        throw Error("missing error id");
      }
      res.send(await phone.callbackAction(speechResult, confidence, eventId));
      break;
    }

    default:
      res.status(400).send();
  }
});
