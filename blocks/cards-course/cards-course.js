import { createOptimizedPicture } from '../../scripts/aem.js';

/** Cards shown per page at the current viewport width. */
function cardsPerView() {
  if (window.matchMedia('(width >= 1200px)').matches) return 4;
  if (window.matchMedia('(width >= 900px)').matches) return 3;
  if (window.matchMedia('(width >= 600px)').matches) return 2;
  return 1;
}

/**
 * Turn the course card list into a paging slider with Previous/Next controls
 * at the top-right, advancing one full page (cardsPerView) at a time.
 * @param {Element} block the cards-course block
 * @param {HTMLUListElement} ul the decorated card list
 */
function buildSlider(block, ul) {
  const controls = document.createElement('div');
  controls.className = 'cards-course-controls';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'cards-course-arrow cards-course-prev';
  prev.setAttribute('aria-label', 'Previous courses');
  prev.textContent = 'Previous';

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'cards-course-arrow cards-course-next';
  next.setAttribute('aria-label', 'Next courses');
  next.textContent = 'Next';

  controls.append(prev, next);

  const viewport = document.createElement('div');
  viewport.className = 'cards-course-viewport';
  viewport.append(ul);

  block.textContent = '';
  block.append(controls, viewport);

  const cards = [...ul.children];
  let page = 0;

  const maxPage = () => Math.max(0, Math.ceil(cards.length / cardsPerView()) - 1);

  const update = () => {
    if (page > maxPage()) page = maxPage();
    const target = cards[page * cardsPerView()];
    // Delta between the first card and the page's first card — both live in the
    // same transformed track, so the delta is independent of current transform.
    const offset = target
      ? target.getBoundingClientRect().left - cards[0].getBoundingClientRect().left
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
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-course-card-image';
      else div.className = 'cards-course-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);

  // Turn the card grid into a paging slider (Previous/Next controls top-right).
  buildSlider(block, ul);
}
