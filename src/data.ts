import { Datastore } from "@google-cloud/datastore";
import { CalendarEvent } from "./calendar";

const datastore = new Datastore();

const REMIND_KIND = "Reminder";
const EVENT_KIND = "Event";

export class Data {
  static async setReminderSent(id: string, start: string) {
    console.debug(`data: set reminder sent, id=${id}, start=${start}`);
    const key = datastore.key([REMIND_KIND, id]);
    const task = {
      key: key,
      data: { start: start },
    };

    await datastore.save(task);
  }

  static async isReminderSent(id: string, start: string): Promise<boolean> {
    console.debug(`data: is reminder sent, id=${id}, start=${start}`);
    const key = datastore.key([REMIND_KIND, id]);
    const reminders = await datastore.get(key);

    const reminder = reminders[0];
    if (!reminder) {
      console.debug("reminder has not yet been remembered");
      return false;
    }
    if (!reminder.start) {
      console.debug("found reminder data, but no start date", reminder);
      return false;
    }

    console.debug(`found reminder data, start: ${reminder.start}`);
    return reminder.start == start;
  }

  static async clearReminderSent(id: string) {
    const key = datastore.key([REMIND_KIND, id]);
    await datastore.delete(key);
  }

  static async saveEvent(event: CalendarEvent) {
    const start = event.start.toISOString();
    console.debug(`data: save event, id=${event.id}, start=${start}`);
    const key = datastore.key([EVENT_KIND, event.id]);
    const task = {
      key: key,
      data: { title: event.title, start: start, type: event.type },
    };

    await datastore.save(task);
  }

  static async readEvent(eventId: string): Promise<CalendarEvent> {
    console.debug(`data: read event, id=${eventId}`);
    const key = datastore.key([EVENT_KIND, eventId]);
    const events = await datastore.get(key);

    const event = events[0];
    if (!event) {
      throw Error(`event not found: ${eventId}`);
    }

    return new CalendarEvent(
      eventId,
      event.type,
      event.title,
      new Date(event.start)
    );
  }
}
