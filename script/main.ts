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
    case "curl":
      return curl(next);
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

function curl(parts: string[]) {
  const next = parts.slice(1);
  switch (parts[0]) {
    case "stage":
      return curlStage(next);
    case "prod":
      return curlProd(next);
  }
}

function deployStage(parts: string[]) {
  switch (parts[0]) {
    case "check-calendar":
      return runDeploy("check-calendar-stage", "check-calendar", "stage");
    case "phone-callback":
      return runDeploy("phone-callback-stage", "phone-callback", "stage");
  }
}

function deployProd(parts: string[]) {
  const env = "prod";
  switch (parts[0]) {
    case "check-calendar":
      return runDeploy("check-calendar", "check-calendar", "prod");
    case "phone-callback":
      return runDeploy("phone-callback", "phone-callback", "prod");
  }
}

function curlProd(parts: string[]) {
  switch (parts[0]) {
    case "phone-callback":
      return runCurl([`${BASE_URL}/phone-callback`]);

    case "check-calendar":
      return runCurl([`${BASE_URL}/check-calendar`]);

    case "check-calendar-test":
      return runCurl([`${BASE_URL}/check-calendar?test`]);
  }
}

function curlStage(parts: string[]) {
  switch (parts[0]) {
    case "phone-callback":
      return runCurl([`${BASE_URL}/phone-callback-stage`]);

    case "check-calendar":
      return runCurl([`${BASE_URL}/check-calendar-stage`]);

    case "check-calendar-test":
      return runCurl([`${BASE_URL}/check-calendar-stage?test`]);
  }
}

async function runTsc() {
  await run("npx", ["tsc"]);
}

async function runCurl(args: string[]) {
  await run("curl", ["-s", "-S"].concat(args));
}

async function runDeploy(
  target: string,
  entryPoint: string,
  deployEnv: string
) {
  await runTsc();
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
    `--set-env-vars=DEPLOY_ENV=${deployEnv}`,
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
