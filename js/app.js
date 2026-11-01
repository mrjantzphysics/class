// Router and page rendering. Pages are addressed by hash:
//   #honors            class page (units)
//   #honors-unit-2     unit page (sequence)
//   #honors-2-1        a section or event page (#honors-2-7-2-8, #honors-quiz-2-1)
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const app = $("#app");
  const CFG = window.SITE_CONFIG || {};
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- math ----------
  function renderMath(html) {
    if (!window.katex) return html;
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => katex.renderToString(t, { displayMode: true, throwOnError: false }));
    return html.replace(/\$([^$]+?)\$/g, (_, t) => katex.renderToString(t, { throwOnError: false }));
  }

  // ---------- storage (optional) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem("phys:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("phys:" + k, JSON.stringify(v)); } catch (e) { } },
  };

  // ---------- ids ----------
  const slug = s => s.replace(/[.–]/g, "-").replace(/-+/g, "-");
  const itemId = it => it.kind === "section" ? slug(it.sec) : it.id;
  const itemLabel = it => it.kind === "section" ? `Section ${it.sec}` : "";
  function find(hash) {
    for (const c of CLASSES) {
      if (hash === c.id) return { view: "class", c };
      for (const u of c.units) {
        if (hash === `${c.id}-unit-${u.num}`) return { view: "unit", c, u };
        const items = u.items || [];
        for (let i = 0; i < items.length; i++)
          if (hash === `${c.id}-${itemId(items[i])}`) return { view: "item", c, u, it: items[i], i };
      }
    }
    return { view: "home" };
  }

  const ICONS = {
    notes: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    videos: '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M10 9l5 3-5 3z" class="fill"/></svg>',
    practice: '<svg viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/></svg>',
    sims: '<svg viewBox="0 0 24 24"><path d="M3 19c4-10 10-14 18-14"/><circle cx="7" cy="12" r="1.6" class="fill"/><circle cx="12" cy="8" r="1.6" class="fill"/><circle cx="17" cy="6" r="1.6" class="fill"/></svg>',
    printables: '<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7"/></svg>',
  };
  const TABS = [
    ["notes", "Notes", it => it.deck && DECKS[it.deck]],
    ["practice", "Practice", it => it.practice && it.practice.length],
    ["videos", "Videos", it => it.videos && it.videos.length],
    ["sims", "Simulations", it => it.sims && it.sims.length],
    ["printables", "Printables", it => it.printables && it.printables.length],
  ];

  function crumbs(parts) {
    return `<nav class="crumbs">${parts.map(([h, t]) => h ? `<a href="#${h}">${esc(t)}</a>` : `<span>${esc(t)}</span>`).join('<span class="sep">›</span>')}</nav>`;
  }

  // ---------- views ----------
  function home() {
    document.title = SITE.title;
    app.innerHTML = `
      <section class="hero">
        <h1>${esc(SITE.title)}</h1>
        <p>${esc(SITE.tagline)}</p>
      </section>
      <div class="class-cards">
        ${CLASSES.map(c => `
          <a class="class-card ${c.id}" href="#${c.id}">
            <span class="eyebrow">Class</span>
            <h2>${esc(c.name)}</h2>
            <p>${esc(c.blurb)}</p>
            <span class="go">Open ›</span>
          </a>`).join("")}
      </div>
      ${continueCard()}`;
  }
  function continueCard() {
    const last = store.get("last", null);
    if (!last) return "";
    const f = find(last);
    if (f.view !== "item") return "";
    return `<a class="continue" href="#${last}"><span class="eyebrow">Pick up where you left off</span>
      <b>${esc(f.c.name)} · ${esc(itemLabel(f.it) ? itemLabel(f.it) + ": " : "")}${esc(f.it.title)}</b></a>`;
  }

  function classView({ c }) {
    document.title = `${c.name} · ${SITE.title}`;
    app.innerHTML = `
      ${crumbs([["home", "Home"], [null, c.name]])}
      <header class="page-head ${c.id}"><span class="eyebrow">${esc(c.name)}</span><h1>Units</h1></header>
      <div class="units">
        ${c.units.map(u => {
          const live = u.items && u.items.length;
          const inner = `<span class="unum">${u.num === 0 ? "Start" : "Unit " + u.num}</span>
            <h3>${esc(u.title)}</h3>
            <p>${esc(u.eq || u.sub || "")}</p>
            <span class="status">${live ? "Open ›" : "Coming soon"}</span>`;
          return live ? `<a class="unit live" href="#${c.id}-unit-${u.num}">${inner}</a>` : `<div class="unit soon">${inner}</div>`;
        }).join("")}
      </div>`;
  }

  function unitView({ c, u }) {
    document.title = `Unit ${u.num}: ${u.title} · ${c.name}`;
    const has = it => TABS.filter(([k, , ok]) => ok(it)).map(([k, t]) => `<span class="mini" title="${t}">${ICONS[k]}</span>`).join("");
    app.innerHTML = `
      ${crumbs([["home", "Home"], [c.id, c.name], [null, `Unit ${u.num}`]])}
      <header class="page-head ${c.id}">
        <span class="eyebrow">${esc(c.name)} · Unit ${u.num}</span>
        <h1>${esc(u.title)}</h1>
        ${u.eq ? `<p class="eq">${esc(u.eq)}</p>` : ""}
      </header>
      ${u.printables ? `<div class="unit-files">${u.printables.map(fileLink).join("")}</div>` : ""}
      <ol class="sequence">
        ${u.items.map(it => `
          <li class="${it.kind}">
            <a href="#${c.id}-${itemId(it)}">
              <span class="tag">${it.kind === "section" ? esc(it.sec) : eventTag(it)}</span>
              <span class="body"><b>${esc(it.title)}</b><small>${esc(it.summary || "")}</small></span>
              <span class="has">${has(it)}</span>
            </a>
          </li>`).join("")}
      </ol>`;
  }
  function eventTag(it) {
    if (it.id.startsWith("quiz")) return "Quiz";
    if (it.id === "test") return "Test";
    if (it.id === "review") return "Review";
    if (it.id === "project") return "Project";
    return "Lab";
  }

  function itemView(f) {
    const { c, u, it, i } = f;
    const hash = `${c.id}-${itemId(it)}`;
    store.set("last", hash);
    const label = itemLabel(it);
    document.title = `${label ? label + ": " : ""}${it.title} · ${c.name}`;
    const tabs = TABS.filter(([, , ok]) => ok(it));
    const saved = store.get("tab:" + hash, null);
    let tab = tabs.find(t => t[0] === saved) ? saved : (tabs[0] || [])[0];
    const prev = u.items[i - 1], next = u.items[i + 1];
    const navLink = (x, dir) => x ? `<a class="pn ${dir}" href="#${c.id}-${itemId(x)}"><small>${dir === "prev" ? "‹ Previous" : "Next ›"}</small><b>${esc(itemLabel(x) ? x.sec + " " : "")}${esc(x.title)}</b></a>` : "<span></span>";
    app.innerHTML = `
      ${crumbs([["home", "Home"], [c.id, c.name], [`${c.id}-unit-${u.num}`, `Unit ${u.num}`], [null, label || it.title]])}
      <header class="page-head ${c.id}">
        <span class="eyebrow">${esc(c.name)} · Unit ${u.num}${label ? " · " + label : ""}</span>
        <h1>${esc(it.title)}</h1>
        ${it.summary ? `<p class="eq">${esc(it.summary)}</p>` : ""}
      </header>
      <div class="tabs" role="tablist">
        ${tabs.map(([k, t]) => `<button role="tab" data-tab="${k}">${ICONS[k]}<span>${t}</span></button>`).join("")}
      </div>
      <div id="panel"></div>
      <nav class="prevnext">${navLink(prev, "prev")}${navLink(next, "next")}</nav>`;
    const show = k => {
      tab = k; store.set("tab:" + hash, k);
      app.querySelectorAll(".tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === k));
      const p = $("#panel");
      ({ notes: notesPanel, practice: practicePanel, videos: videosPanel, sims: simsPanel, printables: printPanel })[k](p, it, c);
    };
    app.querySelectorAll(".tabs button").forEach(b => b.onclick = () => show(b.dataset.tab));
    if (tab) show(tab); else $("#panel").innerHTML = `<p class="empty">Materials for this one are on the way.</p>`;
  }

  // ---------- notes (slide viewer) ----------
  let keyHandler = null;
  function notesPanel(p, it) {
    const d = DECKS[it.deck], key = "slide:" + it.deck;
    let n = Math.min(store.get(key, 1), d.n);
    const bundle = (window.SLIDEDATA || {})[it.deck];
    if (CFG.slideBundles && !bundle) {
      // preview build: each deck's slides are packed into one script
      p.innerHTML = `<p class="empty">Loading slides…</p>`;
      const sc = document.createElement("script");
      sc.src = `slides/${it.deck}.js`;
      sc.onload = () => notesPanel(p, it);
      document.head.appendChild(sc);
      return;
    }
    const src = k => bundle ? bundle[k - 1] : `slides/${it.deck}/${String(k).padStart(2, "0")}.jpg`;
    p.innerHTML = `
      <div class="viewer">
        <div class="stage"><img alt="Slide" id="slideImg"><button class="nav l" aria-label="Previous slide">‹</button><button class="nav r" aria-label="Next slide">›</button></div>
        <div class="vbar">
          <button class="vb" data-a="prev">‹ Prev</button>
          <span class="count"><span id="sn"></span> / ${d.n}</span>
          <button class="vb" data-a="next">Next ›</button>
          <span class="grow"></span>
          <button class="vb" data-a="grid">All slides</button>
          <button class="vb" data-a="full">Full screen</button>
        </div>
        <div class="grid hidden">${Array.from({ length: d.n }, (_, k) => `<button data-k="${k + 1}"><img loading="lazy" src="${src(k + 1)}" alt="Slide ${k + 1}"><span>${k + 1}</span></button>`).join("")}</div>
      </div>`;
    const img = $("#slideImg", p), viewer = $(".viewer", p), grid = $(".grid", p);
    const go = k => {
      n = Math.max(1, Math.min(d.n, k)); img.src = src(n); $("#sn", p).textContent = n; store.set(key, n);
      if (n < d.n) { const pre = new Image(); pre.src = src(n + 1); }
    };
    p.querySelector(".nav.l").onclick = () => go(n - 1);
    p.querySelector(".nav.r").onclick = () => go(n + 1);
    p.querySelectorAll(".vb").forEach(b => b.onclick = () => {
      const a = b.dataset.a;
      if (a === "prev") go(n - 1);
      if (a === "next") go(n + 1);
      if (a === "grid") grid.classList.toggle("hidden");
      if (a === "full") { try { (document.fullscreenElement ? document.exitFullscreen() : viewer.requestFullscreen()).catch(() => { }); } catch (e) { } }
    });
    grid.querySelectorAll("button").forEach(b => b.onclick = () => { go(+b.dataset.k); grid.classList.add("hidden"); viewer.scrollIntoView({ behavior: "smooth", block: "start" }); });
    if (keyHandler) document.removeEventListener("keydown", keyHandler);
    keyHandler = e => {
      if (!document.body.contains(img) || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
      if (e.key === "ArrowRight") go(n + 1);
      if (e.key === "ArrowLeft") go(n - 1);
    };
    document.addEventListener("keydown", keyHandler);
    let x0 = null;
    img.addEventListener("touchstart", e => x0 = e.touches[0].clientX, { passive: true });
    img.addEventListener("touchend", e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(n + (dx < 0 ? 1 : -1)); x0 = null; });
    go(n);
  }

  // ---------- practice ----------
  function practicePanel(p, it, c) {
    const types = it.practice.filter(k => PRACTICE[k]);
    const statsKey = `stats:${c.id}-${itemId(it)}`;
    let type = types[0], prob = null;
    p.innerHTML = `
      <div class="practice">
        <div class="ptypes">${types.length > 1 ? types.map(k => `<button data-k="${k}">${esc(PRACTICE[k].name)}</button>`).join("") : ""}</div>
        <div class="pstats" id="pstats"></div>
        <div id="prob"></div>
      </div>`;
    const stats = () => {
      const s = store.get(statsKey, { right: 0, tried: 0 });
      $("#pstats", p).innerHTML = s.tried ? `You've gotten <b>${s.right}</b> of <b>${s.tried}</b> answers right here. <button class="link" id="resetStats">Reset</button>` : "Type an answer and press <b>Check</b>. Round to three significant figures.";
      const r = $("#resetStats", p); if (r) r.onclick = () => { store.set(statsKey, { right: 0, tried: 0 }); stats(); };
    };
    const bump = ok => { const s = store.get(statsKey, { right: 0, tried: 0 }); s.tried++; if (ok) s.right++; store.set(statsKey, s); stats(); };
    const fresh = () => {
      prob = PRACTICE[type].gen();
      p.querySelectorAll(".ptypes button").forEach(b => b.classList.toggle("on", b.dataset.k === type));
      const box = $("#prob", p);
      box.innerHTML = `
        <article class="problem">
          <h3>${esc(prob.title)}</h3>
          <p class="intro">${renderMath(prob.intro)}</p>
          <ol class="parts">
            ${prob.parts.map((pt, j) => `
              <li data-j="${j}">
                <span class="ask">${esc(pt.ask)}</span>
                ${pt.type === "num"
                  ? `<span class="ans"><span class="sym">${renderMath("$" + pt.sym + " =$")}</span><input inputmode="decimal" autocomplete="off" aria-label="${esc(pt.ask)}"><span class="uval">${renderMath(pt.unit ? "$" + pt.unit.replace(/^\\text\{ /, "\\text{") + "$" : "")}</span></span>`
                  : `<span class="ans choices">${pt.options.map((o, k) => `<label><input type="radio" name="c${j}" value="${k}"> ${esc(o)}</label>`).join("")}</span>`}
                <span class="fb" aria-live="polite"></span>
              </li>`).join("")}
          </ol>
          <div class="pactions">
            <button class="btn primary" data-a="check">Check</button>
            <button class="btn" data-a="sol">Show solution</button>
            <button class="btn" data-a="new">New numbers</button>
          </div>
          <div class="solution hidden"></div>
        </article>`;
      box.querySelectorAll("input:not([type=radio])").forEach(inp => inp.addEventListener("keydown", e => { if (e.key === "Enter") check(); }));
      box.querySelector('[data-a="check"]').onclick = check;
      box.querySelector('[data-a="new"]').onclick = fresh;
      box.querySelector('[data-a="sol"]').onclick = () => {
        const s = box.querySelector(".solution");
        if (s.classList.contains("hidden")) {
          s.innerHTML = `<h4>Worked solution</h4>${prob.steps.map(st => `<div class="step">${renderMath(st)}</div>`).join("")}
            <div class="answers"><b>Answers:</b> ${prob.parts.map(pt => pt.type === "num" ? renderMath(`$${pt.sym} = ${PRACTICE_UTIL.sf(pt.value)}${pt.unit}$`) : `${esc(pt.ask)}: <b>${esc(pt.options[pt.answer])}</b>`).join(" · ")}</div>`;
          s.classList.remove("hidden");
        } else s.classList.add("hidden");
      };
    };
    function check() {
      const box = $("#prob", p);
      prob.parts.forEach((pt, j) => {
        const li = box.querySelector(`li[data-j="${j}"]`), fb = li.querySelector(".fb");
        let ok = null, msg = "";
        if (pt.type === "num") {
          const raw = li.querySelector("input").value.trim().replace(/[−–]/g, "-").replace(/,/g, "").replace(/\s/g, "");
          if (!raw) { fb.textContent = ""; li.className = ""; return; }
          const x = parseFloat(raw);
          if (isNaN(x)) { ok = false; msg = "Enter a number."; }
          else {
            const tol = Math.max(Math.abs(pt.value) * (pt.tol || 0.02), pt.abs || 0.005);
            ok = Math.abs(x - pt.value) <= tol;
            if (!ok && Math.abs(x + pt.value) <= tol && Math.abs(pt.value) > 1e-9) msg = "Right size, wrong sign.";
            else if (!ok) msg = "Not quite. Check your setup.";
          }
        } else {
          const r = li.querySelector("input:checked");
          if (!r) { fb.textContent = ""; li.className = ""; return; }
          ok = +r.value === pt.answer; msg = ok ? "" : "Not quite.";
        }
        if (li.dataset.done !== "1") { bump(ok); if (ok) li.dataset.done = "1"; }
        li.className = ok ? "right" : "wrong";
        fb.textContent = ok ? "✓ Correct" : msg;
      });
    }
    p.querySelectorAll(".ptypes button").forEach(b => b.onclick = () => { type = b.dataset.k; fresh(); });
    stats(); fresh();
  }

  // ---------- videos ----------
  function videosPanel(p, it) {
    p.innerHTML = `<div class="videos">${it.videos.map(v => `
      <div class="video" data-id="${v.id}">
        <button class="vthumb" aria-label="Play ${esc(v.title)}">
          ${CFG.thumbnails ? `<img loading="lazy" src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="">` : ""}
          <span class="play">▶</span>
        </button>
        <div class="vmeta"><b>${esc(v.title)}</b><small>${esc(v.by)}</small>
          <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">Watch on YouTube ↗</a></div>
      </div>`).join("")}</div>`;
    p.querySelectorAll(".video").forEach(el => el.querySelector(".vthumb").onclick = () => {
      const id = el.dataset.id;
      if (!CFG.embedVideos) { window.open(`https://www.youtube.com/watch?v=${id}`, "_blank"); return; }
      el.querySelector(".vthumb").outerHTML = `<div class="vframe"><iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Video"></iframe></div>`;
    });
  }

  // ---------- sims ----------
  function simsPanel(p, it) {
    const sims = it.sims;
    let cur = 0;
    const draw = () => {
      const s = sims[cur];
      p.innerHTML = `
        <div class="sims">
          ${sims.length > 1 ? `<div class="ptypes">${sims.map((x, k) => `<button data-k="${k}" class="${k === cur ? "on" : ""}">${esc(x.title)}</button>`).join("")}</div>` : ""}
          <div class="simhead"><div><b>${esc(s.title)}</b><small>${esc(s.blurb)}</small></div><a class="btn" href="${s.file}" target="_blank" rel="noopener">Open in its own tab ↗</a></div>
          <div class="simframe"><iframe src="${s.file}" title="${esc(s.title)}"></iframe></div>
        </div>`;
      p.querySelectorAll(".ptypes button").forEach(b => b.onclick = () => { cur = +b.dataset.k; draw(); });
    };
    draw();
  }

  // ---------- printables ----------
  function fileLink(f) {
    return `<a class="file" href="files/${f.file}" target="_blank" rel="noopener">${ICONS.printables}<span><b>${esc(f.title)}</b>${f.note ? `<small>${esc(f.note)}</small>` : ""}</span><span class="pdf">PDF</span></a>`;
  }
  function printPanel(p, it, c) {
    p.innerHTML = `<div class="files">${it.printables.map(fileLink).join("")}</div>`;
  }

  // ---------- boot ----------
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    const f = find(h);
    if (keyHandler && f.view !== "item") { document.removeEventListener("keydown", keyHandler); keyHandler = null; }
    ({ home, class: classView, unit: unitView, item: itemView })[f.view](f);
    document.body.dataset.cls = f.c ? f.c.id : "";
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
})();
