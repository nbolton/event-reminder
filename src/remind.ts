import { Calendar } from "./calendar";
import { Slack } from "./slack";
import { Twilio } from "./twilio";

export function sendReminders() {
  const events = Calendar.getCalendarEvents();
  events.forEach((event) => {
    console.log(event.name, event.date);
  });
}

export function testReminderServices() {
  console.log("running integration tests");
  Calendar.integTest();
  Slack.integTest();
  Twilio.integTest();
}
