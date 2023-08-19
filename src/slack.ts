import { WebClient } from "@slack/web-api";
import { config } from "./config";

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
}
