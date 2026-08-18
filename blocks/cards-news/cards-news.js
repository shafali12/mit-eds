import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-news
 * Content model (one row per news item):
 *   [ image ] [ linked headline + date ]
 * The final row has no image and holds the "view all" link.
 *
 * Rendered layout:
 *   - first item  -> large featured card with image + dark overlay (date + headline)
 *   - middle items -> sidebar list (thumbnail + title + date)
 *   - last item (no image) -> footer "view all" link
 */
export default function decorate(block) {
  const rows = [...block.children];

  // The trailing row without a picture is the "view all" link.
  let footerRow = null;
  const itemRows = rows.filter((row) => {
    if (!row.querySelector('picture, img')) {
      footerRow = row;
      return false;
    }
    return true;
  });

  const clean = (text) => (text || '').replace(/^#+\s*/, '').trim();

  const buildParts = (row) => {
    const picture = row.querySelector('picture');
    const link = row.querySelector('a');
    const headline = clean(link ? link.textContent : '');
    // date = a paragraph that is not the headline link
    let date = '';
    row.querySelectorAll('p').forEach((p) => {
      if (!p.querySelector('a')) {
        const t = clean(p.textContent);
        if (t) date = t;
      }
    });
    return {
      href: link ? link.getAttribute('href') : '#',
      picture,
      headline,
      date,
    };
  };

  const container = document.createElement('div');
  container.className = 'cards-news-container';

  // Featured (first item)
  const [first, ...rest] = itemRows;
  if (first) {
    const p = buildParts(first);
    const featured = document.createElement('a');
    featured.className = 'cards-news-featured';
    featured.href = p.href;

    if (p.picture) {
      const img = p.picture.querySelector('img');
      const optimized = createOptimizedPicture(img.src, p.headline || img.alt, true, [{ width: '750' }]);
      featured.append(optimized);
    }

    const overlay = document.createElement('div');
    overlay.className = 'cards-news-overlay';
    overlay.innerHTML = `
      <span class="cards-news-date">${p.date}</span>
      <h3 class="cards-news-heading">${p.headline}</h3>`;
    featured.append(overlay);
    container.append(featured);
  }

  // Sidebar (remaining items)
  if (rest.length) {
    const sidebar = document.createElement('div');
    sidebar.className = 'cards-news-sidebar';
    rest.forEach((row) => {
      const p = buildParts(row);
      const item = document.createElement('a');
      item.className = 'cards-news-item';
      item.href = p.href;

      if (p.picture) {
        const img = p.picture.querySelector('img');
        const optimized = createOptimizedPicture(img.src, p.headline || img.alt, false, [{ width: '250' }]);
        optimized.className = 'cards-news-thumb';
        item.append(optimized);
      }

      const content = document.createElement('div');
      content.className = 'cards-news-item-content';
      content.innerHTML = `
        <span class="cards-news-item-title">${p.headline}</span>
        <span class="cards-news-item-date">${p.date}</span>`;
      item.append(content);
      sidebar.append(item);
    });
    container.append(sidebar);
  }

  block.textContent = '';
  block.append(container);

  // Footer "view all" link
  if (footerRow) {
    const link = footerRow.querySelector('a');
    if (link) {
      const footer = document.createElement('div');
      footer.className = 'cards-news-footer';
      link.textContent = clean(link.textContent);
      footer.append(link);
      block.append(footer);
    }
  }
}
