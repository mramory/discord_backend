/* eslint-disable */
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECK_DIR = path.join(ROOT, 'check');
const COUNT_FILE = path.join(CHECK_DIR, 'count.txt');
const FILES_FILE = path.join(CHECK_DIR, 'files.txt');

const ESLINT_BIN = path.join(ROOT, 'node_modules', '.bin', 'eslint');
const eslintArgs = (outFile) => [
  '{src,apps,libs,test}/**/*.ts',
  '--no-error-on-unmatched-pattern',
  '-f', 'json',
  '-o', outFile,
];

function fail(msg, code = 2) {
  console.error(`❌ ${msg}`);
  process.exit(code);
}

function runLinter() {
  if (!fs.existsSync(ESLINT_BIN)) {
    fail(`ESLint not installed at ${ESLINT_BIN}. Run \`yarn install\` first.`);
  }
  const tmpFile = path.join(os.tmpdir(), `eslint-results-${process.pid}-${Date.now()}.json`);
  // ESLint exits non-zero when problems are found — expected. Ignore exit code.
  const res = spawnSync(ESLINT_BIN, eslintArgs(tmpFile), {
    cwd: ROOT,
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  if (res.error) fail(`Failed to spawn ESLint: ${res.error.message}`);
  if (!fs.existsSync(tmpFile)) fail('ESLint did not produce a results file.');
  let raw;
  try {
    raw = fs.readFileSync(tmpFile, 'utf-8');
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    fail(`Failed to parse ESLint JSON: ${e.message}`);
  }
}

function aggregate(results) {
  const map = new Map();
  for (const r of results) {
    if (!r || !Array.isArray(r.messages)) continue;
    let errors = 0;
    for (const m of r.messages) if (m.severity === 2) errors++;
    if (errors > 0) {
      const rel = path.relative(ROOT, r.filePath).split(path.sep).join('/');
      map.set(rel, errors);
    }
  }
  return map;
}

function sortedEntries(map) {
  return Array.from(map.entries()).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}

function writeBaseline(total, map) {
  fs.mkdirSync(CHECK_DIR, { recursive: true });
  fs.writeFileSync(COUNT_FILE, `${total}\n`);
  const lines = sortedEntries(map).map(([p, c]) => `${p}\t${c}`).join('\n');
  fs.writeFileSync(FILES_FILE, lines ? `${lines}\n` : '');
}

function readBaseline() {
  if (!fs.existsSync(COUNT_FILE)) return null;
  const total = Number.parseInt(fs.readFileSync(COUNT_FILE, 'utf-8').trim(), 10);
  if (!Number.isFinite(total)) fail(`Could not parse baseline count from ${COUNT_FILE}`);
  const map = new Map();
  if (fs.existsSync(FILES_FILE)) {
    for (const line of fs.readFileSync(FILES_FILE, 'utf-8').split('\n')) {
      if (!line.trim()) continue;
      const [p, c] = line.split('\t');
      const n = Number.parseInt(c, 10);
      if (p && Number.isFinite(n)) map.set(p, n);
    }
  }
  return { total, map };
}

function mapsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) if (b.get(k) !== v) return false;
  return true;
}

function main() {
  const results = runLinter();
  const current = aggregate(results);
  const currentTotal = Array.from(current.values()).reduce((a, b) => a + b, 0);

  const baseline = readBaseline();
  if (baseline === null) {
    writeBaseline(currentTotal, current);
    console.log(`✨ Baseline initialized: ${currentTotal} errors across ${current.size} files`);
    process.exit(0);
  }

  if (currentTotal > baseline.total) {
    const delta = currentTotal - baseline.total;
    console.error(`❌ Lint errors increased by ${delta} (baseline ${baseline.total} → now ${currentTotal})`);

    const newFiles = [];
    const grewFiles = [];
    for (const [p, c] of sortedEntries(current)) {
      const prev = baseline.map.get(p) || 0;
      if (prev === 0) newFiles.push({ p, c });
      else if (c > prev) grewFiles.push({ p, prev, c, d: c - prev });
    }
    if (newFiles.length) {
      console.error('\nNew files with errors:');
      for (const { p, c } of newFiles) console.error(`  ${p}  (${c})`);
    }
    if (grewFiles.length) {
      grewFiles.sort((a, b) => b.d - a.d);
      console.error('\nFiles where errors grew:');
      for (const { p, prev, c, d } of grewFiles) console.error(`  ${p}  (${prev} → ${c}, +${d})`);
    }
    process.exit(1);
  }

  if (currentTotal < baseline.total) {
    const delta = baseline.total - currentTotal;
    writeBaseline(currentTotal, current);
    console.log(`✅ Baseline lowered: ${baseline.total} → ${currentTotal} (-${delta} errors)`);
    process.exit(0);
  }

  if (!mapsEqual(current, baseline.map)) {
    writeBaseline(currentTotal, current);
    console.log(`✅ No change in error count (${currentTotal}); per-file distribution updated`);
  } else {
    console.log(`✅ No change in error count (${currentTotal} errors)`);
  }
  process.exit(0);
}

main();
