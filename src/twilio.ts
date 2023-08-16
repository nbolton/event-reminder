import { config } from "./config";

export class Twilio {
  static async integTest() {
    console.log("test twilio integration");
    twilio().calls.create({
      twiml:
        `<Response>` +
        `<Pause length="2" />` +
        `<Say>Hello, this is a test</Say>` +
        `<Pause length="5" />` +
        `<Say>Oh... uh... are you still here?</Say>` +
        `<Pause length="2" />` +
        `<Say>Well, gotta go now, see ya!</Say>` +
        `<Pause length="2" />` +
        `</Response>`,
      to: config().PHONE_NUMBER_TO,
      from: config().PHONE_NUMBER_FROM,
    });
  }
}

function twilio() {
  const sid = config().TWILIO_SID;
  const token = config().TWILIO_TOKEN;
  return require("twilio")(sid, token);
}
