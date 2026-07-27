(() => {
  const modifiedElement = document.querySelector('#last-modified');
  const footerModifiedElement = document.querySelector('#footer-last-modified');
  if (!modifiedElement && !footerModifiedElement) return;

  const modifiedDate = new Date(document.lastModified);
  if (Number.isNaN(modifiedDate.getTime())) return;

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(modifiedDate);

  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const formattedDate = `${values.year}-${values.month}-${values.day}`;

  if (modifiedElement) {
    modifiedElement.textContent = formattedDate;
    modifiedElement.dateTime = formattedDate;
  }

  if (footerModifiedElement) {
    footerModifiedElement.textContent = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(modifiedDate);
    footerModifiedElement.dateTime = formattedDate;
  }
})();
