#!/usr/bin/env node
// Performance gate (Watt / Flux): fail the build when the gzipped production
// bundle exceeds budget. Zero-dependency — uses Node's built-in gzip.
//
// Budgets are provisional until confirmed on target hardware (see docs/performance/budgets.md).
// Run after `npm run build`:  node scripts/check-bundle-budget.mjs

import { gzipSync } from 'node:zlib';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ASSETS_DIR = 'dist/assets';

// KB, gzipped.
const BUDGETS = {
  totalJs: 300,
  totalCss: 50,
  singleChunk: 200,
};

function gzipKb(path) {
  return gzipSync(readFileSync(path)).length / 1024;
}

let files;
try {
  files = readdirSync(ASSETS_DIR).filter((f) => statSync(join(ASSETS_DIR, f)).isFile());
} catch {
  console.error(`✖ ${ASSETS_DIR} not found — run \`npm run build\` first.`);
  process.exit(1);
}

let totalJs = 0;
let totalCss = 0;
let biggestChunk = 0;
let biggestChunkName = '';

for (const file of files) {
  const kb = gzipKb(join(ASSETS_DIR, file));
  if (file.endsWith('.js')) {
    totalJs += kb;
    if (kb > biggestChunk) {
      biggestChunk = kb;
      biggestChunkName = file;
    }
  } else if (file.endsWith('.css')) {
    totalCss += kb;
  }
}

const checks = [
  { label: 'Total JS (gzip)', value: totalJs, budget: BUDGETS.totalJs },
  { label: 'Total CSS (gzip)', value: totalCss, budget: BUDGETS.totalCss },
  {
    label: `Largest chunk (${biggestChunkName})`,
    value: biggestChunk,
    budget: BUDGETS.singleChunk,
  },
];

let failed = false;
console.log('Bundle budget check (gzipped):');
for (const { label, value, budget } of checks) {
  const ok = value <= budget;
  if (!ok) failed = true;
  console.log(`  ${ok ? '✓' : '✖'} ${label}: ${value.toFixed(1)} KB / ${budget} KB budget`);
}

if (failed) {
  console.error('\n✖ Bundle budget exceeded.');
  process.exit(1);
}
console.log('\n✓ Within budget.');
