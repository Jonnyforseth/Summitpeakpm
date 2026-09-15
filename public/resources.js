document.querySelectorAll('[data-resource]').forEach(resource => {
  const tools = resource.querySelector('.resource-tools');
  tools.hidden = false;
  const search = resource.querySelector('input[type="search"]');
  const items = [...resource.querySelectorAll('[data-category]')];
  let category = 'All';
  function filter() {
    const query = (search?.value || '').trim().toLocaleLowerCase();
    let visible = 0;
    items.forEach(item => {
      const matches = (category === 'All' || item.dataset.category === category) && item.textContent.toLocaleLowerCase().includes(query);
      item.hidden = !matches;
      if (matches) visible++;
    });
    const noun = resource.dataset.resource === 'faq' ? 'question' : 'guide';
    resource.querySelector('.result-count').textContent = `${visible} ${noun}${visible === 1 ? '' : 's'} found`;
    resource.querySelector('.empty-state').hidden = visible !== 0;
  }
  resource.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    resource.querySelectorAll('[data-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    filter();
  }));
  search?.addEventListener('input', filter);
  function openLinkedQuestion() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const item = document.getElementById(id);
    if (item?.matches('details') && resource.contains(item)) {
      category = 'All';
      if (search) search.value = '';
      resource.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === 'All')));
      filter();
      item.open = true;
      item.scrollIntoView({ block: 'start' });
    }
  }
  window.addEventListener('hashchange', openLinkedQuestion);
  filter();
  openLinkedQuestion();
});
