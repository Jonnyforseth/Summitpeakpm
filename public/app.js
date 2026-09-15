const services = {
  management: { title: 'Property management', description: 'One point of contact for property owners and renters across Colorado Springs and El Paso County. Summit Peak handles communication so you can step back from everyday renter conversations.', items: ['Direct communication through Summit Peak.', 'Local support while you are nearby or away.', 'Clear expectations for owner updates and approvals.'], interest: 'Property management' },
  leasing: { title: 'Leasing & placement', description: 'We connect property owners with carefully vetted renters and support both sides through an organized rental process.', items: ['Careful review of prospective renters.', 'Clear application and move-in communication.', 'Personal support for owners and renters.'], interest: 'Leasing & placement' },
  owners: { title: 'Owner support', description: 'Local experience and a clear plan when a renter misses payment. Summit Peak offers one month of rent protection while managing communication and the next steps.', items: ['Ask Summit Peak for written coverage details.', 'Understand eligibility, timing, and exclusions.', 'Discuss resolution of unpaid rent and appropriate legal steps.'], interest: 'Owner support' }
};
const dialog = document.querySelector('#service-dialog');
document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
  const service = services[button.dataset.service];
  document.querySelector('#dialog-title').textContent = service.title;
  document.querySelector('#dialog-description').textContent = service.description;
  document.querySelector('#dialog-list').replaceChildren(...service.items.map(item => { const li = document.createElement('li'); li.textContent = item; return li; }));
  document.querySelector('#dialog-cta').dataset.interest = service.interest;
  dialog.showModal();
  document.body.classList.add('modal-open');
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
document.querySelector('#dialog-cta').addEventListener('click', (event) => {
  document.querySelector('#interest').value = event.currentTarget.dataset.interest;
  dialog.close();
});
document.querySelector('#year').textContent = new Date().getFullYear();
const form = document.querySelector('#inquiry-form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  const status = document.querySelector('#form-status');
  button.disabled = true;
  status.classList.remove('error');
  status.textContent = 'Submitting your inquiry…';
  try {
    const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Please try again.');
    status.textContent = 'Thank you. Your inquiry has been received.';
    form.reset();
  } catch (error) {
    status.classList.add('error');
    status.textContent = `Your inquiry wasn’t submitted. ${error.message === 'Failed to fetch' ? 'Check your connection and try again.' : error.message}`;
  } finally { button.disabled = false; }
});
