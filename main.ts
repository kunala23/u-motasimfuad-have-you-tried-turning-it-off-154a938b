// "Have You Tried Turning It Off?" — make.fun entry.
//
// A tiny deterministic program: it writes one funny line, spoken by a
// hopeless tech support agent to a desperate customer, to
// /output/entry.txt. No network, no input, no secrets, no randomness —
// the same line every run, so the sealed gate always sees valid UTF-8
// text of 1 to 199 characters.

import { mkdirSync, writeFileSync } from "node:fs";

// The line, kept as a single string so what the judge reads is exactly
// what this program writes — no templating, no assembly at runtime.
const LINE =
  "I have turned it off and on again three times now — at this point the computer and I are both just pretending this is a plan.";

// The gate requires 1 to 199 characters of non-whitespace text.
if (LINE.length < 1 || LINE.length > 199 || LINE.trim().length === 0) {
  throw new Error(`entry line is ${LINE.length} characters, outside the 1–199 range`);
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", LINE, "utf8");
