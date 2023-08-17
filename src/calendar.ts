import { authenticate } from "@google-cloud/local-auth";
import fs from "fs";
import { OAuth2Client } from "google-auth-library";
import { calendar_v3, google } from "googleapis";
import path from "path";
import process from "process";
import { config } from "./config";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

export class CalendarEvent {
  id: string;
  title: string;
  start: Date;
  allDay: boolean;

  constructor(id: string, title: string, start: Date, allDay: boolean) {
    this.id = id;
    this.title = title;
    this.start = start;
    this.allDay = allDay;
  }

  startIso() {
    return this.start.toISOString();
  }

  startStr() {
    const date = this.start.toLocaleDateString("en-GB", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const time = this.start.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Europe/London",
      timeZoneName: "short",
    });
    return `${date} at ${time}`;
  }

  minsStr() {
    const now = new Date();
    const ms = this.start.getTime() - now.getTime();
    const mins = ms / 60000;
    const minsRound = Math.round(mins);
    const minsAbsRound = Math.abs(minsRound);
    console.debug(`time diff: ${ms} ms, ${mins} mins`);
    if (minsRound === 1) {
      return `starting in 1 minute`;
    } else if (minsRound > 1) {
      return `starting in ${minsAbsRound} minutes`;
    } else if (minsRound === 0) {
      return `starting now`;
    } else if (minsRound === -1) {
      return `which started 1 minute ago`;
    } else if (minsRound < -1) {
      return `which started ${minsAbsRound} minutes ago`;
    } else {
      throw Error("can't determine mins");
    }
  }
}

export class CalendarResult {
  events: CalendarEvent[];

  constructor(events: CalendarEvent[]) {
    this.events = events;
  }

  filterAllDay() {
    this.events = this.events.filter((e) => {
      return !e.allDay;
    });
  }

  filterBeyond(mins: number) {
    const now = new Date();
    console.debug(`filter beyond, time now: ${now.toISOString()}`);
    const beyond = (e: CalendarEvent) => {
      if (!e.start) {
        return false;
      }
      const ms = mins * 60000;
      const diff = e.start.getTime() - now.getTime();
      return diff < ms;
    };
    this.events = this.events.filter(beyond);
  }

  empty() {
    return !this.events || this.events.length === 0;
  }

  first() {
    if (this.empty()) {
      throw Error("no events");
    }
    return this.events[0];
  }
}

export class Calendar {
  id: string;
  auth: OAuth2Client;

  constructor(id: string, auth: OAuth2Client) {
    this.id = id;
    this.auth = auth;
  }

  async getEvents(limit: number) {
    return new CalendarResult(await getNextEvents(this.auth, this.id, limit));
  }

  static async test() {
    console.log("test calendar integration");

    console.log("getting calendar auth");
    const calendarAuth = await Calendar.authorize();

    const business = new Calendar(config().CALENDAR_BUSINESS, calendarAuth);
    console.log("business events", await business.getEvents(10));

    const personal = new Calendar(config().CALENDAR_PERSONAL, calendarAuth);
    console.log("personal events", await personal.getEvents(10));
  }

  static async authorize(): Promise<OAuth2Client> {
    return authorize();
  }
}

/**
 * Reads previously authorized credentials from the save file.
 */
async function loadTokenIfExists(): Promise<OAuth2Client | null> {
  if (!fs.existsSync(TOKEN_PATH)) {
    return null;
  }
  const content = await fs.readFileSync(TOKEN_PATH, "utf8");
  const token = JSON.parse(content);
  return google.auth.fromJSON(token) as OAuth2Client;
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 */
async function saveCredentials(client: OAuth2Client): Promise<void> {
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
async function authorize(): Promise<OAuth2Client> {
  let client = await loadTokenIfExists();
  if (client) {
    return client;
  }

  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.log("go to: https://console.cloud.google.com/apis/credentials");
    throw Error(`google calendar credentials missing: ${CREDENTIALS_PATH}`);
  }

  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  if (!client) {
    throw Error("calendar auth failed");
  }

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
  auth: OAuth2Client,
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
      const startStr = gcEvent.start?.dateTime || gcEvent.start?.date;
      const id = gcEvent.id || null;
      const title = gcEvent.summary || null;
      const start = startStr ? new Date(startStr) : null;
      const allDay = gcEvent.start?.dateTime === undefined;
      if (id === null) {
        console.debug("skipping event with no id");
        return;
      }
      if (start === null) {
        console.debug(`skipping event with no start, id: ${id}`);
        return;
      }
      if (title === null) {
        console.debug(`skipping event with no title, id: ${id}`);
        return;
      }
      events.push(new CalendarEvent(id, title, start, allDay));
    });
  } else {
    console.log("no upcoming events");
  }

  return events;
}
