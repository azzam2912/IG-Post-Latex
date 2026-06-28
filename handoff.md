# Handoff — repository refactor

## Goal

Make the repo easy to navigate and stop regenerating the LaTeX preamble for
every post: flatten the per-post folders, rename everything by post number, and
introduce a single shared template.

## What was done

### 1. Flattened the folder structure
- Removed every per-post sub-folder under `Posted-IG/` and `Posted-Twitter/`.
- Renamed posts by their number directly inside `Posted-IG/`:
  `01.tex` … `45.tex` (numbers are non-contiguous by design).
- Posts with multiple files use a descriptive suffix:
  - `00-imo-2020.tex`, `00-integral.tex`, `00-suneung.tex`
  - `16-imo-2022-p4.tex`, `16-ktom-maret-2022.tex`
  - `18.tex`, `18-old.tex`
  - `19.tex`, `19-draff.tex`
  - `27.tex`, `27-asymptote.tex`
  - `28.tex`, `28-asymptote.tex`
  - `experimental-1.tex`, `experimental-2.tex`
- Figures moved next to the posts with a numbered prefix (e.g.
  `14-am-gm-meme.jpg`, `15-nomor-14-rev.png`, `22-kmo2023p1.png`). All
  `\includegraphics` and `\input` references were updated to the new names.
- Twitter post moved to `Posted-Twitter/01.tex`.

### 2. Single shared template
- Added `preamble.tex`: one preamble for all posts (azzam.sty `[hagavi]`,
  4:5 Instagram page geometry, every extra package the posts use, plus shared
  helper macros: `\siku`, `\zerodisplayskips`, `\progtitle`, `\kunci`,
  `\ralat`, `\sqbox`, the `EvanRed`/`officegreen` colors, and `\graphicspath`).
- Converted all 29 former standalone documents into **body-only fragments**
  (stripped `\documentclass`/preamble/`document` env; `\title` turned into a
  centered heading). The other 25 posts were already fragments.
- `main.tex` is now a thin build driver: `\input{preamble}` + one post.
- `template.tex` is a starter skeleton for new posts.
- Removed the redundant `main-ig.tex`, `main-twitter.tex`, `template-4-to-5.tex`.

### 3. Docs & hygiene
- `README.md`: structure + build/authoring workflow.
- `CLAUDE.md`: conventions for future work in this repo.
- `.gitignore`: LaTeX/Asymptote build artifacts.

## Round 2 — figures: photos relocated, Asymptote → TikZ

### Photos
- Moved every raster figure into a dedicated `0Figure/` folder (names
  unchanged, e.g. `14-am-gm-meme.jpg`, `22-kmo2023p1.png`).
- Updated the `\includegraphics` calls in the affected posts to the
  `0Figure/<name>` path, and added `./0Figure/` to `\graphicspath`.

### Asymptote → TikZ
- Every Asymptote figure was migrated to TikZ. Posts now `\input` the TikZ
  version; they no longer contain `\begin{asy}`.
- New folders:
  - `Asymptote/` — the original `.asy` sources, archived for reference
    (`22, 24, 27, 28, 31, 35.tex`). Not referenced by any post.
  - `TikzLatex/` — the converted TikZ figures, one file per figure:
    `22, 24, 27, 28`, `31-soal, 31-sol1, 31-sol2`, `35-soal, 35-solusi`.
- Conversion method:
  - GeoGebra-exported figures (31, 35) had explicit coordinates → translated
    mechanically (segments, circles, colors, dashes preserved).
  - Constructive figures (22, 24, 27, 28) used Asymptote's computational
    geometry (`circumcircle`, `foot`, `incenter`, `intersectionpoint`, …).
    These were recomputed numerically in Python and emitted as
    explicit-coordinate TikZ, so the geometry is exact and the figures need no
    external tools to render.
- Removed the old `Posted-IG/27-asymptote.tex` and `Posted-IG/28-asymptote.tex`.
- Because nothing uses Asymptote anymore, plain `pdflatex main.tex` is now
  sufficient (no `--shell-escape`).

## Things to verify / follow up

- **No LaTeX was installed** in the working environment, so nothing was
  compile-tested. Run `pdflatex main.tex` on a few posts (especially the
  converted standalone docs 02, 08, 20, 21 and the migrated figures 22, 24, 27,
  28, 31, 35) to confirm. The converted figures are geometrically exact; only
  the per-figure `scale=` (cosmetic sizing) may need small tweaks.
- **Post 21** (`Posted-IG/21.tex`) referenced `soal/soal.tex` and
  `solusi/solusi.tex` that were never in the repo; those `\input`s are commented
  out. Restore the content if available.
- **Unified page size**: old square (16×16) posts now use the 4:5 page, so their
  layout reflows. If any specific post must keep its original aspect ratio, it
  can override geometry locally — but the default is one shared format.
- **No Word/non-LaTeX sources existed**, so nothing needed format conversion.
