(function (root) {
  const key = 'summit-peak-experience';
  const valid = value => ['renters', 'owners', 'overview'].includes(value);
  function read(storage) {
    try { const value = storage.getItem(key); return valid(value) ? value : null; } catch { return null; }
  }
  function save(storage, value) {
    if (!valid(value)) return;
    try { storage.setItem(key, value); } catch { /* The links still work without storage. */ }
  }
  function fromPath(path) {
    const match = path.match(/^\/(renters|owners)(?:\/|$)/);
    return match ? match[1] : null;
  }
  function contextualLink(href, audience) {
    if (!['renters', 'owners'].includes(audience)) return href;
    const base = '/' + audience + '/';
    const mapping = { '/': base, '/#contact': base + '#contact', '/#services': base + (audience === 'owners' ? '#services' : '#process'), '/#service-areas': base + '#service-areas', '/#owners': '/owners/', '/#residents': '/renters/', '/military/': base + 'military/', '/guides/': base + 'guides/', '/faq/': base + 'faq/' };
    return mapping[href] || href;
  }
  const api = { key, read, save, fromPath, contextualLink };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SummitAudience = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
