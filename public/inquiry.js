(() => {
  const form = document.querySelector('#inquiry-form');
  if (!form) return;
  form.addEventListener('submit', async event => {
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
})();
