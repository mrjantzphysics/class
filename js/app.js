// Router and page rendering, plain style. Pages are addressed by hash:
//   #honors                 class page (current unit table + side column)
//   #honors-unit-2          a unit's page
//   #honors-2-7-2-8         a section or event page, Notes tab
//   #honors-2-7-2-8-practice  same page, another tab (notes, practice, videos, sims, printables)
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
  const TABS = [
    ["notes", "Notes", it => it.deck && DECKS[it.deck]],
    ["practice", "Practice", it => it.practice && it.practice.length],
    ["videos", "Video", it => it.videos && it.videos.length],
    ["sims", "Simulation", it => it.sims && it.sims.length],
    ["printables", "Printables", it => it.printables && it.printables.length],
  ];
  const liveUnits = c => c.units.filter(u => u.items && u.items.length);
  function find(hash) {
    let tab = null;
    const m = hash.match(/^(.*)-(notes|practice|videos|sims|printables)$/);
    if (m) { hash = m[1]; tab = m[2]; }
    for (const c of CLASSES) {
      if (hash === c.id) { const lu = liveUnits(c); return { view: "unit", c, u: lu[lu.length - 1], classPage: true }; }
      for (const u of c.units) {
        if (hash === `${c.id}-unit-${u.num}`) return { view: "unit", c, u };
        const items = u.items || [];
        for (let i = 0; i < items.length; i++)
          if (hash === `${c.id}-${itemId(items[i])}`) return { view: "item", c, u, it: items[i], i, tab };
      }
    }
    return { view: "home" };
  }
  const otherClass = c => CLASSES.find(x => x.id !== c.id);
  const fileHref = f => f.url || `files/${f.file}`;
  const fileLink = f => `<a href="${fileHref(f)}" target="_blank" rel="noopener">${esc(f.title)}${f.file ? " (PDF)" : ""}</a>`;

  // ---------- home ----------
  function home() {
    document.title = SITE.title;
    app.innerHTML = `
      <h1>${esc(SITE.title)}</h1>
      <p class="sub">${esc(SITE.tagline)}</p>
      <hr>
      <ul class="big">
        ${CLASSES.map(c => `<li><a href="#${c.id}">${esc(c.name)}</a> · ${esc(c.blurb)}</li>`).join("")}
      </ul>`;
  }

  // ---------- class / unit page (E1) ----------
  function unitView({ c, u }) {
    document.title = `${c.name} · Unit ${u.num}`;
    const oc = otherClass(c);
    const sims = [...new Set(u.items.flatMap(it => it.sims || []))];
    const ann = (SITE.announcements || {})[c.id] || [];
    const every = (SITE.everyday || {})[c.id] || u.printables || [];
    const mats = it => TABS.filter(([, , ok]) => ok(it))
      .map(([k, t]) => `<a href="#${c.id}-${itemId(it)}${k === "notes" ? "" : "-" + k}">${t.toLowerCase()}</a>`).join(", ");
    app.innerHTML = `
      <h1>${esc(c.name)}</h1>
      <p class="sub">Mr. Jantz &nbsp;|&nbsp; <a href="#home">Home</a> &nbsp;|&nbsp; <a href="#${oc.id}">${esc(oc.name)}</a></p>
      <hr>
      <div class="cols">
        <div>
          <h2 class="first">Unit ${u.num}: ${esc(u.title)}</h2>
          ${u.eq ? `<p class="eq">${esc(u.eq)}</p>` : ""}
          <table class="seq">
            <tr><th>Section</th><th>Topic</th><th>Materials</th></tr>
            ${u.items.map(it => `<tr class="${it.kind}">
              <td>${it.kind === "section" ? esc(it.sec) : ""}</td>
              <td><a class="topic" href="#${c.id}-${itemId(it)}">${it.kind === "section" ? esc(it.title) : `<b>${esc(it.title)}</b>`}</a></td>
              <td>${mats(it)}</td></tr>`).join("")}
          </table>
        </div>
        <div>
          ${ann.length ? `<div class="box"><b class="t">Announcements</b>${ann.map(a => `<p>${a.isNew ? '<span class="new">NEW</span> ' : ""}${esc(a.text)}</p>`).join("")}</div>` : ""}
          ${every.length ? `<div class="box"><b class="t">Every day</b>${every.map(fileLink).join("<br>")}</div>` : ""}
          ${sims.length ? `<div class="box"><b class="t">Simulations</b>${sims.map(s => `<a href="${s.file}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join("<br>")}</div>` : ""}
          ${u.printables && u.printables.length > every.length ? `<div class="box"><b class="t">Unit printables</b>${u.printables.filter(p => !every.includes(p)).map(fileLink).join("<br>")}</div>` : ""}
          <div class="box"><b class="t">Units</b>${liveUnits(c).map(x => x === u
            ? `<b>Unit ${x.num}: ${esc(x.title)}</b>` : `<a href="#${c.id}-unit-${x.num}">Unit ${x.num}: ${esc(x.title)}</a>`).join("<br>")}
            <p class="small">More units are added as the year goes.</p></div>
        </div>
      </div>`;
  }

  // ---------- section / event page (S3) ----------
  function wbBox(c, it) {
    if (it.kind !== "section") return "";
    const wb = ((SITE.workbook || {})[c.id]) || {};
    const [a, b] = it.sec.split("–");
    const secs = [];
    if (!b) secs.push(a);
    else { const [ua, la] = a.split(".").map(Number), lb = +b.split(".")[1]; for (let k = la; k <= lb; k++) secs.push(`${ua}.${k}`); }
    const rows = secs.filter(s => wb[s]).map(s => {
      const m = wb[s], part = (sym, arr) => arr.length ? `${sym} ${arr.join(", ")}` : "";
      return `<p><b>Section ${s}</b><br>${[part("●", m.C), part("○", m.P), part("★", m.X)].filter(Boolean).join(" &nbsp;")}</p>`;
    });
    return rows.length ? `<div class="box"><b class="t">Workbook problems</b>${rows.join("")}<p class="small">● Core &nbsp;○ More practice &nbsp;★ Challenge</p></div>` : "";
  }

  let keyHandler = null;
  function itemView(f) {
    const { c, u, it, i } = f;
    const base = `${c.id}-${itemId(it)}`;
    const label = itemLabel(it);
    document.title = `${label ? label + ": " : ""}${it.title} · ${c.name}`;
    const tabs = TABS.filter(([, , ok]) => ok(it));
    const tab = tabs.find(t => t[0] === f.tab) ? f.tab : (tabs[0] || [])[0];
    const prev = u.items[i - 1], next = u.items[i + 1];
    const nm = x => `${x.kind === "section" ? x.sec + " " : ""}${esc(x.title)}`;
    app.innerHTML = `
      <p class="crumb"><a href="#${c.id}">${esc(c.name)}</a> › <a href="#${c.id}-unit-${u.num}">Unit ${u.num}</a> › ${esc(label || it.title)}</p>
      <h1>${label ? esc(label) + ": " : ""}${esc(it.title)}</h1>
      ${it.summary ? `<p class="sub">${esc(it.summary)}</p>` : ""}
      <div class="tabs" role="tablist">${tabs.map(([k, t]) => k === tab
        ? `<span class="on" role="tab" aria-selected="true">${t}</span>`
        : `<span role="tab"><a href="#${base}${k === "notes" ? "" : "-" + k}">${t}</a></span>`).join("")}</div>
      <div class="cols">
        <div id="panel"></div>
        <div>
          ${wbBox(c, it)}
          ${tab !== "printables" && it.printables ? `<div class="box"><b class="t">Printables</b>${it.printables.map(fileLink).join("<br>")}</div>` : ""}
          <div class="box"><b class="t">Sections</b>
            ${prev ? `<a href="#${c.id}-${itemId(prev)}">‹ ${nm(prev)}</a><br>` : ""}
            ${next ? `<a href="#${c.id}-${itemId(next)}">${nm(next)} ›</a><br>` : ""}
            <a href="#${c.id}-unit-${u.num}">Back to Unit ${u.num}</a></div>
        </div>
      </div>`;
    const p = $("#panel");
    if (!tab) { p.innerHTML = `<p class="gray">Materials for this one are on the way.</p>`; return; }
    ({ notes: notesPanel, practice: practicePanel, videos: videosPanel, sims: simsPanel, printables: printPanel })[tab](p, it, c);
  }

  // ---------- notes ----------
  function notesPanel(p, it) {
    const d = DECKS[it.deck], key = "slide:" + it.deck;
    const bundle = (window.SLIDEDATA || {})[it.deck];
    if (CFG.slideBundles && !bundle) {
      // preview build: each deck's slides are packed into one script
      p.innerHTML = `<p class="gray">Loading slides…</p>`;
      const sc = document.createElement("script");
      sc.src = `slides/${it.deck}.js`;
      sc.onload = () => notesPanel(p, it);
      document.head.appendChild(sc);
      return;
    }
    const src = k => bundle ? bundle[k - 1] : `slides/${it.deck}/${String(k).padStart(2, "0")}.jpg`;
    let n = Math.min(store.get(key, 1), d.n);
    p.innerHTML = `
      <div class="viewer"><img class="slide" alt="Slide" id="slideImg"></div>
      <p class="vbar"><button data-a="prev">‹ Previous</button> Slide <span id="sn"></span> of ${d.n} <button data-a="next">Next ›</button>
        &nbsp;<a href="#" data-a="full">full screen</a> &nbsp;<a href="#" data-a="grid">all slides</a></p>
      <div class="grid hidden">${Array.from({ length: d.n }, (_, k) => `<a href="#" data-k="${k + 1}"><img loading="lazy" src="${src(k + 1)}" alt="Slide ${k + 1}"><span>${k + 1}</span></a>`).join("")}</div>`;
    const img = $("#slideImg", p), grid = $(".grid", p), viewer = $(".viewer", p);
    const go = k => {
      n = Math.max(1, Math.min(d.n, k)); img.src = src(n); $("#sn", p).textContent = n; store.set(key, n);
      if (n < d.n) { const pre = new Image(); pre.src = src(n + 1); }
    };
    p.querySelectorAll("[data-a]").forEach(b => b.onclick = e => {
      e.preventDefault();
      const a = b.dataset.a;
      if (a === "prev") go(n - 1);
      if (a === "next") go(n + 1);
      if (a === "grid") grid.classList.toggle("hidden");
      if (a === "full") { try { (document.fullscreenElement ? document.exitFullscreen() : viewer.requestFullscreen()).catch(() => { }); } catch (err) { } }
    });
    grid.querySelectorAll("[data-k]").forEach(b => b.onclick = e => { e.preventDefault(); go(+b.dataset.k); grid.classList.add("hidden"); });
    img.onclick = e => go(n + (e.offsetX < img.clientWidth / 3 ? -1 : 1));
    if (keyHandler) document.removeEventListener("keydown", keyHandler);
    keyHandler = e => {
      if (!document.body.contains(img) || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
      if (e.key === "ArrowRight") go(n + 1);
      if (e.key === "ArrowLeft") go(n - 1);
    };
    document.addEventListener("keydown", keyHandler);
    go(n);
  }

  // ---------- practice ----------
  function practicePanel(p, it, c) {
    const types = it.practice.filter(k => PRACTICE[k]);
    const statsKey = `stats:${c.id}-${itemId(it)}`;
    let type = types[0], prob = null;
    p.innerHTML = `<p class="ptypes"></p><div id="prob"></div>`;
    const header = () => {
      const s = store.get(statsKey, { right: 0, tried: 0 });
      $(".ptypes", p).innerHTML = `Problem type: ${types.map(k => k === type ? `<b>${esc(PRACTICE[k].name)}</b>` : `<a href="#" data-k="${k}">${esc(PRACTICE[k].name)}</a>`).join(" | ")}
        &nbsp; <span class="small">${s.tried ? `Score so far: ${s.right} of ${s.tried} <a href="#" id="resetStats">reset</a>` : "Round to three significant figures."}</span>`;
      p.querySelectorAll(".ptypes [data-k]").forEach(a => a.onclick = e => { e.preventDefault(); type = a.dataset.k; fresh(); });
      const r = $("#resetStats", p); if (r) r.onclick = e => { e.preventDefault(); store.set(statsKey, { right: 0, tried: 0 }); header(); };
    };
    const bump = ok => { const s = store.get(statsKey, { right: 0, tried: 0 }); s.tried++; if (ok) s.right++; store.set(statsKey, s); header(); };
    function fresh() {
      prob = PRACTICE[type].gen();
      header();
      const box = $("#prob", p);
      box.innerHTML = `
        <div class="prob">
          <p><b>${esc(prob.title)}.</b> ${renderMath(prob.intro)}</p>
          ${prob.parts.map((pt, j) => `<div class="part" data-j="${j}">(${String.fromCharCode(97 + j)}) ${esc(pt.ask)}:
            ${pt.type === "num"
              ? `<span class="nowrap">${renderMath("$" + pt.sym + " =$")} <input type="text" inputmode="decimal" autocomplete="off" id="ans-${j}" aria-label="${esc(pt.ask)}"> ${renderMath(pt.unit ? "$" + pt.unit.replace(/^\\text\{ /, "\\text{") + "$" : "")}</span>`
              : pt.options.map((o, k) => `<label><input type="radio" name="c${j}" value="${k}"> ${esc(o)}</label>`).join(" ")}
            <span class="fb" aria-live="polite"></span></div>`).join("")}
          <p class="btns"><button data-a="check">Check</button> <button data-a="sol">Show solution</button> <button data-a="new">New numbers</button></p>
          <div class="sol hidden"></div>
        </div>`;
      box.querySelectorAll("input[type=text]").forEach(inp => inp.addEventListener("keydown", e => { if (e.key === "Enter") check(); }));
      box.querySelector('[data-a="check"]').onclick = check;
      box.querySelector('[data-a="new"]').onclick = fresh;
      box.querySelector('[data-a="sol"]').onclick = e => {
        const s = box.querySelector(".sol");
        if (s.classList.toggle("hidden")) { e.target.textContent = "Show solution"; return; }
        e.target.textContent = "Hide solution";
        s.innerHTML = prob.steps.map(st => `<div class="step">${renderMath(st)}</div>`).join("") +
          `<p><b>Answers:</b> ${prob.parts.map(pt => pt.type === "num" ? renderMath(`$${pt.sym} = ${PRACTICE_UTIL.sf(pt.value)}${pt.unit}$`) : `${esc(pt.ask)}: ${esc(pt.options[pt.answer])}`).join("; ")}</p>`;
      };
    }
    function check() {
      const box = $("#prob", p);
      prob.parts.forEach((pt, j) => {
        const row = box.querySelector(`.part[data-j="${j}"]`), fb = row.querySelector(".fb");
        let ok = null, msg = "";
        if (pt.type === "num") {
          const raw = row.querySelector("input").value.trim().replace(/[−–]/g, "-").replace(/,/g, "").replace(/\s/g, "");
          if (!raw) { fb.textContent = ""; fb.className = "fb"; return; }
          const x = parseFloat(raw);
          if (isNaN(x)) { ok = false; msg = "Enter a number."; }
          else {
            const tol = Math.max(Math.abs(pt.value) * (pt.tol || 0.02), pt.abs || 0.005);
            ok = Math.abs(x - pt.value) <= tol;
            if (!ok && Math.abs(x + pt.value) <= tol && Math.abs(pt.value) > 1e-9) msg = "Right size, wrong sign.";
            else if (!ok) msg = "Not quite. Check your setup.";
          }
        } else {
          const r = row.querySelector("input:checked");
          if (!r) { fb.textContent = ""; fb.className = "fb"; return; }
          ok = +r.value === pt.answer; msg = "Not quite.";
        }
        if (row.dataset.done !== "1") { bump(ok); if (ok) row.dataset.done = "1"; }
        fb.className = "fb " + (ok ? "ok" : "no");
        fb.textContent = ok ? "✓ Correct" : msg;
      });
    }
    fresh();
  }

  // ---------- videos ----------
  function videosPanel(p, it) {
    p.innerHTML = it.videos.map(v => `
      <div class="video" data-id="${v.id}">
        <p><b>${esc(v.title)}</b> <span class="small">(${esc(v.by)})</span><br>
        ${CFG.embedVideos ? `<a href="#" data-play>play here</a> &nbsp;|&nbsp; ` : ""}<a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">watch on YouTube</a></p>
      </div>`).join("");
    p.querySelectorAll("[data-play]").forEach(a => a.onclick = e => {
      e.preventDefault();
      const el = a.closest(".video");
      if (el.querySelector("iframe")) return;
      el.insertAdjacentHTML("beforeend", `<div class="vframe"><iframe src="https://www.youtube-nocookie.com/embed/${el.dataset.id}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Video"></iframe></div>`);
    });
  }

  // ---------- sims ----------
  function simsPanel(p, it) {
    let cur = 0;
    const draw = () => {
      const s = it.sims[cur];
      p.innerHTML = `
        ${it.sims.length > 1 ? `<p>${it.sims.map((x, k) => k === cur ? `<b>${esc(x.title)}</b>` : `<a href="#" data-k="${k}">${esc(x.title)}</a>`).join(" | ")}</p>` : ""}
        <p><b>${esc(s.title)}.</b> ${esc(s.blurb)} <a href="${s.file}" target="_blank" rel="noopener">Open in its own tab</a></p>
        <div class="simframe"><iframe src="${s.file}" title="${esc(s.title)}"></iframe></div>`;
      p.querySelectorAll("[data-k]").forEach(a => a.onclick = e => { e.preventDefault(); cur = +a.dataset.k; draw(); });
    };
    draw();
  }

  // ---------- printables ----------
  function printPanel(p, it) {
    p.innerHTML = `<ul>${it.printables.map(f => `<li>${fileLink(f)}${f.note ? ` <span class="small">· ${esc(f.note)}</span>` : ""}</li>`).join("")}</ul>`;
  }

  // ---------- boot ----------
  function route() {
    const f = find(decodeURIComponent(location.hash.slice(1)));
    if (keyHandler && f.view !== "item") { document.removeEventListener("keydown", keyHandler); keyHandler = null; }
    ({ home, unit: unitView, item: itemView })[f.view](f);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
})();
