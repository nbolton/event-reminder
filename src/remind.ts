import { checkCalendar, testCalendar } from "./calendar";
import { testSlack } from "./slack";
import { testTwilio } from "./twilio";

export function sendReminders() {
  checkCalendar();
}

export function testReminders() {
  testCalendar();
  testSlack();
  testTwilio();
}
