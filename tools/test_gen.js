global.window = global;
require('../vendor/katex/katex.min.js');
const katex = global.katex || require('../vendor/katex/katex.min.js');
require('../js/practice.js');
let errs = 0;
for (const [k, p] of Object.entries(PRACTICE)) {
  for (let i = 0; i < 300; i++) {
    const pr = p.gen();
    for (const pt of pr.parts) if (pt.type === 'num' && !isFinite(pt.value)) { errs++; console.log('NaN', k, pt.ask); }
    const all = [pr.intro, ...pr.steps].join(' ');
    if (/NaN|undefined|Infinity/.test(all)) { errs++; console.log('bad text', k, all.match(/.{40}(NaN|undefined|Infinity).{20}/)); break; }
    const maths = [...all.matchAll(/\$\$([\s\S]+?)\$\$/g)].map(m => m[1]);
    const rest = all.replace(/\$\$[\s\S]+?\$\$/g, '');
    maths.push(...[...rest.matchAll(/\$([^$]+?)\$/g)].map(m => m[1]));
    for (const pt of pr.parts) if (pt.type==='num') maths.push(pt.sym + ' = ' + pt.value + pt.unit);
    for (const m of maths) { try { katex.renderToString(m, { throwOnError: true }); } catch (e) { errs++; if (errs < 10) console.log('katex', k, m.slice(0, 80), e.message.slice(0, 80)); } }
  }
}
console.log('errors', errs);
const s = PRACTICE.cliffAngled.gen(); console.log(JSON.stringify(s.parts.map(p=>[p.ask,p.value])), s.intro);
