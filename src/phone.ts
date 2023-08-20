import { config } from "./config";

export enum PhoneCallbackMode {
  Default,
  Test,
}

export class Phone {
  call(twiml: string) {
    const to = config().PHONE_NUMBER_TO;
    const from = config().PHONE_NUMBER_FROM;
    console.log(`starting twilio call ${from} to ${to}`);
    twilio().calls.create({ twiml, to, from });
  }

  callback(mode: PhoneCallbackMode, speechResult: string, confidence: string) {
    try {
      console.log("speech result:", speechResult);
      console.log("speech result confidence:", confidence);

      const vmMatch = config().PHONE_VOICEMAIL_MATCH;
      if (vmMatch && speechResult.match(vmMatch)) {
        console.log("aborting, speech result is voicemail");
        // empty response hangs up immediately, preventing voicemail from being left
        return "<Response></Response>";
      }

      let twiml;
      switch (mode) {
        case PhoneCallbackMode.Default:
          break;

        case PhoneCallbackMode.Test:
          let message;
          if (speechResult) {
            message = `Here's what I heard you say: ${speechResult}`;
          } else {
            message = `Sorry, I didn't hear you say anything.`;
          }
          twiml =
            `<Response>` +
            `<Say>${message}</Say>` +
            `<Pause length="1" />` +
            `</Response>`;
          break;
      }

      if (!twiml) {
        throw Error("empty twiml");
      }
      console.log("twiml response:", twiml);
      return twiml;
    } catch (err) {
      console.error("error sending twiml response:", err);
      const errStr = err instanceof Error ? err.message : (err as string);
      const twiml =
        `<Response>` +
        `<Say>Sorry, a server error occurred: ${errStr}</Say>` +
        `<Pause length="1" />` +
        `</Response>`;
      console.log("twiml error response:", twiml);
      return twiml;
    }
  }
}

function twilio() {
  const sid = config().TWILIO_SID;
  const token = config().TWILIO_TOKEN;
  return require("twilio")(sid, token);
}
