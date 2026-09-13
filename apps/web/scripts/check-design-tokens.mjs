#!/usr/bin/env node
/**
 * Design-token adherence check.
 *
 * Carries forward two selectors from the repository-root
 * `_adherence.oxlintrc.json` that oxlint 1.x can no longer run (it dropped
 * `no-restricted-syntax`):
 *
 *   - raw hex colours   -> use a colour token via var()
 *   - raw px values     -> use a spacing token via var()
 *
 * Scope is the product screens and layouts. The design system under
 * src/components is exempt: raw values there ARE the token implementations, and
 * the original ruleset exempted `index.js` for the same reason.
 *
 * Reported as warnings, exit 0 — matching the original ruleset's "warn"
 * severity. The findings are inherited from the prototype's inline styles and
 * are Phase 3 cleanup (responsive/design pass), not a Phase 1 gate. Pass
 * `--strict` to exit non-zero, e.g. to stop new violations landing in CI once
 * the existing ones are cleared.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SCAN = ['src/pages', 'src/layouts'];
const STRICT = process.argv.includes('--strict');

const CHECKS = [
  {
    id: 'raw-hex-color',
    // #abc / #aabbcc / #aabbccdd, but not a CSS custom property or a fragment id
    re: /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g,
    message: 'Raw hex colour — use a design-system colour token via var().',
  },
  {
    id: 'raw-px-value',
    re: /\b\d+px\b/g,
    message: 'Raw px value — use a design-system spacing token via var().',
  },
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const findings = [];
for (const target of SCAN) {
  const dir = join(ROOT, target);
  let files;
  try {
    files = walk(dir);
  } catch {
    continue; // directory not present
  }
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      // Skip comment lines — the migration notes quote token names.
      const trimmed = line.trim();
      if (trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;
      for (const check of CHECKS) {
        for (const match of line.matchAll(check.re)) {
          findings.push({
            file: relative(ROOT, file),
            line: i + 1,
            id: check.id,
            message: check.message,
            text: match[0],
          });
        }
      }
    });
  }
}

if (findings.length === 0) {
  console.log('design-tokens: no raw hex or px literals in src/pages or src/layouts.');
  process.exit(0);
}

const byCheck = new Map();
for (const f of findings) byCheck.set(f.id, (byCheck.get(f.id) ?? 0) + 1);

console.log(`design-tokens: ${findings.length} finding(s) (inherited from the prototype's inline styles):`);
for (const f of findings) {
  console.log(`  ${STRICT ? 'error' : 'warn'}  ${f.file}:${f.line}  ${f.text}  ${f.message}`);
}
console.log('\nSummary:');
for (const [id, n] of byCheck) console.log(`  ${id}: ${n}`);
console.log(
  STRICT
    ? '\nFailing because --strict was passed.'
    : '\nNot failing the build: these are carried over from the prototype and are Phase 3 cleanup.',
);
process.exit(STRICT ? 1 : 0);
