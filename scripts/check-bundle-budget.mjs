#!/usr/bin/env node
// Performance gate (Watt / Flux): fail the build when the gzipped JS the app actually
// needs for first paint exceeds budget. Zero-dependency — uses Node's built-in gzip.
//
// Budgets are provisional until confirmed on target hardware (see docs/performance/budgets.md).
// Run after `npm run build`:  node scripts/check-bundle-budget.mjs

import { gzipSync } from 'node:zlib';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST_DIR = 'dist';
const ASSETS_DIR = join(DIST_DIR, 'assets');
const MANIFEST_PATH = join(DIST_DIR, '.vite', 'manifest.json');

// KB, gzipped. See ADR-0005 for the react-hook-form bundle-impact rationale.
const BUDGETS = {
  totalJs: 320,
  totalCss: 50,
  singleChunk: 200,
};

// Chunks that only load on a user action (not on every visit), so they don't belong in the
// first-paint budget even though Vite's chunk graph reaches them via a "dynamic import" edge
// just like the always-loaded route chunk does. Match by manifest `src` (source module path).
const DEFERRED_ENTRY_SOURCES = [
  'src/features/portfolio/components/SettingsPanel.tsx',
  'src/features/portfolio/components/AccountsPanel.tsx',
];

function gzipKb(path) {
  return gzipSync(readFileSync(path)).length / 1024;
}

if (!existsSync(ASSETS_DIR)) {
  console.error(`✖ ${ASSETS_DIR} not found — run \`npm run build\` first.`);
  process.exit(1);
}

const files = readdirSync(ASSETS_DIR).filter((f) => statSync(join(ASSETS_DIR, f)).isFile());

let totalJsAll = 0;
let totalCss = 0;
for (const file of files) {
  const kb = gzipKb(join(ASSETS_DIR, file));
  if (file.endsWith('.js')) {
    totalJsAll += kb;
  } else if (file.endsWith('.css')) {
    totalCss += kb;
  }
}

// Walk the manifest's import graph from the HTML entry to find every chunk that's on the
// critical path to first paint — following both static and dynamic imports, since this is a
// single-route app where the route's own lazy chunk (see src/app/router.tsx) always loads
// immediately. Chunks only reachable through a DEFERRED_ENTRY_SOURCES node (e.g. the settings
// panel, opened on demand) are excluded.
let criticalFiles = null;
if (existsSync(MANIFEST_PATH)) {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
  const entryKey = Object.keys(manifest).find((key) => manifest[key].isEntry);
  if (entryKey !== undefined) {
    const visited = new Set();
    const files = new Set();

    function visit(key) {
      if (visited.has(key) || DEFERRED_ENTRY_SOURCES.includes(key)) {
        return;
      }
      visited.add(key);
      const entry = manifest[key];
      if (entry === undefined) {
        return;
      }
      files.add(entry.file);
      for (const cssFile of entry.css ?? []) {
        files.add(cssFile);
      }
      for (const dep of [...(entry.imports ?? []), ...(entry.dynamicImports ?? [])]) {
        visit(dep);
      }
    }

    visit(entryKey);
    criticalFiles = files;
  }
}

let totalJs = 0;
let totalCriticalCss = 0;
let biggestChunk = 0;
let biggestChunkName = '';

const measuredFiles = criticalFiles ?? new Set(files.map((f) => join('assets', f)));
for (const relativeFile of measuredFiles) {
  const path = join(DIST_DIR, relativeFile);
  if (!existsSync(path)) {
    continue;
  }
  const kb = gzipKb(path);
  if (relativeFile.endsWith('.js')) {
    totalJs += kb;
    if (kb > biggestChunk) {
      biggestChunk = kb;
      biggestChunkName = relativeFile;
    }
  } else if (relativeFile.endsWith('.css')) {
    totalCriticalCss += kb;
  }
}

const checks = [
  { label: 'Total JS (gzip, first paint)', value: totalJs, budget: BUDGETS.totalJs },
  { label: 'Total CSS (gzip)', value: totalCriticalCss || totalCss, budget: BUDGETS.totalCss },
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
if (criticalFiles !== null && totalJsAll > totalJs) {
  console.log(
    `  ℹ Total JS incl. on-demand chunks (e.g. settings): ${totalJsAll.toFixed(1)} KB (not budget-gated)`,
  );
}

if (failed) {
  console.error('\n✖ Bundle budget exceeded.');
  process.exit(1);
}
console.log('\n✓ Within budget.');
