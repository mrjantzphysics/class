// Practice problem generators. Each generator returns a fresh problem with
// computed answers and a worked solution in the course notation:
//   x_f = ½a_x t² + v_ix t + x_i,  v_f = a t + v_i,  v_f² = v_i² + 2a(x_f − x_i)
// Up is positive, a_y = −9.8 m/s², a_x = 0, launch height y_i = h, ground y_f = 0.

(function () {
  const G = 9.8;
  const AY = -9.8;
  const D2R = Math.PI / 180;

  // ---------- helpers ----------
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const chance = p => Math.random() < p;
  // random value in [lo, hi] rounded to `dp` decimals
  const rnd = (lo, hi, dp = 0) => {
    const k = Math.pow(10, dp);
    return Math.round((lo + Math.random() * (hi - lo)) * k) / k;
  };
  // n significant figures, no exponent
  function sf(x, n = 3) {
    if (!isFinite(x)) return "?";
    if (Math.abs(x) < 1e-12) return "0";
    const s = x.toPrecision(n);
    return s.includes("e") ? String(Number(s)) : s;
  }
  // fixed decimals, for givens
  const fx = (x, dp) => x.toFixed(dp);
  const neg = s => s.replace(/^-/, "-");
  // a given to 3 significant figures, keeping trailing zeros (3.50, 12.0)
  const g3 = x => x.toPrecision(3);
  // TeX quantity
  const U = {
    m: "\\text{ m}", km: "\\text{ km}", s: "\\text{ s}", h: "\\text{ h}",
    ms: "\\text{ m/s}", kmh: "\\text{ km/h}", ms2: "\\text{ m/s}^2", deg: "^\\circ",
  };
  const q = (v, u, n = 3) => `${neg(sf(v, n))}${u}`;
  const qg = (s, u) => `${s}${u}`; // a given, already formatted

  // x/y table. rows: [symbolTeX, valueTeX, kind] kind: "a" always true, "q" from the question, "g" goal, "" unknown
  function xyTable(xRows, yRows, tRow) {
    const cell = r => {
      if (!r) return "<td></td><td></td>";
      const [s, v, k] = r;
      return `<td class="sym">$${s}$</td><td class="val ${k || ""}">${v ? "$" + v + "$" : ""}</td>`;
    };
    const n = Math.max(xRows.length, yRows.length);
    let rows = "";
    for (let i = 0; i < n; i++) rows += `<tr>${cell(xRows[i])}${cell(yRows[i])}</tr>`;
    const t = tRow
      ? `<tr class="trow"><td class="sym">$t$</td><td class="val ${tRow[1]}" colspan="3">${tRow[0] ? "$" + tRow[0] + "$" : ""}</td></tr>`
      : "";
    return `<table class="xy"><thead><tr><th colspan="2">x-world</th><th colspan="2">y-world</th></tr></thead><tbody>${rows}${t}</tbody></table>
      <div class="xy-key"><span class="k a"></span>always true <span class="k q"></span>from the question <span class="k g"></span>goal</div>`;
  }

  const num = (ask, sym, unit, value, extra = {}) => ({ type: "num", ask, sym, unit, value, ...extra });
  const choice = (ask, options, answer) => ({ type: "choice", ask, options, answer });

  // ---------- 2.1 scalars and vectors ----------
  const QUANTITIES = [
    ["A speed of 25 m/s", false, "Speed has a size but no direction."],
    ["A velocity of 25 m/s north", true, "Velocity includes a direction (north)."],
    ["A distance of 3.2 km", false, "Distance is the total path length, with no direction."],
    ["A displacement of 3.2 km west", true, "Displacement has a direction (west)."],
    ["A time of 4.0 s", false, "Time has no direction."],
    ["A mass of 60 kg", false, "Mass has no direction."],
    ["An acceleration of 9.8 m/s² downward", true, "Acceleration includes a direction (down)."],
    ["A temperature of 21 °C", false, "Temperature has no direction."],
    ["A plane flying 250 m/s at 30° north of east", true, "It names a direction (30° north of east)."],
    ["The 55 mph reading on a car's speedometer", false, "A speedometer shows speed only."],
    ["A ball's position 4.0 m to the left of the origin", true, "Position from an origin has a direction (left)."],
    ["The 8 hours you slept last night", false, "Time has no direction."],
    ["A river current flowing 1.5 m/s south", true, "The current has a direction (south)."],
    ["A drop of 12 m straight down from a cliff", true, "It has a direction (down), so it is a displacement."],
    ["The 400 m once around a track", false, "Distance around the track has no direction."],
  ];
  function scalarVector() {
    const items = [...QUANTITIES].sort(() => Math.random() - 0.5).slice(0, 4);
    return {
      title: "Scalar or vector?",
      intro: "Decide whether each quantity is a <b>scalar</b> (size only) or a <b>vector</b> (size and direction).",
      parts: items.map(([t, v]) => choice(t, ["Scalar", "Vector"], v ? 1 : 0)),
      steps: [
        "Ask one question: <i>does it tell you which way?</i> If yes, it's a vector.",
        "<ul>" + items.map(([t, v, why]) => `<li><b>${t}:</b> ${v ? "vector" : "scalar"}. ${why}</li>`).join("") + "</ul>",
      ],
    };
  }

  // ---------- 2.2 perpendicular vectors ----------
  function perpWalk() {
    const ctx = pick([
      { who: "Mr. Peck", verb: "jogs", u: "m", lo: 150, hi: 900, dp: 0 },
      { who: "A delivery drone", verb: "flies", u: "m", lo: 200, hi: 1500, dp: 0 },
      { who: "Ivy, Mr. Jantz's dog,", verb: "runs", u: "m", lo: 10, hi: 60, dp: 0 },
      { who: "A hiker", verb: "walks", u: "km", lo: 1.0, hi: 6.0, dp: 1 },
      { who: "An orienteering runner", verb: "runs", u: "m", lo: 100, hi: 800, dp: 0 },
    ]);
    const d1 = pick(["east", "west"]), d2 = pick(["north", "south"]);
    let A = rnd(ctx.lo, ctx.hi, ctx.dp), B = rnd(ctx.lo, ctx.hi, ctx.dp);
    const As = fx(A, ctx.dp), Bs = fx(B, ctx.dp), u = U[ctx.u];
    const R = Math.hypot(A, B), th = Math.atan(B / A) / D2R;
    const D1 = d1[0].toUpperCase(), D2 = d2[0].toUpperCase();
    return {
      title: "Two perpendicular moves",
      intro: `${ctx.who} ${ctx.verb} ${As} ${ctx.u} ${d1}, then ${Bs} ${ctx.u} ${d2}.`,
      parts: [
        num("Total distance traveled", "d", u, A + B),
        num("Size of the displacement", "R", u, R),
        num(`Direction: angle measured from ${d1} toward ${d2}`, "\\theta", U.deg, th, { abs: 0.6 }),
      ],
      steps: [
        `Distance is a scalar, so just add the path lengths: $$d = ${As} + ${Bs} = ${q(A + B, u)}$$`,
        `Displacement is a vector. Draw the two moves tip-to-tail. They make a right triangle, and the resultant $R$ is the hypotenuse.`,
        `$$R = \\sqrt{A^2 + B^2} = \\sqrt{(${As})^2 + (${Bs})^2} = ${q(R, u)}$$`,
        `The angle at the start sits between the ${d1} leg (adjacent) and the resultant. The ${d2} leg is opposite: $$\\theta = \\tan^{-1}\\!\\left(\\frac{\\text{opp}}{\\text{adj}}\\right) = \\tan^{-1}\\!\\left(\\frac{${Bs}}{${As}}\\right) = ${q(th, U.deg)}$$`,
        `So the displacement is $${q(R, u)}$ at $${q(th, U.deg)}$ ${D2} of ${D1}.`,
      ],
    };
  }

  // ---------- 2.3 components ----------
  function components() {
    const c = pick(["kick", "hike", "plane", "kick"]);
    const th = rnd(15, 75, 0);
    if (c === "hike") {
      const d = rnd(1.0, 8.0, 2), ds = fx(d, 2);
      const x = d * Math.cos(th * D2R), y = d * Math.sin(th * D2R);
      return {
        title: "Resolve a displacement",
        intro: `A hiker's displacement is ${ds} km at ${th}° north of east. How far east and how far north did the hiker end up?`,
        parts: [num("East part", "d_x", U.km, x), num("North part", "d_y", U.km, y)],
        steps: [
          `Sketch it: the displacement is the hypotenuse. The angle is measured from east, so the east part is adjacent and the north part is opposite.`,
          `$$d_x = d\\cos\\theta = (${ds})\\cos ${th}^\\circ = ${q(x, U.km)}$$`,
          `$$d_y = d\\sin\\theta = (${ds})\\sin ${th}^\\circ = ${q(y, U.km)}$$`,
          `Check: both parts are shorter than ${ds} km, and the bigger part is ${th > 45 ? "north" : "east"} because the angle is ${th > 45 ? "more" : "less"} than 45°.`,
        ],
      };
    }
    const who = c === "kick"
      ? pick(["Mr. White kicks a football", "A soccer ball is kicked", "Mrs. Luksic hits a softball", "A soccer ball is kicked"])
      : "An airliner climbs after takeoff";
    const v = c === "kick" ? rnd(10, 30, 1) : rnd(70, 95, 0);
    const vs = c === "kick" ? fx(v, 1) : String(v);
    const thp = c === "plane" ? rnd(8, 20, 0) : th;
    const x = v * Math.cos(thp * D2R), y = v * Math.sin(thp * D2R);
    return {
      title: "Resolve a velocity",
      intro: `${who} at ${vs} m/s, ${thp}° above the horizontal. Find the horizontal and vertical parts of the velocity.`,
      parts: [num("Horizontal part", "v_{ix}", U.ms, x), num("Vertical part", "v_{iy}", U.ms, y)],
      steps: [
        `Sketch the velocity as the hypotenuse of a right triangle. The angle is measured from the horizontal, so the horizontal part is adjacent (CAH) and the vertical part is opposite (SOH).`,
        `$$v_{ix} = v_i\\cos\\theta = (${vs})\\cos ${thp}^\\circ = ${q(x, U.ms)}$$`,
        `$$v_{iy} = v_i\\sin\\theta = (${vs})\\sin ${thp}^\\circ = ${q(y, U.ms)}$$`,
        `Check with Pythagoras: $\\sqrt{(${sf(x)})^2 + (${sf(y)})^2} \\approx ${vs}$ m/s.`,
      ],
    };
  }

  function fromComponents() {
    if (chance(0.5)) {
      const x = rnd(4, 20, 1), y = rnd(3, 15, 1);
      const v = Math.hypot(x, y), th = Math.atan(y / x) / D2R;
      return {
        title: "Put the parts back together",
        intro: `A ball leaves the ground with $v_{ix} = ${g3(x)}${U.ms}$ and $v_{iy} = ${g3(y)}${U.ms}$. Find its launch speed and launch angle above the horizontal.`,
        parts: [num("Launch speed", "v_i", U.ms, v), num("Launch angle above horizontal", "\\theta", U.deg, th, { abs: 0.6 })],
        steps: [
          `The parts are the legs of a right triangle and the velocity is the hypotenuse.`,
          `$$v_i = \\sqrt{v_{ix}^2 + v_{iy}^2} = \\sqrt{(${g3(x)})^2 + (${g3(y)})^2} = ${q(v, U.ms)}$$`,
          `$$\\theta = \\tan^{-1}\\!\\left(\\frac{v_{iy}}{v_{ix}}\\right) = \\tan^{-1}\\!\\left(\\frac{${g3(y)}}{${g3(x)}}\\right) = ${q(th, U.deg)}$$`,
        ],
      };
    }
    const dx = pick(["east", "west"]), dy = pick(["north", "south"]);
    const x = rnd(100, 900, 0), y = rnd(100, 900, 0);
    const R = Math.hypot(x, y), th = Math.atan(y / x) / D2R;
    return {
      title: "Put the parts back together",
      intro: `A drone ends up ${x} m ${dx} and ${y} m ${dy} of where it took off. Find the size of its displacement and the angle measured from ${dx} toward ${dy}.`,
      parts: [num("Size of the displacement", "R", U.m, R), num(`Angle from ${dx} toward ${dy}`, "\\theta", U.deg, th, { abs: 0.6 })],
      steps: [
        `$$R = \\sqrt{(${x})^2 + (${y})^2} = ${q(R, U.m)}$$`,
        `The ${dx} part is adjacent to the angle and the ${dy} part is opposite: $$\\theta = \\tan^{-1}\\!\\left(\\frac{${y}}{${x}}\\right) = ${q(th, U.deg)}$$`,
        `Displacement: $${q(R, U.m)}$ at $${q(th, U.deg)}$ ${dy[0].toUpperCase()} of ${dx[0].toUpperCase()}.`,
      ],
    };
  }

  // ---------- 2.4 adding vectors with components ----------
  const AX = { E: 0, N: 90, W: 180, S: 270 };
  const ADJ = { E: ["N", "S"], W: ["N", "S"], N: ["E", "W"], S: ["E", "W"] };
  const SGN = { E: [1, 0], W: [-1, 0], N: [0, 1], S: [0, -1] };
  function compassVector(mag) {
    const base = pick(["E", "N", "W", "S"]);
    const tow = pick(ADJ[base]);
    const th = rnd(15, 75, 0);
    // components from the sketch
    const along = mag * Math.cos(th * D2R), across = mag * Math.sin(th * D2R);
    const x = SGN[base][0] * along + SGN[tow][0] * across;
    const y = SGN[base][1] * along + SGN[tow][1] * across;
    const ew = base === "E" || base === "W";
    return { mag, base, tow, th, x, y, label: `${th}° ${tow} of ${base}`, ew };
  }
  function compStep(name, v, u) {
    const xf = v.ew ? "\\cos" : "\\sin", yf = v.ew ? "\\sin" : "\\cos";
    const xs = v.x < 0 ? "-" : "", ys = v.y < 0 ? "-" : "";
    return `$\\vec ${name}$: ${v.mag} ${u} at ${v.label}. Sketch it: it points ${v.x < 0 ? "west" : "east"} and ${v.y < 0 ? "south" : "north"}, so $${name}_x$ is ${v.x < 0 ? "negative" : "positive"} and $${name}_y$ is ${v.y < 0 ? "negative" : "positive"}.
      $$${name}_x = ${xs}(${v.mag})${xf} ${v.th}^\\circ = ${q(v.x, "")} \\qquad ${name}_y = ${ys}(${v.mag})${yf} ${v.th}^\\circ = ${q(v.y, "")}$$`;
  }
  function quadrant(x, y) {
    return (y >= 0 ? "N" : "S") + " of " + (x >= 0 ? "E" : "W");
  }
  const QUADS = ["N of E", "N of W", "S of W", "S of E"];
  function resultantParts(Rx, Ry, u) {
    const R = Math.hypot(Rx, Ry), th = Math.atan(Math.abs(Ry) / Math.abs(Rx)) / D2R;
    return {
      R, th,
      parts: [
        num("x part of the resultant (east is +)", "R_x", u, Rx),
        num("y part of the resultant (north is +)", "R_y", u, Ry),
        num("Size of the resultant", "R", u, R),
        num("Angle measured from the east-west line", "\\theta", U.deg, th, { abs: 0.6 }),
        choice("Direction", QUADS, QUADS.indexOf(quadrant(Rx, Ry))),
      ],
      tail: [
        `$$R = \\sqrt{R_x^2 + R_y^2} = \\sqrt{(${sf(Rx)})^2 + (${sf(Ry)})^2} = ${q(R, U[u === U.km ? "km" : "m"])}$$`,
        `Use sizes for the angle, then read the direction from the signs: $$\\theta = \\tan^{-1}\\!\\left(\\frac{|R_y|}{|R_x|}\\right) = \\tan^{-1}\\!\\left(\\frac{${sf(Math.abs(Ry))}}{${sf(Math.abs(Rx))}}\\right) = ${q(th, U.deg)}$$`,
        `$R_x$ is ${Rx < 0 ? "negative (west)" : "positive (east)"} and $R_y$ is ${Ry < 0 ? "negative (south)" : "positive (north)"}, so the resultant points $${q(th, U.deg)}$ <b>${quadrant(Rx, Ry)}</b>.`,
      ],
    };
  }
  function addComponents() {
    let A, B, Rx, Ry;
    do {
      A = compassVector(rnd(20, 90, 0));
      B = compassVector(rnd(20, 90, 0));
      Rx = A.x + B.x; Ry = A.y + B.y;
    } while (Math.abs(Rx) < 8 || Math.abs(Ry) < 8);
    const ctx = pick([
      ["Mrs. Gordon's cross-country runner", "runs"], ["A sailboat", "sails"], ["A robot vacuum", "rolls"], ["A drone", "flies"],
    ]);
    const r = resultantParts(Rx, Ry, U.m);
    return {
      title: "Add two vectors with components",
      intro: `${ctx[0]} ${ctx[1]} ${A.mag} m at ${A.label}, then ${B.mag} m at ${B.label}. Find the resultant displacement.`,
      parts: r.parts,
      steps: [
        `Resolve each vector into x (east +) and y (north +) parts. Sine or cosine depends on which axis the angle is measured from.`,
        compStep("A", A, "m"),
        compStep("B", B, "m"),
        `Add the parts: $$R_x = A_x + B_x = ${q(Rx, U.m)} \\qquad R_y = A_y + B_y = ${q(Ry, U.m)}$$`,
        ...r.tail,
      ],
    };
  }
  function multiLeg() {
    let legs, Rx, Ry;
    do {
      legs = [];
      const dirs = [pick(["E", "W"]), pick(["N", "S"]), pick(["E", "W", "N", "S"])].sort(() => Math.random() - 0.5);
      for (const d of dirs) legs.push([d, rnd(10, 90, 0) * 10]);
      Rx = legs.reduce((s, [d, m]) => s + SGN[d][0] * m, 0);
      Ry = legs.reduce((s, [d, m]) => s + SGN[d][1] * m, 0);
    } while (Math.abs(Rx) < 80 || Math.abs(Ry) < 80);
    const name = { E: "east", W: "west", N: "north", S: "south" };
    const who = pick(["Mr. Peck walks his route", "A delivery robot drives", "Mrs. Gordon's runner jogs", "Ivy, Mr. Jantz's dog, wanders"]);
    const r = resultantParts(Rx, Ry, U.m);
    const xs = legs.filter(([d]) => d === "E" || d === "W").map(([d, m]) => (d === "W" ? "-" : "+") + m).join(" ").replace(/^\+/, "");
    const ys = legs.filter(([d]) => d === "N" || d === "S").map(([d, m]) => (d === "S" ? "-" : "+") + m).join(" ").replace(/^\+/, "");
    return {
      title: "Resultant of several moves",
      intro: `${who}: ${legs.map(([d, m]) => `${m} m ${name[d]}`).join(", then ")}. Find the resultant displacement.`,
      parts: r.parts,
      steps: [
        `Make a table: east and north are positive, west and south are negative.`,
        `$$R_x = ${xs} = ${q(Rx, U.m)} \\qquad R_y = ${ys} = ${q(Ry, U.m)}$$`,
        ...r.tail,
      ],
    };
  }

  // ---------- 2.5 / 2.6 relative velocity ----------
  function relVelPerp() {
    if (chance(0.7)) {
      const vb = rnd(2.0, 6.0, 1), vc = rnd(0.8, 4.0, 1), d = rnd(40, 200, 0);
      const who = pick(["Mr. White rows a boat", "A kayaker paddles", "A small ferry heads", "Mr. Jantz swims"]);
      const v = Math.hypot(vb, vc), th = Math.atan(vc / vb) / D2R, t = d / vb, x = vc * t;
      return {
        title: "Crossing a river",
        intro: `${who} straight across a ${d} m wide river at ${g3(vb)} m/s relative to the water. The current flows downstream at ${g3(vc)} m/s.`,
        parts: [
          num("Speed relative to the shore", "v", U.ms, v),
          num("Angle downstream from straight across", "\\theta", U.deg, th, { abs: 0.6 }),
          num("Time to cross", "t", U.s, t),
          num("How far downstream it lands", "x_f", U.m, x),
        ],
        steps: [
          `The two velocities are perpendicular: ${g3(vb)} m/s across and ${g3(vc)} m/s downstream. Add them tip-to-tail.`,
          `$$v = \\sqrt{(${g3(vb)})^2 + (${g3(vc)})^2} = ${q(v, U.ms)} \\qquad \\theta = \\tan^{-1}\\!\\left(\\frac{${g3(vc)}}{${g3(vb)}}\\right) = ${q(th, U.deg)}$$`,
          `Crossing only depends on the across part, and the current can't help or hurt it: $$t = \\frac{\\text{width}}{v_{\\text{across}}} = \\frac{${d}}{${g3(vb)}} = ${q(t, U.s)}$$`,
          `During that same time the current carries it downstream: $$x_f = v_{\\text{current}}\\,t = (${g3(vc)})(${sf(t)}) = ${q(x, U.m)}$$`,
        ],
      };
    }
    const vp = rnd(20, 60, 0) * 10, vw = rnd(3, 12, 0) * 10, T = rnd(1.0, 3.0, 1);
    const v = Math.hypot(vp, vw), th = Math.atan(vw / vp) / D2R, x = vw * T;
    return {
      title: "Plane in a crosswind",
      intro: `A plane points due north with an airspeed of ${vp} km/h. A wind blows toward the east at ${vw} km/h.`,
      parts: [
        num("Speed relative to the ground", "v", U.kmh, v),
        num("Angle east of north", "\\theta", U.deg, th, { abs: 0.6 }),
        num(`How far east the wind pushes it in ${fx(T, 1)} h`, "x_f", U.km, x),
      ],
      steps: [
        `North (the plane) and east (the wind) are perpendicular. Add them tip-to-tail.`,
        `$$v = \\sqrt{(${vp})^2 + (${vw})^2} = ${q(v, U.kmh)} \\qquad \\theta = \\tan^{-1}\\!\\left(\\frac{${vw}}{${vp}}\\right) = ${q(th, U.deg)}$$`,
        `East drift: $$x_f = v_{\\text{wind}}\\,t = (${vw})(${fx(T, 1)}) = ${q(x, U.km)}$$`,
      ],
    };
  }

  function relVelAngle() {
    if (chance(0.6)) {
      const vb = rnd(3.0, 6.0, 1), vc = rnd(0.8, 0.8 * vb, 1), d = rnd(40, 200, 0);
      const th = Math.asin(vc / vb) / D2R, v = Math.sqrt(vb * vb - vc * vc), t = d / v;
      return {
        title: "Land directly across",
        intro: `Mr. White can row at ${g3(vb)} m/s relative to the water. The river is ${d} m wide and flows at ${g3(vc)} m/s. He wants to land directly across from where he starts.`,
        parts: [
          num("Angle to aim upstream (from straight across)", "\\theta", U.deg, th, { abs: 0.6 }),
          num("Speed across the river (relative to shore)", "v", U.ms, v),
          num("Time to cross", "t", U.s, t),
        ],
        steps: [
          `To land straight across, the boat's upstream part must cancel the current. Draw it: the boat's ${g3(vb)} m/s is the <b>hypotenuse</b>, the current is the side opposite $\\theta$, and the resultant points straight across.`,
          `$$\\sin\\theta = \\frac{\\text{opp}}{\\text{hyp}} = \\frac{${g3(vc)}}{${g3(vb)}} \\quad\\Rightarrow\\quad \\theta = \\sin^{-1}\\!\\left(\\frac{${g3(vc)}}{${g3(vb)}}\\right) = ${q(th, U.deg)}$$`,
          `The leftover leg is the speed across: $$v = \\sqrt{(${g3(vb)})^2 - (${g3(vc)})^2} = ${q(v, U.ms)}$$`,
          `$$t = \\frac{${d}}{${sf(v)}} = ${q(t, U.s)}$$ Aiming upstream always takes longer than pointing straight across.`,
        ],
      };
    }
    const vp = rnd(20, 50, 0) * 10, vw = rnd(4, 12, 0) * 10, D = rnd(30, 120, 0) * 10;
    const th = Math.asin(vw / vp) / D2R, v = Math.sqrt(vp * vp - vw * vw), t = D / v;
    return {
      title: "Fly due north in a crosswind",
      intro: `A pilot flies at ${vp} km/h relative to the air. The wind blows toward the east at ${vw} km/h. The airport is ${D} km due north.`,
      parts: [
        num("Heading angle west of north", "\\theta", U.deg, th, { abs: 0.6 }),
        num("Speed relative to the ground", "v", U.kmh, v),
        num("Time to reach the airport", "t", U.h, t),
      ],
      steps: [
        `The plane must point partly west so its west part cancels the wind. The plane's ${vp} km/h is the hypotenuse; the wind is opposite $\\theta$.`,
        `$$\\theta = \\sin^{-1}\\!\\left(\\frac{${vw}}{${vp}}\\right) = ${q(th, U.deg)} \\text{ west of north}$$`,
        `$$v = \\sqrt{(${vp})^2 - (${vw})^2} = ${q(v, U.kmh)} \\qquad t = \\frac{${D}}{${sf(v)}} = ${q(t, U.h)}$$`,
      ],
    };
  }

  // ---------- horizontal launches ----------
  const HCTX = [
    { s: "A marble rolls off a lab table", h: [0.75, 1.10, 2], v: [0.80, 2.50, 2], end: "the floor" },
    { s: "Mrs. Luksic throws a softball horizontally from the top of the dugout roof", h: [2.0, 4.0, 2], v: [4.0, 9.0, 2], end: "the ground" },
    { s: "Mr. Lehman drives his motorcycle horizontally off a ramp", h: [5.0, 20.0, 1], v: [15.0, 30.0, 1], end: "the landing area" },
    { s: "Ivy, Mr. Jantz's dog, leaps horizontally off a dock", h: [0.50, 1.50, 2], v: [3.0, 7.0, 1], end: "the water" },
    { s: "A cliff diver runs horizontally off a cliff", h: [12.0, 28.0, 1], v: [2.0, 5.0, 1], end: "the water" },
    { s: "A package slides horizontally off the back of a delivery truck bed", h: [0.90, 1.40, 2], v: [1.0, 4.0, 1], end: "the road" },
  ];
  function hGiven(c) {
    const h = rnd(c.h[0], c.h[1], c.h[2]), v = rnd(c.v[0], c.v[1], c.v[2]);
    return { h, v, hs: g3(h), vs: g3(v) };
  }
  function horizLaunch() {
    const c = pick(HCTX), { h, v, hs, vs } = hGiven(c);
    const t = Math.sqrt(2 * h / G), x = v * t;
    return {
      title: "Horizontal launch",
      intro: `${c.s} at ${vs} m/s. It starts ${hs} m above ${c.end}.`,
      parts: [num("Time in the air", "t", U.s, t), num("Horizontal distance from the edge to where it lands", "x_f", U.m, x)],
      steps: [
        `<b>Set up.</b> It leaves horizontally, so $v_{iy} = 0$. Put the origin on ${c.end} below the edge: $y_i = ${hs}${U.m}$, $y_f = 0$.`,
        xyTable(
          [["x_i", "0", "q"], ["x_f", "?", "g"], ["v_{ix}", qg(vs, U.ms), "q"], ["a_x", "0", "a"]],
          [["y_i", qg(hs, U.m), "q"], ["y_f", "0", "q"], ["v_{iy}", "0", "q"], ["a_y", "-9.8" + U.ms2, "a"]],
          ["?", ""]),
        `<b>Map the route.</b> The goal $x_f$ needs $t$. The y-world has everything else, so it gives $t$.`,
        `<b>Follow the route.</b> y-world: $$y_f = \\tfrac{1}{2}a_y t^2 + v_{iy} t + y_i \\;\\Rightarrow\\; 0 = \\tfrac{1}{2}a_y t^2 + y_i \\;\\Rightarrow\\; t = \\sqrt{\\frac{-2y_i}{a_y}} = \\sqrt{\\frac{-2(${hs})}{-9.8}} = ${q(t, U.s)}$$`,
        `x-world: $$x_f = v_{ix} t + x_i \\;\\Rightarrow\\; x_f = v_{ix} t = (${vs})(${sf(t)}) = ${q(x, U.m)}$$`,
        `<b>Check.</b> Units work, $t$ is positive, and the same $t$ was used in both worlds.`,
      ],
    };
  }

  function horizBackward() {
    const c = pick(HCTX), { h, v, hs, vs } = hGiven(c);
    const t = Math.sqrt(2 * h / G), x = v * t;
    if (chance(0.5)) {
      const xs = sf(x);
      const xv = Number(xs), tt = Math.sqrt(2 * h / G), vv = xv / tt;
      return {
        title: "Horizontal launch: find the launch speed",
        intro: `${c.s}. It starts ${hs} m above ${c.end} and lands ${xs} m from the edge. How fast was it moving when it left?`,
        parts: [num("Time in the air", "t", U.s, tt), num("Launch speed", "v_{ix}", U.ms, vv)],
        steps: [
          xyTable(
            [["x_i", "0", "q"], ["x_f", qg(xs, U.m), "q"], ["v_{ix}", "?", "g"], ["a_x", "0", "a"]],
            [["y_i", qg(hs, U.m), "q"], ["y_f", "0", "q"], ["v_{iy}", "0", "q"], ["a_y", "-9.8" + U.ms2, "a"]],
            ["?", ""]),
          `<b>Map the route.</b> The goal $v_{ix}$ is in the x-world equation, which also needs $t$. The y-world gives $t$.`,
          `y-world: $$0 = \\tfrac{1}{2}a_y t^2 + y_i \\;\\Rightarrow\\; t = \\sqrt{\\frac{-2(${hs})}{-9.8}} = ${q(tt, U.s)}$$`,
          `x-world: $$x_f = v_{ix} t + x_i \\;\\Rightarrow\\; v_{ix} = \\frac{x_f}{t} = \\frac{${xs}}{${sf(tt)}} = ${q(vv, U.ms)}$$`,
        ],
      };
    }
    const xs = sf(x), xv = Number(xs), tt = xv / v, hh = -0.5 * AY * tt * tt;
    return {
      title: "Horizontal launch: how high was it?",
      intro: `${c.s} at ${vs} m/s and lands ${xs} m from the edge. How high above ${c.end} did it start?`,
      parts: [num("Time in the air", "t", U.s, tt), num("Launch height", "y_i", U.m, hh)],
      steps: [
        xyTable(
          [["x_i", "0", "q"], ["x_f", qg(xs, U.m), "q"], ["v_{ix}", qg(vs, U.ms), "q"], ["a_x", "0", "a"]],
          [["y_i", "?", "g"], ["y_f", "0", "q"], ["v_{iy}", "0", "q"], ["a_y", "-9.8" + U.ms2, "a"]],
          ["?", ""]),
        `<b>Map the route.</b> This time the x-world has everything but $t$, so it gives $t$ first.`,
        `x-world: $$x_f = v_{ix} t + x_i \\;\\Rightarrow\\; t = \\frac{x_f}{v_{ix}} = \\frac{${xs}}{${vs}} = ${q(tt, U.s)}$$`,
        `y-world: $$y_f = \\tfrac{1}{2}a_y t^2 + v_{iy} t + y_i \\;\\Rightarrow\\; 0 = \\tfrac{1}{2}a_y t^2 + y_i \\;\\Rightarrow\\; y_i = -\\tfrac{1}{2}a_y t^2 = -\\tfrac{1}{2}(-9.8)(${sf(tt)})^2 = ${q(hh, U.m)}$$`,
      ],
    };
  }

  function velFlightCore(general) {
    const c = pick(HCTX.slice(1)), { h, v, hs, vs } = hGiven(c);
    const vfy = -Math.sqrt(2 * G * h), t = Math.sqrt(2 * h / G);
    const sp = Math.hypot(v, vfy), ang = Math.atan(-vfy / v) / D2R;
    const table = xyTable(
      [["x_i", "0", "q"], ["v_{ix}", qg(vs, U.ms), "q"], ["v_{fx}", "?", "g"], ["a_x", "0", "a"]],
      [["y_i", qg(hs, U.m), "q"], ["y_f", "0", "q"], ["v_{iy}", "0", "q"], ["v_{fy}", "?", "g"], ["a_y", "-9.8" + U.ms2, "a"]],
      ["", ""]);
    if (general) {
      return {
        title: "Velocity at impact",
        intro: `${c.s} at ${vs} m/s. It starts ${hs} m above ${c.end}. Find the time in the air and the velocity parts just before it lands.`,
        parts: [num("Time in the air", "t", U.s, t), num("Horizontal velocity at impact", "v_{fx}", U.ms, v), num("Vertical velocity at impact (down is −)", "v_{fy}", U.ms, vfy)],
        steps: [
          table,
          `y-world for $t$: $$0 = \\tfrac{1}{2}a_y t^2 + y_i \\;\\Rightarrow\\; t = \\sqrt{\\frac{-2(${hs})}{-9.8}} = ${q(t, U.s)}$$`,
          `x-world: $a_x = 0$, so the horizontal velocity never changes: $v_{fx} = v_{ix} = ${qg(vs, U.ms)}$.`,
          `y-world: $$v_{fy} = a_y t + v_{iy} = (-9.8)(${sf(t)}) + 0 = ${q(vfy, U.ms)}$$ Negative, because it's moving down.`,
        ],
      };
    }
    return {
      title: "Velocity at impact",
      intro: `${c.s} at ${vs} m/s. It starts ${hs} m above ${c.end}. Find its velocity just before it lands.`,
      parts: [
        num("Horizontal velocity at impact", "v_{fx}", U.ms, v),
        num("Vertical velocity at impact (down is −)", "v_{fy}", U.ms, vfy),
        num("Speed at impact", "v_f", U.ms, sp),
        num("Angle below the horizontal", "\\theta", U.deg, ang, { abs: 0.6 }),
      ],
      steps: [
        table,
        `x-world: $a_x = 0$, so $v_{fx} = v_{ix} = ${qg(vs, U.ms)}$.`,
        `y-world: the time isn't needed. $$v_{fy}^2 = v_{iy}^2 + 2a_y(y_f - y_i) = 0 + 2(-9.8)(0 - ${hs}) \\;\\Rightarrow\\; v_{fy} = -\\sqrt{${sf(2 * G * h, 4)}} = ${q(vfy, U.ms)}$$ Take the negative root: it's moving down.`,
        `Put the parts together: $$v_f = \\sqrt{v_{fx}^2 + v_{fy}^2} = \\sqrt{(${vs})^2 + (${sf(vfy)})^2} = ${q(sp, U.ms)}$$ $$\\theta = \\tan^{-1}\\!\\left(\\frac{|v_{fy}|}{v_{fx}}\\right) = \\tan^{-1}\\!\\left(\\frac{${sf(-vfy)}}{${vs}}\\right) = ${q(ang, U.deg)} \\text{ below horizontal}$$`,
      ],
    };
  }
  const velFlight = () => velFlightCore(false);
  const velFlightGeneral = () => velFlightCore(true);

  // ---------- angled launches ----------
  const ACTX = [
    { s: "Mr. White punts a football", v: [16, 26, 1], th: [40, 65] },
    { s: "Mr. Jantz kicks a kickball", v: [12, 20, 1], th: [35, 60] },
    { s: "A golfer chips a ball", v: [10, 18, 1], th: [25, 50] },
    { s: "Mrs. Kraus's long jumper leaves the board", v: [8.0, 10.0, 1], th: [18, 25] },
    { s: "A soccer ball is kicked", v: [12, 25, 1], th: [20, 55] },
  ];
  function aGiven() {
    const c = pick(ACTX), v = rnd(c.v[0], c.v[1], c.v[2]), th = rnd(c.th[0], c.th[1], 0);
    return { c, v, th, vs: g3(v), vix: v * Math.cos(th * D2R), viy: v * Math.sin(th * D2R) };
  }
  function splitSteps(vs, th, vix, viy) {
    return `<b>Split the launch velocity:</b> $$v_{ix} = v_i\\cos\\theta = (${vs})\\cos ${th}^\\circ = ${q(vix, U.ms)} \\qquad v_{iy} = v_i\\sin\\theta = (${vs})\\sin ${th}^\\circ = ${q(viy, U.ms)}$$`;
  }
  function angledLevel() {
    const { c, v, th, vs, vix, viy } = aGiven();
    const t = -2 * viy / AY, ymax = -viy * viy / (2 * AY), x = vix * t;
    return {
      title: "Angled launch on level ground",
      intro: `${c.s} at ${vs} m/s, ${th}° above the horizontal. It lands at the same height it started.`,
      parts: [
        num("Horizontal part of the launch velocity", "v_{ix}", U.ms, vix),
        num("Vertical part of the launch velocity", "v_{iy}", U.ms, viy),
        num("Time in the air", "t", U.s, t),
        num("Maximum height", "y_{max}", U.m, ymax),
        num("Range (horizontal distance)", "x_f", U.m, x),
      ],
      steps: [
        splitSteps(vs, th, vix, viy),
        xyTable(
          [["x_i", "0", "q"], ["x_f", "?", "g"], ["v_{ix}", q(vix, U.ms), "q"], ["a_x", "0", "a"]],
          [["y_i", "0", "q"], ["y_f", "0", "q"], ["v_{iy}", q(viy, U.ms), "q"], ["a_y", "-9.8" + U.ms2, "a"]],
          ["?", ""]),
        `<b>Time in the air</b> (y-world, $y_i = y_f = 0$): $$y_f = \\tfrac{1}{2}a_y t^2 + v_{iy} t + y_i \\;\\Rightarrow\\; 0 = t\\left(\\tfrac{1}{2}a_y t + v_{iy}\\right) \\;\\Rightarrow\\; t = \\frac{-2v_{iy}}{a_y} = \\frac{-2(${sf(viy)})}{-9.8} = ${q(t, U.s)}$$ The other root, $t = 0$, is the launch.`,
        `<b>Maximum height</b>: at the top $v_{fy} = 0$. $$v_{fy}^2 = v_{iy}^2 + 2a_y(y_{max} - y_i) \\;\\Rightarrow\\; 0 = v_{iy}^2 + 2a_y y_{max} \\;\\Rightarrow\\; y_{max} = \\frac{-v_{iy}^2}{2a_y} = \\frac{-(${sf(viy)})^2}{2(-9.8)} = ${q(ymax, U.m)}$$`,
        `<b>Range</b> (x-world): $$x_f = v_{ix} t + x_i = (${sf(vix)})(${sf(t)}) = ${q(x, U.m)}$$`,
        `<b>Desmos check:</b> graph $y = -4.9x^2 + ${sf(viy)}x$ (x stands for time). It crosses zero at $x \\approx ${sf(t)}$ and peaks at $y \\approx ${sf(ymax)}$.`,
      ],
    };
  }
  function angledSplit() {
    const { c, th, vs, vix, viy } = aGiven();
    const tup = -viy / AY, t = 2 * tup;
    return {
      title: "Split and symmetry",
      intro: `${c.s} at ${vs} m/s, ${th}° above the horizontal, and it lands at the same height it started.`,
      parts: [
        num("Horizontal part of the launch velocity", "v_{ix}", U.ms, vix),
        num("Vertical part of the launch velocity", "v_{iy}", U.ms, viy),
        num("Time to reach the top", "t_{\\text{top}}", U.s, tup),
        num("Total time in the air", "t", U.s, t),
      ],
      steps: [
        splitSteps(vs, th, vix, viy),
        `<b>Time to the top:</b> at the top the vertical velocity is zero, $v_{fy} = 0$. $$v_{fy} = a_y t + v_{iy} \\;\\Rightarrow\\; 0 = (-9.8)t_{\\text{top}} + ${sf(viy)} \\;\\Rightarrow\\; t_{\\text{top}} = \\frac{${sf(viy)}}{9.8} = ${q(tup, U.s)}$$`,
        `<b>Symmetry:</b> on level ground the way down takes as long as the way up. $$t = 2t_{\\text{top}} = 2(${sf(tup)}) = ${q(t, U.s)}$$`,
      ],
    };
  }
  function cliffAngled() {
    const c = pick([
      { s: "Mr. Lehman's launcher fires a ball from the edge of a cliff", v: [12, 25, 1], th: [20, 45], h: [10, 40, 1], end: "the beach below" },
      { s: "Mr. Jantz throws a water balloon from a balcony", v: [8, 14, 1], th: [20, 45], h: [6, 12, 1], end: "the ground" },
      { s: "Mr. Vincenzo throws a ball from the top of the bleachers", v: [10, 18, 1], th: [25, 50], h: [5, 12, 1], end: "the floor" },
    ]);
    const v = rnd(c.v[0], c.v[1], c.v[2]), th = rnd(c.th[0], c.th[1], 0), h = rnd(c.h[0], c.h[1], c.h[2]);
    const vs = g3(v), hs = g3(h);
    const vix = v * Math.cos(th * D2R), viy = v * Math.sin(th * D2R);
    const A = 0.5 * AY, B = viy, C = h; // 0 = A t² + B t + C
    const disc = B * B - 4 * A * C;
    const r1 = (-B + Math.sqrt(disc)) / (2 * A), r2 = (-B - Math.sqrt(disc)) / (2 * A);
    const t = Math.max(r1, r2), tneg = Math.min(r1, r2);
    const x = vix * t, vfy = AY * t + viy, sp = Math.hypot(vix, vfy), ang = Math.atan(-vfy / vix) / D2R;
    return {
      title: "Angled launch from a height",
      intro: `${c.s} at ${vs} m/s, ${th}° above the horizontal. The launch point is ${hs} m above ${c.end}.`,
      parts: [
        num("Time in the air", "t", U.s, t),
        num("Horizontal distance to where it lands", "x_f", U.m, x),
        num("Speed just before it lands", "v_f", U.ms, sp),
        num("Angle below the horizontal at impact", "\\theta", U.deg, ang, { abs: 0.6 }),
      ],
      steps: [
        splitSteps(vs, th, vix, viy),
        xyTable(
          [["x_i", "0", "q"], ["x_f", "?", "g"], ["v_{ix}", q(vix, U.ms), "q"], ["a_x", "0", "a"]],
          [["y_i", qg(hs, U.m), "q"], ["y_f", "0", "q"], ["v_{iy}", q(viy, U.ms), "q"], ["v_{fy}", "", ""], ["a_y", "-9.8" + U.ms2, "a"]],
          ["?", ""]),
        `<b>Time</b> (y-world): $v_{iy} \\neq 0$ and $y_f \\neq y_i$, so this is a quadratic. $$y_f = \\tfrac{1}{2}a_y t^2 + v_{iy} t + y_i \\;\\Rightarrow\\; 0 = -4.9t^2 + ${sf(viy)}t + ${hs}$$`,
        `Quadratic formula with $a = -4.9$, $b = ${sf(viy)}$, $c = y_i - y_f = ${hs}$: $$t = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} = \\frac{-${sf(viy)} \\pm \\sqrt{(${sf(viy)})^2 - 4(-4.9)(${hs})}}{2(-4.9)}$$ The roots are $t = ${sf(tneg)}$ s (before the launch, so throw it out) and $t = ${q(t, U.s)}$.`,
        `<b>Or use Desmos:</b> graph $y = -4.9x^2 + ${sf(viy)}x + ${hs}$ and click where it crosses $y = 0$ on the right: $x \\approx ${sf(t)}$. On a quiz, write the equation you typed, the point you clicked and what it means.`,
        `<b>Distance</b> (x-world): $$x_f = v_{ix} t + x_i = (${sf(vix)})(${sf(t)}) = ${q(x, U.m)}$$`,
        `<b>Impact velocity:</b> $$v_{fy} = a_y t + v_{iy} = (-9.8)(${sf(t)}) + ${sf(viy)} = ${q(vfy, U.ms)}$$ $$v_f = \\sqrt{(${sf(vix)})^2 + (${sf(vfy)})^2} = ${q(sp, U.ms)} \\qquad \\theta = \\tan^{-1}\\!\\left(\\frac{${sf(-vfy)}}{${sf(vix)}}\\right) = ${q(ang, U.deg)}$$`,
      ],
    };
  }
  function workBackward() {
    if (chance(0.5)) {
      const th = rnd(25, 60, 0), R = rnd(15, 60, 1), Rs = fx(R, 1);
      const s2 = 2 * Math.sin(th * D2R) * Math.cos(th * D2R);
      const v = Math.sqrt(G * R / s2), t = 2 * v * Math.sin(th * D2R) / G;
      const who = pick(["Mr. White wants to punt a football", "Mrs. Luksic wants to throw a softball", "A launcher in the Projectile Launch Project needs to send a ball"]);
      return {
        title: "Work backward: launch speed for a target",
        intro: `${who} ${Rs} m across level ground, launching at ${th}° above the horizontal. What launch speed is needed?`,
        parts: [num("Launch speed", "v_i", U.ms, v), num("Time in the air", "t", U.s, t)],
        steps: [
          `Work in symbols first. Both worlds share the same unknown, $v_i$, through $v_{ix} = v_i\\cos\\theta$ and $v_{iy} = v_i\\sin\\theta$.`,
          `y-world, level ground ($y_i = y_f = 0$): $$0 = \\tfrac{1}{2}a_y t^2 + v_{iy}t \\;\\Rightarrow\\; t = \\frac{-2v_{iy}}{a_y} = \\frac{2v_i\\sin\\theta}{9.8}$$`,
          `x-world: $$x_f = v_{ix}t = (v_i\\cos\\theta)\\left(\\frac{2v_i\\sin\\theta}{9.8}\\right) = \\frac{2v_i^2\\sin\\theta\\cos\\theta}{9.8}$$`,
          `Solve for $v_i$: $$v_i = \\sqrt{\\frac{9.8\\,x_f}{2\\sin\\theta\\cos\\theta}} = \\sqrt{\\frac{9.8(${Rs})}{2\\sin ${th}^\\circ\\cos ${th}^\\circ}} = ${q(v, U.ms)}$$`,
          `Then $$t = \\frac{2(${sf(v)})\\sin ${th}^\\circ}{9.8} = ${q(t, U.s)}$$ <b>Check:</b> doubling the distance needs $\\sqrt{2}$ times the speed, not twice.`,
        ],
      };
    }
    const th = rnd(30, 70, 0), H = rnd(0.30, 1.20, 2), Hs = fx(H, 2);
    const viy = Math.sqrt(-2 * AY * H), v = viy / Math.sin(th * D2R), vix = v * Math.cos(th * D2R);
    const t = -2 * viy / AY, x = vix * t;
    return {
      title: "Work backward from the top",
      intro: `Phoebe leaps at ${th}° above the horizontal and reaches a maximum height of ${Hs} m above the ground. She lands at the height she started.`,
      parts: [num("Vertical launch velocity", "v_{iy}", U.ms, viy), num("Launch speed", "v_i", U.ms, v), num("How far she travels horizontally", "x_f", U.m, x)],
      steps: [
        `At the top, $v_{fy} = 0$ and $y_f = y_{max}$: $$v_{fy}^2 = v_{iy}^2 + 2a_y(y_{max} - y_i) \\;\\Rightarrow\\; v_{iy} = \\sqrt{-2a_y y_{max}} = \\sqrt{-2(-9.8)(${Hs})} = ${q(viy, U.ms)}$$`,
        `$v_{iy}$ is the opposite side of the launch triangle: $$v_i = \\frac{v_{iy}}{\\sin\\theta} = \\frac{${sf(viy)}}{\\sin ${th}^\\circ} = ${q(v, U.ms)} \\qquad v_{ix} = v_i\\cos\\theta = ${q(vix, U.ms)}$$`,
        `Time in the air (level ground): $$t = \\frac{-2v_{iy}}{a_y} = ${q(t, U.s)} \\qquad x_f = v_{ix}t = (${sf(vix)})(${sf(t)}) = ${q(x, U.m)}$$`,
      ],
    };
  }

  window.PRACTICE = {
    scalarVector: { name: "Scalar or vector?", gen: scalarVector },
    perpWalk: { name: "Perpendicular vectors", gen: perpWalk },
    components: { name: "Find the components", gen: components },
    fromComponents: { name: "Resultant from components", gen: fromComponents },
    addComponents: { name: "Add vectors with components", gen: addComponents },
    multiLeg: { name: "Several moves", gen: multiLeg },
    relVelPerp: { name: "Rivers and crosswinds", gen: relVelPerp },
    relVelAngle: { name: "Aim to cancel the current", gen: relVelAngle },
    horizLaunch: { name: "Horizontal launch", gen: horizLaunch },
    horizBackward: { name: "Horizontal launch, backward", gen: horizBackward },
    velFlight: { name: "Velocity at impact", gen: velFlight },
    velFlightGeneral: { name: "Velocity at impact", gen: velFlightGeneral },
    angledSplit: { name: "Split and symmetry", gen: angledSplit },
    angledLevel: { name: "Angled launch, level ground", gen: angledLevel },
    cliffAngled: { name: "Angled launch from a height", gen: cliffAngled },
    workBackward: { name: "Work backward", gen: workBackward },
  };
  window.PRACTICE_UTIL = { sf };
})();
