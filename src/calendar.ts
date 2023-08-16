import fs from "fs";
import path from "path";
import process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google, calendar_v3 } from "googleapis";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

export class CalendarEvent {
  name: string | null | undefined;
  date: string | null | undefined;

  constructor(gcEvent: calendar_v3.Schema$Event | null) {
    if (!gcEvent) {
      return;
    }
    this.name = gcEvent.summary;
    //this.date = gcEvent.start?.dateTime || gcEvent.start?.date;
    this.date = gcEvent.start?.dateTime;
  }
}

export class Calendar {
  static getCalendarEvents(): CalendarEvent[] {
    console.log("get calendar events");
    throw Error("not implemented");
  }

  static async integTest() {
    console.log("test calendar integration");

    authorize().then(async (auth) => {
      console.log(
        await getNextEvents(auth, process.env.CALENDAR_BUSINESS || "", 10)
      );
      console.log(
        await getNextEvents(auth, process.env.CALENDAR_PERSONAL || "", 10)
      );
    });
  }
}

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadTokenIfExists() {
  try {
    const content = await fs.readFileSync(TOKEN_PATH, "utf8");
    const token = JSON.parse(content);
    return google.auth.fromJSON(token);
  } catch (err) {
    // HACK
    console.debug("no token file", err);
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 */
async function saveCredentials(client: any): Promise<void> {
  const content = await fs.readFileSync(CREDENTIALS_PATH, "utf8");
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFileSync(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 */
async function authorize() {
  let client = await loadTokenIfExists();
  if (client) {
    return client;
  }
  client = (await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  })) as any;
  if (client?.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function getNextEvents(
  auth: any,
  calendarId: string,
  max: number
): Promise<CalendarEvent[]> {
  const calendar = google.calendar({ version: "v3", auth });
  const now = new Date();
  const res = await calendar.events.list({
    calendarId: calendarId,
    timeMin: now.toISOString(),
    maxResults: max,
    singleEvents: true,
    orderBy: "startTime",
  });

  const gcEvents = res.data.items;
  let events: CalendarEvent[] = [];
  if (gcEvents && gcEvents.length !== 0) {
    console.debug(`events for ${calendarId}...`);
    events.map((event: any, _i: any) => {
      console.debug(`raw event data:`, event);
      const start = event.start.dateTime || event.start.date;
      events.push(new CalendarEvent(event));
    });
  } else {
    console.log("no upcoming events");
  }

  return events;
}
