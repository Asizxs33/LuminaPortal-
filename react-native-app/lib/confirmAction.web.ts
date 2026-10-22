type Options = { title?: string; confirmLabel?: string };
let pending: Promise<boolean> | null = null;

// Native HTML dialog provides a focus trap, Escape handling and top-layer display.
export function confirmAction(message: string, options: Options = {}): Promise<boolean> {
  if (pending) return Promise.resolve(false);
  if (typeof document === 'undefined') return Promise.resolve(false);
  pending = new Promise<boolean>((resolve) => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.createElement('dialog');
    dialog.className = 'lumina-confirm';
    dialog.setAttribute('aria-labelledby', 'lumina-confirm-title');
    dialog.setAttribute('aria-describedby', 'lumina-confirm-description');
    const logout = message.includes('Жүйеден');
    const deleting = message.includes('өшір') || message.includes('өшіру');
    const icon = document.createElement('div');
    icon.className = 'lumina-confirm-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = logout ? '↗' : deleting ? '!' : '?';
    const title = document.createElement('h2');
    title.id = 'lumina-confirm-title';
    title.textContent = options.title || (logout ? 'Жүйеден шығасыз ба?' : deleting ? 'Өшіруді растаңыз' : 'Әрекетті растаңыз');
    const description = document.createElement('p');
    description.id = 'lumina-confirm-description';
    description.textContent = logout ? 'Кабинетке қайта кіру үшін поштаңыз бен құпиясөзіңіз қажет болады.' : message;
    const actions = document.createElement('div');
    actions.className = 'lumina-confirm-actions';
    const cancel = document.createElement('button');
    cancel.type = 'button'; cancel.textContent = 'Бас тарту';
    const confirm = document.createElement('button');
    confirm.type = 'button'; confirm.className = 'lumina-confirm-primary';
    confirm.textContent = options.confirmLabel || (logout ? 'Шығу' : deleting ? 'Өшіру' : 'Растау');
    let closing = false;
    const finish = (answer: boolean) => {
      if (closing) return;
      closing = true;
      dialog.classList.add('is-closing');
      cancel.disabled = true; confirm.disabled = true;
      setTimeout(() => {
        dialog.close(); dialog.remove(); pending = null;
        if (previous?.isConnected) previous.focus();
        resolve(answer);
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 160);
    };
    cancel.onclick = () => finish(false);
    confirm.onclick = () => finish(true);
    dialog.addEventListener('cancel', event => { event.preventDefault(); finish(false); });
    dialog.addEventListener('click', event => { if (event.target === dialog) {
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) finish(false);
    }});
    actions.append(cancel, confirm); dialog.append(icon, title, description, actions);
    (document.fullscreenElement || document.body).append(dialog);
    dialog.showModal(); cancel.focus();
  });
  return pending;
}
