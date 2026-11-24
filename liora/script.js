if (new URLSearchParams(location.search).get('capture') === '1') document.documentElement.classList.add('capture');

const products = {
  ring: { name: '晨露戒指', english: 'Dew Ring', image: 'assets/ring.jpg', description: '一抹浅绿，停在柔和的金色弧线上。适合每天佩戴的小小亮点。' },
  earrings: { name: '叶语耳环', english: 'Leaf Drop Earrings', image: 'assets/earrings.jpg', description: '轻盈的垂坠线条，让浅绿宝石随着步伐微微闪动。' },
  necklace: { name: '微光项链', english: 'Soft Light Pendant', image: 'assets/necklace.jpg', description: '细链与一颗浅绿宝石，把自然的温柔留在心口。' },
  cuff: { name: '溪纹手镯', english: 'Stream Cuff', image: 'assets/cuff.jpg', description: '像溪流一样起伏的金色弧线，在腕间留下轻盈的光。' },
  studs: { name: '苔光耳钉', english: 'Moss Studs', image: 'assets/studs.jpg', description: '两颗不规则的浅绿宝石，让简单的耳钉多了一点自然气息。' },
  bracelet: { name: '漫光手链', english: 'Wandering Light Bracelet', image: 'assets/bracelet.jpg', description: '三点浅绿散落在细链上，随着每一次抬手轻轻移动。' },
  petalRing: { name: '双芽戒指', english: 'Twin Bud Ring', image: 'assets/petal-ring.jpg', description: '两颗相望的浅绿宝石，勾勒出像新芽一样舒展的线条。' },
  brooch: { name: '枝影胸针', english: 'Branch Shadow Brooch', image: 'assets/brooch.jpg', description: '一笔金色的叶片轮廓，为衣襟留下一点自然的痕迹。' }
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
    empty.textContent = '还没有心选作品。去自然系列里看看吧。';
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
    subtitle.textContent = product.english;
    const remove = document.createElement('button');
    remove.className = 'remove-item';
    remove.type = 'button';
    remove.textContent = '移除';
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
  eyebrow.textContent = product.english.toUpperCase();
  const heading = document.createElement('h2');
  heading.textContent = product.name;
  const description = document.createElement('p');
  description.textContent = product.description;
  const add = document.createElement('button');
  add.className = 'button button-dark';
  add.type = 'button';
  add.textContent = '加入心选清单';
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
  menuTrigger.setAttribute('aria-label', mobileNav.hidden ? '打开菜单' : '关闭菜单');
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuTrigger.setAttribute('aria-expanded', 'false');
  menuTrigger.setAttribute('aria-label', '打开菜单');
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
