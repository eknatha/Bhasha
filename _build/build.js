// Bhasha build: cd _build && node build.js  -> writes the site into the repo root (parent folder)
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const SRC = path.join(__dirname, 'src'), OUT = path.resolve(process.env.BHASHA_OUT || path.join(__dirname, '..'));
const BASE = process.env.BHASHA_BASE || 'https://bhasha.eknathalabs.com';
const FILES = ['core', 'data', 'ui', 'i18n', 'v-read', 'v-watch', 'v-words', 'v-learn', 'app'];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MARK = fs.readFileSync(path.join(__dirname, 'icons', 'icon.svg'), 'utf8').match(/d="(M29\.2[^"]+)"/)[1];
const ROUTES = [
  ['', 'Bhasha', 'Learn spoken languages from what you watch and read', 'Free language learning tool for Telugu, Hindi, Kannada, Tamil, Malayalam and more. Use your own video, audio or text with clickable words, romanization, read-aloud and spaced repetition. Private and works offline.'],
  ['watch', 'Watch', 'Watch with two subtitle lines', 'Play your own video or audio with a subtitle file. Dual subtitles, clickable words, line repeat, slow speed, pause after each line and shadowing practice. Nothing is uploaded.'],
  ['read', 'Read', 'Read any text with tappable words', 'Paste or open text in Telugu, Hindi, Kannada, Tamil, Malayalam or other languages. Tap a word to hear it, see romanization and save it. Read aloud with sentence highlight.'],
  ['words', 'My words', 'Your saved words', 'Your saved vocabulary, stored only in your browser. Export to CSV, Anki or a backup file and import it back.'],
  ['review', 'Review', 'Spaced repetition review', 'Flashcards with spaced repetition: word to meaning, meaning to word, listening and fill-the-gap.'],
  ['scripts', 'Scripts', 'Learn the scripts', 'Telugu, Hindi, Kannada, Tamil and Malayalam letters, vowel signs and digits with audio, a quick quiz and tracing practice.'],
  ['phrases', 'Phrases', 'Everyday phrases', 'A starter phrasebook of greetings, introductions, daily life and numbers in Telugu, Hindi, Kannada, Tamil and Malayalam with romanization and audio.']
];
fs.mkdirSync(OUT, { recursive: true });
for (const e of fs.readdirSync(OUT, { withFileTypes: true })) { const p = path.join(OUT, e.name); if (e.isDirectory() && ROUTES.some(r => r[0] && r[0] === e.name)) fs.rmSync(p, { recursive: true }); }
for (const f of ['index.html', '404.html', 'app.js', 'app.css', 'sw.js', 'sitemap.xml', 'robots.txt', 'site.webmanifest', 'favicon.svg']) fs.rmSync(path.join(OUT, f), { force: true });
const bundle = FILES.map(f => fs.readFileSync(path.join(SRC, f + '.js'), 'utf8')).join('\n;\n');
const css = fs.readFileSync(path.join(SRC, 'app.css'), 'utf8');
const ver = crypto.createHash('sha1').update(bundle + css).digest('hex').slice(0, 10);
fs.writeFileSync(path.join(OUT, 'app.js'), bundle); fs.writeFileSync(path.join(OUT, 'app.css'), css);
if (!fs.existsSync(path.join(OUT, 'assets'))) throw new Error('assets/fonts missing');
const THEME = "(function(){try{var t=localStorage.getItem('el-theme');if(t!=='light'&&t!=='dark'&&t!=='new')t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}})()";
function page({ title, desc, url, body, ld, canon = true }) {
  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#1c1b4b">
${canon ? `<link rel="canonical" href="${url}">\n` : ''}<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="website"><meta property="og:site_name" content="Bhasha by EknathaLabs">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
<script>${THEME}</script>
<link rel="preload" href="/assets/fonts/poppins-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/app.css?v=${ver}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<a class="skip" href="#app">Skip to content</a>
<header class="top" id="hdr"><div class="wrap bar"><a class="brand" href="/"><b><svg viewBox="14 14 36 36" width="22" height="22" aria-hidden="true"><path d="${MARK}" fill="currentColor"/></svg></b><span>Bhasha<small>EknathaLabs</small></span></a></div></header>
<main class="wrap" id="app" tabindex="-1">
${body}
<noscript><p class="note">Bhasha needs JavaScript. It runs entirely in your browser and sends nothing anywhere.</p></noscript>
</main>
<footer class="foot" id="ftr"><div class="wrap"><span>Part of EknathaLabs · <a href="https://eknathalabs.com/">eknathalabs.com</a></span></div></footer>
<div class="toast" id="toast" role="status" hidden></div>
<script src="/app.js?v=${ver}" defer></script>
</body>
</html>
`;
}
const pub = { '@type': 'Organization', name: 'EknathaLabs', url: 'https://eknathalabs.com/' };
const nav = `<ul>${ROUTES.slice(1).map(r => `<li><a href="/${r[0]}/">${esc(r[1])}</a>: ${esc(r[2])}</li>`).join('')}</ul>`;
ROUTES.forEach(([id, name, h1, desc]) => {
  const url = BASE + '/' + (id ? id + '/' : '');
  const body = id ? `<h1>${esc(h1)}</h1><p class="lede">${esc(desc)}</p>${nav}` : `<section class="hero"><h1>${esc(h1)}</h1><p class="lede">${esc(desc)}</p></section>${nav}`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'WebApplication', name: id ? `Bhasha ${name}` : 'Bhasha', url, description: desc, applicationCategory: 'EducationalApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, isPartOf: { '@type': 'WebSite', name: 'Bhasha', url: BASE + '/' }, publisher: pub }];
  if (id) ld.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Bhasha', item: BASE + '/' }, { '@type': 'ListItem', position: 2, name: name, item: url }] });
  const title = id ? `${name}: ${h1} | Bhasha by EknathaLabs` : 'Bhasha: learn spoken languages from what you watch and read | EknathaLabs';
  const html = page({ title, desc, url, body, ld });
  if (id) { fs.mkdirSync(path.join(OUT, id), { recursive: true }); fs.writeFileSync(path.join(OUT, id, 'index.html'), html); } else { fs.writeFileSync(path.join(OUT, 'index.html'), html); fs.writeFileSync(path.join(OUT, '404.html'), html.replace(/<link rel="canonical"[^>]*>\n/, '')); }
});
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${ROUTES.map(r => `<url><loc>${BASE}/${r[0] ? r[0] + '/' : ''}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, 'site.webmanifest'), JSON.stringify({ name: 'Bhasha', short_name: 'Bhasha', description: 'Learn spoken languages from what you watch and read', start_url: '/', scope: '/', display: 'standalone', background_color: '#fff9ee', theme_color: '#1c1b4b', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }] }));
fs.copyFileSync(path.join(__dirname, 'icons', 'icon.svg'), path.join(OUT, 'favicon.svg'));
for (const f of ['icon-192.png', 'icon-512.png']) { const p = path.join(__dirname, 'icons', f); if (fs.existsSync(p)) fs.copyFileSync(p, path.join(OUT, f)); }
const pre = ['/', ...ROUTES.filter(r => r[0]).map(r => '/' + r[0] + '/'), '/app.js?v=' + ver, '/app.css?v=' + ver, '/favicon.svg', '/site.webmanifest', ...['poppins-latin-400-normal', 'poppins-latin-600-normal', 'poppins-latin-700-normal', 'poppins-latin-800-normal', 'jetbrains-mono-latin-400-normal'].map(f => `/assets/fonts/${f}.woff2`)];
fs.writeFileSync(path.join(OUT, 'sw.js'), `const V='bhasha-${ver}',PRE=${JSON.stringify(pre)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(PRE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('bhasha-')&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
 e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));}return res;}).catch(()=>caches.match('/'))));});
`);
console.log('built Bhasha, version', ver, '->', OUT);
