'use strict';
// One-time static gallery, populated from a manually verified Instagram export.
// Never fetches Instagram and never runs on a schedule.
(() => {
  const grid = document.querySelector('[data-instagram-grid]');
  const status = document.querySelector('[data-ig-status]');
  if (!grid || !status) return;
  let count = 0;
  let snapshotDate = '';

  const validPost = post => {
    if (!post || typeof post !== 'object') return false;
    try {
      const permalink = new URL(post.permalink);
      if (!['instagram.com', 'www.instagram.com'].includes(permalink.hostname) ||
          permalink.protocol !== 'https:') return false;
      const image = new URL(post.image, location.href);
      return image.origin === location.origin &&
             image.pathname.includes('/media/instagram/') &&
             /\.(jpg|jpeg|png|webp)$/i.test(image.pathname);
    } catch { return false; }
  };

  const updateText = language => {
    if (!count) return;
    const en = language === 'en';
    const date = snapshotDate ? new Date(snapshotDate).toLocaleDateString(en ? 'en-ZA' : 'af-ZA') : '';
    status.textContent = en
      ? `${count} manually selected posts from @overdevoor${date ? ' · Snapshot: ' + date : ''}. This gallery does not automatically update.`
      : `${count} handmatig gekeurde plasings van @overdevoor${date ? ' · Vasgelê: ' + date : ''}. Hierdie galery werk nie outomaties by nie.`;
  };

  document.addEventListener('site-language-change', event => updateText(event.detail.language));
  fetch('./instagram-gallery.json', {cache: 'no-store'})
    .then(response => {
      if (!response.ok) throw Error('Static snapshot unavailable');
      return response.json();
    })
    .then(data => {
      const posts = (Array.isArray(data.posts) ? data.posts : [])
        .filter(validPost)
        .sort((a, b) => Date.parse(b.timestamp || 0) - Date.parse(a.timestamp || 0))
        .slice(0, 40);
      if (!posts.length) return; // Retain original four residence gallery photos.
      const cards = posts.map(post => {
        const a = document.createElement('a');
        a.href = post.permalink;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        const img = document.createElement('img');
        img.src = new URL(post.image, location.href).href;
        img.loading = 'lazy';
        img.alt = typeof post.caption === 'string' && post.caption.trim()
          ? post.caption.slice(0, 145)
          : 'Over de Voor Instagram photo';
        const label = document.createElement('span');
        const words = typeof post.caption === 'string' && post.caption.trim()
          ? post.caption.trim().slice(0, 65)
          : '@overdevoor';
        label.append(document.createTextNode(words));
        const arrow = document.createElement('b');
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '↗';
        label.append(arrow);
        a.append(img, label);
        return a;
      });
      grid.replaceChildren(...cards);
      count = cards.length;
      snapshotDate = typeof data.snapshot_date === 'string' ? data.snapshot_date : '';
      updateText(document.documentElement.lang);
    })
    .catch(() => {}); // Honest four-photo gallery fallback.
})();
