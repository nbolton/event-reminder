import { spawn } from "child_process";
import { config } from "../src/config";

const BASE_URL = config().DEPLOY_BASE_URL;

main();

function main() {
  const args = process.argv.slice(2);
  console.debug("args:", args);

  const parts = args[0].split(":");
  const next = parts.slice(1);

  switch (parts[0]) {
    case "deploy":
      return deploy(next);
    case "prod":
      return prod(next);
    case "stage":
      return stage(next);
  }
}

function deploy(parts: string[]) {
  const next = parts.slice(1);
  switch (parts[0]) {
    case "stage":
      return deployStage(next);
    case "prod":
      return deployProd(next);
  }
}

function deployStage(parts: string[]) {
  switch (parts[0]) {
    case "check-calendar":
      return gcDeploy("check-calendar-stage", "check-calendar");
    case "phone-callback":
      return gcDeploy("phone-callback-stage", "phone-callback");
  }
}

function deployProd(parts: string[]) {
  switch (parts[0]) {
    case "check-calendar":
      return gcDeploy("check-calendar", "check-calendar");
    case "phone-callback":
      return gcDeploy("phone-callback", "phone-callback");
  }
}

function prod(parts: string[]) {
  switch (parts[0]) {
    case "phone-callback":
      return curl([`${BASE_URL}/phone-callback`]);

    case "check-calendar":
      return curl([`${BASE_URL}/check-calendar`]);

    case "check-calendar-test":
      return curl([`${BASE_URL}/check-calendar?test`]);
  }
}

function stage(parts: string[]) {
  switch (parts[0]) {
    case "phone-callback":
      return curl([`${BASE_URL}/phone-callback-stage`]);

    case "check-calendar":
      return curl([`${BASE_URL}/check-calendar-stage`]);

    case "check-calendar-test":
      return curl([`${BASE_URL}/check-calendar-stage?test`]);
  }
}

async function tsc() {
  await run("npx", ["tsc"]);
}

async function curl(args: string[]) {
  await run("curl", ["-s", "-S"].concat(args));
}

async function gcDeploy(target: string, entryPoint: string) {
  await tsc();
  run("gcloud", [
    "functions",
    "deploy",
    target,
    `--entry-point=${entryPoint}`,
    "--gen2",
    "--runtime=nodejs20",
    "--region=europe-west2",
    "--trigger-http",
    "--allow-unauthenticated",
    "--env-vars-file=.env.yaml",
  ]);
}

async function run(command: string, args?: string[]) {
  console.log("running command:", command);
  console.log("args:", args ? args : "none");
  const ls = spawn(command, args || [], {
    cwd: process.cwd(),
    detached: true,
    stdio: "inherit",
  });

  return new Promise((resolveFunc) => {
    ls.on("error", (error) => {
      throw Error(`error running ${command}`, { cause: error });
    });

    ls.on("close", (code) => {
      if (code !== 0) {
        throw Error(`${command} exited with code ${code}`);
      }
      console.debug(`\n${command} exited ok`);
      resolveFunc(code);
    });
  });
}
