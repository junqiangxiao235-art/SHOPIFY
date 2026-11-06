(function(){
const S=window.STORE;const KEY='cart_'+S.id;const CKEY='cur_'+S.id;
const $=(q,el=document)=>el.querySelector(q),$$=(q,el=document)=>[...el.querySelectorAll(q)];
const img=(id,w=800)=>id.startsWith('http')?id:`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75&fm=webp`;
const srcset=id=>{if(!id||String(id).startsWith('http'))return '';return [480,800,1200].map(w=>`${img(id,w)} ${w}w`).join(', ')};
const vName=o=>o&&typeof o==='object'?o.name:String(o||'');
const vAdd=o=>{if(o&&typeof o==='object')return +o.add||0;const m=String(o||'').match(/\(\+\$(\d+(?:\.\d+)?)\)/);return m?+m[1]:0};
const optOf=(p,name)=>{const opts=p&&p.variants&&p.variants.options||[];return opts.find(o=>vName(o)===name)||opts[0]};
const unitPrice=(p,line)=>{if(!p)return 0;const o=optOf(p,line&&line.v);return p.price+(o?vAdd(o):0)};
const allDigital=()=>cart.length>0&&cart.every(l=>{const p=P(l.id);return p&&p.digital});
S.img=img;
let cur=localStorage.getItem(CKEY)||S.currency;
const rate=()=> (S.rates&&S.rates[cur])||1;
const sym=()=> (S.symbols&&S.symbols[cur])||S.symbol;
const money=v=>{const n=v*rate();return sym()+(n%1===0&&!S.cents?n.toFixed(0):n.toFixed(2))};
S.money=money;
const P=id=>S.products.find(p=>p.id===id);
const stars=r=>'★★★★★'.slice(0,Math.round(r))+'☆☆☆☆☆'.slice(0,5-Math.round(r));
let cart=JSON.parse(localStorage.getItem(KEY)||'[]');
const save=()=>{localStorage.setItem(KEY,JSON.stringify(cart));renderCart()};
function add(id,variant,qty=1){const k=id+'|'+(variant||'');const l=cart.find(x=>x.k===k);if(l)l.q+=qty;else cart.push({k,id,v:variant||'',q:qty});save();openCart();}
S.add=add;
function toast(t){let el=$('.toast');if(!el){el=document.createElement('div');el.className='toast';document.body.appendChild(el)}el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),2200)}
S.toast=toast;
function subtotal(){return cart.reduce((s,l)=>{const p=P(l.id);return s+(p?unitPrice(p,l)*l.q:0)},0)}
S.subtotal=subtotal;S.getCart=()=>cart;S.clearCart=()=>{cart=[];save()};
const I={search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
bag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 6l12 12M18 6 6 18"/></svg>',
menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'};
S.icons=I;
// chrome
function chrome(){
 const ann=$('#announce');if(ann){const msgs=S.announce.map(m=>`<span>${m}</span>`).join('');ann.innerHTML=`<div class="track">${msgs}${msgs}${msgs}${msgs}</div>`}
 const h=$('#header');if(h){
  const curSel=S.rates?`<select class="cur-select" id="cur">${Object.keys(S.rates).map(c=>`<option ${c===cur?'selected':''}>${c}</option>`).join('')}</select>`:'';
  h.innerHTML=`<div class="wrap bar"><button class="icon-btn menu-btn" aria-label="Menu" id="menuBtn">${I.menu}</button><a class="logo" href="index.html">${S.logo}</a><nav class="main" id="nav">${S.nav.map(n=>`<a href="${n[1]}">${n[0]}</a>`).join('')}</nav><div class="icons">${curSel}<button class="icon-btn" id="searchBtn" aria-label="Search">${I.search}</button><a class="icon-btn" href="#" aria-label="Account">${I.user}</a><button class="icon-btn" id="cartBtn" aria-label="Cart">${I.bag}<span class="cart-count" data-n="0">0</span></button></div></div>`;
  $('#menuBtn').onclick=()=>$('#nav').classList.toggle('open');
  $('#cartBtn').onclick=openCart;$('#searchBtn').onclick=openSearch;
  const cs=$('#cur');if(cs)cs.onchange=e=>{cur=e.target.value;localStorage.setItem(CKEY,cur);location.reload()};
 }
 document.body.insertAdjacentHTML('beforeend',`<div class="overlay" id="ov"></div>
 <aside class="drawer" id="drawer" aria-label="Cart"><div class="dh"><h3>${S.t.cart||'Your cart'}</h3><button class="icon-btn" id="dClose" aria-label="Close cart">${I.x}</button></div><div class="ship-bar" id="shipBar"></div><div class="lines" id="lines"></div><div class="df"><div class="tot"><span>${S.t.subtotal||'Subtotal'}</span><span id="sub"></span></div><div class="note">${S.t.taxNote||'Taxes and shipping calculated at checkout.'}</div><a class="btn accent block" href="checkout.html" id="coBtn">${S.t.checkout||'Checkout'}</a></div></aside>
 <div class="search-pop" id="sp"><div class="wrap"><div style="display:flex;gap:10px;align-items:center"><input id="sq" placeholder="${S.t.search||'Search products…'}" aria-label="${S.t.search||'Search products'}"><button class="icon-btn" id="sClose" aria-label="Close search">${I.x}</button></div><div class="search-res" id="sr"></div></div></div>`);
 $('#ov').onclick=closeAll;$('#dClose').onclick=closeAll;$('#sClose').onclick=closeAll;
 $('#sq').oninput=e=>{const q=e.target.value.toLowerCase();const r=S.products.filter(p=>!q||(p.name+p.cat+(p.sub||'')).toLowerCase().includes(q)).slice(0,8);$('#sr').innerHTML=r.map(p=>`<a href="product.html?id=${p.id}"><img src="${img(p.img,120)}" alt=""><span>${p.name}<br><b>${money(p.price)}</b></span></a>`).join('')||'<p>No results</p>'};
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
 $$('form[data-news]').forEach(f=>f.onsubmit=e=>{e.preventDefault();f.reset();const ok=f.parentElement.querySelector('.ok');if(ok)ok.style.display='block';toast(S.t.subscribed||'Thanks for subscribing!')});
}
function openCart(){$('#drawer').classList.add('on');$('#ov').classList.add('on')}
function openSearch(){$('#sp').classList.add('on');$('#ov').classList.add('on');$('#sq').dispatchEvent(new Event('input'));setTimeout(()=>$('#sq').focus(),200)}
function closeAll(){['#drawer','#ov','#sp'].forEach(q=>$(q)&&$(q).classList.remove('on'))}
S.openCart=openCart;
function renderCart(){
 const n=cart.reduce((s,l)=>s+l.q,0);$$('.cart-count').forEach(e=>{e.textContent=n;e.dataset.n=n});
 const L=$('#lines');if(!L)return;
 const sub=subtotal();$('#sub').textContent=money(sub);
 const th=S.freeShip||0;
 $('#shipBar').innerHTML=th?(sub>=th?`🎉 ${S.t.freeShipDone||"You've unlocked free shipping!"}`:`${(S.t.freeShipLeft||'You are {x} away from free shipping').replace('{x}','<b>'+money(th-sub)+'</b>')}`)+`<div class="bar"><i style="width:${Math.min(100,sub/th*100)}%"></i></div>`:'';
 $('#coBtn').style.pointerEvents=cart.length?'auto':'none';$('#coBtn').style.opacity=cart.length?1:.5;
 if(!cart.length){L.innerHTML=`<div class="empty">${S.t.empty||'Your cart is empty.'}<br><br><a class="btn alt" href="index.html#shop">${S.t.continue||'Continue shopping'}</a></div>`;return}
 L.innerHTML=cart.map((l,i)=>{const p=P(l.id);if(!p)return'';const unit=unitPrice(p,l);return `<div class="line"><img src="${img(p.img,200)}" alt=""><div><div style="font-weight:600">${p.name}</div>${l.v?`<div class="v">${l.v}</div>`:''}<div class="qty"><button data-d="-1" data-i="${i}">−</button><span>${l.q}</span><button data-d="1" data-i="${i}">+</button></div><button class="rm" data-rm="${i}">${S.t.remove||'Remove'}</button></div><div style="font-weight:600">${money(unit*l.q)}</div></div>`}).join('');
 $$('[data-d]',L).forEach(b=>b.onclick=()=>{const l=cart[+b.dataset.i];l.q+=+b.dataset.d;if(l.q<1)cart.splice(+b.dataset.i,1);save()});
 $$('[data-rm]',L).forEach(b=>b.onclick=()=>{cart.splice(+b.dataset.rm,1);save()});
}
function card(p){
 const sale=p.compare&&p.compare>p.price;
 const badge=p.badge?`<span class="badge ${p.badge.match(/sale|off|%/i)?'sale':''}">${p.badge}</span>`:(sale?`<span class="badge sale">${S.t.sale||'Sale'}</span>`:'');
 return `<div class="card">${badge}<a class="media" href="product.html?id=${p.id}"><img loading="lazy" decoding="async" src="${img(p.img,700)}" srcset="${srcset(p.img)}" sizes="(max-width:820px) 46vw, 25vw" alt="${p.name}"></a><button class="btn quick" data-add="${p.id}">${S.t.quickAdd||'Quick add'} · ${money(unitPrice(p,{}))}</button><div class="info"><a class="name" href="product.html?id=${p.id}">${p.name}</a>${p.sub?`<div class="sub">${p.sub}</div>`:''}<div class="stars"><span class="s">${stars(p.rating)}</span>${p.rating.toFixed(1)} (${p.reviews})</div><div class="price"><span class="now ${sale?'on-sale':''}">${S.t.from&&p.variants?S.t.from+' ':''}${money(p.price)}</span>${sale?`<s>${money(p.compare)}</s>`:''}</div></div></div>`;
}
S.card=card;
function grids(){
 $$('[data-grid]').forEach(g=>{const f=g.dataset.grid;let ps=S.products;if(f&&f!=='all')ps=ps.filter(p=>p.cat===f||(p.tags||[]).includes(f));if(g.dataset.limit)ps=ps.slice(0,+g.dataset.limit);g.innerHTML=ps.map(card).join('')});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b){e.preventDefault();const p=P(b.dataset.add);const first=p.variants?vName(p.variants.options[0]):'';add(p.id,first)}});
 $$('[data-filter]').forEach(b=>b.onclick=()=>{$$('[data-filter]').forEach(x=>x.classList.remove('on'));b.classList.add('on');const g=$('#mainGrid');g.dataset.grid=b.dataset.filter;const f=b.dataset.filter;g.innerHTML=S.products.filter(p=>f==='all'||p.cat===f).map(card).join('')});
}
// product page
function pdp(){
 const root=$('#pdp');if(!root)return;
 const id=new URLSearchParams(location.search).get('id')||S.products[0].id;const p=P(id)||S.products[0];
 document.title=p.name+' – '+S.name;
 const imgs=[p.img,...(p.imgs||[])];const sale=p.compare&&p.compare>p.price;
 let variant=p.variants?vName(p.variants.options[0]):'';let q=1;
 const priceNow=()=>p.price+vAdd(optOf(p,variant));
 root.innerHTML=`<div class="gallery"><div class="main-img"><img id="mainImg" src="${img(imgs[0],1100)}" srcset="${srcset(imgs[0])}" sizes="(max-width:820px) 100vw, 55vw" alt="${p.name}" fetchpriority="high" decoding="async"></div><div class="thumbs">${imgs.map((m,i)=>`<button class="${i?'':'on'}" data-img="${m}"><img src="${img(m,240)}" alt=""></button>`).join('')}</div></div>
 <div class="pinfo"><div class="crumbs"><a href="index.html">Home</a> / ${p.cat} / ${p.name}</div>${p.badge?`<span class="eyebrow">${p.badge}</span>`:''}<h1>${p.name}</h1><div class="stars"><span class="s">${stars(p.rating)}</span>${p.rating.toFixed(1)} · ${p.reviews} ${S.t.reviews||'reviews'}</div>
 <div class="price"><span class="now ${sale?'on-sale':''}" id="priceNow">${money(priceNow())}</span>${sale?`<s>${money(p.compare)}</s><span class="save">${S.t.save||'Save'} ${Math.round((1-p.price/p.compare)*100)}%</span>`:''}</div>
 <p style="color:var(--muted)">${p.desc}</p>
 ${p.variants?`<div class="opt"><label>${p.variants.label}: <span id="vlab">${variant}</span></label><div class="chips">${p.variants.options.map((o,i)=>`<button class="${i?'':'on'}" data-v="${vName(o)}">${vName(o)}</button>`).join('')}</div></div>`:''}
 <div class="buyrow"><div class="qty"><button id="qm">−</button><span id="qv">1</span><button id="qp">+</button></div><button class="btn accent" style="flex:1" id="addBtn">${S.t.addToCart||'Add to cart'} — <span id="btnPrice">${money(priceNow())}</span></button></div>
 <button class="btn block" id="buyNow">${S.t.buyNow||'Buy it now'}</button>
 <ul class="perks">${(S.perks||[]).map(x=>`<li>${x}</li>`).join('')}</ul>
 ${(p.details||S.details||[]).map((d,i)=>`<details ${i?'':'open'}><summary>${d[0]}</summary>${d[1].startsWith('<')?d[1]:`<p>${d[1]}</p>`}</details>`).join('')}
 </div>`;
 $$('.thumbs button',root).forEach(b=>b.onclick=()=>{$$('.thumbs button',root).forEach(x=>x.classList.remove('on'));b.classList.add('on');$('#mainImg').src=img(b.dataset.img,1100)});
 $$('[data-v]',root).forEach(b=>b.onclick=()=>{$$('[data-v]',root).forEach(x=>x.classList.remove('on'));b.classList.add('on');variant=b.dataset.v;$('#vlab').textContent=variant;upd()});
 const upd=()=>{$('#qv').textContent=q;const n=priceNow();$('#priceNow').textContent=money(n);$('#btnPrice').textContent=money(n*q)};
 $('#qm').onclick=()=>{q=Math.max(1,q-1);upd()};$('#qp').onclick=()=>{q++;upd()};
 $('#addBtn').onclick=()=>{add(p.id,variant,q);toast((S.t.added||'Added to cart')+' ✓')};
 $('#buyNow').onclick=()=>{add(p.id,variant,q);location.href='checkout.html'};
 const rel=$('[data-related]');if(rel)rel.innerHTML=S.products.filter(x=>x.id!==p.id).slice(0,4).map(card).join('');
 const rv=$('#pdpReviews');if(rv){rv.innerHTML=`<div class="rv-summary"><div><div class="rv-big">${p.rating.toFixed(1)}</div><div class="stars"><span class="s">${stars(p.rating)}</span>${p.reviews} ${S.t.reviews||'reviews'}</div></div></div><div class="reviews">${S.reviews.slice(0,3).map(reviewHTML).join('')}</div>`}
}
function reviewHTML(r){return `<div class="review"><div class="stars"><span class="s">★★★★★</span></div><p>“${r.text}”</p><div class="who">${r.av?`<img src="${img(r.av,100)}" alt="">`:''}<div><b>${r.name}</b><br><span class="verified">✓ ${S.t.verified||'Verified buyer'}</span>${r.loc?` · ${r.loc}`:''}</div></div></div>`}
S.reviewHTML=reviewHTML;
function reviews(){$$('[data-reviews]').forEach(el=>el.innerHTML=S.reviews.slice(0,+(el.dataset.reviews||3)).map(reviewHTML).join(''))}
// checkout
function checkout(){
 const r=$('#coSummary');if(!r)return;
 const draw=()=>{const sub=subtotal();const digital=allDigital();const ship=digital?0:(S.freeShip&&sub>=S.freeShip?0:(S.shipFee||0));
 const fields=$('#shipFields');const note=$('#digitalNote');
 if(fields)fields.hidden=digital;
 if(note)note.hidden=!digital;
 $$('#shipFields [required]').forEach(el=>{el.disabled=digital});
 r.innerHTML=(cart.length?cart.map(l=>{const p=P(l.id);if(!p)return'';const unit=unitPrice(p,l);return `<div class="sumline"><div class="ph"><img src="${img(p.img,140)}" alt=""><b>${l.q}</b></div><div><b>${p.name}</b><div style="font-size:12px;color:var(--muted)">${l.v}</div></div><div>${money(unit*l.q)}</div></div>`}).join(''):'<p>Your cart is empty.</p>')+
 `<div style="display:flex;gap:8px;margin:20px 0"><input placeholder="Discount code" style="margin:0"><button class="btn alt" type="button" style="padding:10px 18px">Apply</button></div><div class="sumrow"><span>Subtotal</span><span>${money(sub)}</span></div><div class="sumrow"><span>Shipping</span><span>${ship?money(ship):'FREE'}</span></div><div class="sumrow t"><span>Total</span><span><small style="font-size:12px;font-weight:400;color:var(--muted)">${cur} </small>${money(sub+ship)}</span></div>`};
 draw();
 const mark=(el,msg)=>{if(!el)return;el.classList.toggle('field-error',!!msg);const next=el.nextElementSibling;if(next&&next.classList.contains('err'))next.remove();if(msg){const d=document.createElement('div');d.className='err';d.textContent=msg;el.after(d)}};
 $('#coForm').onsubmit=e=>{e.preventDefault();if(!cart.length){toast('Cart is empty');return}
  const digital=allDigital();
  const banner=$('#coErrors');
  const checks=[['#co-email',v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),'Enter a valid email']];
  if(!digital)checks.push(['#co-first',v=>v.trim().length>0,'Enter a first name'],['#co-last',v=>v.trim().length>0,'Enter a last name'],['#co-addr',v=>v.trim().length>3,'Enter a street address'],['#co-city',v=>v.trim().length>1,'Enter a city'],['#co-zip',v=>v.trim().length>2,'Enter a postal code']);
  checks.push(['#co-card',v=>v.replace(/\s/g,'').length>=12,'Enter a card number'],['#co-exp',v=>/^\d{2}\s*\/\s*\d{2}$/.test(v),'Use MM / YY'],['#co-cvc',v=>/^\d{3,4}$/.test(v),'Enter the CVC']);
  let bad=0;
  checks.forEach(([sel,ok,msg])=>{const el=$(sel);const fail=el&&!el.disabled&&!ok((el.value||'').trim());if(fail)bad++;mark(el,fail?msg:'')});
  if(banner){banner.hidden=!bad;banner.textContent=bad?'Please fix the highlighted fields.':''}
  if(bad)return;
  const n='#'+(1000+Math.floor(Math.random()*9000));$('#coForm').innerHTML=`<div style="padding:60px 0;text-align:center"><div style="font-size:54px">✓</div><h1 style="font-size:32px;margin:10px 0">Order ${n} confirmed</h1><p style="color:var(--muted)">This is a demo checkout — no payment was taken.</p><br><a class="btn accent" href="index.html">Back to store</a></div>`;cart=[];save();draw()};
}
document.addEventListener('DOMContentLoaded',()=>{chrome();grids();reviews();pdp();checkout();renderCart();});
})();
