/**
 * columns-social — two-up panel: left = social icon links, right = newsletter signup.
 * Adds structural classes/wrappers so the CSS can lay out icons and the signup form.
 * @param {Element} block
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const [connect, subscribe] = cells;

  if (connect) {
    connect.classList.add('columns-social-connect');
    const ps = [...connect.children];
    if (ps[0]) ps[0].classList.add('columns-social-title');
    // group the social icon paragraphs into a single flex row
    const icons = document.createElement('div');
    icons.className = 'columns-social-icons';
    ps.slice(1).forEach((p) => icons.append(p));
    if (icons.children.length) connect.append(icons);
  }

  if (subscribe) {
    subscribe.classList.add('columns-social-subscribe');
    const ps = [...subscribe.children];
    if (ps[0]) ps[0].classList.add('columns-social-title');
    // group the email field + signup button into an inline form row
    const form = document.createElement('div');
    form.className = 'columns-social-form';
    ps.slice(1).forEach((p) => {
      if (p.querySelector('picture')) p.classList.add('columns-social-email');
      else p.classList.add('columns-social-signup');
      form.append(p);
    });
    if (form.children.length) subscribe.append(form);
  }
}
