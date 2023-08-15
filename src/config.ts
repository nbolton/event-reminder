import fs from "fs";

export function config() {
  const env = ".env.yaml";
  if (fs.existsSync(env)) {
    console.log(`loading ${env}`);
    require("dotenv-yaml").config({ path: env });
  }
}
