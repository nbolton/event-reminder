import { describe, expect, jest, test } from "@jest/globals";
import { CalendarEvent, CalendarResult } from "../calendar";

describe("calendar event", () => {
  describe("mins str", () => {
    test("+0s", () => {
      const now = new Date();
      const start = new Date(now.getTime());
      let event = new CalendarEvent("id", "title", start, false);
      expect(event.minsStr()).toEqual("starting now");
    });

    test("+20s", () => {
      const now = new Date();
      const start = new Date(now.getTime() + 20 * 1000);
      let event = new CalendarEvent("id", "title", start, false);
      expect(event.minsStr()).toEqual("starting now");
    });

    test("-20s", () => {
      const now = new Date();
      const start = new Date(now.getTime() - 20 * 1000);
      let event = new CalendarEvent("id", "title", start, false);
      expect(event.minsStr()).toEqual("starting now");
    });

    test("+60s", () => {
      const now = new Date();
      const start = new Date(now.getTime() + 60 * 1000);
      let event = new CalendarEvent("id", "title", start, false);
      expect(event.minsStr()).toEqual("starting in 1 minute");
    });

    test("-60s", () => {
      const now = new Date();
      const start = new Date(now.getTime() - 60 * 1000);
      let event = new CalendarEvent("id", "title", start, false);
      expect(event.minsStr()).toEqual("which started 1 minute ago");
    });

    test("+100s", () => {
      const now = new Date();
      const start = new Date(now.getTime() + 100 * 1000);
      let event = new CalendarEvent("id", "title", start, false);
      expect(event.minsStr()).toEqual("starting in 2 minutes");
    });

    test("-100s", () => {
      const now = new Date();
      const start = new Date(now.getTime() - 100 * 1000);
      let event = new CalendarEvent("id", "title", start, false);
      expect(event.minsStr()).toEqual("which started 2 minutes ago");
    });
  });
});

describe("calendar result", () => {
  test("filter all day events - removed", () => {
    let event = new CalendarEvent("id", "title", new Date(), true);
    let result = new CalendarResult([event]);
    result.filterAllDay();
    expect(result.events.length).toBe(0);
    expect(result.events.length).toBe(0);
  });

  test("filter all day events - not removed", () => {
    let event = new CalendarEvent("id", "title", new Date(), false);
    let result = new CalendarResult([event]);
    result.filterAllDay();
    expect(result.events.length).toBe(1);
  });

  test("filter events beyond mins - removed", () => {
    const now = new Date();
    const start = new Date(now.getTime() + 60000 * 2);
    let event = new CalendarEvent("id", "title", start, false);
    let result = new CalendarResult([event]);
    result.filterBeyond(1);
    expect(result.events.length).toBe(0);
  });

  test("filter events beyond mins - not removed", () => {
    const now = new Date();
    const start = new Date(now.getTime() + 60000 * 1);
    let event = new CalendarEvent("id", "title", start, false);
    let result = new CalendarResult([event]);
    result.filterBeyond(2);
    expect(result.events.length).toBe(1);
  });
});
