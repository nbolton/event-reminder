import fs from "fs";
import path from "path";
import process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google, calendar_v3 } from "googleapis";
import { config } from "./config";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

export class CalendarEvent {
  title: string | null = null;
  start: Date | null = null;
  allDay: boolean = false;

  constructor(gcEvent?: calendar_v3.Schema$Event) {
    if (!gcEvent) {
      return;
    }
    const start = gcEvent.start?.dateTime || gcEvent.start?.date;
    this.title = gcEvent.summary || null;
    this.start = start ? new Date(start) : null;
    this.allDay = gcEvent.start?.dateTime === undefined;
  }
}

export class CalendarEventPair {
  business: CalendarEvent[] = [];
  personal: CalendarEvent[] = [];

  filterAllDay() {
    this.business = this.business.filter((e) => {
      return !e.allDay;
    });
    this.personal = this.personal.filter((e) => {
      return !e.allDay;
    });
  }

  filterBeyond(mins: number) {
    const now = new Date();
    const beyond = (e: CalendarEvent) => {
      if (!e.start) {
        return false;
      }
      const ms = mins * 60000;
      const diff = e.start.getTime() - now.getTime();
      return diff < ms;
    };
    this.business = this.business.filter(beyond);
    this.personal = this.personal.filter(beyond);
  }

  log() {
    console.log("business events...");
    this.business.forEach((event) => {
      console.log(event.title, event.start);
    });
    console.log("personal events...");
    this.personal.forEach((event) => {
      console.log(event.title, event.start);
    });
  }
}

export class Calendar {
  static async getEvents(): Promise<CalendarEventPair> {
    let pair = new CalendarEventPair();
    await authorize().then(async (auth) => {
      pair.business = await getNextEvents(auth, config().CALENDAR_BUSINESS, 10);
      pair.personal = await getNextEvents(auth, config().CALENDAR_PERSONAL, 10);
    });
    return pair;
  }

  static async integTest() {
    console.log("test calendar integration");

    authorize().then(async (auth) => {
      console.log(await getNextEvents(auth, config().CALENDAR_BUSINESS, 10));
      console.log(await getNextEvents(auth, config().CALENDAR_PERSONAL, 10));
    });
  }
}

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadTokenIfExists() {
  if (!fs.existsSync(TOKEN_PATH)) {
    return null;
  }
  const content = await fs.readFileSync(TOKEN_PATH, "utf8");
  const token = JSON.parse(content);
  return google.auth.fromJSON(token);
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
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.log("go to: https://console.cloud.google.com/apis/credentials");
    throw Error(`google calendar credentials missing: ${CREDENTIALS_PATH}`);
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
    gcEvents.map((gcEvent: any, _i: any) => {
      events.push(new CalendarEvent(gcEvent));
    });
  } else {
    console.log("no upcoming events");
  }

  return events;
}
