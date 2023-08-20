import { WebClient } from "@slack/web-api";
import { config } from "./config";
import { CalendarType } from "./calendar";

const SLACK_ICON_EMOJI = ":alarm_clock:";

export class Slack {
  token: string;

  constructor(token: string) {
    this.token = token;
  }

  send(channel: string, message: string) {
    console.log("sending slack message");
    this.slack()
      .chat.postMessage({
        channel: channel,
        icon_emoji: SLACK_ICON_EMOJI,
        text: message,
      })
      .catch((err) => {
        console.error("slack send failed:", err);
      });
  }

  slack() {
    return new WebClient(this.token);
  }

  static channelForCalendar(type: CalendarType): string {
    switch (type) {
      case CalendarType.business:
        return config().SLACK_CHANNEL_BUSINESS;
      case CalendarType.personal:
        return config().SLACK_CHANNEL_PERSONAL;
      default:
        throw Error("invalid calendar type");
    }
  }

  static forCalendar(type: CalendarType): Slack {
    switch (type) {
      case CalendarType.business:
        return new Slack(config().SLACK_TOKEN_BUSINESS);
      case CalendarType.personal:
        return new Slack(config().SLACK_TOKEN_PERSONAL);
      default:
        throw Error("invalid calendar type");
    }
  }
}
