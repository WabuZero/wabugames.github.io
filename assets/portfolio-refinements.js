(() => {
  // Native details keep their built-in click, touch, and keyboard behavior.
  document.querySelectorAll('details').forEach(details => {
    const summary = details.querySelector(':scope > summary');
    const indicator = summary?.querySelector('.disclosure-indicator');
    if (!indicator) return;
    const sync = () => { indicator.textContent = details.open ? '−' : '+'; };
    sync();
    details.addEventListener('toggle', sync);
  });
  // Retain the original custom toggle handlers, and expose their actual state.
  document.querySelectorAll('button.collapsible, button.collapse-btn').forEach((button, index) => {
    button.type = 'button';
    const isCard = button.classList.contains('collapse-btn');
    const card = isCard ? button.closest('.collapsible-card') : null;
    const content = isCard ? card?.querySelector('.collapsible-content') : button.nextElementSibling;
    const indicator = isCard ? button : button.querySelector('.icon');
    const title = (isCard ? button.parentElement.querySelector('h2,h3,h4')?.textContent : [...button.childNodes].filter(n => n !== indicator).map(n => n.textContent).join(' '))?.replace(/\s+/g, ' ').trim() || 'section';
    if (content) {
      if (!content.id) content.id = `portfolio-dropdown-${index + 1}`;
      button.setAttribute('aria-controls', content.id);
    }
    const sync = () => {
      const open = isCard ? !!card?.classList.contains('open') : button.classList.contains('active');
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', `${open ? 'Collapse' : 'Expand'}: ${title}`);
      if (indicator) indicator.textContent = open ? '−' : '+';
    };
    sync();
    const stateElement = card || button;
    new MutationObserver(sync).observe(stateElement, {attributes:true, attributeFilter:['class']});
    button.addEventListener('click', sync);
  });
})();
