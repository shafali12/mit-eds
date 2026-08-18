/**
 * hero-home block
 * Source: ocw.mit.edu home-banner — a full-width background-image hero with a
 * two-column layout: left = search prompt + quick links, right = teal panel
 * with the "Unlocking Knowledge" headline + mission statement.
 *
 * The authored content arrives as a single flat cell. We split it at the first
 * <h2>: everything before goes into the left column, the heading and everything
 * after goes into the right (teal) panel.
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;

  const container = document.createElement('div');
  container.className = 'hero-home-inner';

  const left = document.createElement('div');
  left.className = 'hero-home-left';
  const right = document.createElement('div');
  right.className = 'hero-home-right';

  const nodes = [...cell.children];
  const headingIndex = nodes.findIndex((n) => /^H[1-6]$/.test(n.tagName));
  const split = headingIndex === -1 ? nodes.length : headingIndex;

  nodes.forEach((node, i) => {
    (i < split ? left : right).append(node);
  });

  container.append(left, right);

  const row = block.querySelector(':scope > div');
  row.textContent = '';
  row.append(container);
}
