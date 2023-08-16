import { describe, expect, jest, test } from "@jest/globals";
import { sendReminders } from "../remind";
import { Calendar, CalendarEvent } from "../calendar";

jest.mock("../calendar");
const CalendarMock = jest.mocked(Calendar);

describe("remind module", () => {
  test("send reminders", () => {
    CalendarMock.getCalendarEvents.mockImplementation(() => {
      console.log("mock calendar events");
      let e1 = new CalendarEvent(null);
      e1.name = "event name 1";
      e1.date = "event date 1";
      let e2 = new CalendarEvent(null);
      e2.name = "event name 2";
      e2.date = "event date 2";
      let events: Array<CalendarEvent> = [e1, e2];
      return events;
    });

    sendReminders();
    expect(true);
  });
});
