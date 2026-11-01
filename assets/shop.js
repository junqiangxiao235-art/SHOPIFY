(function(){
const S=window.STORE;if(!S)return;
{
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const conn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const slow=!!(conn&&(conn.saveData||conn.effectiveType==='slow-2g'||conn.effectiveType==='2g'));
 if(reduce||slow)document.documentElement.setAttribute('data-motion','off');
}
const KEY='cart_'+S.id;const CKEY='cur_'+S.id;
const $=(q,el=document)=>el.querySelector(q),$$=(q,el=document)=>[...el.querySelectorAll(q)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const srcOf=(id,w)=>{
  if(String(id).startsWith('http')){const u=new URL(id);u.searchParams.set('auto','format');u.searchParams.set('fit','crop');u.searchParams.set('q','75');u.searchParams.set('w',String(w));return u.toString()}
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
};
const srcset=(id,widths)=>widths.map(w=>`${srcOf(id,w)} ${w}w`).join(', ');
let cur=localStorage.getItem(CKEY)||S.currency;
const rate=()=>(S.rates&&S.rates[cur])||1;
const sym=()=>(S.symbols&&S.symbols[cur])||S.symbol;
const money=v=>{const n=v*rate();return sym()+(n%1===0&&!S.cents?n.toFixed(0):n.toFixed(2))};
S.money=money;
const P=id=>S.products.find(p=>p.id===id);
const stars=r=>'★★★★★'.slice(0,Math.round(r))+'☆☆☆☆☆'.slice(0,5-Math.round(r));
let cart=[];try{cart=JSON.parse(localStorage.getItem(KEY)||'[]')||[]}catch(e){cart=[]}
let discount=null;
const save=()=>{localStorage.setItem(KEY,JSON.stringify(cart));renderCart()};
function opts(p){if(!p||!p.variants)return[];return p.variants.options.map(o=>typeof o==='string'?{name:o,add:0}:{name:o.name,add:+o.add||0})}
function optText(o){if(!o.add)return o.name;return `${o.name} (${o.add>0?'+':'−'}${money(Math.abs(o.add))})`}
function unitPrice(p,line){let price=p.price+(+line.add||0);if(line.purchase==='sub'&&p.subSave)price=Math.round(price*85)/100;return price}
function add(id,variant,qty=1,addAmt=0,purchase='once'){const k=[id,variant||'',purchase,addAmt].join('|');const l=cart.find(x=>x.k===k);if(l)l.q+=qty;else cart.push({k,id,v:variant||'',q:qty,add:+addAmt||0,purchase:purchase||'once'});save();openCart()}
S.add=add;
function toast(t){let el=$('.toast');if(!el){el=document.createElement('div');el.className='toast';el.setAttribute('role','status');document.body.appendChild(el)}el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),2200)}
S.toast=toast;
function subtotal(){return cart.reduce((s,l)=>{const p=P(l.id);return s+(p?unitPrice(p,l)*l.q:0)},0)}
function physSubtotal(){return cart.reduce((s,l)=>{const p=P(l.id);if(!p||p.digital)return s;return s+unitPrice(p,l)*l.q},0)}
S.subtotal=subtotal;S.getCart=()=>cart;S.clearCart=()=>{cart=[];save()};
const allDigital=()=>cart.length>0&&cart.every(l=>{const p=P(l.id);return p&&p.digital});
const anySub=()=>cart.some(l=>l.purchase==='sub'||(P(l.id)||{}).subscription);
const COUNTRIES={
 'United States':{mult:1,days:'3–6 business days',region:'State'},
 'Canada':{mult:1.2,days:'5–9 business days',region:'Province'},
 'United Kingdom':{mult:1.15,days:'5–9 business days'},
 'Ireland':{mult:1.2,days:'5–9 business days'},
 'Germany':{mult:1.25,days:'5–9 business days'},
 'France':{mult:1.25,days:'5–9 business days'},
 'Netherlands':{mult:1.2,days:'5–9 business days'},
 'Sweden':{mult:1.3,days:'6–10 business days'},
 'Australia':{mult:1.45,days:'7–12 business days',region:'State'},
 'New Zealand':{mult:1.5,days:'7–14 business days'},
 'Japan':{mult:1.35,days:'6–10 business days'},
 'South Korea':{mult:1.3,days:'6–10 business days'},
 'Singapore':{mult:1.3,days:'5–9 business days'},
 'United Arab Emirates':{mult:1.4,days:'6–11 business days'},
 'Mexico':{mult:1.25,days:'6–11 business days',region:'State'},
 'China':{mult:.9,days:'4–8 business days',region:'Province'}
};
function shipFee(){
  if(!cart.length||allDigital())return 0;
  const sub=physSubtotal();
  if(S.freeShip&&sub>=S.freeShip)return 0;
  const sel=$('#co-country');
  const info=COUNTRIES[(sel&&sel.value)||'United States']||COUNTRIES['United States'];
  return +((S.shipFee||0)*info.mult).toFixed(2);
}
const I={search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
bag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'};
let lastFocus=null;
function focusables(root){return [...root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea')].filter(el=>!el.closest('[inert]')&&el.getClientRects().length)}
function openLayer(el){el.classList.add('on');el.removeAttribute('inert');el.setAttribute('aria-hidden','false');$('#ov')&&$('#ov').classList.add('on');document.body.style.overflow='hidden'}
function shut(el){if(!el)return;el.classList.remove('on');el.setAttribute('inert','');el.setAttribute('aria-hidden','true')}
function closeAll(){shut($('#drawer'));shut($('#sp'));shut($('#pick'));shut($('#quiz'));shut($('#infoDlg'));$('#ov')&&$('#ov').classList.remove('on');const nav=$('#nav');if(nav)nav.classList.remove('open');const mb=$('#menuBtn');if(mb)mb.setAttribute('aria-expanded','false');document.body.style.overflow='';if(lastFocus&&lastFocus.focus){const f=lastFocus;lastFocus=null;f.focus()}}
function topLayer(){return ['#pick','#quiz','#infoDlg','#drawer','#sp'].map(q=>$(q)).find(el=>el&&el.classList.contains('on'))}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(topLayer()||($('#nav')&&$('#nav').classList.contains('open')))closeAll();return}
  if(e.key!=='Tab')return;
  const root=topLayer();if(!root)return;
  const f=focusables(root);if(!f.length)return;
  const first=f[0],last=f[f.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
function chrome(){
 const ann=$('#announce');if(ann){if(ann.hasAttribute('data-static')){ann.textContent=S.announce[0]||''}else{const msgs=S.announce.map(m=>`<span>${m}</span>`).join('');ann.innerHTML=`<div class="track">${msgs}${msgs}${msgs}${msgs}</div>`}}
 const h=$('#header');if(h){
  const curOpts=S.rates?Object.keys(S.rates).map(c=>`<option ${c===cur?'selected':''}>${c}</option>`).join(''):'';
  const curSel=S.rates?`<select class="cur-select" aria-label="Currency">${curOpts}</select>`:'';
  h.innerHTML=`<div class="wrap bar"><button class="icon-btn menu-btn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav" id="menuBtn">${I.menu}</button><a class="logo" href="index.html">${S.logo}</a><nav class="main" id="nav">${S.nav.map(n=>`<a href="${n[1]}"${n[2]?` data-filter="${esc(n[2])}"`:''}>${n[0]}</a>`).join('')}${curSel}</nav><div class="icons">${curSel}<button class="icon-btn" type="button" id="searchBtn" aria-label="Search">${I.search}</button><button class="icon-btn acct" type="button" id="acctBtn" aria-label="Account">${I.user}</button><button class="icon-btn" type="button" id="cartBtn" aria-label="Cart" aria-controls="drawer">${I.bag}<span class="cart-count" data-n="0">0</span></button></div></div>`;
  $('#menuBtn').onclick=()=>{const open=$('#nav').classList.toggle('open');$('#menuBtn').setAttribute('aria-expanded',open?'true':'false')};
  $('#cartBtn').onclick=openCart;$('#searchBtn').onclick=openSearch;
  $('#acctBtn').onclick=()=>toast('Demo store — accounts are not available.');
  $$('.cur-select',h).forEach(cs=>cs.onchange=e=>{cur=e.target.value;localStorage.setItem(CKEY,cur);location.reload()});
 }
 if(!$('.skip'))document.body.insertAdjacentHTML('afterbegin','<a class="skip" href="#main">Skip to content</a>');
 document.body.insertAdjacentHTML('beforeend',`<div class="overlay" id="ov"></div>
 <aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="cartTitle" aria-hidden="true" inert><div class="dh"><h3 id="cartTitle">${S.t.cart||'Your cart'}</h3><button class="icon-btn" type="button" id="dClose" aria-label="Close cart">${I.x}</button></div><div class="ship-bar" id="shipBar"></div><div class="lines" id="lines"></div><div class="df"><div class="tot"><span>${S.t.subtotal||'Subtotal'}</span><span id="sub"></span></div><div class="note">${S.t.taxNote||'Taxes and shipping calculated at checkout.'}</div><a class="btn accent block" href="checkout.html" id="coBtn">${S.t.checkout||'Checkout'}</a></div></aside>
 <div class="search-pop" id="sp" role="dialog" aria-modal="true" aria-label="Search" aria-hidden="true" inert><div class="wrap"><div style="display:flex;gap:10px;align-items:center"><input id="sq" aria-label="Search products" placeholder="${S.t.search||'Search products'}"><button class="icon-btn" type="button" id="sClose" aria-label="Close search">${I.x}</button></div><div class="search-res" id="sr"></div></div></div>
 <div class="pick" id="pick" role="dialog" aria-modal="true" aria-labelledby="pickTitle" aria-hidden="true" inert><h3 id="pickTitle"></h3><div id="pickBody"></div><button class="btn accent block" type="button" id="pickAdd">Add to cart</button><button class="linkish" type="button" id="pickClose" style="margin-top:10px">Cancel</button></div>`);
 $('#ov').onclick=closeAll;$('#dClose').onclick=closeAll;$('#sClose').onclick=closeAll;$('#pickClose').onclick=closeAll;
 $('#sq').oninput=e=>{const q=e.target.value.toLowerCase();const r=S.products.filter(p=>!q||(p.name+p.cat+(p.sub||'')).toLowerCase().includes(q)).slice(0,8);$('#sr').innerHTML=r.map(p=>`<a href="product.html?id=${p.id}">${thumb(p,48)}<span>${esc(p.name)}<br><b>${money(p.price)}</b></span></a>`).join('')||'<p>No results</p>'};
 $$('form[data-news]').forEach(f=>f.onsubmit=e=>{e.preventDefault();f.reset();const ok=f.parentElement.querySelector('.ok');if(ok)ok.style.display='block';toast(S.t.subscribed||'Thanks for subscribing!')});
 if(!$('#demoLine') && !/Demo by 拾光/.test((document.querySelector('footer')||document.body).textContent)){
  const line=`<p class="demo-line" id="demoLine">Demo by 拾光 · <a href="../index.html">Portfolio</a> · <a href="../index.html#contact">Contact</a></p>`;
  const foot=document.querySelector('footer');
  if(foot) foot.insertAdjacentHTML('beforeend', line);
 }
}
function openCart(){const d=$('#drawer');if(!d)return;const ae=document.activeElement;if(!ae||!ae.closest||!ae.closest('#pick,#quiz,#infoDlg'))lastFocus=ae;shut($('#sp'));shut($('#pick'));openLayer(d);$('#dClose').focus()}
function openSearch(){lastFocus=document.activeElement;shut($('#drawer'));openLayer($('#sp'));$('#sq').dispatchEvent(new Event('input'));setTimeout(()=>$('#sq').focus(),30)}
S.openCart=openCart;
function thumb(p,w){if(p.mock){const c=(p.tint||['#e7d3b5'])[0];return `<span class="mini-mock" style="--c1:${c};width:${w}px;height:${Math.round(w*1.15)}px" role="img" aria-label="${esc(p.name)}"></span>`}return `<img src="${srcOf(p.img,w*2)}" alt="${esc(p.name)}" width="${w}" height="${Math.round(w*1.15)}" ${w>80?'':'loading="lazy"'} decoding="async">`}
function renderCart(){
 const n=cart.reduce((s,l)=>s+l.q,0);$$('.cart-count').forEach(e=>{e.textContent=n;e.dataset.n=n});
 const L=$('#lines');if(!L)return;
 const sub=subtotal();$('#sub').textContent=money(sub);
 const th=S.freeShip||0;const base=allDigital()?0:physSubtotal();
 $('#shipBar').innerHTML=!th||allDigital()?(allDigital()?'Digital items are delivered by email — no shipping.':''):(base>=th?`🎉 ${S.t.freeShipDone||"You've unlocked free shipping!"}`:`${(S.t.freeShipLeft||'You are {x} away from free shipping').replace('{x}','<b>'+money(th-base)+'</b>')}`)+((!th||allDigital())?'':`<div class="bar"><i style="width:${Math.min(100,base/th*100)}%"></i></div>`);
 const co=$('#coBtn');if(co){const ok=cart.length>0;co.setAttribute('aria-disabled',ok?'false':'true');co.tabIndex=ok?0:-1;co.style.opacity=ok?1:.5;co.onclick=e=>{if(!ok)e.preventDefault()}}
 if(!cart.length){L.innerHTML=`<div class="empty"><p class="empty-title">${S.t.empty||'Your cart is empty'}</p><p>Add something to see shipping and checkout.</p><br><a class="btn alt" href="index.html#shop">${S.t.continue||'Continue shopping'}</a></div>`;return}
 L.innerHTML=cart.map((l,i)=>{const p=P(l.id);if(!p)return'';const price=unitPrice(p,l);return `<div class="line">${thumb(p,76)}<div><div style="font-weight:600">${esc(p.name)}</div>${l.v?`<div class="v">${esc(l.v)}</div>`:''}${l.purchase==='sub'?'<div class="v">Subscribe · cancel anytime</div>':''}<div class="qty"><button type="button" data-d="-1" data-i="${i}" aria-label="Decrease quantity">−</button><span>${l.q}</span><button type="button" data-d="1" data-i="${i}" aria-label="Increase quantity">+</button></div><button class="rm" type="button" data-rm="${i}">${S.t.remove||'Remove'}</button></div><div style="font-weight:600">${money(price*l.q)}</div></div>`}).join('');
 $$('[data-d]',L).forEach(b=>b.onclick=()=>{const i=+b.dataset.i;const l=cart[i];if(!l)return;l.q+=+b.dataset.d;if(l.q<1)cart.splice(i,1);save();const again=$(`#lines [data-i="${Math.min(i,cart.length-1)}"][data-d="${b.dataset.d}"]`);if(again)again.focus()});
 $$('[data-rm]',L).forEach(b=>b.onclick=()=>{cart.splice(+b.dataset.rm,1);save()});
}
function mockHTML(p){
 const c=p.tint||(p.mock==='bottle'?['#f7d5de','#e7b7c3']:['#f0e2cf','#c4895c']);
 if(p.mock==='bag')return `<span class="mock bag" style="--c1:${c[0]};--c2:${c[1]}"><span class="pack"><span class="mk">◐ halfmoon</span><strong>${esc(p.name)}</strong><em>${esc(p.sub||'250g')}</em><i>${esc(p.badge||'Label-free bag')}</i></span></span>`;
 if(p.mock==='bottle')return `<span class="mock bottle" style="--c1:${c[0]};--c2:${c[1]}"><span class="vial"><span class="cap"></span><span class="lbl"><b>dewlune</b><strong>${esc(p.name)}</strong></span></span></span>`;
 if(p.mock==='enamel')return `<span class="mock enamel" style="--c1:${c[0]};--c2:${c[1]}"><span class="cup"><span class="handle"></span><span class="muglbl"><b>◐ halfmoon</b><strong>${esc(p.name)}</strong></span></span></span>`;
 return '';
}
function photoHTML(id,alt,opts={}){
 const w=opts.w||800,h=opts.h||1000;
 const lazy=opts.priority?'fetchpriority="high"':'loading="lazy"';
 const set=opts.widths?` srcset="${srcset(id,opts.widths)}" sizes="${opts.sizes||'100vw'}"`:'';
 return `<img src="${srcOf(id,w)}"${set} alt="${esc(alt)}" width="${w}" height="${h}" ${lazy} decoding="async">`;
}
function card(p, plain){
 const sale=p.compare&&p.compare>p.price;
 const badge=p.badge?`<span class="badge ${/sale|off|%/i.test(p.badge)?'sale':''}">${esc(p.badge)}</span>`:(sale?`<span class="badge sale">${S.t.sale||'Sale'}</span>`:'');
 const media=p.mock?mockHTML(p):photoHTML(p.img,p.name,{w:700,h:875,widths:[400,700],sizes:'(max-width:820px) 46vw, 25vw'});
 const stars=plain?'':`<div class="stars"><span class="s" aria-hidden="true">${stars(p.rating)}</span><span>${p.rating.toFixed(1)} (${p.reviews})</span></div>`;
 return `<div class="card">${badge}<a class="media" href="product.html?id=${p.id}">${media}</a><div class="info"><a class="name" href="product.html?id=${p.id}">${esc(p.name)}</a>${p.sub?`<div class="sub">${esc(p.sub)}</div>`:''}${stars}<div class="price"><span class="now ${sale?'on-sale':''}">${S.t.from&&p.variants?S.t.from+' ':''}${money(p.price)}</span>${sale?`<s>${money(p.compare)}</s>`:''}</div></div><button class="btn quick" type="button" data-add="${p.id}">Add · ${money(p.price)}</button></div>`;
}
S.card=card;
function applyFilter(f){
 const g=$('#mainGrid');if(!g)return;
 const ps=S.products.filter(p=>!f||f==='all'||p.cat===f||(p.tags||[]).includes(f));
 g.innerHTML=ps.map(p=>card(p,g.hasAttribute('data-plain'))).join('')||'<p>Nothing in this group yet.</p>';
 g.style.minHeight='0';
 $$('[data-filter]').forEach(x=>{const on=x.dataset.filter===f;x.classList.toggle('on',on);if(x.tagName==='BUTTON')x.setAttribute('aria-pressed',on?'true':'false')});
 const shop=document.getElementById('shop');if(shop)shop.scrollIntoView({behavior:'smooth',block:'start'});
 revealCards();
}
function openPicker(p){
 lastFocus=document.activeElement;
 const list=opts(p);let name=list[0]?list[0].name:'';let addAmt=list[0]?list[0].add:0;let purchase=p.subSave?'once':'once';
 const title=$('#pickTitle');title.textContent=p.name;
 const body=$('#pickBody');
 const draw=()=>{
  let price=p.price+addAmt;if(purchase==='sub'&&p.subSave)price=Math.round(price*85)/100;
  body.innerHTML=`${list.length?`<div class="opts" role="group" aria-label="${esc(p.variants.label)}">${list.map(o=>`<button type="button" class="${o.name===name?'on':''}" data-o="${esc(o.name)}" data-add="${o.add}" aria-pressed="${o.name===name}">${esc(optText(o))}</button>`).join('')}</div>`:''}
  ${p.subSave?`<div class="purchase" role="radiogroup" aria-label="Purchase type"><button type="button" class="${purchase==='once'?'on':''}" data-buy="once" aria-pressed="${purchase==='once'}">One-time · ${money(p.price+addAmt)}</button><button type="button" class="${purchase==='sub'?'on':''}" data-buy="sub" aria-pressed="${purchase==='sub'}">Subscribe & save 15% · ${money(Math.round((p.price+addAmt)*85)/100)} every 2 weeks</button></div><p class="subnote">Skip or cancel anytime. Not sure on grind? Whole bean stays freshest.</p>`:''}
  <p style="font-weight:700;margin:8px 0 12px">${money(price)}</p>`;
  $$('[data-o]',body).forEach(b=>b.onclick=()=>{name=b.dataset.o;addAmt=+b.dataset.add||0;draw()});
  $$('[data-buy]',body).forEach(b=>b.onclick=()=>{purchase=b.dataset.buy;draw()});
 };
 draw();
 $('#pickAdd').onclick=()=>{const v=p.subSave&&purchase==='sub'?`${name} · Subscribe every 2 weeks`:name;add(p.id,v,1,addAmt,purchase);shut($('#pick'));if(!$('#drawer').classList.contains('on'))openCart()};
 openLayer($('#pick'));($('[data-o]',body)||$('#pickAdd')).focus();
}
function grids(){
 $$('[data-grid]').forEach(g=>{const f=g.dataset.grid;let ps=S.products;if(f&&f!=='all')ps=ps.filter(p=>p.cat===f||(p.tags||[]).includes(f));if(g.dataset.limit)ps=ps.slice(0,+g.dataset.limit);const plain=g.hasAttribute('data-plain');g.innerHTML=ps.map(p=>card(p,plain)).join('')});
 revealCards();
 document.addEventListener('click',e=>{
  const filt=e.target.closest('[data-filter]');
  if(filt&&$('#mainGrid')){e.preventDefault();applyFilter(filt.dataset.filter);return}
  const b=e.target.closest('[data-add]');if(!b)return;e.preventDefault();
  if(b.dataset.planChosen){add(b.dataset.add,b.dataset.v,1,+b.dataset.addAmt||0,'sub');return}
  const p=P(b.dataset.add);if(!p)return;
  if(opts(p).length||p.subSave)openPicker(p);else add(p.id,'',1,0,'once');
 });
 const preset=new URLSearchParams(location.search).get('cat');if(preset)applyFilter(preset);
}
function perkList(p){
 if(p.digital)return ['Instant download by email','Personal license for your own work','No shipping — nothing is mailed'];
 if(p.subSave)return ['250g bag, roasted after you order','Subscribe & save 15%, cancel anytime',S.freeShip?`Free shipping over ${money(S.freeShip)}`:'Roasted to order'];
 return S.perks||[];
}
function pdp(){
 const root=$('#pdp');if(!root)return;
 document.body.classList.add('has-pdp');
 const id=new URLSearchParams(location.search).get('id')||S.products[0].id;const p=P(id)||S.products[0];
 document.title=p.name+' – '+S.name;
 const md=$('meta[name="description"]');if(md)md.setAttribute('content',String(p.desc||'').slice(0,160));
 const canon=$('link[rel="canonical"]');if(canon)canon.href='https://junqiangxiao235-art.github.io/SHOPIFY'+location.pathname.replace(/^\/SHOPIFY/,'')+location.search;
 const list=opts(p);let name=list[0]?list[0].name:'';let addAmt=list[0]?list[0].add:0;let purchase='once';let q=1;
 const sale0=p.compare&&p.compare>p.price;
 const gallery=p.mock?`<div class="gallery"><div class="main-img">${mockHTML(p)}</div></div>`:
  `<div class="gallery"><div class="main-img">${photoHTML(p.img,p.name,{w:1100,h:1375,priority:true,widths:[640,960,1280],sizes:'(max-width:820px) 100vw, 55vw'})}</div>${(p.imgs||[]).length?`<div class="thumbs">${[p.img,...p.imgs].map((m,i)=>`<button type="button" class="${i?'':'on'}" data-img="${esc(m)}" aria-label="Show photo ${i+1} of ${esc(p.name)}">${photoHTML(m,'',{w:240,h:240,widths:[240],sizes:'80px'})}</button>`).join('')}</div>`:''}</div>`;
 const sizeGuide=S.id==='lumen'&&list.some(o=>o.name==='Twin')?`<button type="button" class="linkish" id="sizeBtn">Size guide</button>`:'';
 root.innerHTML=`${gallery}<div class="pinfo"><div class="crumbs"><a href="index.html">Home</a> / ${esc(p.cat)} / ${esc(p.name)}</div>${p.badge?`<span class="eyebrow">${esc(p.badge)}</span>`:''}<h1>${esc(p.name)}</h1><div class="stars"><span class="s" aria-hidden="true">${stars(p.rating)}</span><span>${p.rating.toFixed(1)} · ${p.reviews} ${S.t.reviews||'reviews'} · product rating</span></div>
 <div class="price"><span class="now ${sale0?'on-sale':''}" id="nowPrice"></span><s id="wasPrice" hidden></s><span class="save" id="savePct" hidden></span></div>
 <p style="color:var(--muted)">${esc(p.desc)}</p>
 ${p.skin?`<p class="skin-line">Best for: ${esc(p.skin)}</p>`:''}
 ${p.subSave?`<div class="purchase" role="radiogroup" aria-label="Purchase type" id="buyType"><button type="button" class="on" data-buy="once">One-time</button><button type="button" data-buy="sub">Subscribe &amp; save 15%</button></div><p class="subnote" id="subnote" hidden>Renews every 2 weeks · cancel anytime. ${esc(p.hint||'Whole bean stays freshest if you are unsure.')}</p>`:''}
 ${list.length?`<div class="opt"><label>${esc(p.variants.label)}: <span id="vlab">${esc(name)}</span></label><div class="chips">${list.map((o,i)=>`<button type="button" class="${i?'':'on'}" data-v="${esc(o.name)}" data-add="${o.add}" aria-pressed="${i?'false':'true'}">${esc(optText(o))}</button>`).join('')}</div>${sizeGuide}${p.hint&&!p.subSave?`<p class="hint">${esc(p.hint)}</p>`:''}</div>`:''}
 <div class="buyrow"><div class="qty"><button type="button" id="qm" aria-label="Decrease quantity">−</button><span id="qv">1</span><button type="button" id="qp" aria-label="Increase quantity">+</button></div><button class="btn accent" type="button" id="addBtn"><span>${S.t.addToCart||'Add to cart'}</span><span id="btnPrice"></span></button></div>
 <button class="btn block" type="button" id="buyNow">${S.t.buyNow||'Buy it now'}</button>
 <ul class="perks">${perkList(p).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
 ${(p.details||S.details||[]).map((d,i)=>`<details ${i?'':'open'}><summary>${esc(d[0])}</summary>${String(d[1]).startsWith('<')?d[1]:`<p>${esc(d[1])}</p>`}</details>`).join('')}
 </div>
 <div class="sticky-atc" id="stickyAtc"><div class="sa-meta"><b>${esc(p.name)}</b><span id="saPrice"></span></div><button class="btn accent" type="button" id="saAdd">Add</button></div>`;
 const paint=()=>{
  const unit=(()=>{let price=p.price+addAmt;if(purchase==='sub'&&p.subSave)price=Math.round(price*85)/100;return price})();
  const showSale=sale0&&addAmt===0&&purchase!=='sub';
  $('#nowPrice').textContent=money(unit);
  $('#nowPrice').classList.toggle('on-sale',!!showSale);
  $('#wasPrice').hidden=!showSale;if(showSale)$('#wasPrice').textContent=money(p.compare);
  const pct=showSale?Math.round((1-p.price/p.compare)*100):0;
  $('#savePct').hidden=!showSale;if(showSale)$('#savePct').textContent=`${S.t.save||'Save'} ${pct}%`;
  $('#btnPrice').textContent=money(unit*q);
  $('#saPrice').textContent=money(unit*q);
  const onceBtn=$('[data-buy="once"]',root), subBtn=$('[data-buy="sub"]',root);
  if(onceBtn)onceBtn.textContent=`One-time · ${money(p.price+addAmt)}`;
  if(subBtn)subBtn.textContent=`Subscribe & save 15% · ${money(Math.round((p.price+addAmt)*85)/100)}`;
  $('#qv').textContent=q;
  const sn=$('#subnote');if(sn)sn.hidden=purchase!=='sub';
 };
 paint();
 $$('.thumbs button',root).forEach(b=>b.onclick=()=>{$$('.thumbs button',root).forEach(x=>x.classList.remove('on'));b.classList.add('on');const img=$('#mainImg')||$('.main-img img',root);if(img)img.src=srcOf(b.dataset.img,1100)});
 $$('[data-v]',root).forEach(b=>b.onclick=()=>{$$('[data-v]',root).forEach(x=>{x.classList.remove('on');x.setAttribute('aria-pressed','false')});b.classList.add('on');b.setAttribute('aria-pressed','true');name=b.dataset.v;addAmt=+b.dataset.add||0;$('#vlab').textContent=optText(opts(p).find(o=>o.name===name)||{name,add:addAmt});paint()});
 $$('[data-buy]',root).forEach(b=>b.onclick=()=>{purchase=b.dataset.buy;$$('[data-buy]',root).forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b?'true':'false')});paint()});
 $('#qm').onclick=()=>{q=Math.max(1,q-1);paint()};$('#qp').onclick=()=>{q++;paint()};
 const go=()=>{const v=p.subSave&&purchase==='sub'?`${name} · Subscribe every 2 weeks`:name;add(p.id,v,q,addAmt,purchase)};
 $('#addBtn').onclick=go;$('#saAdd').onclick=go;
 $('#buyNow').onclick=()=>{go();location.href='checkout.html'};
 const sb=$('#sizeBtn');if(sb)sb.onclick=()=>openInfo('Size guide',sizeGuideHTML());
 const rel=$('[data-related]');if(rel)rel.innerHTML=S.products.filter(x=>x.id!==p.id).slice(0,4).map(card).join('');
 const rv=$('#pdpReviews');if(rv){rv.innerHTML=`<div class="rv-summary"><div><div class="rv-big">${p.rating.toFixed(1)}</div><div class="stars"><span class="s" aria-hidden="true">${stars(p.rating)}</span>Product rating · ${p.reviews} ${S.t.reviews||'reviews'}</div></div></div><h3 style="font-size:22px;margin:0 0 14px">Store reviews</h3><p class="hint" style="margin-top:0">From other orders in this demo shop, not only this product.</p><div class="reviews">${S.reviews.slice(0,3).map(reviewHTML).join('')}</div>`}
 const ld={ '@context':'https://schema.org','@type':'Product',name:p.name,image:p.mock?[]:[srcOf(p.img,1200)],description:p.desc,sku:p.id,brand:{'@type':'Brand',name:S.name},offers:{'@type':'Offer',priceCurrency:S.currency,price:p.price,availability:'https://schema.org/InStock',url:location.href}};
 setLd(ld);
}
function sizeGuideHTML(){return `<table style="width:100%;border-collapse:collapse;font-size:14px"><tr><th align="left">Size</th><th align="left">Duvet cover</th></tr>${[['Twin','173 × 224 cm · 68 × 88 in'],['Queen','229 × 229 cm · 90 × 90 in'],['King','264 × 229 cm · 104 × 90 in'],['Cal King','264 × 213 cm · 104 × 84 in']].map(r=>`<tr><td style="padding:6px 8px 6px 0">${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table><p class="hint">Measurements are the finished cover. This is a demo size chart.</p>`}
function reviewHTML(r){const loc=String(r.loc||'').replace(/^Verified buyer\s*·\s*/i,'');const initial=esc(String(r.name||'?').trim().slice(0,1).toUpperCase());return `<div class="review"><div class="stars"><span class="s" aria-hidden="true">★★★★★</span></div><p>“${esc(r.text)}”</p><div class="who"><span class="avatar" aria-hidden="true">${initial}</span><div><b>${esc(r.name)}</b><br><span class="verified">✓ ${S.t.verified||'Verified buyer'}</span>${loc?` · ${esc(loc)}`:''}</div></div></div>`}
S.reviewHTML=reviewHTML;
function reviews(){$$('[data-reviews]').forEach(el=>el.innerHTML=S.reviews.slice(0,+(el.dataset.reviews||3)).map(reviewHTML).join(''))}
function setErr(input,msg){if(!input)return false;input.classList.toggle('field-error',!!msg);input.setAttribute('aria-invalid',msg?'true':'false');let n=input.nextElementSibling;if(!n||!n.classList.contains('err')){n=document.createElement('p');n.className='err';input.after(n)}n.textContent=msg||'';n.hidden=!msg;return !!msg}
function checkout(){
 const r=$('#coSummary');if(!r)return;
 const country=$('#co-country');const region=$('#regionWrap');const regionLabel=$('#regionLabel');const eta=$('#eta');const shipFields=$('#shipFields');const digitalNote=$('#digitalNote');
 function syncCountry(){
  const digital=allDigital();
  if(shipFields)shipFields.hidden=digital;
  if(digitalNote)digitalNote.hidden=!digital;
  const info=COUNTRIES[(country&&country.value)||'United States']||COUNTRIES['United States'];
  if(region){region.hidden=digital||!info.region;if(regionLabel&&info.region)regionLabel.textContent=info.region}
  if(eta)eta.textContent=digital?'':`Estimated delivery ${info.days}.`;
 }
 const draw=()=>{
  syncCountry();
  const sub=subtotal();const off=discount?+(sub*discount.pct).toFixed(2):0;const ship=shipFee();const info=COUNTRIES[(country&&country.value)||'United States']||COUNTRIES['United States'];
  const rows=cart.length?cart.map(l=>{const p=P(l.id);if(!p)return'';return `<div class="sumline"><div class="ph">${thumb(p,64)}<b>${l.q}</b></div><div><b>${esc(p.name)}</b><div style="font-size:12px;color:var(--muted)">${esc(l.v||'')}</div></div><div>${money(unitPrice(p,l)*l.q)}</div></div>`}).join(''):'<p>Your cart is empty. <a href="index.html#shop">Continue shopping</a></p>';
  const disc=discount?`<div class="sumrow"><span>Discount (${esc(discount.code)})</span><span>−${money(off)}</span></div>`:'';
  const shipLabel=allDigital()?'Digital delivery':`Shipping · ${esc((country&&country.value)||'United States')}`;
  const shipVal=allDigital()?'Free':ship?money(ship):'FREE';
  const extra=S.duties&&!allDigital()?'<div class="sumrow"><span>Duties & import taxes</span><span>Included</span></div>':'';
  const sample=S.sample&&cart.length?'<div class="sumrow"><span>Free sample</span><span>$0</span></div>':'';
  const renew=anySub()?'<p class="hint">Renews every 2 weeks at the subscription price. Cancel anytime before the next roast ships.</p>':'';
  const etaLine=allDigital()?'<p class="hint">Download links would be emailed. No payment is captured.</p>':`<p class="hint">Demo estimate for ${esc(info.days)}. No payment is captured.</p>`;
  r.innerHTML=rows+`<div style="display:flex;gap:8px;margin:16px 0 0"><label class="sr-only" for="discount">Discount code</label><input id="discount" placeholder="Discount code" style="margin:0" value="${discount?esc(discount.code):''}"><button class="btn alt" type="button" id="applyCode" style="padding:10px 18px">Apply</button></div><p id="discMsg" class="disc-msg" aria-live="polite"></p>`+disc+`<div class="sumrow"><span>Subtotal</span><span>${money(sub)}</span></div>`+extra+sample+`<div class="sumrow"><span>${shipLabel}</span><span>${shipVal}</span></div><div class="sumrow t"><span>Total</span><span><small style="font-size:12px;font-weight:400;color:var(--muted)">${cur} </small>${money(sub-off+ship)}</span></div>`+renew+etaLine;
  const msg=$('#discMsg');
  if(discount){msg.textContent=`${discount.code} applied — 10% off.`;msg.className='disc-msg ok'}
  $('#applyCode').onclick=()=>{
   const code=$('#discount').value.trim().toUpperCase();
   if(code==='WELCOME10'){discount={code,pct:.1};draw()}
   else{discount=null;draw();const m=$('#discMsg');m.textContent=code?'Code not valid. Try WELCOME10.':'Enter a code. Demo code: WELCOME10.';m.className='disc-msg bad'}
  };
  const btn=$('#placeOrder');if(btn)btn.textContent=anySub()&&cart.every(l=>l.purchase==='sub'||(P(l.id)||{}).subscription)?'Start subscription':'Place demo order';
 };
 if(country)country.onchange=draw;
 const toggle=$('#sumToggle');
 const col=$('.co .r');
 if(toggle&&col){
  const set=open=>{col.classList.toggle('is-collapsed',!open);toggle.setAttribute('aria-expanded',open?'true':'false');toggle.textContent=open?'Hide order summary':'Show order summary'};
  set(window.innerWidth>820);
  toggle.onclick=()=>set(col.classList.contains('is-collapsed'));
 }
 draw();
 const form=$('#coForm');if(!form)return;
 form.onsubmit=e=>{
  e.preventDefault();
  if(!cart.length){toast('Your cart is empty');return}
  const digital=allDigital();
  const fields=[['co-email',v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),'Enter a valid email']];
  if(!digital){fields.push(['co-first',v=>v.trim().length>0,'Enter a first name'],['co-last',v=>v.trim().length>0,'Enter a last name'],['co-addr',v=>v.trim().length>3,'Enter a street address'],['co-city',v=>v.trim().length>1,'Enter a city'],['co-zip',v=>v.trim().length>2,'Enter a postal code']);
   const info=COUNTRIES[(country&&country.value)||'United States'];
   if(info&&info.region)fields.push(['co-region',v=>v.trim().length>1,`Enter a ${info.region.toLowerCase()}`]);
  }
  fields.push(['co-card',v=>/^\d{13,19}$/.test(v.replace(/\s/g,'')),'Enter a demo card number (16 digits, no charge)'],['co-exp',v=>/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(v),'Use MM / YY'],['co-cvc',v=>/^\d{3,4}$/.test(v),'Enter the 3-digit CVC']);
  let bad=0,first=null;
  fields.forEach(([id,ok,msg])=>{const el=$('#'+id);const fail=el&&!ok(el.value||'');if(setErr(el,fail?msg:'')){bad++;if(!first)first=el}});
  const banner=$('#coBanner');
  if(bad){if(banner){banner.hidden=false;banner.textContent=`${bad} field${bad>1?'s':''} need attention before this demo order can be placed.`}first&&first.focus();return}
  if(banner)banner.hidden=true;
  const n='#'+(1000+Math.floor(Math.random()*9000));
  form.innerHTML=`<div style="padding:40px 0;text-align:center"><div style="font-size:54px" aria-hidden="true">✓</div><h1 style="font-size:32px;margin:10px 0">Order ${n} confirmed</h1><p style="color:var(--muted)">This is a demo checkout — no payment was taken.${allDigital()?' Download links would be emailed.':''}</p><br><a class="btn accent" href="index.html">Back to store</a></div>`;
  cart=[];discount=null;save();draw();
 };
}
function openInfo(title,html){
 let dlg=$('#infoDlg');
 if(!dlg){document.body.insertAdjacentHTML('beforeend','<div class="modal" id="infoDlg" role="dialog" aria-modal="true" aria-labelledby="infoTitle" inert aria-hidden="true"><h3 id="infoTitle"></h3><div id="infoBody"></div><button class="btn" type="button" id="infoClose" style="margin-top:14px">Close</button></div>');dlg=$('#infoDlg');$('#infoClose').onclick=closeAll}
 $('#infoTitle').textContent=title;$('#infoBody').innerHTML=html;lastFocus=document.activeElement;openLayer(dlg);$('#infoClose').focus();
}
function policies(){
 const copy={
  refund:'Demo policy: physical goods can be returned within the window shown in the footer. Digital downloads are delivered by email and are not shipped back. Nothing on this page is a real purchase.',
  shipping:S.duties?'Duties and import taxes are included in the price. Delivery estimates update when you change country. This is a portfolio demo, so no parcel is sent.':'Shipping is calculated from the destination and waived over the free-shipping threshold. Digital goods are not shipped. This is a portfolio demo.',
  privacy:'The form stays in your browser. This demo does not send your email, card number, or address to a server.'
 };
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-policy]');if(b){e.preventDefault();openInfo(b.textContent.trim(),`<p>${copy[b.dataset.policy]||'Demo information.'}</p>`);return}
  if(e.target.closest('[data-size]')){e.preventDefault();openInfo('Size guide',sizeGuideHTML())}
});
 const notes={};
 $$('[data-note]').forEach(b=>{b.addEventListener('click',()=>openInfo(b.dataset.note,`<p>${esc(b.dataset.note)} is part of this fictional demo store. No separate page is published.</p>`))});
}
function plans(){
 const root=document.querySelector('#subscribe');if(!root)return;
 const btn=root.querySelector('[data-add="subscription"]');if(!btn)return;
 if(!root.querySelector('#planFreq'))btn.insertAdjacentHTML('beforebegin','<label class="plan-freq">Grind <select id="planGrind" aria-label="Grind"><option>Whole bean</option><option>Espresso</option><option>Filter / V60</option><option>French press</option></select></label><label class="plan-freq">Frequency <select id="planFreq" aria-label="Frequency"><option>Every 2 weeks</option><option>Every 4 weeks</option></select></label>');
 let chosen=null;
 const cards=$$('.plan', root);
 function paint(){
  cards.forEach(c=>c.classList.toggle('on',c===chosen));
  if(!chosen){btn.textContent='Choose a plan';btn.removeAttribute('data-plan-chosen');return}
  const add=+chosen.dataset.add||0;const price=36+add;
  const freq=root.querySelector('#planFreq').value;const grind=root.querySelector('#planGrind').value;
  btn.dataset.planChosen='1';btn.dataset.v=`${chosen.dataset.plan} · ${grind} · ${freq}`;btn.dataset.addAmt=String(add);
  btn.textContent=`Start ${chosen.dataset.plan} — ${money(price)}`;
 }
 cards.forEach(c=>{c.setAttribute('role','button');c.tabIndex=0;const go=()=>{chosen=c;cards.forEach(x=>x.setAttribute('aria-pressed',x===c?'true':'false'));paint()};c.onclick=go;c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}});
 root.querySelector('#planFreq').onchange=paint;root.querySelector('#planGrind').onchange=paint;
 const popular=cards[1]||cards[0];if(popular){chosen=popular;popular.setAttribute('aria-pressed','true');paint()}
}
function quiz(){
 if(!S.quiz)return;
 $$('a[href="#quiz"],a[href$="#quiz"]').forEach(a=>a.setAttribute('data-quiz','1'));
 document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="quiz" role="dialog" aria-modal="true" aria-labelledby="quizTitle" inert aria-hidden="true"><h3 id="quizTitle">Skin quiz</h3><div id="quizBody"></div><button class="linkish" type="button" id="quizClose">Close</button></div>`);
 const steps=[
  {q:'How does your skin usually feel by afternoon?',opts:[['Tight or flaky','dry'],['Shiny on the T-zone','oil'],['Easily red or stingy','sensitive'],['A bit of everything','combo']]},
  {q:'What do you want to change first?',opts:[['Dullness','glow-serum'],['Dry patches','barrier-cream'],['Oil and clogged pores','clay-mask'],['Uneven tone','face-oil']]},
  {q:'How many steps will you actually do?',opts:[['One or two','short'],['A full routine','ritual-set']]}
 ];
 let i=0;const ans={};
 function render(){
  if(i>=steps.length){
   let id=ans.concern;if(ans.steps==='ritual-set')id='ritual-set';if(ans.feel==='sensitive'&&ans.steps==='short')id='cloud-cleanser';
   const p=P(id)||S.products[0];
   $('#quizBody').innerHTML=`<p>For this demo, a match is <b>${esc(p.name)}</b>.</p><p class="hint">${esc(p.skin||p.desc||'')}</p><a class="btn accent" href="product.html?id=${p.id}">View ${esc(p.name)}</a>`;
   return;
  }
  const s=steps[i];
  $('#quizBody').innerHTML=`<p>${esc(s.q)}</p><div class="quiz-opts">${s.opts.map(o=>`<button type="button" data-a="${esc(o[1])}">${esc(o[0])}</button>`).join('')}</div><p class="hint">Question ${i+1} of ${steps.length}. This quiz is a demo, not dermatological advice.</p>`;
  $$('[data-a]', $('#quizBody')).forEach(b=>b.onclick=()=>{if(i===0)ans.feel=b.dataset.a;if(i===1)ans.concern=b.dataset.a;if(i===2)ans.steps=b.dataset.a;i++;render()});
 }
 $('#quizClose').onclick=closeAll;
 document.addEventListener('click',e=>{if(e.target.closest('[data-quiz]')){e.preventDefault();i=0;render();lastFocus=document.activeElement;openLayer($('#quiz'));const b=$('#quizBody button');if(b)b.focus()}});
 render();
}
function revealCards(){
 if(document.documentElement.getAttribute('data-motion')==='off')return;
 if(!document.body.classList.contains('store-home')||!('IntersectionObserver' in window))return;
 if(!revealCards.io){
  revealCards.io=new IntersectionObserver(entries=>{
   entries.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');revealCards.io.unobserve(e.target)});
  },{threshold:.18});
 }
 $$('.store-home .card').forEach(c=>{
  if(c.dataset.reveal)return;
  if(c.getBoundingClientRect().top<innerHeight*.92)return;
  c.dataset.reveal='1';c.classList.add('reveal');revealCards.io.observe(c);
 });
}
function heroMotion(){
 const v=document.querySelector('video[data-hero]');
 if(!v||document.documentElement.getAttribute('data-motion')==='off')return;
 const arm=()=>{
  v.querySelectorAll('source[data-src]').forEach(s=>{if(!s.getAttribute('src'))s.src=s.dataset.src});
  const play=()=>{v.classList.add('is-on');const p=v.play();if(p)p.catch(()=>{})};
  v.addEventListener('canplay',play,{once:true});
  v.load();
 };
 if(document.readyState==='complete'){if('requestIdleCallback' in window)requestIdleCallback(arm,{timeout:1200});else setTimeout(arm,400)}
 else window.addEventListener('load',()=>{if('requestIdleCallback' in window)requestIdleCallback(arm,{timeout:1200});else setTimeout(arm,400)});
}
function homeBuy(){
 $$('[data-hm-product]').forEach(box=>{
  const p=P(box.dataset.hmProduct);if(!p)return;
  let purchase='sub';
  const paint=()=>{
   $$('[data-hm-buy]',box).forEach(b=>{const on=b.dataset.hmBuy===purchase;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false')});
   const once=box.querySelector('[data-hm-buy="once"]');
   const sub=box.querySelector('[data-hm-buy="sub"]');
   if(once)once.textContent=`One-time · ${money(p.price)}`;
   if(sub)sub.textContent=`Subscribe · ${money(Math.round(p.price*85)/100)}`;
  };
  $$('[data-hm-buy]',box).forEach(b=>b.onclick=()=>{purchase=b.dataset.hmBuy;paint()});
  const go=box.querySelector('[data-hm-add]');
  if(go)go.onclick=()=>{const v=purchase==='sub'?'Whole bean · Subscribe every 2 weeks':'Whole bean';add(p.id,v,1,0,purchase)};
  paint();
 });
}
function setLd(data){let el=$('#jsonld');if(!el){el=document.createElement('script');el.id='jsonld';el.type='application/ld+json';document.head.appendChild(el)}el.textContent=JSON.stringify(data)}
function orgLd(){
 if($('#pdp')||$('#coForm'))return;
 const path=location.pathname.replace(/\/index\.html$/,'').replace(/\/$/,'');
 setLd({'@context':'https://schema.org','@type':'Organization',name:S.name,url:'https://junqiangxiao235-art.github.io/SHOPIFY'+path.replace(/^\/SHOPIFY/,'')+'/',description:($('meta[name="description"]')||{}).content||S.name});
}
document.addEventListener('DOMContentLoaded',()=>{
 const main=$('main');if(main&&!main.id)main.id='main';
 chrome();grids();reviews();pdp();checkout();renderCart();policies();plans();quiz();homeBuy();heroMotion();orgLd();
});
})();
