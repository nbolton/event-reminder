export async function testTwilio() {
  console.log("test twilio");
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
    to: process.env.PHONE_NUMBER_TO,
    from: process.env.PHONE_NUMBER_FROM,
  });
}

function twilio() {
  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_TOKEN;
  return require("twilio")(sid, token);
}
