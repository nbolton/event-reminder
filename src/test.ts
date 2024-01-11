import { Calendar, CalendarEvent, CalendarType } from "./calendar";
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

    case "data": {
      testData();
      break;
    }

    case "phone": {
      testPhone();
      break;
    }

    case "phone-listen": {
      testPhoneListen();
      break;
    }
  }
  console.log("finished testing");
}

async function testCalendar() {
  console.log("test calendar integration");

  console.log("getting calendar auth");
  const calendarAuth = await Calendar.authorize();

  const business = new Calendar(
    CalendarType.business,
    config().CALENDAR_BUSINESS,
    calendarAuth
  );
  const businessEvents = await business.getEvents(10);
  if (config().DEBUG_VERBOSE) {
    console.log("business events:", businessEvents);
  }

  const personal = new Calendar(
    CalendarType.personal,
    config().CALENDAR_PERSONAL,
    calendarAuth
  );
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

async function testPhoneListen() {
  const phone = new Phone();
  const callback = phone.callbackBaseUrl() + "/test";
  console.log("test twilio phone service (listen)");
  console.log("gather callback:", callback);
  phone.call(
    `<Response>` +
      `<Pause length="2" />` +
      `<Say>Hello, please go ahead and say something.</Say>` +
      `<Gather input="speech" speechTimeout="1" speechModel="experimental_conversations" action="${callback}" />` +
      `<Say>Sorry, I didn't hear anything.</Say>` +
      `<Pause length="1" />` +
      `</Response>`
  );
}

async function testData() {
  const id = "foo";
  const start = "bar";

  Data.setReminderSent(id, start);

  const exists = Data.isReminderSent(id, start);
  if (!exists) {
    throw Error("expected data didn't exist");
  }

  await Data.clearReminderSent(id);

  const now = new Date();
  const eIn = new CalendarEvent("test", CalendarType.personal, "title", now);

  console.log("event write:", eIn);
  await Data.saveEvent(eIn);

  const eOut = await Data.readEvent("test");
  console.log("event read:", eOut);

  if (eOut.id !== eIn.id) {
    throw Error("id mismatch");
  }

  if (eOut.type !== eIn.type) {
    throw Error("type mismatch");
  }

  if (eOut.title !== eIn.title) {
    throw Error("title mismatch");
  }

  if (eOut.start.getDate() !== eIn.start.getDate()) {
    throw Error("start mismatch");
  }
}
