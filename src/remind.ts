import {
  Calendar,
  CalendarEvent,
  CalendarType as CalendarType,
} from "./calendar";
import { config } from "./config";
import { Data } from "./data";
import { Slack } from "./slack";
import { Phone } from "./phone";

async function sendReminder(
  calendarType: CalendarType,
  calendarAuth: any,
  calendarId: string,
  slackToken: string,
  slackChannel: string
) {
  const limit = 10;
  const maxMins = config().REMINDER_TIME_MINS;

  const calendar = new Calendar(calendarType, calendarId, calendarAuth);
  const result = await calendar.getEvents(limit);
  result.filterAllDay();
  result.filterBeyond(maxMins);
  result.filterNotAttending();
  result.filterIgnored(config().IGNORE_EVENTS);

  if (result.empty()) {
    console.debug("no events, nothing to do");
    return;
  }

  for (const event of result.events) {
    const { id, title } = event;
    const startIso = event.startIso();

    console.debug(`checking calendar event, id=${id}, title=${title}`);

    if (await Data.isReminderSent(id, startIso)) {
      console.debug(`reminder already sent for id: ${id}`);
      continue;
    }

    await Data.saveEvent(event);

    const slack = new Slack(slackToken);
    slack.send(slackChannel, slackMessage(event));

    if (config().PHONE_ENABLE) {
      const twilio = new Phone();
      twilio.remind(event);
    } else {
      console.info("phone reminder disabled");
    }

    console.debug("remembering event reminder");
    await Data.setReminderSent(id, startIso);
    return true;
  }

  console.debug("no reminder was sent");
  return false;
}

function slackMessage(event: CalendarEvent) {
  const descriptionMaxLength = 200;
  const { title, location, description, hangoutLink } = event;
  const selfStatus = event.selfStatusExtended();
  const startStr = event.startStr();

  let message = `*${title}*\n${startStr}`;

  if (selfStatus) {
    message += `\n${selfStatus}`;
  }

  if (location) {
    message += `\n${location}`;
  }

  if (hangoutLink) {
    message += `\n${hangoutLink}`;
  }

  if (description) {
    var shortDescription = htmlToText(description);

    if (shortDescription.length > descriptionMaxLength) {
      shortDescription =
        shortDescription.slice(0, descriptionMaxLength).trim() + "...";
    }
    message += `\n\n${shortDescription}\n`;
  }

  return message;
}

// TODO: handle things like lists, etc.
function htmlToText(text: string) {
  text = text.replace(/(<([^>]+)>)/gi, "");

  var entities = [
    ["amp", "&"],
    ["apos", "'"],
    ["#x27", "'"],
    ["#x2F", "/"],
    ["#39", "'"],
    ["#47", "/"],
    ["lt", "<"],
    ["gt", ">"],
    ["nbsp", " "],
    ["quot", '"'],
  ];

  for (var i = 0, max = entities.length; i < max; ++i) {
    text = text.replace(
      new RegExp("&" + entities[i][0] + ";", "g"),
      entities[i][1]
    );
  }

  return text;
}

export async function sendReminders() {
  console.log("getting calendar auth");
  const calendarAuth = await Calendar.authorize();

  console.log("sending business reminder");
  const sentBusiness = await sendReminder(
    CalendarType.business,
    calendarAuth,
    config().CALENDAR_BUSINESS,
    config().SLACK_TOKEN_BUSINESS,
    config().SLACK_CHANNEL_BUSINESS
  );

  if (!sentBusiness) {
    console.log("sending personal reminder");
    await sendReminder(
      CalendarType.personal,
      calendarAuth,
      config().CALENDAR_PERSONAL,
      config().SLACK_TOKEN_PERSONAL,
      config().SLACK_CHANNEL_PERSONAL
    );
  } else {
    // avoids multiple phone call attempts at same time.
    console.log("business reminder sent, skipping personal reminder");
  }

  console.log("finished sending reminders");
}
