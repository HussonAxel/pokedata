import { runFetch } from "./fetch.ts";
import { runStage } from "./stage.ts";
import { runTransform } from "./transform.ts";

const commands = {
  fetch: runFetch,
  stage: runStage,
  transform: runTransform,
};

type CommandName = keyof typeof commands;

function isCommand(value: string | undefined): value is CommandName {
  return value !== undefined && value in commands;
}

const command = process.argv[2];

if (!isCommand(command)) {
  console.error(`Usage : node src/cli.ts <${Object.keys(commands).join(" | ")}>`);
  process.exit(1);
}

try {
  await commands[command]();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
