# Event Reminder

Checks Google Calendar for new events, sends you a message on Slack, and calls your phone (via Twilio).

> Hi Nick, you have a business event starting in 2 minutes.

## Quick start

**Depends on:** [gcloud CLI](https://cloud.google.com/sdk/docs/install)

**First time:**

```
npm run ci
npm run gcloud:auth:sdk
```

**After that:**
```
npm run local:datastore
npm run start
```

## Deploy to gcloud

```
npm run gcloud:auth
npm run deploy
npm run prod:run
```
