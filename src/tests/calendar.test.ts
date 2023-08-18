import { describe, expect, test } from "@jest/globals";
import { CalendarAttendee, CalendarEvent, CalendarResult } from "../calendar";

describe("calendar event", () => {
  describe("mins str", () => {
    test("+0s", () => {
      const now = new Date();
      const start = new Date(now.getTime());
      const event = new CalendarEvent("id", "title", start, false);
      expect(event.minsStr()).toEqual("starting now");
    });

    test("+20s", () => {
      const now = new Date();
      const start = new Date(now.getTime() + 20 * 1000);
      const event = new CalendarEvent("id", "title", start, false);
      expect(event.minsStr()).toEqual("starting now");
    });

    test("-20s", () => {
      const now = new Date();
      const start = new Date(now.getTime() - 20 * 1000);
      const event = new CalendarEvent("id", "title", start, false);
      expect(event.minsStr()).toEqual("starting now");
    });

    test("+60s", () => {
      const now = new Date();
      const start = new Date(now.getTime() + 60 * 1000);
      const event = new CalendarEvent("id", "title", start, false);
      expect(event.minsStr()).toEqual("starting in 1 minute");
    });

    test("-60s", () => {
      const now = new Date();
      const start = new Date(now.getTime() - 60 * 1000);
      const event = new CalendarEvent("id", "title", start, false);
      expect(event.minsStr()).toEqual("which started 1 minute ago");
    });

    test("+100s", () => {
      const now = new Date();
      const start = new Date(now.getTime() + 100 * 1000);
      const event = new CalendarEvent("id", "title", start, false);
      expect(event.minsStr()).toEqual("starting in 2 minutes");
    });

    test("-100s", () => {
      const now = new Date();
      const start = new Date(now.getTime() - 100 * 1000);
      const event = new CalendarEvent("id", "title", start, false);
      expect(event.minsStr()).toEqual("which started 2 minutes ago");
    });
  });
});

describe("calendar result", () => {
  test("filter all day events - removed", () => {
    const event = new CalendarEvent("id", "title", new Date(), true);
    const result = new CalendarResult([event]);
    result.filterAllDay();
    expect(result.events.length).toBe(0);
    expect(result.events.length).toBe(0);
  });

  test("filter all day events - not removed", () => {
    const event = new CalendarEvent("id", "title", new Date(), false);
    const result = new CalendarResult([event]);
    result.filterAllDay();
    expect(result.events.length).toBe(1);
  });

  test("filter events beyond mins - removed", () => {
    const now = new Date();
    const start = new Date(now.getTime() + 60000 * 2);
    const event = new CalendarEvent("id", "title", start, false);
    const result = new CalendarResult([event]);
    result.filterBeyond(1);
    expect(result.events.length).toBe(0);
  });

  test("filter events beyond mins - not removed", () => {
    const now = new Date();
    const start = new Date(now.getTime() + 60000 * 1);
    const event = new CalendarEvent("id", "title", start, false);
    const result = new CalendarResult([event]);
    result.filterBeyond(2);
    expect(result.events.length).toBe(1);
  });

  test("filter not attending - foobar removed", () => {
    const now = new Date();
    const attendee = new CalendarAttendee("email", "foobar", true, true);
    const event = new CalendarEvent(
      "id",
      "title",
      now,
      false,
      null,
      null,
      null,
      [attendee]
    );
    const result = new CalendarResult([event]);
    result.filterBeyond(2);
    expect(result.events.length).toBe(1);
  });

  test("filter not attending - attending not removed", () => {
    const now = new Date();
    const attendee = new CalendarAttendee("email", "attending", true, true);
    const event = new CalendarEvent(
      "id",
      "title",
      now,
      false,
      null,
      null,
      null,
      [attendee]
    );
    const result = new CalendarResult([event]);
    result.filterBeyond(2);
    expect(result.events.length).toBe(1);
  });

  test("filter not attending - tentative not removed", () => {
    const now = new Date();
    const attendee = new CalendarAttendee("email", "tentative", true, true);
    const event = new CalendarEvent(
      "id",
      "title",
      now,
      false,
      null,
      null,
      null,
      [attendee]
    );
    const result = new CalendarResult([event]);
    result.filterBeyond(2);
    expect(result.events.length).toBe(1);
  });
});
