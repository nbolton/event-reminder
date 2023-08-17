import { WebClient } from "@slack/web-api";
import { config } from "./config";

const SLACK_CHANNEL_BUSINESS = "C02SGMLBBQ8";
const SLACK_CHANNEL_PERSONAL = "C02RT0VV78A";
const SLACK_ICON_EMOJI = ":alarm_clock:";

export class Slack {
  static async test() {
    console.log("test business slack integration");
    businessSlack()
      .chat.postMessage({
        channel: SLACK_CHANNEL_BUSINESS,
        icon_emoji: SLACK_ICON_EMOJI,
        text: "Test message for business Slack",
      })
      .catch((err) => {
        console.error("business slack failed", err);
      });

    console.log("test personal slack integration");
    personalSlack()
      .chat.postMessage({
        channel: SLACK_CHANNEL_PERSONAL,
        icon_emoji: SLACK_ICON_EMOJI,
        text: "Test message for personal Slack",
      })
      .catch((err) => {
        console.error("personal slack failed", err);
      });
  }
}

function personalSlack() {
  const token = config().PERSONAL_SLACK_TOKEN;
  return new WebClient(token);
}

function businessSlack() {
  const token = config().BUSINESS_SLACK_TOKEN;
  return new WebClient(token);
}
