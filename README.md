# Class website (Mr. Jantz's Physics)

Plain static site: no build step, works on GitHub Pages (upload this folder as the repo root) or any web host.
Live site: https://mrjantzphysics.github.io/class/ (GitHub Pages, deploys from main). Claude preview copy: https://claude.ai/artifact/JHRdoA2TqVtgDZUFZGx6hg

- index.html + js/app.js: plain class-page look (Riley picked mockups E1 + S3, 2026-11-01). Hash router: #honors (current unit table + side column), #honors-unit-2, #honors-2-7-2-8 (section page with folder tabs); add -practice, -videos, -sims or -printables for a tab.
- js/content.js: ALL site content (units, sections, videos, sims, printables, practice set ids, SITE.announcements, SITE.everyday links, SITE.workbook = workbook problem marks per section). Edit this to add a unit or an announcement.
- js/practice.js: 16 random-number problem generators with checked answers (2% tolerance, sign hint) and worked solutions in course notation (x/y-world tables, Riley's equation forms, y_i = h, y_f = 0).
- js/decks.js + slides/<deck>/NN.jpg: slide images from the PowerPoints (tools/build_slides.py, paths point at the Claude project folder: soffice -> PDF -> pdftoppm 1000px).
  Honors 2.7-2.8 and 2.10-2.12 use the merged decks in unit2/slides/drafts/.
- js/config.js: embedVideos/thumbnails true for the real site. The artifact preview sets them false and slideBundles true
  (slides packed one JS file per deck as data URIs, because an artifact upload is capped at 256 files).
- files/: student PDFs only. No answer keys, quizzes or tests on the site.
- tools/test_gen.js: `node tools/test_gen.js` checks that every generator gives finite answers and valid KaTeX.
