(() => {
  const modifiedElement = document.querySelector('#last-modified');
  if (!modifiedElement) return;

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

  modifiedElement.textContent = formattedDate;
  modifiedElement.dateTime = formattedDate;
})();
