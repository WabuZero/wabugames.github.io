const player = document.getElementById('combat-player');
const clipButtons = [...document.querySelectorAll('[data-video-src]')];
clipButtons.forEach(button => button.addEventListener('click', () => {
  if (button.getAttribute('aria-pressed') === 'true') return;
  player.pause();
  player.poster = button.dataset.poster;
  player.src = button.dataset.videoSrc;
  player.setAttribute('aria-label',button.dataset.title);
  player.load();
  clipButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.getElementById('clip-caption').textContent = button.dataset.caption;
}));
document.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>{
  document.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause()});
}));

const viewer=document.getElementById('design-viewer');
const viewerBody=document.getElementById('viewer-body');
const viewerTitle=document.getElementById('viewer-title');
const viewerCaption=document.getElementById('viewer-caption');
const fallback=document.getElementById('viewer-fallback');
const zoom=document.getElementById('viewer-zoom');
const galleryControls=document.getElementById('gallery-controls');
let priorFocus=null, gallery=[], currentIndex=0;
function showImage(link){
  viewer.classList.remove('doc-mode');
  viewerBody.classList.remove('zoomed');
  zoom.textContent='Zoom in';zoom.setAttribute('aria-pressed','false');zoom.hidden=false;
  viewerTitle.textContent=link.dataset.title || link.querySelector('img')?.alt || 'Development image';
  viewerCaption.textContent=link.dataset.caption || '';
  fallback.href=link.href;
  const img=document.createElement('img');img.src=link.href;img.alt=viewerTitle.textContent;
  viewerBody.replaceChildren(img);
  galleryControls.hidden=gallery.length<2;
  document.getElementById('gallery-count').textContent=`${currentIndex+1} / ${gallery.length}`;
}
function openImage(link){
  priorFocus=link;
  const group=link.closest('[data-gallery]');
  gallery=group?[...group.querySelectorAll('a[data-image]')]:[link];
  currentIndex=gallery.indexOf(link);
  showImage(link);viewer.showModal();document.body.classList.add('modal-open');
}
document.querySelectorAll('a[data-image]').forEach(a=>a.addEventListener('click',e=>{
  if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  if(typeof viewer.showModal!=='function')return;
  e.preventDefault();openImage(a);
}));
document.querySelectorAll('[data-doc-preview]').forEach(a=>a.addEventListener('click',e=>{
  if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||matchMedia('(max-width:700px)').matches||typeof viewer.showModal!=='function')return;
  e.preventDefault();priorFocus=a;gallery=[];
  viewerTitle.textContent=a.dataset.title;
  fallback.href=a.href;zoom.hidden=true;viewer.classList.add('doc-mode');viewerBody.classList.remove('zoomed');
  const iframe=document.createElement('iframe');iframe.src=a.dataset.docPreview;iframe.title=a.dataset.title;iframe.allowFullscreen=true;
  viewerBody.replaceChildren(iframe);viewer.showModal();document.body.classList.add('modal-open');
}));
const advance=dir=>{if(!gallery.length)return;currentIndex=(currentIndex+dir+gallery.length)%gallery.length;showImage(gallery[currentIndex])};
document.getElementById('gallery-prev').addEventListener('click',()=>advance(-1));
document.getElementById('gallery-next').addEventListener('click',()=>advance(1));
viewer.addEventListener('keydown',e=>{
  if(viewer.classList.contains('doc-mode')||viewerBody.classList.contains('zoomed'))return;
  if(e.key==='ArrowLeft'){e.preventDefault();advance(-1)}
  if(e.key==='ArrowRight'){e.preventDefault();advance(1)}
});
zoom.addEventListener('click',()=>{
  const on=viewerBody.classList.toggle('zoomed');zoom.textContent=on?'Fit image':'Zoom in';zoom.setAttribute('aria-pressed',String(on));
});
document.getElementById('viewer-close').addEventListener('click',()=>viewer.close());
viewer.addEventListener('close',()=>{viewerBody.replaceChildren();document.body.classList.remove('modal-open');priorFocus?.focus()});
viewer.addEventListener('click',e=>{if(e.target!==viewer)return;const r=viewer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)viewer.close()});

// Native scrolling keeps every capture accessible, with compact page controls.
document.querySelectorAll('[data-carousel]').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const images = [...track.querySelectorAll('.shot')];
  const prev = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  const status = carousel.querySelector('.carousel-status');
  const dimensions = () => ({
    visible: Number.parseInt(getComputedStyle(carousel).getPropertyValue('--visible-captures'), 10) || 3,
    step: images[0].getBoundingClientRect().width + (Number.parseFloat(getComputedStyle(track).columnGap) || 0)
  });
  const update = () => {
    const {visible, step} = dimensions();
    const first = Math.max(0, Math.min(images.length - 1, Math.round(track.scrollLeft / (step || 1))));
    status.textContent = `${first + 1} to ${Math.min(first + visible, images.length)} / ${images.length}`;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  };
  const advance = direction => {
    const {visible, step} = dimensions();
    const first = Math.round(track.scrollLeft / (step || 1));
    const left = Math.max(0, Math.min((first + direction * visible) * step, track.scrollWidth - track.clientWidth));
    track.scrollTo({left, behavior:matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth'});
  };
  prev.addEventListener('click', () => advance(-1));
  next.addEventListener('click', () => advance(1));
  track.addEventListener('scroll', update, {passive:true});
  track.addEventListener('keydown', event => {
    if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();advance(event.key === 'ArrowLeft' ? -1 : 1);
  });
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
  else window.addEventListener('resize', update, {passive:true});
  update();
});
