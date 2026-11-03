import 'server-only'

/**
 * Re-skins the plan pages with the ÉLEVÉ website palette and type
 * (obsidian, charcoal, warm ivory, champagne gold, antique bronze; Cormorant Garamond + Manrope).
 * Injected after the page's own styles; the tripled :root beats its light/dark theme rules.
 */
export const planFontsLink =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Manrope:wght@400;500;600;700&display=swap">'

export const planThemeStyle = `<style>
:root:root:root{
  color-scheme:dark;
  --paper:#111114; --surface:#1b1a1e; --ink:#f5f0e8; --muted:rgb(245 240 232 / .66); --line:rgb(201 170 120 / .18);
  --leaf:#c9aa78; --leaf-soft:rgb(201 170 120 / .12);
  --gold:#b8a088; --gold-soft:rgb(141 119 96 / .2);
  --alert:#e08a7a; --alert-soft:rgb(224 138 122 / .12);
  --display:"Cormorant Garamond", Georgia, serif;
  --body:"Manrope", system-ui, sans-serif;
  --mono:"Manrope", system-ui, sans-serif;
}
body{-webkit-font-smoothing:antialiased}
h1,h2,.big,.prio-n,.s6 .num{font-weight:500;letter-spacing:-.01em}
h1{font-size:clamp(2.6rem,6vw,4.2rem);line-height:1}
h2{font-size:clamp(1.9rem,3.8vw,2.6rem)}
.big{font-size:2.8rem}
.eyebrow,.brandline,th,.tag,.who,.lvl,.example,.confstatus,.brief h4{letter-spacing:.2em;font-weight:600}
.eyebrow{font-size:.7rem}
.meta,.sync,.when,.due,.phase-head .when,.phase-head .pct,.stage-btn .k,.fstep .n,.link{letter-spacing:.04em}
header.hero{background:linear-gradient(180deg,var(--surface),var(--paper))}
nav.toc{background:rgb(17 17 20 / .92)}
nav.toc a,.chipbtn{border-radius:2px}
nav.toc a:hover{color:var(--leaf)}
.card,.phase,.progress-card,.tbl,.brief,details,.stage-btn,.node,.src,.agent-panel,.agent-tab,.fstep,.s6,.btn,.inp,.firmtag,.hrs input{border-radius:4px}
.callout{border-radius:0 4px 4px 0}
.bar{border-radius:0;height:4px}
.bar > i{background:var(--leaf)}
.tag,.who,.lvl,.example,.confstatus{border-radius:2px}
.btn.primary,.chipbtn[aria-pressed="true"]{background:var(--leaf);color:var(--paper);border-color:var(--leaf)}
pre.tree{background:var(--surface);color:var(--ink);border:1px solid var(--line)}
a{color:var(--leaf)}
::selection{background:rgb(201 170 120 / .35)}
</style>`
