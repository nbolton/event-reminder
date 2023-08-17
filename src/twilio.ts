import { config } from "./config";

export class Twilio {
  call(twiml: string) {
    const to = config().PHONE_NUMBER_TO;
    const from = config().PHONE_NUMBER_FROM;
    console.log(`starting twilio call to: ${to}`);
    twilio().calls.create({ twiml, to, from });
  }

  static async test() {
    console.log("test twilio integration");
    const twilio = new Twilio();
    twilio.call(
      `<Response>` +
        `<Pause length="2" />` +
        `<Say>Hello, this is a test</Say>` +
        `<Pause length="5" />` +
        `<Say>Oh... uh... are you still here?</Say>` +
        `<Pause length="2" />` +
        `<Say>Well, gotta go now, see ya!</Say>` +
        `<Pause length="2" />` +
        `</Response>`
    );
  }
}

function twilio() {
  const sid = config().TWILIO_SID;
  const token = config().TWILIO_TOKEN;
  return require("twilio")(sid, token);
}
