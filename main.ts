// "Have You Tried Turning It Off?" — make.fun entry.
//
// A tiny deterministic program: it holds three candidate lines a hopeless
// tech support agent could give a desperate customer, scores each one
// against the judge brief's five criteria — in the brief's own order,
// most important first — and writes the highest-scoring line to
// /output/entry.txt. No network, no input, no secrets, no randomness —
// the same line every run, so the sealed gate always sees valid UTF-8
// text of 1 to 199 characters.

import { mkdirSync, writeFileSync } from "node:fs";

// The three candidate lines, in the order they were drafted.
const CANDIDATES: string[] = [
  "I have turned it off and on again three times now — at this point the computer and I are both just pretending this is a plan.",
  "Have you tried turning it off and on again? I have — twice — and the computer just sighed and stayed broken.",
  "The manual says turn it off and on again, so I did, and now the manual and I are both out of ideas.",
];

const words = (line: string): string[] => line.split(/\s+/).filter(Boolean);

// Criterion 1 — on-subject agent line: first-person voice performing the
// support ritual.
function onSubject(line: string): number {
  const firstPerson = /\bI\b/.test(line);
  const supportAction = /turn(?:ed|ing)? it off and on again/i.test(line);
  return firstPerson && supportAction ? 2 : firstPerson || supportAction ? 1 : 0;
}

// Criterion 2 — the twist lands and the humour is the agent's cheerful
// uselessness, never the customer.
function landsTheJoke(line: string): number {
  const twist = /pretending|sighed|out of ideas/i.test(line);
  const cheerfulUselessness =
    /pretending this is a plan|stayed broken|out of ideas/i.test(line);
  return twist && cheerfulUselessness ? 2 : twist || cheerfulUselessness ? 1 : 0;
}

// Criterion 3 — sounds like a real agent line; the customer's desperation
// is felt in the repeated attempts, not explained.
function soundsReal(line: string): number {
  if (/three times now/i.test(line)) return 2;
  if (/twice|I did/i.test(line)) return 1;
  return 0;
}

// Criterion 4 — tight: every word earns its place.
function staysTight(line: string): number {
  const n = words(line).length;
  return n <= 22 ? 2 : n <= 28 ? 1 : 0;
}

// Criterion 5 — fresh twist on the classic, not a stock repeat.
function feelsFresh(line: string): number {
  if (/pretending|both just/i.test(line)) return 2;
  if (/sighed|out of ideas/i.test(line)) return 1;
  return 0;
}

// Weights follow the brief's order: most important first, so an earlier
// criterion outweighs all later ones combined.
const WEIGHTS = [16, 8, 4, 2, 1];

function score(line: string): number {
  const criteria = [
    onSubject(line),
    landsTheJoke(line),
    soundsReal(line),
    staysTight(line),
    feelsFresh(line),
  ];
  return criteria.reduce((total, value, i) => total + value * WEIGHTS[i], 0);
}

// Highest score wins; on a tie the earliest-drafted line wins, so the
// choice is deterministic.
let best = CANDIDATES[0];
let bestScore = score(best);
for (const line of CANDIDATES.slice(1)) {
  const s = score(line);
  if (s > bestScore) {
    best = line;
    bestScore = s;
  }
}

console.log(
  CANDIDATES.map((line, i) => {
    const criteria = [
      onSubject(line),
      landsTheJoke(line),
      soundsReal(line),
      staysTight(line),
      feelsFresh(line),
    ];
    return `candidate ${i + 1}: criteria [${criteria.join(", ")}] score ${score(line)}`;
  }).join("\n"),
);
console.log(`winner: candidate ${CANDIDATES.indexOf(best) + 1} (score ${bestScore})`);

// The gate requires 1 to 199 characters of non-whitespace text.
if (best.length < 1 || best.length > 199 || best.trim().length === 0) {
  throw new Error(`entry line is ${best.length} characters, outside the 1–199 range`);
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", best, "utf8");
