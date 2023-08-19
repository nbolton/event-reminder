import { calendar } from "googleapis/build/src/apis/calendar";
import { Calendar } from "./calendar";
import { config } from "./config";
import { Data } from "./data";
import { Phone } from "./phone";
import { Slack } from "./slack";

export async function testServices(arg?: string) {
  switch (arg) {
    default: {
      console.log("testing all services");
      testCalendar();
      testSlack();
      testPhone();
      testData();
      break;
    }

    case "phone": {
      testPhone();
      break;
    }
  }
  console.log("finished testing");
}

async function testCalendar() {
  console.log("test calendar integration");

  console.log("getting calendar auth");
  const calendarAuth = await Calendar.authorize();

  const business = new Calendar(config().CALENDAR_BUSINESS, calendarAuth);
  const businessEvents = await business.getEvents(10);
  if (config().DEBUG_VERBOSE) {
    console.log("business events:", businessEvents);
  }

  const personal = new Calendar(config().CALENDAR_PERSONAL, calendarAuth);
  const personalEvents = await personal.getEvents(10);
  if (config().DEBUG_VERBOSE) {
    console.log("personal events:", personalEvents);
  }
}

async function testSlack() {
  const businessChannel = config().SLACK_CHANNEL_BUSINESS;
  const personalChannel = config().SLACK_CHANNEL_PERSONAL;

  console.log("test business slack integration");

  const business = new Slack(config().SLACK_TOKEN_BUSINESS);
  business.send(businessChannel, "Test message for business Slack");

  const personal = new Slack(config().SLACK_TOKEN_PERSONAL);
  personal.send(personalChannel, "Test message for personal Slack");
}

async function testPhone() {
  console.log("test twilio phone service");
  const phone = new Phone();
  phone.call(
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

async function testData() {
  const id = "foo";
  const start = "bar";

  Data.writeEvent(id, start);

  const exists = Data.readEvent(id, start);
  if (!exists) {
    throw Error("expected data didn't exist");
  }

  await Data.deleteEvent(id);
}
