import { describe, expect, jest, test } from "@jest/globals";
import {
  Calendar,
  CalendarEvent,
  CalendarResult,
  CalendarType,
} from "../calendar";
import { sendReminders } from "../remind";
import { config, Config } from "../config";

jest.mock("../config");
jest.mock("../calendar");
jest.mock("../data");
jest.mock("../slack");
jest.mock("../phone");

const CalendarMock = jest.mocked(Calendar);
const CalendarEventResultMock = jest.mocked(CalendarResult);
const mockConfig = config as jest.MockedFunction<typeof config>;

describe("remind module", () => {
  test("send reminders", () => {
    mockConfig.mockReturnValue(new Config());

    const e1 = new CalendarEvent(
      "id 1",
      CalendarType.business,
      "name 1",
      new Date(),
      false
    );
    const e2 = new CalendarEvent(
      "id 2",
      CalendarType.business,
      "name 2",
      new Date(),
      false
    );

    CalendarMock.prototype.getEvents.mockImplementation(async () => {
      const result = new CalendarResult([e1, e2]);
      result.events = [e1, e2];
      return result;
    });

    sendReminders();
    expect(true);
  });
});
