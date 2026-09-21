(() => {
  const state = window.SummitAudience;
  let storage;
  try { storage = window.sessionStorage; } catch { storage = null; }
  const pathChoice = state.fromPath(location.pathname);
  const savedChoice = state.read(storage);
  const audience = pathChoice || (savedChoice === 'overview' ? null : savedChoice);
  const dialog = document.querySelector('#audience-dialog');
  const switchButton = document.querySelector('[data-open-audience]');
  let previousFocus;
  if (pathChoice) state.save(storage, pathChoice);

  if (audience) {
    document.querySelector('[data-audience-label]').textContent = audience === 'renters' ? 'For renters' : 'For property owners';
    document.body.dataset.audience = audience;
    if (!pathChoice) {
      const prefix = '/' + audience + '/';
      const links = audience === 'renters'
        ? [['Find a home', '#contact'], ['Resident support', '#support'], ['Military moves', 'military/'], ['Q&A', 'faq/'], ['Guides', 'guides/']]
        : [['Our services', '#services'], ['Rent protection', '#protection'], ['Military moves', 'military/'], ['Q&A', 'faq/'], ['Guides', 'guides/']];
      const nav = document.querySelector('#navigation');
      const items = links.map(([label, route]) => {
        const link = document.createElement('a'); link.textContent = label; link.href = prefix + route; return link;
      });
      const contact = document.createElement('a'); contact.className = 'button button-dark nav-cta'; contact.href = prefix + '#contact'; contact.textContent = 'Contact us ↗';
      const extras = nav.querySelector('.navigation-extras');
      nav.replaceChildren(...items, contact, ...(extras ? [extras] : []));
      document.querySelectorAll('a[href]').forEach(link => {
        if (!link.closest('#audience-dialog')) link.setAttribute('href', state.contextualLink(link.getAttribute('href'), audience));
      });
      // Keep a shared article useful for the selected audience.
      const heading = document.querySelector('.page-cta h2');
      if (heading) heading.textContent = audience === 'renters' ? 'Your next home starts with a conversation.' : 'Let’s make property ownership easier.';
      document.querySelectorAll('.related-guides .guide-card').forEach(card => {
        const href = card.querySelector('a')?.getAttribute('href') || '';
        const relevant = audience === 'renters' ? /military-renting|renter-screening/.test(href) : !/military-renting/.test(href);
        card.hidden = !relevant;
      });
    }
  }

  function openChoice() {
    if (!dialog || dialog.open) return;
    previousFocus = document.activeElement;
    if (typeof closeMenu === 'function') closeMenu();
    dialog.showModal();
    document.body.classList.add('audience-modal-open');
    document.querySelector('#audience-title').focus();
  }
  function dismissChoice() {
    if (!audience && !savedChoice) state.save(storage, 'overview');
    dialog.close();
  }
  switchButton?.addEventListener('click', openChoice);
  dialog?.querySelector('.audience-close').addEventListener('click', dismissChoice);
  dialog?.querySelector('.audience-skip').addEventListener('click', () => {
    state.save(storage, 'overview');
    if (location.pathname !== '/' || audience) location.assign('/');
    else dialog.close();
  });
  dialog?.addEventListener('cancel', event => { event.preventDefault(); dismissChoice(); });
  dialog?.addEventListener('close', () => {
    document.body.classList.remove('audience-modal-open');
    if (previousFocus?.isConnected && previousFocus !== document.body && !previousFocus.closest?.('#navigation')) previousFocus.focus();
    else document.querySelector('.menu-toggle')?.focus();
  });
  document.querySelectorAll('[data-select-audience]').forEach(link => link.addEventListener('click', () => {
    state.save(storage, link.dataset.selectAudience);
  }));

  if (location.pathname === '/' && !location.hash && audience) {
    location.replace('/' + audience + '/');
  } else if (!audience && !savedChoice && !location.pathname.startsWith('/privacy')) {
    openChoice();
  }
})();
