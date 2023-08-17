import { Calendar } from "./calendar";
import { Data } from "./data";
import { Slack } from "./slack";
import { Twilio } from "./twilio";

export async function sendReminders() {
  const maxMins = 3;
  const events = await Calendar.getEvents();
  events.filterAllDay();
  events.filterBeyond(maxMins);
}

export async function testReminderServices() {
  console.log("running integration tests");
  //Calendar.test();
  //Slack.test();
  //Twilio.test();
  await Data.test();
  console.log("finished integration tests");
}
