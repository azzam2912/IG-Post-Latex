# CLAUDE.md

Guidance for working in this repository.

## What this is

LaTeX sources for olympiad-math problems posted on Instagram (and one on
Twitter). Each post is a short, self-contained article (problem + walkthrough +
solution) typeset for the Instagram 4:5 portrait carousel format.

## Layout

```
preamble.tex        Shared preamble for ALL posts. Edit ONCE; used everywhere.
main.tex            Build driver: \input{preamble} + one post, then compile.
template.tex        Starter skeleton to copy when writing a new post.

azzam.sty           Personal style package (derived from evan.sty by Evan Chen).
evan.sty            Evan Chen's style package.
geometry.asy        Asymptote helper (do not treat as generated output).
olympiad.asy        Asymptote helper (do not treat as generated output).

Posted-IG/          One file per post, named by number: 01.tex .. 45.tex.
                    Multi-file posts use a descriptive suffix, e.g.
                      16-imo-2022-p4.tex, 16-ktom-maret-2022.tex
                      18.tex, 18-old.tex

Posted-Twitter/     Same convention for Twitter posts (01.tex).

0Figure/            All raster figures (photos/screenshots), numbered by post:
                      14-am-gm-meme.jpg, 22-kmo2023p1.png, ...
TikzLatex/          TikZ figures \input by the posts (NN.tex / NN-<part>.tex).
Asymptote/          The original Asymptote sources for those figures, kept for
                    reference. Posts use the TikZ versions, NOT these.
```

There are no per-post sub-folders. Post numbers are not contiguous (e.g. there
is no 04 or 17) — that is intentional; the numbers match the published posts.

## Key conventions

- **Posts are body-only fragments.** A post file contains only the content —
  NO `\documentclass`, NO `\usepackage`, NO `\begin{document}`. The whole
  preamble lives in `preamble.tex`. Never re-add a preamble to a post file.
- **Add packages/macros once.** If a post needs a new package or macro, add it
  to `preamble.tex`, not to the individual post.
- **`azzam.sty[hagavi]` already loads** amsmath, amssymb, xcolor, graphicx,
  ulem, mathtools, multicol, float, tcolorbox, pgfplots, mathrsfs, tkz-euclide,
  enumitem, hyperref, amsthm, thmtools, mdframed, fancyhdr, asymptote. Do not
  re-`\usepackage` these in `preamble.tex` (option clashes, esp. hyperref).
- **Page format** is Instagram 4:5 (17 × 21.25 cm), set in `preamble.tex`.
- **Slides** within a post are separated by `\newpage` (each page = one carousel
  image). The usual sections are `Soal`, `Walkthrough`, `Solusi` (Indonesian).
- **Raster figures** live in `0Figure/` and are referenced as
  `\includegraphics{0Figure/14-am-gm-meme}`; `\graphicspath` in `preamble.tex`
  also covers `./0Figure/` so a bare basename still resolves.
- **Vector figures use TikZ, not Asymptote.** Each figure is its own file in
  `TikzLatex/` and is pulled into a post with `\input{TikzLatex/<name>}`. The
  original Asymptote sources are archived in `Asymptote/` for reference only.
  When adding a figure, prefer TikZ (pure LaTeX, no `--shell-escape`).

## Building

1. In `main.tex`, set the `\input` line to the post you want, e.g.
   `\input{Posted-IG/45}` (Twitter: `\input{Posted-Twitter/01}`).
2. Compile from the repo root, e.g. `pdflatex main.tex`. All figures are now
   TikZ, so plain `pdflatex` is enough (no `--shell-escape`/Asymptote needed).

### Build script (`scripts/build.js`)

A dependency-free Node helper that wraps a body-only post with `preamble.tex`,
compiles it, and can rasterize the result. Needs `pdflatex` on `PATH` to
compile and `pdftoppm` (poppler-utils) on `PATH` for images.

```bash
node scripts/build.js compile 45                 # one post  -> pdfs/45.pdf
node scripts/build.js compile Posted-Twitter/01  # explicit path also works
node scripts/build.js compile-latest             # newest post by number (Posted-IG)
node scripts/build.js compile-latest --dir Posted-Twitter
node scripts/build.js to-images pdfs/45.pdf      # -> pdf-to-images/45/page-1.png, ...
```

npm aliases: `npm run compile -- 45`, `npm run latest`,
`npm run to-images -- pdfs/45.pdf`. Image DPI via `PDF_DPI` (default 200).
Output dirs `pdfs/` and `pdf-to-images/` are git-ignored generated artifacts.

## Writing a new post

1. Copy `template.tex` to `Posted-IG/<number>.tex` and fill in the body.
2. Put figures in `Posted-IG/` with a `<number>-` prefix.
3. Point `main.tex` at the new file and compile.

## Notes / known issues

- `Posted-IG/21.tex` references `soal/soal.tex` and `solusi/solusi.tex` that
  were never committed; those `\input` lines are commented out until the content
  is restored.
- No LaTeX toolchain is guaranteed in the dev environment — verify changes by
  compiling locally where possible.
