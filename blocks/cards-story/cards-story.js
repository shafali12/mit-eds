import { createOptimizedPicture } from '../../scripts/aem.js';

/** Cards shown per page at the current viewport width. */
function cardsPerView() {
  if (window.matchMedia('(width >= 900px)').matches) return 3;
  if (window.matchMedia('(width >= 600px)').matches) return 2;
  return 1;
}

/**
 * Turn the story card list into a paging slider: prev/next arrows flanking the
 * track, advancing one full page (cardsPerView) at a time.
 * @param {Element} block the cards-story block
 * @param {HTMLUListElement} ul the decorated card list
 */
function buildSlider(block, ul) {
  const viewport = document.createElement('div');
  viewport.className = 'cards-story-viewport';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'cards-story-arrow cards-story-prev';
  prev.setAttribute('aria-label', 'Previous stories');

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'cards-story-arrow cards-story-next';
  next.setAttribute('aria-label', 'Next stories');

  viewport.append(ul);
  block.append(prev, viewport, next);

  const cards = [...ul.children];
  let page = 0;

  const maxPage = () => Math.max(0, Math.ceil(cards.length / cardsPerView()) - 1);

  const update = () => {
    if (page > maxPage()) page = maxPage();
    const perView = cardsPerView();
    const first = cards[0];
    const target = cards[page * perView];
    // Distance from the first card to the page's first card. Both cards live in
    // the same transformed track, so their bounding-rect delta is independent
    // of the current transform — robust across gaps and viewport sizes.
    const offset = target
      ? target.getBoundingClientRect().left - first.getBoundingClientRect().left
      : 0;
    ul.style.transform = `translateX(-${Math.round(offset)}px)`;
    prev.disabled = page <= 0;
    next.disabled = page >= maxPage();
  };

  prev.addEventListener('click', () => { if (page > 0) { page -= 1; update(); } });
  next.addEventListener('click', () => { if (page < maxPage()) { page += 1; update(); } });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(update, 150);
  });

  update();
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-story-card-image';
      else div.className = 'cards-story-card-body';
    });
    ul.append(li);
  });

  ul.querySelectorAll('.cards-story-card-body').forEach((body) => {
    const paras = [...body.querySelectorAll(':scope > p')];
    if (!paras.length) return;

    // First paragraph: story subject's name (strip stray markdown heading prefix)
    const [nameP] = paras;
    nameP.classList.add('cards-story-name');
    const nameLink = nameP.querySelector('a');
    const storyHref = nameLink ? nameLink.getAttribute('href') : null;
    const cleanText = (el) => { el.textContent = el.textContent.replace(/^#+\s*/, '').trim(); };
    if (nameLink) cleanText(nameLink); else cleanText(nameP);

    // Second paragraph: occupation, location (rendered left / right)
    const metaP = paras[1];
    if (metaP) {
      metaP.classList.add('cards-story-meta');
      const raw = metaP.textContent.trim();
      const idx = raw.lastIndexOf(',');
      if (idx > -1) {
        const occupation = raw.slice(0, idx).trim();
        const location = raw.slice(idx + 1).trim();
        metaP.textContent = '';
        const occ = document.createElement('span');
        occ.className = 'cards-story-occupation';
        occ.textContent = occupation;
        const loc = document.createElement('span');
        loc.className = 'cards-story-location';
        loc.textContent = location;
        metaP.append(occ, loc);
      }
    }

    // Remaining paragraph(s): excerpt. Pull the trailing "Read Full Story"
    // call-to-action out into its own link below the clamped excerpt.
    const excerptP = paras[paras.length - 1];
    if (excerptP && excerptP !== nameP) {
      excerptP.classList.add('cards-story-excerpt');
      const ctaMatch = excerptP.textContent.match(/\s*Read Full Story\s*$/i);
      if (ctaMatch) {
        excerptP.textContent = excerptP.textContent.slice(0, ctaMatch.index).trim();
      }
      const cta = document.createElement('p');
      cta.className = 'cards-story-cta';
      const ctaLink = document.createElement('a');
      ctaLink.href = storyHref || '#';
      ctaLink.textContent = 'Read Full Story';
      cta.append(ctaLink);
      excerptP.after(cta);
    }
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);

  // Turn the card list into a paging slider (prev/next arrows, 3-up desktop).
  buildSlider(block, ul);
}
