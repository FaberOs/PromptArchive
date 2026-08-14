#!/usr/bin/env node

import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";

const ROOT = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const requested = process.argv.slice(2);
const isStrict = requested.includes("--strict");
const isJson = requested.includes("--json");
const forwarded = requested.filter((argument) => !["--", "--strict", "--human", "--json"].includes(argument));
const configuredMaxDuration = Number.parseInt(process.env.REACT_DOCTOR_MAX_DURATION_SECONDS ?? "360", 10);
const maxDurationSeconds =
  Number.isFinite(configuredMaxDuration) && configuredMaxDuration > 0 ? String(configuredMaxDuration) : "360";

const commonArguments = [
  ".",
  "--scope",
  "full",
  "--no-supply-chain",
  "--no-score",
  "--no-telemetry",
  "--no-parallel",
  "--yes",
  "--max-duration",
  maxDurationSeconds,
  ...(isStrict ? ["--blocking", "warning", "--no-respect-inline-disables"] : ["--blocking", "none"]),
];

if (isJson) {
  const reportDirectory = mkdtempSync(join(tmpdir(), "prompt-archive-react-doctor-"));
  const reportPath = join(reportDirectory, "report.json");
  commonArguments.push("--json", "--json-out", reportPath);
}

const child = spawn(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["exec", "--", "react-doctor", ...commonArguments, ...forwarded],
  { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" },
);

child.on("error", (error) => {
  console.error(`[react-doctor] No se pudo iniciar el ejecutable local: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`[react-doctor] Terminó por señal ${signal}.`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = code ?? 1;
});
