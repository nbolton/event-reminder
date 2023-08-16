import { Calendar } from "./calendar";
import { testSlack } from "./slack";
import { testTwilio } from "./twilio";

export function sendReminders() {
  const events = Calendar.getCalendarEvents();
  events.forEach((event) => {
    console.log(event.name, event.date);
  });
}

export function testReminderServices() {
  console.log("running integration tests");
  Calendar.testCalendar();
  testSlack();
  testTwilio();
}
