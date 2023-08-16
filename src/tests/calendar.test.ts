import { describe, expect, jest, test } from "@jest/globals";
import { Calendar, CalendarEvent, CalendarEventPair } from "../calendar";

describe("calendar module", () => {
  test("filter all day events - removed", () => {
    let pair = new CalendarEventPair();
    let e1 = new CalendarEvent();
    e1.allDay = true;
    pair.business = [e1];
    pair.personal = [e1];
    pair.filterAllDay();
    expect(pair.business.length).toBe(0);
    expect(pair.personal.length).toBe(0);
  });

  test("filter all day events - not removed", () => {
    let pair = new CalendarEventPair();
    let e1 = new CalendarEvent();
    e1.allDay = false;
    pair.business = [e1];
    pair.personal = [e1];
    pair.filterAllDay();
    expect(pair.business.length).toBe(1);
    expect(pair.personal.length).toBe(1);
  });

  test("filter events beyond mins - removed", () => {
    let pair = new CalendarEventPair();
    let e1 = new CalendarEvent();
    const now = new Date();
    e1.start = new Date(now.getTime() + 60000 * 2);
    pair.business = [e1];
    pair.personal = [e1];
    pair.filterBeyond(1);
    expect(pair.business.length).toBe(0);
    expect(pair.personal.length).toBe(0);
  });

  test("filter events beyond mins - not removed", () => {
    let pair = new CalendarEventPair();
    let e1 = new CalendarEvent();
    const now = new Date();
    e1.start = new Date(now.getTime() + 60000 * 1);
    pair.business = [e1];
    pair.personal = [e1];
    pair.filterBeyond(2);
    expect(pair.business.length).toBe(1);
    expect(pair.personal.length).toBe(1);
  });
});
