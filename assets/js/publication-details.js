document.querySelectorAll('.publication-resources').forEach((resources) => {
  const button = resources.querySelector('.detail-toggle');
  const panel = resources.querySelector('.detail-panel');
  const arrow = button.querySelector('.detail-arrow');
  let pinned = false;

  function render(preview = false) {
    resources.classList.toggle('is-preview', preview && !pinned);
    panel.hidden = !pinned && !preview;
    button.setAttribute('aria-expanded', String(!panel.hidden));
    arrow.textContent = pinned ? '▴' : '▾';
  }

  button.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse' || pinned) return;
    render(true);
  });

  button.addEventListener('pointerleave', (event) => {
    if (!panel.contains(event.relatedTarget)) render();
  });

  panel.addEventListener('pointerleave', (event) => {
    if (!button.contains(event.relatedTarget)) render();
  });

  button.addEventListener('click', () => {
    pinned = !pinned;
    render();
  });

  // Escape dismisses only a temporary preview; pinned details close via Detail.
  resources.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !pinned) {
      render();
    }
  });

  render();
  button.hidden = false;
});
