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
                      27.tex, 27-asymptote.tex
                    Figures live alongside posts with a numbered prefix, e.g.
                      14-am-gm-meme.jpg, 22-kmo2023p1.png

Posted-Twitter/     Same convention for Twitter posts (01.tex).
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
- **Figures** are referenced by their new prefixed basename only (e.g.
  `\includegraphics{14-am-gm-meme}`); `\graphicspath` in `preamble.tex` covers
  `./`, `./Posted-IG/`, and `./Posted-Twitter/`.

## Building

1. In `main.tex`, set the `\input` line to the post you want, e.g.
   `\input{Posted-IG/45}` (Twitter: `\input{Posted-Twitter/01}`).
2. Compile from the repo root, e.g. `pdflatex main.tex`. Posts using Asymptote
   (`\begin{asy}`) need `--shell-escape` and Asymptote installed.

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
