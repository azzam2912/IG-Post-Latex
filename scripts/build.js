#!/usr/bin/env node
/* ============================================================================
 *  scripts/build.js
 *
 *  Build / convert helper for the IG-Post-Latex repo. Three jobs:
 *
 *    1. Compile ONE post to PDF        -> pdfs/<name>.pdf
 *         node scripts/build.js compile <name>
 *         e.g. node scripts/build.js compile 45
 *              node scripts/build.js compile Posted-IG/16-imo-2022-p4
 *              node scripts/build.js compile Posted-Twitter/01
 *
 *    2. Compile the NEWEST post (highest leading number) to PDF
 *         node scripts/build.js compile-latest [--dir Posted-IG]
 *
 *    3. Convert a PDF's pages to PNG images
 *         node scripts/build.js to-images <pdf>
 *         -> pdf-to-images/<pdf-basename>/page-1.png, page-2.png, ...
 *         e.g. node scripts/build.js to-images pdfs/45.pdf
 *
 *  Posts are body-only fragments (no \documentclass / \begin{document}); this
 *  script wraps the chosen post with preamble.tex in a throwaway driver and
 *  runs pdflatex from the repo root so every relative path resolves exactly as
 *  it does for main.tex.
 *
 *  External tools (must be on PATH in the runtime environment):
 *    - pdflatex   (TeX Live / MiKTeX)  -> compile
 *    - pdftoppp / pdftoppm (poppler)   -> to-images
 *      (set PDFTOPPM env var to override the binary name/path)
 *
 *  No third-party npm dependencies; pure Node stdlib so it drops into any
 *  webapp/back-end without an install step.
 * ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const POST_DIRS = ['Posted-IG', 'Posted-Twitter'];
const PDF_OUT_DIR = path.join(REPO_ROOT, 'pdfs');
const IMG_OUT_DIR = path.join(REPO_ROOT, 'pdf-to-images');

/* ---------------------------------------------------------------- helpers -- */

function die(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function which(bin) {
  const probe = spawnSync(process.platform === 'win32' ? 'where' : 'which', [bin]);
  return probe.status === 0;
}

// Leading integer of a post filename, e.g. "16-imo-2022-p4" -> 16, "45" -> 45.
// Returns null when the name does not start with a number.
function leadingNumber(name) {
  const m = path.basename(name).match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

// Resolve a user-supplied post reference to an absolute .tex path.
//   "45"                      -> Posted-IG/45.tex (searches POST_DIRS)
//   "Posted-Twitter/01"       -> that exact file
//   "Posted-IG/16-imo-2022-p4.tex" -> as given
function resolvePost(ref) {
  const candidates = [];
  const withTex = ref.endsWith('.tex') ? ref : `${ref}.tex`;

  // Explicit path (relative to repo root or absolute).
  candidates.push(path.resolve(REPO_ROOT, withTex));
  // Bare name: look inside each posts directory.
  for (const dir of POST_DIRS) {
    candidates.push(path.join(REPO_ROOT, dir, path.basename(withTex)));
  }

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  die(`could not find post "${ref}" (looked in ${POST_DIRS.join(', ')})`);
}

// Find the newest post in `dir` by highest leading number. Ties (e.g. 18.tex
// and 18-old.tex) resolve to the plain "<n>.tex" when present, else the
// shortest name, so "compile-latest" tracks the canonical published post.
function findLatestPost(dir) {
  const abs = path.join(REPO_ROOT, dir);
  if (!fs.existsSync(abs)) die(`directory not found: ${dir}`);

  const numbered = fs
    .readdirSync(abs)
    .filter((f) => f.endsWith('.tex') && leadingNumber(f) !== null)
    .map((f) => ({ file: f, n: leadingNumber(f) }));

  if (numbered.length === 0) die(`no numbered .tex posts in ${dir}`);

  const maxN = Math.max(...numbered.map((x) => x.n));
  const tied = numbered.filter((x) => x.n === maxN).map((x) => x.file);

  const plain = `${maxN}.tex`;
  const chosen = tied.includes(plain)
    ? plain
    : tied.sort((a, b) => a.length - b.length)[0];

  return path.join(abs, chosen);
}

/* --------------------------------------------------------------- compile --- */

function compile(postPath) {
  if (!which('pdflatex')) {
    die('pdflatex not found on PATH. Install TeX Live / MiKTeX to compile.');
  }

  // Driver name relative to repo root, without extension, for \input.
  const rel = path.relative(REPO_ROOT, postPath).replace(/\\/g, '/');
  const inputArg = rel.replace(/\.tex$/, '');
  const baseName = path.basename(postPath, '.tex');

  // Unique throwaway driver in the repo root (relative \input paths must
  // resolve from here, just like main.tex).
  const driverJob = `__build_${baseName}_${process.pid}`;
  const driverPath = path.join(REPO_ROOT, `${driverJob}.tex`);
  const driverBody =
    `\\input{preamble}\n` +
    `\\begin{document}\n` +
    `\\pagestyle{plain}\n` +
    `\\input{${inputArg}}\n` +
    `\\end{document}\n`;

  fs.writeFileSync(driverPath, driverBody);

  let pdflatexFailed = false;
  try {
    // Two passes so cross-references / page geometry settle.
    for (let pass = 1; pass <= 2; pass++) {
      const res = spawnSync(
        'pdflatex',
        ['-interaction=nonstopmode', '-halt-on-error', `-jobname=${driverJob}`, driverPath],
        { cwd: REPO_ROOT, stdio: 'inherit' }
      );
      if (res.status !== 0) {
        pdflatexFailed = true;
        break;
      }
    }
  } finally {
    cleanupDriverArtifacts(driverJob);
  }

  const builtPdf = path.join(REPO_ROOT, `${driverJob}.pdf`);
  if (pdflatexFailed || !fs.existsSync(builtPdf)) {
    if (fs.existsSync(builtPdf)) fs.unlinkSync(builtPdf);
    die(`pdflatex failed for ${rel} (see log above)`);
  }

  fs.mkdirSync(PDF_OUT_DIR, { recursive: true });
  const outPdf = path.join(PDF_OUT_DIR, `${baseName}.pdf`);
  fs.renameSync(builtPdf, outPdf);

  console.log(`\n✔ compiled ${rel} -> ${path.relative(REPO_ROOT, outPdf)}`);
  return outPdf;
}

// Remove the throwaway driver and the per-job aux files it produced.
function cleanupDriverArtifacts(driverJob) {
  const exts = [
    '.tex', '.aux', '.log', '.out', '.toc', '.lof', '.lot', '.fls',
    '.fdb_latexmk', '.synctex.gz', '.bbl', '.blg', '.nav', '.snm', '.vrb',
  ];
  for (const ext of exts) {
    const f = path.join(REPO_ROOT, `${driverJob}${ext}`);
    if (fs.existsSync(f)) {
      try { fs.unlinkSync(f); } catch (_) { /* best effort */ }
    }
  }
}

/* -------------------------------------------------------------- to-images -- */

function toImages(pdfRef) {
  const pdftoppm = process.env.PDFTOPPM || 'pdftoppm';
  if (!which(pdftoppm)) {
    die(
      `${pdftoppm} not found on PATH. Install poppler-utils (provides pdftoppm) ` +
        `or set PDFTOPPM to its location.`
    );
  }

  const pdfPath = path.resolve(REPO_ROOT, pdfRef);
  if (!fs.existsSync(pdfPath)) die(`pdf not found: ${pdfRef}`);

  const base = path.basename(pdfPath, '.pdf');
  const outDir = path.join(IMG_OUT_DIR, base);
  fs.mkdirSync(outDir, { recursive: true });

  // pdftoppm writes <prefix>-N.png (zero-padded). Emit to a temp prefix, then
  // rename to page-1.png, page-2.png, ... with no zero padding.
  const dpi = process.env.PDF_DPI || '200';
  const tmpPrefix = path.join(outDir, '__tmp_page');
  const res = spawnSync(
    pdftoppm,
    ['-png', '-r', dpi, pdfPath, tmpPrefix],
    { stdio: 'inherit' }
  );
  if (res.status !== 0) die(`pdftoppm failed for ${pdfRef}`);

  const produced = fs
    .readdirSync(outDir)
    .filter((f) => f.startsWith('__tmp_page') && f.endsWith('.png'))
    .map((f) => ({
      file: f,
      n: parseInt(f.match(/-(\d+)\.png$/)?.[1] ?? '0', 10),
    }))
    .sort((a, b) => a.n - b.n);

  if (produced.length === 0) die('pdftoppm produced no pages');

  produced.forEach((p, i) => {
    const target = path.join(outDir, `page-${i + 1}.png`);
    fs.renameSync(path.join(outDir, p.file), target);
  });

  console.log(
    `✔ ${produced.length} page(s) -> ${path.relative(REPO_ROOT, outDir)}/page-1.png ...`
  );
  return outDir;
}

/* ------------------------------------------------------------------- cli --- */

function usage() {
  console.log(`Usage:
  node scripts/build.js compile <name>            Compile one post -> pdfs/<name>.pdf
  node scripts/build.js compile-latest [--dir D]  Compile newest post (default Posted-IG)
  node scripts/build.js to-images <pdf>           PDF -> pdf-to-images/<name>/page-N.png

Examples:
  node scripts/build.js compile 45
  node scripts/build.js compile Posted-Twitter/01
  node scripts/build.js compile-latest
  node scripts/build.js compile-latest --dir Posted-Twitter
  node scripts/build.js to-images pdfs/45.pdf

Env:
  PDF_DPI   raster resolution for to-images (default 200)
  PDFTOPPM  path/name of the pdftoppm binary (default "pdftoppm")`);
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);

  switch (cmd) {
    case 'compile': {
      if (!rest[0]) die('compile needs a post name (e.g. "45")');
      compile(resolvePost(rest[0]));
      break;
    }
    case 'compile-latest': {
      const dirFlag = rest.indexOf('--dir');
      const dir = dirFlag !== -1 ? rest[dirFlag + 1] : 'Posted-IG';
      const latest = findLatestPost(dir);
      console.log(`latest post in ${dir}: ${path.basename(latest)}`);
      compile(latest);
      break;
    }
    case 'to-images': {
      if (!rest[0]) die('to-images needs a pdf path (e.g. "pdfs/45.pdf")');
      toImages(rest[0]);
      break;
    }
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      usage();
      break;
    default:
      console.error(`unknown command: ${cmd}\n`);
      usage();
      process.exit(1);
  }
}

main();
