import { Datastore } from "@google-cloud/datastore";

const datastore = new Datastore();

const DATA_KIND = "Event";

export class Data {
  static async writeEvent(id: string, start: string) {
    console.debug(`event data write, id=${id}, start=${start}`);
    const key = datastore.key([DATA_KIND, id]);
    const task = {
      key: key,
      data: { start: start },
    };

    await datastore.save(task);
  }

  static async readEvent(id: string, start: string): Promise<boolean> {
    console.debug(`event data read, id=${id}, start=${start}`);
    const key = datastore.key([DATA_KIND, id]);
    const events = await datastore.get(key);

    const event = events[0];
    if (!event) {
      console.debug("no event data found");
      return false;
    }
    if (!event.start) {
      console.debug("found event data, but no start date", events);
      return false;
    }

    console.debug(`found event data, start: ${event.start}`);
    return event.start == start;
  }

  static async test() {
    const id = "foo";
    const start = "bar";

    Data.writeEvent(id, start);

    const exists = Data.readEvent(id, start);
    if (!exists) {
      throw Error("expected data didn't exist");
    }

    const key = datastore.key([id, start]);
    await datastore.delete(key);
  }
}
