const languageButtons = document.querySelectorAll('.language-switch button');
const translatedCopies = document.querySelectorAll('[data-copy-language]');

function setIntroLanguage(language) {
  translatedCopies.forEach(copy => { copy.hidden = copy.dataset.copyLanguage !== language; });
  languageButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  });
}

languageButtons.forEach(button => {
  const select = () => setIntroLanguage(button.dataset.language);
  button.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') select();
  });
  button.addEventListener('focus', select);
  button.addEventListener('click', select);
});
