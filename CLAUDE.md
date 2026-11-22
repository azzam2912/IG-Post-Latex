# CLAUDE.md

Guidance for working in this repository.

## Finishing a task: always commit and push

**Standing instruction from the owner — no need to ask each time.** When you finish a piece of work in this repo, commit it and push to `master`:

```bash
git add -A && git commit -m "<what changed>" && git push origin master
```

- Commit **directly to `master`**; do not create a branch or open a PR. This is a single-author repo, and a branch just strands the files.
- Do this at the end of the task, once the post compiles — not after every intermediate edit.
- `git add -A` is intended: PDFs and build artifacts are already gitignored, so it picks up sources only. Commit **everything** in the working tree, including edits the owner made outside your task — the goal of each commit is to save progress, not to keep authorship separate. Just name your own work in the commit message.
- If the push is rejected because `origin/master` moved, `git pull --rebase origin master` and push again. Report a genuine conflict rather than resolving it blind.
- The one thing to ask about first: deleting or moving files the owner did not ask you to touch.

## What this is

LaTeX sources for olympiad-math problems posted on Instagram (and one on
Twitter). Each post is a short, self-contained article (problem + walkthrough +
solution) typeset for the Instagram 4:5 portrait carousel format.

## Layout

```
preamble.tex        Shared preamble for ALL posts. Edit ONCE; used everywhere.
main.tex            Build driver: \input{preamble} + one post, then compile.
template.tex        Starter skeleton to copy when writing a new post.

azzam-helvethia.sty Active style package — Helvethia theme (Helvetica font,
                    cream/crimson palette). Used by preamble.tex.
azzam.sty           Original style package (kept for reference / older posts).
evan.sty            Evan Chen's style package.
geometry.asy        Asymptote helper (do not treat as generated output).
olympiad.asy        Asymptote helper (do not treat as generated output).

.vscode/settings.json  Shared LaTeX Workshop config: autosave -> pdflatex
                    -> pdfs/main.pdf. Checked in; see "Live preview" below.
scripts/build.js    Node helper: compile any post -> pdfs/, rasterize -> images.

Posted-IG/          One file per post, named "NN - Title.tex", e.g.
                      45 - Iran MO 2018 Round 1.tex
                    Line 1 is the "%!TEX root = ../main.tex" magic comment
                    (tells LaTeX Workshop the build root); line 2 is the
                    "% Title" comment.
                    Multi-file posts use different titles to distinguish them:
                      16 - IMO 2022 P4.tex, 16 - KTOM Maret 2022.tex
                      18 - Ketaksamaan Sederhana.tex
                      18 - Ketaksamaan Sederhana (Old).tex
                    Pre-numbered extras use a hyphenated slug: 00-imo-2020.tex,
                      00-integral.tex, 00-suneung.tex.

Posted-Twitter/     Same convention for Twitter posts:
                      01 - Symmetric Inequality.tex

0Figure/            All raster figures (photos/screenshots), numbered by post:
                      14-am-gm-meme.jpg, 22-kmo2023p1.png, ...
TikzLatex/          TikZ figures \input by the posts (NN.tex / NN-<part>.tex).
                    Each file also carries the "%!TEX root" magic line, so
                    saving a figure rebuilds the preview too.
Asymptote/          The original Asymptote sources for those figures, kept for
                    reference. Posts use the TikZ versions, NOT these.

pdfs/               Build output (git-ignored): pdfs/main.pdf from the live
                    preview, pdfs/<post>.pdf from scripts/build.js.
pdf-to-images/      Rasterized carousel images from build.js (git-ignored).
```

There are no per-post sub-folders. Post numbers are not contiguous (e.g. there
is no 04 or 17) — that is intentional; the numbers match the published posts.

## Key conventions

- **Posts are body-only fragments.** A post file contains only the content —
  NO `\documentclass`, NO `\usepackage`, NO `\begin{document}`. The whole
  preamble lives in `preamble.tex`. Never re-add a preamble to a post file.
- **Every fragment points at the root.** Line 1 of each post, Twitter post,
  and TikZ figure is `%!TEX root = ../main.tex` (`%!TEX root = main.tex` in
  `preamble.tex` itself). This is what makes save-to-build work: LaTeX
  Workshop follows the magic comment and compiles `main.tex` no matter which
  file you saved. Keep this line when editing; `template.tex` already has it.
- **Add packages/macros once.** If a post needs a new package or macro, add it
  to `preamble.tex`, not to the individual post.
- **`azzam-helvethia[hagavi]` already loads** amsmath, amssymb, xcolor,
  graphicx, ulem, mathtools, multicol, float, tcolorbox, pgfplots, mathrsfs,
  tkz-euclide, enumitem, hyperref, amsthm, thmtools, mdframed, fancyhdr,
  asymptote. Do not re-`\usepackage` these in `preamble.tex` (option clashes,
  esp. hyperref).
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
- **Blank line above and below every figure.** Put one blank line between the
  text and `\begin{figure}` / `\begin{center}` / `\begin{tikzpicture}` (or a
  `tabular`), and one blank line after `\end{...}`. Without these, LaTeX
  treats the block as inline with the paragraph and it lands mid line.
- **Stack solution derivations vertically.** In `Walkthrough` and `Solusi`,
  derivations go downwards, one equation per display line: a short lead-in
  sentence, then `align*` / `\[...\]` lines, then a short closing line with
  the answer. Never chain a multi-step derivation inline inside a paragraph;
  readers scroll these on a phone. Display math uses `\[...\]` or `align*`,
  never `$$...$$`. Inline math stays for naming symbols and short facts.
- **Indonesian prose, English math terms.** Posts read in Indonesian, but
  standard math terms stay English where the community uses them (`reversal`,
  `overlap`, `squarefree`, `strictly increasing`). Standard proof connectives
  (`Dengan demikian`, `Akibatnya`, `Jadi`, `Perhatikan bahwa`, `Misalkan`,
  `Andaikan`) are normal Indonesian math voice, not AI signals, and stay.

## Building

**Every time you create or edit a post, compile it.** Saving the `.tex`
without its PDF is an unfinished job. The PDFs are git-ignored build output —
"produce the PDF" means it exists on disk for you to check, not that it gets
committed.

1. In `main.tex`, set the `\input` line to the post you want, e.g.
   `\input{Posted-IG/45 - Iran MO 2018 Round 1}` (Twitter: `\input{Posted-Twitter/01 - Symmetric Inequality}`).
   Spaces in `\input{}` are fine in modern pdflatex (TeX Live 2019+).
2. Compile from the repo root, e.g. `pdflatex main.tex`. All figures are now
   TikZ, so plain `pdflatex` is enough (no `--shell-escape`/Asymptote needed).

### Build script (`scripts/build.js`)

A dependency-free Node helper that wraps a body-only post with `preamble.tex`,
compiles it, and can rasterize the result. Needs `pdflatex` on `PATH` to
compile and `pdftoppm` (poppler-utils) on `PATH` for images.

```bash
node scripts/build.js compile 45                           # by number -> pdfs/45 - Iran MO 2018 Round 1.pdf
node scripts/build.js compile "45 - Iran MO 2018 Round 1" # by full name also works
node scripts/build.js compile-latest                       # newest post by number (Posted-IG)
node scripts/build.js compile-latest --dir Posted-Twitter
node scripts/build.js to-images "pdfs/45 - Iran MO 2018 Round 1.pdf"
```

npm aliases: `npm run compile -- 45`, `npm run latest`,
`npm run to-images -- pdfs/45.pdf`. Image DPI via `PDF_DPI` (default 200).
Output dirs `pdfs/` and `pdf-to-images/` are git-ignored generated artifacts.

### Live preview inside VS Code

`.vscode/settings.json` (checked in) already configures the **LaTeX Workshop**
extension for this repo. It is not a WYSIWYG renderer — it just automates a
real compile: on save it runs `pdflatex` (twice, so cross-references settle)
from the **workspace root** rather than the file's own folder, because
relative asset paths (the shared style file, `0Figure/`, `TikzLatex/`) only
resolve from there; output goes into `pdfs/` next to `main.tex`, nonstopmode
so a broken figure doesn't block the build, and it cleans up build artifacts
after each build. Open a post and press **⌘⌥V** (or the TeX sidebar → *View
LaTeX PDF → in a tab*) to open the built-in PDF.js viewer tab; it rebuilds on
every ⌘S. With autosave (`afterDelay`) on, the workspace sets
`files.autoSaveDelay` to 4000, so the build fires 4s after you stop typing
rather than mid-keystroke. SyncTeX is on, so ⌘-click in the PDF jumps to the
source line and ⌘⌥J goes the other way.

Two things specific to this repo: the **root is always `main.tex`** (via the
`%!TEX root` line in every fragment), so the preview shows `pdfs/main.pdf —
point `main.tex`'s `\input` at the post you are editing first. And unlike
`scripts/build.js` (which passes `-halt-on-error`), the live recipe
deliberately does not: a single broken figure would otherwise block the whole
preview instead of just leaving a gap.

Do not change the recipe to a plain `pdflatex %DOC%` — LaTeX Workshop would
then run it from the file's own folder, where shared assets resolving via
relative paths from the repo root would not be found.

## Writing a new post

1. Copy `template.tex` to `Posted-IG/<number> - <Title>.tex` and fill in the
   body (the template shows the usual `Soal` / `Walkthrough` / `Solusi`
   layout, with `\newpage` separating carousel slides). Keep its line-1
   `%!TEX root` magic comment and add the `% Title` comment on line 2.
2. Put raster figures in `0Figure/` with a `<number>-` prefix and reference
   them as `\includegraphics{0Figure/<name>}`; put vector figures in
   `TikzLatex/` and pull them in with `\input{TikzLatex/<name>}`.
3. Point `main.tex` at the new file and compile.

## Where the problems come from

The contest archive is the sibling repo **`../Project-Helvethia/`** (absolute:
`/Users/xeratha-hagavi/LaTeX Project/Project-Helvethia/`), which holds one
folder per contest series plus its own `CLAUDE.md` describing each one's
conventions. When a post adapts a contest problem, quote the statement from
there and note the source; commit each side separately, and only commit there
if a source file actually changed.

## Theme colors (`azzam-helvethia.sty`)

The active Helvethia palette (defined in `azzam-helvethia.sty`):

| Name         | Hex       | Role                          |
|--------------|-----------|-------------------------------|
| `bg`         | `#F2EEE5` | page background (alt-surface) |
| `surface`    | `#FFFDF8` | cards / theorem panels        |
| `ink`        | `#1A1C24` | primary text                  |
| `inksoft`    | `#3A3D49` | secondary text                |
| `crimson`    | `#A8324A` | primary brand accent          |
| `crimsonink` | `#7A1F33` | hover / press variant         |

Convenience macros defined in the style:
- `\textcrimson{text}` — typeset in crimson
- `\textcrimsonink{text}` — typeset in crimson-ink

`preamble.tex` sets `\pagecolor{bg}` and `\color{ink}` globally.

## Writing style: avoid AI-sounding prose

Posts here are written in Indonesian, in the owner's own voice. A solution can
be completely correct and still read as machine-written. Before finishing any
prose (walkthroughs, solutions, problem statements, commit messages, chat
replies) in this repo, read the checklist
`/Users/xeratha-hagavi/LaTeX Project/Privat-Olimpiade-Matematika-utility/humanizer-id-skills.md`
and apply its 21 patterns; the table below is only the short version. Standard
proof connectives (`Dengan demikian`, `Akibatnya`, `Jadi`, `Perhatikan
bahwa`, `Misalkan`, `Andaikan`) are normal Indonesian math voice, not AI
signals, and stay. The examples are English, but the same habits show up in
Indonesian and get the same treatment.

| Signal | Sounds like AI | Write this instead |
|---|---|---|
| The em dash | "The triangle is isosceles—and that is the whole trick." | Use a comma, a colon, or a full stop. Never the long dash. |
| Hyphenated compounds | "a classic angle-chasing shortcut" | "a classic angle chasing shortcut" |
| AI vocabulary | "Let us delve into this robust approach and leverage the key insight." | "Let us look at what makes this approach work." |
| The "not X but Y" move | "This is not just about angles, it is about seeing the configuration." | "The trick is to see the configuration differently." |
| Reflexive lists of three | "Look at the sides, the angles, and the symmetry." | "Look at the sides and the angles." (Two is enough when two is enough.) |
| Hedging pile-up | "This might perhaps be one possible way you could arguably approach it." | "Here is one way to approach it." |
| Uniform rhythm | Every sentence the same length and shape. | Vary it. Short sentence. Then a longer one that takes its time and lets the idea settle before it stops. |
| "It is worth noting" | "It is worth noting that $OI \perp BC$." | "Note that $OI \perp BC$." |
| Empty summary closer | "In conclusion, we have successfully solved the problem." | Cut it. The `\blacksquare` already says so. |

Never use a hyphen or en/em dash as a sentence-joining punctuation mark. A hyphenated compound word is fine only when it is standard spelling and no natural unhyphenated alternative exists; when in doubt, write it as two words.

## Notes / known issues

- `Posted-IG/21 - OSN SMA 2023.tex` references `soal/soal.tex` and
  `solusi/solusi.tex` that were never committed; those `\input` lines are
  commented out until the content is restored.
