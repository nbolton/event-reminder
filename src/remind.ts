import { Calendar } from "./calendar";
import { Slack } from "./slack";
import { Twilio } from "./twilio";

export async function sendReminders() {
  const maxMins = 3;
  const events = await Calendar.getEvents();
  events.filterAllDay();
  events.filterBeyond(maxMins);
}

export function testReminderServices() {
  console.log("running integration tests");
  Calendar.integTest();
  //Slack.integTest();
  //Twilio.integTest();
}
