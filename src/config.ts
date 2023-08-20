import fs from "fs";

let instance: Config;

export class Config {
  DEBUG_VERBOSE: boolean;
  DATASTORE_EMULATOR_HOST: string | null;
  REMINDER_TIME_MINS: number;
  IGNORE_EVENTS: string[] = [];
  DEPLOY_BASE_URL: string;

  CALENDAR_BUSINESS: string;
  CALENDAR_PERSONAL: string;

  SLACK_TOKEN_PERSONAL: string;
  SLACK_TOKEN_BUSINESS: string;
  SLACK_CHANNEL_BUSINESS: string;
  SLACK_CHANNEL_PERSONAL: string;

  PHONE_ENABLE: boolean;
  PHONE_NUMBER_TO: string;
  PHONE_NUMBER_FROM: string;
  PHONE_INTRO: string;
  PHONE_CALLBACK: string | null;
  PHONE_VOICEMAIL_MATCH: string | null;

  TWILIO_SID: string;
  TWILIO_TOKEN: string;

  constructor() {
    console.debug("loading config");

    const env = process.env.DEPLOY_ENV || "dev";
    console.debug("deploy env:", env);

    Config.load(`.env.${env}.yaml`);
    Config.load(".env.yaml");

    this.DEBUG_VERBOSE = process.env.DEBUG_VERBOSE === "true";
    this.REMINDER_TIME_MINS = Number.parseInt(Config.get("REMINDER_TIME_MINS"));
    this.DATASTORE_EMULATOR_HOST = process.env.DATASTORE_EMULATOR_HOST || null;
    this.DEPLOY_BASE_URL = Config.get("DEPLOY_BASE_URL");

    this.CALENDAR_BUSINESS = Config.get("CALENDAR_BUSINESS");
    this.CALENDAR_PERSONAL = Config.get("CALENDAR_PERSONAL");

    this.SLACK_TOKEN_PERSONAL = Config.get("SLACK_TOKEN_PERSONAL");
    this.SLACK_TOKEN_BUSINESS = Config.get("SLACK_TOKEN_BUSINESS");
    this.SLACK_CHANNEL_BUSINESS = Config.get("SLACK_CHANNEL_BUSINESS");
    this.SLACK_CHANNEL_PERSONAL = Config.get("SLACK_CHANNEL_PERSONAL");

    this.TWILIO_SID = Config.get("TWILIO_SID");
    this.TWILIO_TOKEN = Config.get("TWILIO_TOKEN");

    this.PHONE_ENABLE = Config.get("PHONE_ENABLE") === "true";
    this.PHONE_NUMBER_TO = Config.get("PHONE_NUMBER_TO");
    this.PHONE_NUMBER_FROM = Config.get("PHONE_NUMBER_FROM");
    this.PHONE_INTRO = Config.get("PHONE_INTRO");
    this.PHONE_CALLBACK = process.env.PHONE_CALLBACK || null;
    this.PHONE_VOICEMAIL_MATCH = process.env.PHONE_VOICEMAIL_MATCH || null;

    const ignoreEvents = process.env.IGNORE_EVENTS;
    if (ignoreEvents) {
      this.IGNORE_EVENTS = ignoreEvents.split(",");
    }
  }

  private static load(path: string) {
    if (fs.existsSync(path)) {
      console.log(`loading file: ${path}`);
      require("dotenv-yaml").config({ path: path });
    }
  }

  private static get(name: string) {
    const v = process.env[name];
    if (!v) {
      throw Error(`missing env var: ${name}`);
    }
    return v;
  }
}
export function config(): Config {
  if (!instance) {
    instance = new Config();
  }
  return instance;
}
