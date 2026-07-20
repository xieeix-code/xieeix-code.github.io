(() => {
  const dialog = document.querySelector('#pdf-viewer');
  const frame = document.querySelector('#pdf-frame');
  const title = document.querySelector('#pdf-viewer-title');
  const download = document.querySelector('#pdf-download');
  const closeButton = document.querySelector('.pdf-dialog__close');
  const pdfLinks = document.querySelectorAll('a[href$=".pdf"], a[href*=".pdf?"]');

  if (!dialog || !frame || !title || !download || !closeButton || typeof dialog.showModal !== 'function') return;

  let trigger = null;

  const closeViewer = () => {
    if (dialog.open) dialog.close();
  };

  pdfLinks.forEach((link) => {
    link.setAttribute('aria-haspopup', 'dialog');

    link.addEventListener('click', (event) => {
      event.preventDefault();
      trigger = link;

      const publicationTitle = link.closest('.publication')?.querySelector('h3')?.textContent;
      const isCv = link.textContent.trim().toUpperCase() === 'CV';
      const viewerTitle = publicationTitle?.replace(/\s+/g, ' ').trim() || (isCv ? 'Yuhang Xie — CV' : 'PDF Viewer');
      const pdfUrl = new URL(link.href, window.location.href);

      title.textContent = viewerTitle;
      frame.title = viewerTitle;
      frame.src = `${pdfUrl.href}#view=FitH`;
      download.href = pdfUrl.href;
      document.body.classList.add('pdf-viewer-open');
      dialog.showModal();
    });
  });

  closeButton.addEventListener('click', closeViewer);

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeViewer();
  });

  dialog.addEventListener('close', () => {
    frame.src = 'about:blank';
    document.body.classList.remove('pdf-viewer-open');
    trigger?.focus();
    trigger = null;
  });
})();
