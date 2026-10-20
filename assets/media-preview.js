(() => {
  if (document.getElementById('portfolio-media-preview')) return;
  const dialog = document.createElement('dialog');
  dialog.id = 'portfolio-media-preview';
  dialog.className = 'portfolio-media-preview';
  dialog.setAttribute('aria-label', 'Media preview');
  dialog.setAttribute('aria-describedby', 'pm-caption');
  dialog.innerHTML = `<div class="pm-stage"></div><div class="pm-footer"><div class="pm-description"><p class="pm-caption" id="pm-caption"></p><span class="pm-count" aria-live="polite"></span></div><div class="pm-controls"><button type="button" class="pm-prev" aria-label="Previous image or video">←</button><button type="button" class="pm-next" aria-label="Next image or video">→</button><button type="button" class="pm-close" autofocus>Close</button></div></div>`;
  document.body.append(dialog);
  const stage = dialog.querySelector('.pm-stage');
  const caption = dialog.querySelector('.pm-caption');
  const count = dialog.querySelector('.pm-count');
  const prev = dialog.querySelector('.pm-prev');
  const next = dialog.querySelector('.pm-next');
  const close = dialog.querySelector('.pm-close');
  let entries = [], current = 0, returnFocus = null, savedOverflow = '';
  const imageURL = value => { try { return /\.(png|jpe?g|webp|gif|svg|avif|bmp)$/i.test(new URL(value, document.baseURI).pathname) || /^data:image\//i.test(value); } catch { return false; } };
  const absolute = value => { try { return new URL(value, document.baseURI).href; } catch { return value; } };
  const labelFor = el => {
    if (el.dataset.mediaCaption) return el.dataset.mediaCaption;
    if (el.dataset.imageLabel) return el.dataset.imageLabel;
    const fig = el.closest('figure')?.querySelector('figcaption');
    if (fig) {
      const copy = fig.cloneNode(true);
      copy.querySelectorAll('.media-meta,button,a').forEach(node => node.remove());
      const text = copy.textContent.replace(/\s+/g, ' ').trim();
      if (text) return text;
    }
    if (el.dataset.title) return [el.dataset.title, el.dataset.caption].filter(Boolean).join(' · ');
    const button = el.closest('.expression-strip button');
    if (button) return button.textContent.replace(/\s+/g, ' ').trim() || button.getAttribute('aria-label')?.replace(/^Enlarge\s+/i, '') || '';
    return el.getAttribute('alt') || el.querySelector?.('img')?.getAttribute('alt') || 'Project image';
  };
  const describe = el => {
    if (!el || el.closest('#portfolio-media-preview')) return null;
    if (el.matches('[data-media-preview]')) {
      const src = el.dataset.mediaPreview;
      return src ? {node:el,src:absolute(src),kind:el.dataset.mediaKind || 'image',label:labelFor(el)} : null;
    }
    if (el.matches('[data-story-image]')) return {node:el,src:absolute(el.dataset.storyImage),kind:'image',label:labelFor(el)};
    if (el.matches('[data-image]')) {
      const src = el.getAttribute('href') || el.dataset.image;
      return src && imageURL(src) ? {node:el,src:absolute(src),kind:'image',label:labelFor(el)} : null;
    }
    if (el.matches('a[href]')) {
      const src = el.getAttribute('href');
      return imageURL(src) ? {node:el,src:absolute(src),kind:'image',label:labelFor(el)} : null;
    }
    if (el.matches('.expression-strip button')) {
      const image = el.querySelector('img');
      return image ? {node:el,src:absolute(image.currentSrc || image.src),kind:'image',label:labelFor(el)} : null;
    }
    if (el.tagName === 'IMG') {
      const anchor = el.closest('a');
      if (anchor) return describe(anchor);
      if (el.closest('[data-character],.cast-icon,.character-icon,.ss-cast-icon')) return null;
      const button = el.closest('button');
      if (button) return button.matches('.expression-strip button') ? describe(button) : null;
      if (!el.closest('figure,.media-grid,.gallery,.case-shots,.story-panels,.expression-strip,[data-gallery]') && !['cast-portrait','ss-character-portrait'].includes(el.id)) return null;
      return {node:el,src:absolute(el.currentSrc || el.src),kind:'image',label:labelFor(el)};
    }
    return null;
  };
  const triggerFor = target => {
    if (!(target instanceof Element) || target.closest('#portfolio-media-preview')) return null;
    const explicit = target.closest('[data-media-preview],[data-story-image],[data-image]');
    if (explicit) return describe(explicit);
    const anchor = target.closest('a[href]');
    if (anchor) return describe(anchor);
    const expression = target.closest('.expression-strip button');
    if (expression) return describe(expression);
    const image = target.closest('img');
    return image ? describe(image) : null;
  };
  const groupFor = entry => {
    const root = entry.node.closest('[data-gallery],.media-grid,.gallery,.case-shots,.expression-strip,.story-panels,.research-photo-grid,.research-observation-grid,.ss-brainstorming,.flow-grid') || entry.node.closest('section') || entry.node.parentElement;
    const selected = root ? [...root.querySelectorAll('[data-media-preview],[data-story-image],[data-image],a[href],.expression-strip button,figure img,.media-grid img')] : [entry.node];
    const seen = new Set(), list = [];
    selected.forEach(node => {
      const item = describe(node);
      if (!item) return;
      const key = `${item.kind}:${item.src}`;
      if (!seen.has(key)) { seen.add(key); list.push(item); }
    });
    if (!seen.has(`${entry.kind}:${entry.src}`)) list.push(entry);
    return list;
  };
  const stopMedia = () => {
    stage.querySelectorAll('video').forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
    stage.replaceChildren();
  };
  const show = index => {
    if (!entries.length) return;
    current = (index + entries.length) % entries.length;
    const item = entries[current];
    stopMedia();
    let media;
    if (item.kind === 'video') {
      media = document.createElement('video');
      media.controls = true; media.playsInline = true; media.preload = 'metadata';
      item.node.closest('figure')?.querySelector('video')?.pause();
    } else {
      media = document.createElement('img'); media.alt = item.label || 'Expanded project image';
    }
    media.src = item.src;
    stage.append(media); caption.textContent = item.label;
    prev.hidden = next.hidden = count.hidden = entries.length < 2;
    count.textContent = `${current + 1} / ${entries.length}`;
  };
  const open = entry => {
    returnFocus = document.activeElement;
    entries = groupFor(entry);
    show(Math.max(0, entries.findIndex(item => item.src === entry.src && item.kind === entry.kind)));
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!dialog.open) dialog.showModal();
  };
  const dismiss = () => { if (dialog.open) dialog.close(); };
  dialog.addEventListener('close', () => {
    stopMedia(); entries = []; document.body.style.overflow = savedOverflow;
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  });
  close.addEventListener('click', dismiss);
  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dismiss();
  });
  document.addEventListener('click', event => {
    const entry = triggerFor(event.target);
    if (!entry) return;
    event.preventDefault(); event.stopImmediatePropagation(); open(entry);
  }, true);
  document.addEventListener('keydown', event => {
    if (dialog.open) {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); dismiss(); }
      else if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && event.target?.tagName !== 'VIDEO') {
        event.preventDefault(); event.stopImmediatePropagation(); show(current + (event.key === 'ArrowRight' ? 1 : -1));
      }
      return;
    }
    if (!['Enter',' '].includes(event.key) || !event.target?.matches('img[role="button"]')) return;
    const entry = triggerFor(event.target);
    if (entry) { event.preventDefault(); event.stopImmediatePropagation(); open(entry); }
  }, true);
  const prepare = root => {
    root.querySelectorAll('a[href],[data-image],[data-story-image],[data-media-preview]').forEach(el => {
      if (!describe(el)) return;
      el.removeAttribute('target'); el.setAttribute('aria-haspopup','dialog');
    });
    root.querySelectorAll('figure img,.media-grid img,.gallery img,.case-shots img,.story-panels img').forEach(img => {
      if (!describe(img) || img.closest('a,button')) return;
      img.tabIndex = 0; img.setAttribute('role','button'); img.setAttribute('aria-haspopup','dialog');
      img.setAttribute('aria-label',`Enlarge ${labelFor(img)}`);
    });
  };
  prepare(document);
})();
