import { Datastore } from "@google-cloud/datastore";

const datastore = new Datastore();

const DATA_KIND = "Event";

export class Data {
  static async writeEvent(id: string, start: string) {
    console.log("data write");
    const key = datastore.key([DATA_KIND, id]);
    const task = {
      key: key,
      data: { start: start },
    };

    await datastore.save(task);
  }

  static async readEvent(id: string, start: string) {
    console.log("data read");
    const key = datastore.key([DATA_KIND, id]);
    const data = await datastore.get(key);
    return data[0].start == start;
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
