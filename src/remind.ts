import { Calendar } from "./calendar";
import { config } from "./config";
import { Data } from "./data";
import { Slack } from "./slack";
import { Twilio } from "./twilio";

async function sendReminder(
  calendarAuth: any,
  calendarId: string,
  slackToken: string,
  slackChannel: string,
  eventType: string
) {
  const maxMins = 3;
  const limit = 10;

  const calendar = new Calendar(calendarId, calendarAuth);
  const result = await calendar.getEvents(limit);
  result.filterAllDay();
  result.filterBeyond(maxMins);

  if (result.empty()) {
    console.debug("no events, nothing to do");
    return;
  }

  for (const event of result.events) {
    const { id, title } = event;
    const startIso = event.startIso();
    const startStr = event.startStr();

    console.debug(`checking calendar event: ${JSON.stringify(event)}`);

    if (await Data.readEvent(id, startIso)) {
      console.debug(`reminder already sent for id: ${id}`);
      continue;
    }

    const slack = new Slack(slackToken);
    slack.send(slackChannel, `*${title}*\n${startStr}`);

    const minsStr = event.minsStr();
    const intro = config().PHONE_INTRO;
    const twilio = new Twilio();
    twilio.call(
      `<Response>` +
        `<Pause length="3" />` +
        `<Say>${intro}, you have ${eventType} ${minsStr}:</Say>` +
        `<Say>${title}</Say>` +
        `<Pause length="2" />` +
        `<Say>Goodbye</Say>` +
        `<Pause length="2" />` +
        `</Response>`
    );

    console.debug("remembering event reminder");
    await Data.writeEvent(id, startIso);
    return true;
  }

  console.debug("no reminder was sent");
  return false;
}

export async function sendReminders() {
  console.log("getting calendar auth");
  const calendarAuth = await Calendar.authorize();

  console.log("sending business reminder");
  const sentBusiness = await sendReminder(
    calendarAuth,
    config().CALENDAR_BUSINESS,
    config().SLACK_TOKEN_BUSINESS,
    config().SLACK_CHANNEL_BUSINESS,
    "a business event"
  );

  if (!sentBusiness) {
    console.log("sending personal reminder");
    await sendReminder(
      calendarAuth,
      config().CALENDAR_PERSONAL,
      config().SLACK_TOKEN_PERSONAL,
      config().SLACK_CHANNEL_PERSONAL,
      "a personal event"
    );
  } else {
    // avoids multiple phone call attempts at same time.
    console.log("business reminder sent, skipping personal reminder");
  }

  console.log("finished sending reminders");
}

export async function testReminderServices() {
  console.log("running integration tests");

  const slackBusiness = config().SLACK_CHANNEL_BUSINESS;
  const slackPersonal = config().SLACK_CHANNEL_PERSONAL;

  Calendar.test();
  Slack.test(slackBusiness, slackPersonal);
  Twilio.test();
  Data.test();

  console.log("finished integration tests");
}
