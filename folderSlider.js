'use strict';
(() => {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('#main-nav');
  const close = () => {
    if (!nav || !toggle) return;
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Maak kieslys oop');
  };
  toggle?.addEventListener('click', () => {
    const opening = toggle.getAttribute('aria-expanded') !== 'true';
    nav?.classList.toggle('open', opening);
    toggle.setAttribute('aria-expanded', String(opening));
    toggle.setAttribute('aria-label', opening ? 'Maak kieslys toe' : 'Maak kieslys oop');
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
      close();
      toggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) close();
  });
  const gallery = document.querySelector('[data-gallery]');
  const move = direction => {
    if (!gallery) return;
    const item = gallery.querySelector('figure');
    const gap = Number.parseFloat(getComputedStyle(gallery).columnGap) || 14;
    const distance = item ? item.getBoundingClientRect().width + gap : gallery.clientWidth * .8;
    gallery.scrollBy({left: direction * distance, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  };
  document.querySelector('[data-gallery-prev]')?.addEventListener('click', () => move(-1));
  document.querySelector('[data-gallery-next]')?.addEventListener('click', () => move(1));
  document.querySelectorAll('[data-year]').forEach(node => {node.textContent = new Date().getFullYear();});
})();
