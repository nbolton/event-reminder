import fs from "fs";

let instance: Config;

class Config {
  CALENDAR_BUSINESS: string;
  CALENDAR_PERSONAL: string;
  PERSONAL_SLACK_TOKEN: string;
  BUSINESS_SLACK_TOKEN: string;
  PHONE_NUMBER_TO: string;
  PHONE_NUMBER_FROM: string;
  TWILIO_SID: string;
  TWILIO_TOKEN: string;

  constructor() {
    Config.load(".env.prod.yaml");
    Config.load(".env.dev.yaml");

    this.CALENDAR_BUSINESS = Config.get("CALENDAR_BUSINESS");
    this.CALENDAR_PERSONAL = Config.get("CALENDAR_PERSONAL");
    this.PERSONAL_SLACK_TOKEN = Config.get("PERSONAL_SLACK_TOKEN");
    this.BUSINESS_SLACK_TOKEN = Config.get("BUSINESS_SLACK_TOKEN");
    this.PHONE_NUMBER_TO = Config.get("PHONE_NUMBER_TO");
    this.PHONE_NUMBER_FROM = Config.get("PHONE_NUMBER_FROM");
    this.TWILIO_SID = Config.get("TWILIO_SID");
    this.TWILIO_TOKEN = Config.get("TWILIO_TOKEN");
  }

  private static load(path: string) {
    if (fs.existsSync(path)) {
      console.log(`loading ${path}`);
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
