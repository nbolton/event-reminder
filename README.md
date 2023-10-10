# Event Reminder

Checks Google Calendar for new events, sends you a message on Slack, and calls your phone (via Twilio).

> Hi Nick, you have a business event starting in 2 minutes.

## Quick start

### First time

Copy `.env.yaml.example` to `.env.yaml` and fill in the blanks.

Install [gcloud CLI](https://cloud.google.com/sdk/docs/install).


```
npm run ci
npm run gcloud:auth
npm run gcloud:auth:sdk
```

### After that
```
npm run local:datastore
npm run start
```

## Deploy to gcloud

```
npm run deploy:prod:check-calendar
npm run curl:prod:check-calendar-test
```
