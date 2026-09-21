const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const audienceState = require('./public/audience-state.js');

// Exercise the actual navigation script with a minimal DOM adapter. Layout and
// native dialog focus trapping still require a real browser review.
async function experience({ pathname = '/', hash = '', saved = null, blocked = false } = {}) {
  const nodes = new Map();
  function element() {
    return { dataset: {}, events: {}, isConnected: true,
      classList: { add() {}, remove() {} },
      addEventListener(name, callback) { this.events[name] = callback; },
      focus() { this.focused = true; },
      querySelector(selector) { return get(selector); },
      replaceChildren(...children) { this.children = children; }
    };
  }
  function get(selector) {
    if (!nodes.has(selector)) nodes.set(selector, element());
    return nodes.get(selector);
  }
  const dialog = get('#audience-dialog');
  dialog.open = false;
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; dialog.events.close?.(); };
  const choices = ['renters', 'owners'].map(value => Object.assign(element(), { dataset: { selectAudience: value } }));
  const storage = {
    getItem() { if (blocked) throw Error('Storage disabled'); return saved; },
    setItem(key, value) { if (blocked) throw Error('Storage disabled'); assert.equal(key, audienceState.key); saved = value; }
  };
  const location = { pathname, hash, replace(url) { this.replaced = url; }, assign(url) { this.assigned = url; } };
  const body = element();
  const document = { body, activeElement: body, querySelector: get, createElement: element,
    querySelectorAll(selector) { return selector === '[data-select-audience]' ? choices : []; }
  };
  vm.runInNewContext(await fs.readFile(path.join(__dirname, 'public/audience.js'), 'utf8'), {
    window: { SummitAudience: audienceState, sessionStorage: storage }, document, location
  });
  return { dialog, get, choices, location, saved: () => saved, body };
}

test('experience selection, return visits, switching, and privacy access', async () => {
  const first = await experience();
  assert.equal(first.dialog.open, true);
  assert.equal(first.get('#audience-title').focused, true);
  first.choices[0].events.click();
  assert.equal(first.saved(), 'renters');
  const returning = await experience({ saved: first.saved() });
  assert.equal(returning.location.replaced, '/renters/');
  assert.equal(returning.dialog.open, false);
  const direct = await experience({ pathname: '/owners/faq/', saved: 'renters' });
  assert.equal(direct.saved(), 'owners');
  assert.equal(direct.body.dataset.audience, 'owners');
  direct.get('[data-open-audience]').events.click();
  assert.equal(direct.dialog.open, true);
  direct.choices[0].events.click();
  assert.equal(direct.saved(), 'renters');
  const dismiss = await experience();
  dismiss.dialog.events.cancel({ preventDefault() {} });
  assert.equal(dismiss.dialog.open, false);
  assert.equal(dismiss.saved(), 'overview');
  assert.equal(dismiss.get('.menu-toggle').focused, true);
  assert.equal((await experience({ saved: 'overview' })).dialog.open, false);
  assert.equal((await experience({ pathname: '/privacy/' })).dialog.open, false);
  const deep = await experience({ pathname: '/guides/one-month-rent-protection/', saved: 'owners' });
  assert.equal(deep.location.replaced, undefined);
  assert.equal(deep.get('#navigation').children[0].href, '/owners/#services');
  deep.get('[data-open-audience]').events.click();
  deep.get('.audience-skip').events.click();
  assert.equal(deep.saved(), 'overview');
  assert.equal(deep.location.assigned, '/');
});

test('experience selection tolerates unavailable or invalid storage', async () => {
  const unavailable = await experience({ blocked: true });
  assert.equal(unavailable.dialog.open, true);
  assert.doesNotThrow(() => unavailable.choices[1].events.click());
  assert.equal((await experience({ saved: 'unexpected' })).dialog.open, true);
  assert.equal(audienceState.fromPath('/owners-news/'), null);
  assert.equal(audienceState.contextualLink('/#contact', 'renters'), '/renters/#contact');
  assert.equal(audienceState.contextualLink('/privacy/', 'owners'), '/privacy/');
  assert.equal(audienceState.contextualLink('https://example.com/', 'owners'), 'https://example.com/');
});

test('site assets, inquiry validation, persistence, and private file isolation', async () => {
  const directory = path.join(__dirname, '.verification', 'inquiries');
  await fs.mkdir(directory, { recursive: true });
  const server = spawn(process.execPath, ['server.cjs'], {
    cwd: __dirname, env: { ...process.env, PORT: '4347', INQUIRY_DIRECTORY: directory }, stdio: ['ignore', 'pipe', 'pipe']
  });
  try {
    await new Promise((resolve, reject) => {
      let output = '';
      const timeout = setTimeout(() => reject(new Error('Server startup timed out')), 10000);
      server.on('error', error => { clearTimeout(timeout); reject(error); });
      server.on('exit', code => { clearTimeout(timeout); reject(new Error(`Server exited: ${code}`)); });
      server.stdout.on('data', data => {
        output += data;
        if (output.includes('(::1)') && output.includes('(127.0.0.1)')) { clearTimeout(timeout); resolve(); }
      });
    });
    const base = 'http://127.0.0.1:4347';
    for (const url of [base, 'http://[::1]:4347']) {
      const response = await fetch(url);
      assert.equal(response.status, 200);
      assert.match(await response.text(), /Property management,/);
    }
    const html = await (await fetch(base)).text();
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
    for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(id), `Missing anchor: ${id}`);
    for (const [url, type] of [['/styles.css', 'text/css'], ['/app.js', 'text/javascript'], ['/assets/home.jpg', 'image/jpeg'], ['/assets/interior.jpg', 'image/jpeg'], ['/assets/mark.svg', 'image/svg+xml']]) {
      const response = await fetch(base + url);
      assert.equal(response.status, 200);
      assert.ok(response.headers.get('content-type').startsWith(type));
      assert.ok((await response.arrayBuffer()).byteLength > 100);
    }
    for (const url of ['/server.cjs', '/package.json', '/data/inquiries.jsonl', '/%2e%2e%5cserver.cjs', '/missing.jpg']) assert.equal((await fetch(base + url)).status, 404);
    const routes = ['/', '/about/', '/military/', '/faq/', '/guides/', '/privacy/', ...['renters', 'owners'].flatMap(audience => ['', 'faq/', 'guides/', 'military/'].map(page => '/' + audience + '/' + page)), ...require('./site/content.cjs').articles.map(article => '/guides/' + article.slug + '/')];
    const documents = new Map();
    const titles = new Set();
    for (const route of routes) {
      const response = await fetch(base + route);
      assert.equal(response.status, 200, route);
      const document = await response.text();
      documents.set(route, document);
      assert.equal((document.match(/<h1\b/g) || []).length, 1, 'One main heading: ' + route);
      const title = document.match(/<title>(.*?)<\/title>/)[1];
      assert.ok(!titles.has(title), 'Unique title: ' + route);
      titles.add(title);
      for (const match of document.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
      assert.ok(document.includes('Veteran owned &amp; operated'), 'Veteran identity: ' + route);
      assert.ok(document.includes('/navigation.js'), 'Shared navigation: ' + route);
      assert.ok(document.includes('href="/privacy/"'), 'Privacy notice link: ' + route);
      assert.ok(document.includes('<dialog id="audience-dialog"'), 'Experience selector: ' + route);
      assert.ok(document.includes('data-open-audience'), 'Experience switch: ' + route);
      if (route !== '/') {
        const redirect = await fetch(base + route.slice(0, -1), { redirect: 'manual' });
        assert.equal(redirect.status, 301);
        assert.equal(redirect.headers.get('location'), route);
      }
    }
    for (const [route, document] of documents) {
      for (const [, href] of document.matchAll(/href="([/#][^"]*)"/g)) {
        const target = new URL(href, base + route);
        if (/\.(css|svg|jpg|png|txt|xml|md)$/.test(target.pathname)) continue;
        assert.ok(documents.has(target.pathname), 'Known page: ' + href);
        if (target.hash) assert.ok(documents.get(target.pathname).includes('id="' + target.hash.slice(1) + '"'), 'Valid anchor: ' + href);
      }
    }
    for (const asset of ['/navigation.js', '/resources.js', '/readability.css', '/pages.css', '/audience.css', '/audience-state.js', '/audience.js', '/inquiry.js']) assert.equal((await fetch(base + asset)).status, 200, asset);
    const renterHome = documents.get('/renters/');
    const ownerHome = documents.get('/owners/');
    assert.match(renterHome, /data-audience="renters"/);
    assert.match(ownerHome, /data-audience="owners"/);
    const interests = html => html.match(/<select name="interest"[\s\S]*?<\/select>/)[0];
    assert.match(interests(renterHome), /Resident question/);
    assert.doesNotMatch(interests(renterHome), /Property management/);
    assert.match(interests(ownerHome), /Property management/);
    assert.doesNotMatch(interests(ownerHome), /Rental availability/);
    assert.match(documents.get('/privacy/'), /session storage/);
    const { siteUrl } = require('./site/config.cjs');
    const sitemapResponse = await fetch(base + '/sitemap.xml');
    assert.equal(sitemapResponse.status, 200);
    assert.match(sitemapResponse.headers.get('content-type'), /^application\/xml/);
    const sitemap = await sitemapResponse.text();
    assert.ok(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'));
    const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
    assert.deepEqual(new Set(locations), new Set(routes.map(route => siteUrl + route)));
    assert.equal(locations.length, routes.length);
    assert.ok(!sitemap.includes('<lastmod>'), 'Do not invent modification dates');
    const robots = await (await fetch(base + '/robots.txt')).text();
    assert.ok(robots.includes('Sitemap: ' + siteUrl + '/sitemap.xml'));
    const llmsResponse = await fetch(base + '/llms.txt');
    assert.equal(llmsResponse.status, 200);
    assert.match(llmsResponse.headers.get('content-type'), /^text\/plain/);
    const llms = await llmsResponse.text();
    assert.match(llms, /^# Summit Peak Property Management\n/);
    assert.ok(llms.includes('contact@summitpeakpm.com'));
    assert.ok(llms.includes('one month of rent protection'));
    assert.ok(llms.includes('Eligibility, exclusions, payment timing'));
    for (const [route, document] of documents) {
      const markdownPath = route + 'index.md';
      assert.ok(llms.includes(siteUrl + markdownPath), 'Markdown in LLM index: ' + route);
      assert.ok(document.includes('rel="canonical" href="' + siteUrl + route + '"'));
      assert.ok(document.includes('rel="alternate" type="text/markdown" href="' + markdownPath + '"'));
      const response = await fetch(base + markdownPath);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /^text\/markdown/);
      const text = await response.text();
      assert.equal((text.match(/^# /gm) || []).length, 1);
      assert.ok(text.includes('Source: ' + siteUrl + route));
      assert.ok(!/<(?:script|form|svg)\b/.test(text));
    }
    assert.equal((await fetch(base + '/%ZZ')).status, 400);
    const head = await fetch(base, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    const submit = (body, headers = {}) => fetch(base + '/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
    for (const body of ['{', 'null', {}, { name: 'Test' }]) assert.equal((await submit(body)).status, 400);
    assert.equal((await submit('x'.repeat(17000))).status, 413);
    const inquiry = { name: ' Preview Test ', email: 'preview@example.com', phone: '', interest: 'Property management', message: 'Local verification inquiry.' };
    assert.equal((await submit({ ...inquiry, email: 'invalid' })).status, 400);
    assert.equal((await submit(inquiry, { Origin: 'https://unrelated.example' })).status, 403);
    assert.equal((await fetch(base + '/api/inquiries')).status, 405);
    const response = await submit(inquiry);
    assert.equal(response.status, 201);
    const result = await response.json();
    assert.equal(result.received, true);
    const records = (await fs.readFile(path.join(directory, 'inquiries.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
    assert.equal(records.at(-1).id, result.id);
    assert.equal(records.at(-1).name, 'Preview Test');
    assert.equal(records.at(-1).message, inquiry.message);
  } finally {
    server.kill();
    // Only remove this test's known output file; never production inquiries.
    await fs.unlink(path.join(directory, 'inquiries.jsonl')).catch(() => {});
  }
});
