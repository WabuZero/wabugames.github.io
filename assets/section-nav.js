(() => {
  const nav = document.querySelector('.jump-nav');
  const header = document.querySelector('body > header');
  if (!nav || !header) return;
  const measureHeader = () => document.documentElement.style.setProperty('--section-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
  measureHeader();
  if ('ResizeObserver' in window) new ResizeObserver(measureHeader).observe(header);
  window.addEventListener('resize', measureHeader, {passive:true});
  const links = [...nav.querySelectorAll('a')];
  const select = link => links.forEach(item => {
    if (item === link) item.setAttribute('aria-current', 'location');
    else item.removeAttribute('aria-current');
  });
  links.forEach(link => link.addEventListener('click', () => select(link)));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        const link = links.find(item => item.hash === `#${entry.target.id}`);
        if (link) select(link);
      }
    }, {rootMargin:'-18% 0px -62% 0px', threshold:0});
    links.forEach(link => {
      const section = document.getElementById(link.hash.slice(1));
      if (section) observer.observe(section);
    });
  }
})();
