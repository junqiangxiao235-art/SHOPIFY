if (new URLSearchParams(location.search).get('capture') === '1') document.documentElement.classList.add('capture');

const products = {
  ring: { name: 'Dew Ring', label: '01 / 08', image: 'assets/ring.jpg', description: 'A touch of pale green rests on a soft gold curve: a small highlight for every day.' },
  earrings: { name: 'Leaf Drop Earrings', label: '02 / 08', image: 'assets/earrings.jpg', description: 'Light drop forms let pale green gemstones catch the light as you move.' },
  necklace: { name: 'Soft Light Pendant', label: '03 / 08', image: 'assets/necklace.jpg', description: 'A fine chain and a pale green stone keep a touch of nature close.' },
  cuff: { name: 'Stream Cuff', label: '04 / 08', image: 'assets/cuff.jpg', description: 'A flowing gold line curves around the wrist like a quiet stream.' },
  studs: { name: 'Moss Studs', label: '05 / 08', image: 'assets/studs.jpg', description: 'Irregular pale green stones bring a natural note to simple studs.' },
  bracelet: { name: 'Wandering Light Bracelet', label: '06 / 08', image: 'assets/bracelet.jpg', description: 'Three pale green stones sit along a fine chain and move softly with every gesture.' },
  petalRing: { name: 'Twin Bud Ring', label: '07 / 08', image: 'assets/petal-ring.jpg', description: 'Two facing stones trace the open curve of a new bud.' },
  brooch: { name: 'Branch Shadow Brooch', label: '08 / 08', image: 'assets/brooch.jpg', description: 'A gold leaf outline adds a subtle trace of nature to your lapel.' }
};

const cart = [];
const drawer = document.querySelector('.drawer');
const overlay = document.querySelector('.overlay');
const dialog = document.querySelector('.product-dialog');
const mobileNav = document.querySelector('.mobile-nav');
const menuTrigger = document.querySelector('.menu-trigger');
let previousFocus;

function updateCart() {
  document.querySelectorAll('.cart-count, .drawer-count').forEach(el => { el.textContent = cart.length; });
  const items = document.querySelector('.drawer-items');
  items.replaceChildren();
  if (!cart.length) {
    const empty = document.createElement('p');
    empty.className = 'drawer-empty';
    empty.textContent = 'No saved pieces yet. Explore the collection to find one.';
    items.append(empty);
    return;
  }
  cart.forEach((id, index) => {
    const product = products[id];
    const row = document.createElement('div');
    row.className = 'drawer-item';
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    const details = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = product.name;
    const subtitle = document.createElement('small');
    subtitle.textContent = product.label;
    const remove = document.createElement('button');
    remove.className = 'remove-item';
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => { cart.splice(index, 1); updateCart(); });
    details.append(name, subtitle, remove);
    row.append(img, details);
    items.append(row);
  });
}

function openDrawer() {
  previousFocus = document.activeElement;
  overlay.hidden = false;
  drawer.hidden = false;
  document.body.style.overflow = 'hidden';
  drawer.querySelector('.drawer-close').focus();
}
function closeDrawer() {
  overlay.hidden = true;
  drawer.hidden = true;
  document.body.style.overflow = '';
  previousFocus?.focus();
}

document.querySelector('.cart-trigger').addEventListener('click', openDrawer);
document.querySelector('.drawer-close').addEventListener('click', closeDrawer);
document.querySelector('.drawer-continue').addEventListener('click', closeDrawer);
overlay.addEventListener('click', closeDrawer);
document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => {
  cart.push(button.dataset.add);
  updateCart();
  if (dialog.open) dialog.close();
  openDrawer();
}));

document.querySelectorAll('[data-product]').forEach(button => button.addEventListener('click', () => {
  const id = button.dataset.product;
  const product = products[id];
  const content = dialog.querySelector('.dialog-content');
  content.replaceChildren();
  const image = document.createElement('img');
  image.src = product.image;
  image.alt = product.name;
  const info = document.createElement('div');
  info.className = 'dialog-info';
  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = product.label.toUpperCase();
  const heading = document.createElement('h2');
  heading.textContent = product.name;
  const description = document.createElement('p');
  description.textContent = product.description;
  const add = document.createElement('button');
  add.className = 'button button-dark';
  add.type = 'button';
  add.textContent = 'Save this piece';
  add.addEventListener('click', () => { cart.push(id); updateCart(); dialog.close(); openDrawer(); });
  info.append(eyebrow, heading, description, add);
  content.append(image, info);
  dialog.showModal();
}));
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

menuTrigger.addEventListener('click', () => {
  mobileNav.hidden = !mobileNav.hidden;
  menuTrigger.setAttribute('aria-expanded', String(!mobileNav.hidden));
  menuTrigger.setAttribute('aria-label', mobileNav.hidden ? 'Open menu' : 'Close menu');
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuTrigger.setAttribute('aria-expanded', 'false');
  menuTrigger.setAttribute('aria-label', 'Open menu');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !drawer.hidden) closeDrawer();
  if (event.key === 'Tab' && !drawer.hidden) {
    const focusable = [...drawer.querySelectorAll('button:not([disabled]),a[href]')];
    if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
  }
});

updateCart();

const heroVideo = document.querySelector('.hero-video');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const videoSource = heroVideo.querySelector('source');
function syncHeroVideo() {
  const allowMotion = !motionPreference.matches && !navigator.connection?.saveData && !!heroVideo.canPlayType('video/mp4');
  if (!allowMotion) {
    heroVideo.pause();
    heroVideo.classList.remove('is-playing');
    return;
  }
  if (!videoSource.src) {
    videoSource.src = videoSource.dataset.src;
    heroVideo.load();
  }
  if (!document.hidden) heroVideo.play().catch(() => heroVideo.classList.remove('is-playing'));
}
heroVideo.addEventListener('playing', () => heroVideo.classList.add('is-playing'));
heroVideo.addEventListener('error', () => heroVideo.classList.remove('is-playing'));
motionPreference.addEventListener('change', syncHeroVideo);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) heroVideo.pause();
  else syncHeroVideo();
});
syncHeroVideo();

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const elements = document.querySelectorAll('.manifesto h2, .feature-copy, .section-intro, .product-card, .editorial-copy');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  elements.forEach((element, index) => {
    element.classList.add('reveal');
    if (element.classList.contains('product-card')) element.style.transitionDelay = `${(index % 3) * 90}ms`;
    observer.observe(element);
  });
}
