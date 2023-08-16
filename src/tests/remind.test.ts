import { describe, expect, jest, test } from "@jest/globals";
import { sendReminders } from "../remind";
import { Calendar, CalendarEvent, CalendarEventPair } from "../calendar";

jest.mock("../calendar");
const CalendarMock = jest.mocked(Calendar);

describe("remind module", () => {
  test("send reminders", () => {
    CalendarMock.getEvents.mockImplementation(async () => {
      let e1 = new CalendarEvent();
      e1.title = "event name 1";
      e1.start = new Date();
      let e2 = new CalendarEvent();
      e2.title = "event name 2";
      e2.start = new Date();

      const pair = new CalendarEventPair();
      pair.business = [e1, e2];
      pair.personal = [e1, e2];
      return pair;
    });

    sendReminders();
    expect(true);
  });
});
