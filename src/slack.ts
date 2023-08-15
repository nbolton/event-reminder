import { WebClient } from "@slack/web-api";

const SLACK_CHANNEL_BUSINESS = "C02SGMLBBQ8";
const SLACK_CHANNEL_PERSONAL = "C02RT0VV78A";
const SLACK_ICON_EMOJI = ":alarm_clock:";

export async function testSlack() {
  console.log("test business slack");
  businessSlack()
    .chat.postMessage({
      channel: SLACK_CHANNEL_BUSINESS,
      icon_emoji: SLACK_ICON_EMOJI,
      text: "Test message for business Slack",
    })
    .catch((err) => {
      console.error("business slack failed", err);
    });

  console.log("test personal slack");
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

function personalSlack() {
  const token = process.env.PERSONAL_SLACK_TOKEN;
  return new WebClient(token);
}

function businessSlack() {
  const token = process.env.BUSINESS_SLACK_TOKEN;
  return new WebClient(token);
}
