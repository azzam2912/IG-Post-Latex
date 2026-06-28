# IG-Post-Latex

LaTeX sources for the olympiad-math problems posted on Instagram (and one on
Twitter). The repository is organised so every post shares one preamble and is
easy to navigate.

## Structure

```
preamble.tex        Shared preamble for ALL posts (edit once, used everywhere).
main.tex            Build driver: point its \input at the post you want, compile.
template.tex        Starter skeleton to copy when writing a new post.

azzam.sty           Personal style package (derived from evan.sty).
evan.sty            Evan Chen's style package.
geometry.asy        Asymptote helpers.
olympiad.asy        Asymptote helpers.

Posted-IG/          One file per post, named by its number:
                      00-imo-2020.tex, 01.tex, 02.tex, ... , 45.tex
                    Posts that ship several files use a suffix, e.g.
                      16-imo-2022-p4.tex, 16-ktom-maret-2022.tex
                      18.tex, 18-old.tex
                      27.tex, 27-asymptote.tex
                    Figures live next to the posts with a numbered prefix, e.g.
                      14-am-gm-meme.jpg, 22-kmo2023p1.png

Posted-Twitter/     Same idea for Twitter posts (01.tex).
```

There are no more per-post sub-folders, and every `.tex` file is named after
its post number.

## Each post is a fragment

A post file contains **only the body** — no `\documentclass`, no `\usepackage`,
no `\begin{document}`. The whole preamble lives in `preamble.tex`, so it is
never copy-pasted or regenerated per post.

## Building a post

1. Open `main.tex`.
2. Set the `\input` line to the post you want, e.g.

   ```latex
   \input{Posted-IG/45}
   ```

   (for Twitter use `\input{Posted-Twitter/01}`).
3. Compile `main.tex` (e.g. `pdflatex main.tex`). The page is sized for the
   Instagram 4:5 portrait format (17 × 21.25 cm).

## Build script (`scripts/build.js`)

A dependency-free Node helper that wraps a single post with `preamble.tex`,
compiles it, and (optionally) rasterizes the result — handy for automation or a
web back-end. Requires `pdflatex` on `PATH` for compiling and `pdftoppm`
(poppler-utils) on `PATH` for image conversion.

```bash
# 1. Compile one post            -> pdfs/<name>.pdf
node scripts/build.js compile 45
node scripts/build.js compile Posted-Twitter/01

# 2. Compile the newest post     -> pdfs/<name>.pdf
node scripts/build.js compile-latest                 # newest in Posted-IG
node scripts/build.js compile-latest --dir Posted-Twitter

# 3. PDF pages -> images         -> pdf-to-images/<name>/page-1.png, ...
node scripts/build.js to-images pdfs/45.pdf
```

Equivalent npm scripts: `npm run compile -- 45`, `npm run latest`,
`npm run to-images -- pdfs/45.pdf`. Image resolution is configurable with
`PDF_DPI` (default 200). Output folders `pdfs/` and `pdf-to-images/` are
git-ignored as generated artifacts.

## Writing a new post

1. Copy `template.tex` to `Posted-IG/<number>.tex`.
2. Write the body (the template shows the usual `Soal` / `Walkthrough` /
   `Solusi` layout, with `\newpage` separating carousel slides).
3. Put any figures in `Posted-IG/` with a `<number>-` prefix.
4. Point `main.tex` at the new file and compile.

If you need an extra package or macro, add it to `preamble.tex` once.
