import { CalendarEvent } from "./calendar";
import { config } from "./config";
import { Data } from "./data";

export class Phone {
  call(twiml: string) {
    const to = config().PHONE_NUMBER_TO;
    const from = config().PHONE_NUMBER_FROM;
    console.log(`starting twilio call ${from} to ${to}`);
    console.debug(`twiml: ${twiml}`);
    twilio().calls.create({ twiml, to, from });
  }

  remind(event: CalendarEvent) {
    const callback = this.callbackBaseUrl() + `/remind/${event.id}`;
    const twiml =
      `<Response>` +
      `<Gather ` +
      `actionOnEmptyResult="true" ` +
      `input="speech" ` +
      `speechTimeout="1" ` +
      `speechModel="experimental_conversations" ` +
      `action="${callback}" />` +
      `</Response>`;
    this.call(twiml);
  }

  callbackBaseUrl() {
    const base = config().DEPLOY_BASE_URL;
    const isStage = config().DEPLOY_ENV === "stage";
    const location = isStage ? "/phone-callback-stage" : "/phone-callback";
    return base + location;
  }

  async callbackRemind(
    speechResult: string | null,
    confidence: number | null,
    eventId: string
  ) {
    const event = await Data.readEvent(eventId);
    const { title } = event;
    const minsStr = event.minsStr();
    const intro = config().PHONE_INTRO;

    const callback = this.callbackBaseUrl() + `/action/${event.id}`;
    const twimlElements =
      `<Say>${intro}, you have ${event.typeInfo()} ${minsStr}:</Say>` +
      `<Pause length="1" />` +
      `<Say>${title}</Say>` +
      `<Pause length="2" />` +
      `<Gather ` +
      `actionOnEmptyResult="true" ` +
      `input="speech" ` +
      `speechTimeout="3" ` +
      `speechModel="experimental_utterances" ` +
      `action="${callback}">` +
      `<Say>Are you still able to make the event?</Say>` +
      `</Gather>`;

    return this.callback(speechResult, confidence, twimlElements);
  }

  async callbackAction(
    speechResult: string | null,
    confidence: number | null,
    eventId: string
  ) {
    const event = await Data.readEvent(eventId);

    let response;
    if (!speechResult) {
      response = "Sorry, I didn't hear you say anything.";
    } else if (speechResult?.match(/no/i)) {
      // TODO: set RSVP to no, and ask to reschedule
      response = `Ok, I'll reschedule the event: ${event.title}`;
      event.slackMessage(`Event needs to be rescheduled: ${event.title}`);
    } else if (speechResult?.match(/yes/i)) {
      response = "Ok, I won't do anything.";
    } else {
      response = `Sorry, I didn't understand what you meant by: ${speechResult}`;
    }

    const twimlElements =
      `<Say>${response}</Say>` +
      `<Pause length="1" />` +
      `<Say>Goodbye</Say>` +
      `<Pause length="1" />`;

    return this.callback(speechResult, confidence, twimlElements);
  }

  async callbackTest(speechResult: string | null, confidence: number | null) {
    let message;
    if (speechResult) {
      message = `Here's what I heard you say: ${speechResult}`;
    } else {
      message = `Sorry, I didn't hear you say anything.`;
    }
    const twimlElements = `<Say>${message}</Say><Pause length="1" />`;
    return this.callback(speechResult, confidence, twimlElements);
  }

  async callback(
    speechResult: string | null,
    confidence: number | null,
    twimlElements: string
  ) {
    try {
      console.log("callback speech result:", speechResult);
      console.log("callback confidence:", confidence);

      const vmMatch = config().PHONE_VOICEMAIL_MATCH;
      if (vmMatch && speechResult?.match(vmMatch)) {
        console.log("aborting, speech result is voicemail");
        // empty response hangs up immediately, preventing voicemail from being left
        return "<Response></Response>";
      }

      if (!twimlElements) {
        throw Error("empty twiml");
      }
      console.log("twiml response:", twimlElements);
      return `<Response>` + twimlElements + `</Response>`;
    } catch (err) {
      console.error("error sending twiml response:", err);
      const errStr = err instanceof Error ? err.message : (err as string);
      const twiml =
        `<Response>` +
        `<Say>Sorry, a server error occurred: ${errStr}</Say>` +
        `<Pause length="1" />` +
        `</Response>`;
      console.log("twiml error response:", twiml);
      return twiml;
    }
  }
}

function twilio() {
  const sid = config().TWILIO_SID;
  const token = config().TWILIO_TOKEN;
  return require("twilio")(sid, token);
}
