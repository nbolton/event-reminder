import { config } from "./config";

export class Phone {
  call(twiml: string) {
    const to = config().PHONE_NUMBER_TO;
    const from = config().PHONE_NUMBER_FROM;
    console.log(`starting twilio call to: ${to}`);
    twilio().calls.create({ twiml, to, from });
  }
}

function twilio() {
  const sid = config().TWILIO_SID;
  const token = config().TWILIO_TOKEN;
  return require("twilio")(sid, token);
}
