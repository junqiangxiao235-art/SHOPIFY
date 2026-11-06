(function () {
  const DATA = window.SY_DATA || { products: [] };
  const products = DATA.products;
  const byId = Object.fromEntries(products.map(function (p) { return [p.id, p]; }));
  const KEY = "cart_shanyue_v2";
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) { return "$" + (Math.round((Number(n) + Number.EPSILON) * 100) / 100).toFixed(2); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  let cart = load();
  if (!Array.isArray(cart)) cart = [];
  function unitPrice(p, sel) {
    let n = p.price;
    (p.options || []).forEach(function (o) {
      const name = (sel && sel[o.key]) || o.choices[0].name;
      const c = o.choices.find(function (x) { return x.name === name; }) || o.choices[0];
      n += c.add || 0;
    });
    return Math.round(n * 100) / 100;
  }
  function stackOff(lines) {
    const groups = {};
    lines.forEach(function (l) { if (l.stack) (groups[l.stack] || (groups[l.stack] = [])).push(l); });
    let off = 0;
    Object.keys(groups).forEach(function (k) {
      const g = groups[k];
      if (g.length >= 3) off += g.reduce(function (s, l) { return s + l.price * l.q; }, 0) * 0.1;
    });
    return Math.round(off * 100) / 100;
  }
  function totals() {
    const sub = Math.round(cart.reduce(function (s, l) { return s + l.price * l.q; }, 0) * 100) / 100;
    const saveAmt = stackOff(cart);
    const due = Math.round((sub - saveAmt) * 100) / 100;
    const ship = cart.length ? (due >= 60 ? 0 : 6) : 0;
    return { sub: sub, saveAmt: saveAmt, due: due, ship: ship, total: Math.round((due + ship) * 100) / 100 };
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(cart)); renderCart(); }
  function imgSrc(key, w) { return "assets/img/" + key + "-" + w + ".webp"; }
  let lastFocus = null;
  function openCart() {
    const d = $("#drawer");
    if (!d) return;
    lastFocus = document.activeElement;
    d.inert = false;
    d.classList.add("on");
    d.setAttribute("aria-hidden", "false");
    const ov = $("#overlay");
    if (ov) ov.hidden = false;
    const c = $("#closeCart");
    if (c) c.focus();
  }
  function closeCart() {
    const d = $("#drawer");
    if (!d) return;
    d.classList.remove("on");
    d.setAttribute("aria-hidden", "true");
    d.inert = true;
    const ov = $("#overlay");
    if (ov) ov.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function addLine(line) {
    if (!line.stack) {
      const hit = cart.find(function (l) { return !l.stack && l.k === line.k; });
      if (hit) { hit.q += line.q; save(); openCart(); return; }
    }
    cart.push(line);
    save();
    openCart();
  }
  function renderCart() {
    const n = cart.reduce(function (s, l) { return s + l.q; }, 0);
    const count = $("#cartCount");
    const btn = $("#cartBtn");
    if (count) count.textContent = String(n);
    if (btn) btn.setAttribute("aria-label", "Open bag, " + n + (n === 1 ? " item" : " items"));
    const box = $("#lines");
    if (!box) return;
    const t = totals();
    box.innerHTML = cart.length ? cart.map(function (l, i) {
      const p = byId[l.id];
      return '<div class="line"><img src="' + imgSrc(p ? p.img : "hoops", 720) + '" alt="" width="64" height="72"><div><div>' + esc(p ? p.name : l.id) + "</div>" +
        (l.v ? '<div>' + esc(l.v) + "</div>" : "") +
        (l.engrave ? "<div>Engraved: " + esc(l.engrave) + "</div>" : "") +
        (l.stack ? "<div>Stack · 10% off</div>" : "") +
        '<div class="qty"><button type="button" data-i="' + i + '" data-d="-1" aria-label="Decrease quantity">−</button> <span>' + l.q + '</span> <button type="button" data-i="' + i + '" data-d="1" aria-label="Increase quantity">+</button> <button type="button" class="rm" data-rm="' + i + '">Remove</button></div></div><div>' + money(l.price * l.q) + "</div></div>";
    }).join("") : "<p>Your bag is empty.</p>";
    const sub = $("#sub"), sav = $("#saveAmt"), ship = $("#shipAmt"), tot = $("#totalAmt");
    if (sub) sub.textContent = money(t.sub);
    if (sav) sav.textContent = "−" + money(t.saveAmt);
    if (ship) ship.textContent = cart.length ? (t.ship ? money(t.ship) : "Free") : "—";
    if (tot) tot.textContent = money(cart.length ? t.total : 0);
    const link = $("#checkoutLink");
    if (link) link.setAttribute("aria-disabled", cart.length ? "false" : "true");
  }
  function bindChrome() {
    const drawer = $("#drawer");
    if (drawer) drawer.inert = true;
    const btn = $("#cartBtn");
    if (btn) btn.addEventListener("click", openCart);
    const close = $("#closeCart");
    if (close) close.addEventListener("click", closeCart);
    const ov = $("#overlay");
    if (ov) ov.addEventListener("click", closeCart);
    const link = $("#checkoutLink");
    if (link) link.addEventListener("click", function (e) { if (!cart.length) e.preventDefault(); });
    const lines = $("#lines");
    if (lines) lines.addEventListener("click", function (e) {
      const t = e.target.closest("button");
      if (!t) return;
      if (t.dataset.rm != null) { cart.splice(Number(t.dataset.rm), 1); save(); return; }
      if (t.dataset.i != null) {
        const l = cart[Number(t.dataset.i)];
        if (!l) return;
        l.q += Number(t.dataset.d);
        if (l.q < 1) cart.splice(Number(t.dataset.i), 1);
        save();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeCart();
    });
  }
  function bindAnnounce() {
    const el = $("#annText");
    if (!el) return;
    const msgs = ["Free shipping on orders over $60", "30-day returns"];
    let i = 0, timer = null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function tick() { i = (i + 1) % msgs.length; el.textContent = msgs[i]; }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    function start() { stop(); if (!reduce) timer = setInterval(tick, 4000); }
    const ann = el.closest(".ann");
    if (ann) {
      ann.addEventListener("mouseenter", stop);
      ann.addEventListener("mouseleave", start);
      ann.addEventListener("focusin", stop);
      ann.addEventListener("focusout", function (e) {
        if (!ann.contains(e.relatedTarget)) start();
      });
    }
    start();
  }
  function bindHero() {
    const track = $("#heroTrack");
    if (!track) return;
    const slides = $$(".slide", track);
    let i = 0, timer = null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = "translateX(" + (-i * 100) + "%)";
      slides.forEach(function (s, idx) {
        const on = idx === i;
        s.inert = !on;
        if (on) s.removeAttribute("aria-hidden");
        else s.setAttribute("aria-hidden", "true");
      });
      $$(".hero-ui .dot").forEach(function (d) {
        d.setAttribute("aria-current", Number(d.getAttribute("data-go")) === i ? "true" : "false");
      });
    }
    function start() { stop(); timer = setInterval(function () { go(i + 1); }, 6000); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    const prev = $("#heroPrev"), next = $("#heroNext"), pause = $("#heroPause");
    if (prev) prev.addEventListener("click", function () { go(i - 1); });
    if (next) next.addEventListener("click", function () { go(i + 1); });
    if (pause) pause.addEventListener("click", function () {
      const on = pause.getAttribute("aria-pressed") === "true";
      const play = pause.querySelector(".ic-play");
      const hold = pause.querySelector(".ic-pause");
      if (on) {
        pause.setAttribute("aria-pressed", "false");
        pause.setAttribute("aria-label", "Pause carousel");
        if (play) play.hidden = true;
        if (hold) hold.hidden = false;
        if (!reduce) start();
      } else {
        pause.setAttribute("aria-pressed", "true");
        pause.setAttribute("aria-label", "Play carousel");
        if (play) play.hidden = false;
        if (hold) hold.hidden = true;
        stop();
      }
    });
    $$(".hero-ui .dot").forEach(function (d) {
      d.addEventListener("click", function () { go(Number(d.getAttribute("data-go"))); });
    });
    go(0);
    if (!reduce) start();
  }
  function bindTabs() {
    const bar = $("#newTabs");
    if (!bar) return;
    bar.addEventListener("click", function (e) {
      const b = e.target.closest("button");
      if (!b) return;
      $$("button", bar).forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
      $$("[data-new]").forEach(function (p) { p.hidden = p.getAttribute("data-new") !== b.getAttribute("data-tab"); });
    });
  }
  function bindQuick() {
    const dlg = $("#quickDlg");
    if (!dlg) return;
    document.addEventListener("click", function (e) {
      const b = e.target.closest("[data-quick]");
      if (!b) return;
      const p = byId[b.getAttribute("data-quick")];
      if (!p) return;
      $("#quickBody").innerHTML = '<div class="qv-row"><img src="' + imgSrc(p.img, 720) + '" alt="' + esc(p.name) + '" width="140" height="140"><div><p class="kicker">' + esc(p.collectionName) + ' <span class="seal">' + esc(p.zh) + '</span></p><h2 style="font-size:32px">' + esc(p.name) + '</h2><p class="price">from ' + money(p.price) + "</p><p>" + esc(p.line) + '</p><button type="button" class="btn" id="quickAdd"' + (p.stock ? "" : " disabled") + ">" + (p.stock ? "Add to bag" : "Sold out") + "</button></div></div>";
      const add = $("#quickAdd");
      if (add) add.addEventListener("click", function () {
        addLine({ k: p.id + "|default|", id: p.id, v: "Everyday option", q: 1, price: p.price, stack: "", engrave: "" });
      });
      if (dlg.showModal) dlg.showModal();
    });
    const shut = $("#quickClose");
    if (shut) shut.addEventListener("click", function () { if (dlg.close) dlg.close(); });
  }
  function bindStack(rootSel, liveSel, addSel) {
    const root = $(rootSel);
    if (!root) return;
    function picked() {
      return $$("input:checked", root).map(function (b) {
        return { id: b.value, name: b.getAttribute("data-name"), price: Number(b.getAttribute("data-price")) };
      });
    }
    function update() {
      const rows = picked();
      const sum = rows.reduce(function (s, r) { return s + r.price; }, 0);
      const saveAmt = rows.length === 3 ? Math.round(sum * 10) / 100 : 0;
      const live = $(liveSel);
      if (live) {
        live.textContent = rows.length
          ? "Selected: " + rows.map(function (r) { return r.name; }).join(", ") + ". Set " + money(sum) + ". You save " + money(saveAmt) + "."
          : "Select any 3. You save $0.00.";
      }
      const add = $(addSel);
      if (add) add.disabled = rows.length !== 3;
    }
    root.addEventListener("change", function (e) {
      const boxes = $$("input:checked", root);
      if (boxes.length > 3 && e.target.checked) e.target.checked = false;
      update();
    });
    const add = $(addSel);
    if (add) add.addEventListener("click", function () {
      const rows = picked();
      if (rows.length !== 3) return;
      const sid = "s" + Date.now();
      rows.forEach(function (r) {
        cart.push({ k: r.id + "|Everyday|" + sid, id: r.id, v: "Everyday option", q: 1, price: r.price, stack: sid, engrave: "" });
      });
      save();
      openCart();
    });
    update();
  }
  const ANIMALS = [
    ["rat", "Rat", "鼠", "Quick and resourceful. The year sign people give when they mean a sharp start."],
    ["ox", "Ox", "牛", "Steady and patient. A pendant for someone who keeps a promise."],
    ["tiger", "Tiger", "虎", "Bold without being loud. Often given for courage."],
    ["rabbit", "Rabbit", "兔", "Gentle and alert. A quiet gift that still feels personal."],
    ["dragon", "Dragon", "龙", "The sign people ask for when the gift should feel lucky."],
    ["snake", "Snake", "蛇", "Calm and observant. Worn close, not shown off."],
    ["horse", "Horse", "马", "Restless energy. A piece for someone always in motion."],
    ["goat", "Goat", "羊", "Soft-spoken and loyal. Easy to wear every day."],
    ["monkey", "Monkey", "猴", "Playful and quick. A small pendant with a light meaning."],
    ["rooster", "Rooster", "鸡", "Precise and bright. Often chosen as a new-year gift."],
    ["dog", "Dog", "狗", "Loyal and plain-spoken. A keeper, not a showpiece."],
    ["pig", "Pig", "猪", "Warm and generous. A gift for someone who looks after others."]
  ];
  function bindGuard() {
    const form = $("#guardForm");
    if (!form) return;
    let current = null;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const year = Number($("#birthYear").value);
      const out = $("#guardOut");
      if (!year || year < 1924 || year > 2026) { out.textContent = "Enter a birth year between 1924 and 2026."; return; }
      const idx = ((year - 4) % 12 + 12) % 12;
      const row = ANIMALS[idx];
      const p = byId[row[0] + "-pendant"];
      current = p;
      out.innerHTML = "<p class=\"phase\">" + row[2] + "</p><h3>" + esc(row[1]) + "</h3><p>" + esc(row[3]) + "</p><p>Born in January or February? The animal can change with Lunar New Year. This tool uses the year only.</p><p><a href=\"product.html?id=" + p.id + "\">" + esc(p.name) + "</a> · from " + money(p.price) + "</p>";
      const add = $("#guardAdd");
      if (add) add.disabled = !p.stock;
    });
    const input = $("#guardEngrave");
    const prev = $("#guardPreview");
    const count = $("#guardCount");
    if (input) input.addEventListener("input", function () {
      if (input.value.length > 10) input.value = input.value.slice(0, 10);
      if (prev) prev.textContent = input.value || "山月";
      if (count) count.textContent = input.value.length + "/10";
    });
    const add = $("#guardAdd");
    if (add) add.addEventListener("click", function () {
      if (!current || !current.stock) return;
      const text = input ? input.value.slice(0, 10) : "";
      addLine({ k: current.id + "|Gold vermeil|" + text, id: current.id, v: "Gold vermeil", q: 1, price: current.price, stack: "", engrave: text });
    });
  }
  function bindFilters() {
    const form = $("#filters");
    if (!form) return;
    function showEmpty() {
      const note = $("#emptyNote");
      if (!note) return;
      const cards = $$(".grid .card");
      note.hidden = cards.some(function (c) { return getComputedStyle(c).display !== "none"; });
    }
    form.addEventListener("change", function () {
      const params = new URLSearchParams();
      ["price", "metal", "mood", "collection", "category", "grade"].forEach(function (k) {
        const el = form.elements[k];
        const v = el ? el.value : "";
        if (v) { document.documentElement.setAttribute("data-" + k, v); params.set(k, v); }
        else document.documentElement.removeAttribute("data-" + k);
      });
      if (form.elements.gift && form.elements.gift.value) {
        document.documentElement.setAttribute("data-gift", "1");
        params.set("gift", "1");
      } else document.documentElement.removeAttribute("data-gift");
      const stock = form.elements.stock;
      if (stock && stock.checked) { document.documentElement.setAttribute("data-stock", "1"); params.set("stock", "1"); }
      else document.documentElement.removeAttribute("data-stock");
      const qs = params.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
      showEmpty();
    });
    showEmpty();
  }
  function mountPdp() {
    const root = $("#pdp");
    if (!root) return;
    document.body.classList.add("is-pdp");
    const id = new URLSearchParams(location.search).get("id");
    const p = byId[id] || products[0];
    if (!p) return;
    document.title = p.name + " · " + p.collectionName + " – SHANYUE";
    const imgs = (p.gallery || [p.img]).slice(0, 6);
    const frame = $("#frame");
    let main = $("#mainImg");
    if (!main) {
      main = document.createElement("img");
      main.width = 720; main.height = 720;
      frame.appendChild(main);
    }
    main.alt = p.name;
    function show(key) {
      const next = imgSrc(key, 1280);
      if (main.getAttribute("src") !== next) main.src = next;
      main.srcset = imgSrc(key, 720) + " 720w, " + imgSrc(key, 1280) + " 1280w";
    }
    show(imgs[0]);
    const thumbs = $("#thumbs");
    imgs.forEach(function (key, i) {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Image " + (i + 1) + " of " + p.name);
      b.setAttribute("aria-pressed", i ? "false" : "true");
      const im = document.createElement("img");
      im.src = imgSrc(key, 720); im.alt = ""; im.width = 64; im.height = 72;
      b.appendChild(im);
      b.addEventListener("click", function () {
        show(key);
        $$("button", thumbs).forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
      });
      thumbs.appendChild(b);
    });
    const buy = $("#buy");
    const sel = {};
    (p.options || []).forEach(function (o) { sel[o.key] = o.choices[0].name; });
    const opts = (p.options || []).map(function (o) {
      return '<div class="opt"><span id="lab-' + o.key + '" class="kicker">' + esc(o.label) + '</span><div class="chips" role="group" aria-labelledby="lab-' + o.key + '">' +
        o.choices.map(function (c, i) {
          return '<button type="button" data-opt="' + esc(o.key) + '" data-val="' + esc(c.name) + '" aria-pressed="' + (i ? "false" : "true") + '">' + esc(c.name) + (c.add ? " +" + money(c.add) : "") + "</button>";
        }).join("") + "</div></div>";
    }).join("");
    const specs = (p.specs || []).map(function (row) { return "<tr><th scope=\"row\">" + esc(row[0]) + "</th><td>" + esc(row[1]) + "</td></tr>"; }).join("");
    const same = products.filter(function (x) { return x.id !== p.id && x.stock && (x.moods || []).some(function (m) { return (p.moods || []).indexOf(m) >= 0; }); }).slice(0, 3);
    const stackables = products.filter(function (x) { return x.stack && x.stock && x.id !== p.id; }).slice(0, 6);
    buy.innerHTML =
      '<p class="kicker"><a href="collection.html?collection=' + esc(p.collection) + '">' + esc(p.collectionName) + '</a> <span class="seal">' + esc(p.zh) + "</span></p>" +
      "<h1>" + esc(p.name) + "</h1>" +
      '<p class="price" id="priceNow"></p>' +
      opts +
      (p.engrave ? '<label class="field" for="engrave">Engraving <span id="encount">0/10</span><input id="engrave" maxlength="10" autocomplete="off"></label><div class="plate" id="preview" aria-hidden="true">山月</div>' : "") +
      '<button class="btn block" type="button" id="addBtn"' + (p.stock ? "" : " disabled") + ">" + (p.stock ? "Add to bag" : "Sold out") + "</button>" +
      '<ul class="ship-lines" id="shipLines"><li id="shipStock"></li><li>Engraved pieces ship in 7–10 days and are non-returnable.</li><li>Free shipping on orders over $60.</li></ul>' +
      "<p>" + esc(p.line) + "</p><p style=\"margin-top:8px\">" + esc(p.meaning) + "</p><p style=\"margin-top:8px\">" + esc(p.style) + "</p>" +
      '<div class="tablist" role="tablist">' +
      '<button type="button" role="tab" aria-selected="true" data-tab="reviews">Reviews</button>' +
      '<button type="button" role="tab" aria-selected="false" data-tab="desc">Description</button>' +
      '<button type="button" role="tab" aria-selected="false" data-tab="specs">Specs</button>' +
      '<button type="button" role="tab" aria-selected="false" data-tab="care">Care</button>' +
      '<button type="button" role="tab" aria-selected="false" data-tab="ship">Shipping &amp; Returns</button></div>' +
      '<div class="panel" data-panel="reviews" role="tabpanel"><p>Reviews appear after launch — demo store.</p></div>' +
      '<div class="panel" data-panel="desc" role="tabpanel" hidden><p>' + esc(p.line) + "</p><p>" + esc(p.meaning) + "</p></div>" +
      '<div class="panel" data-panel="specs" role="tabpanel" hidden><table class="specs">' + specs + "</table></div>" +
      '<div class="panel" data-panel="care" role="tabpanel" hidden><p>Put it on after perfume. Take it off for the pool, the gym, and the shower. Wipe with a dry cloth. Vermeil is a 2.5 µm gold layer — sample spec — and daily wear softens it over years.</p></div>' +
      '<div class="panel" data-panel="ship" role="tabpanel" hidden><p>In stock pieces ship in 2–4 business days. Engraved pieces ship in 7–10 days and cannot be returned once the letters are cut. Unengraved pieces can come back within 30 days. Free shipping over $60. One-year warranty on making faults.</p></div>' +
      '<a class="factory" href="story.html#factory"><span class="kicker">Dongguan</span><strong style="display:block;font-family:Fraunces,Georgia,serif;font-size:26px;font-weight:400">Made in our Dongguan factory</strong><span>Modelled, cast, set, and checked in Dongguan, Guangdong.</span></a>' +
      '<h2 style="font-size:28px;margin:16px 0 8px">Same mood</h2><div class="also">' + same.map(function (s) {
        return '<a class="card" data-collection="' + s.collection + '" href="product.html?id=' + s.id + '"><div class="ph"><img src="' + imgSrc(s.img, 720) + '" alt="' + esc(s.name) + '"></div><span class="name">' + esc(s.name) + "</span></a>";
      }).join("") + "</div>" +
      '<h2 style="font-size:28px;margin:16px 0 8px">Any 3, save 10%</h2><div id="pdpStack">' +
      stackables.map(function (s) {
        return '<label class="field"><input type="checkbox" value="' + s.id + '" data-name="' + esc(s.name) + '" data-price="' + s.price + '"> ' + esc(s.name) + " · " + money(s.price) + "</label>";
      }).join("") + '<p id="pdpLive" aria-live="polite"></p><button type="button" class="btn" id="pdpStackAdd" disabled>Add set to bag</button></div>';
    function currentEngrave() { const input = $("#engrave"); return input ? input.value.slice(0, 10) : ""; }
    function refresh() {
      const price = unitPrice(p, sel);
      const node = $("#priceNow");
      if (node) node.textContent = money(price);
      const st = $("#stPrice");
      if (st) st.textContent = money(price);
      const stName = $("#stName");
      if (stName) stName.textContent = p.name;
      const stock = $("#shipStock");
      if (stock) {
        if (!p.stock) stock.textContent = "Sold out.";
        else if (p.engrave && currentEngrave()) stock.textContent = "Engraved: ships in 7–10 days.";
        else stock.textContent = "In stock: ships in 2–4 business days.";
      }
    }
    buy.addEventListener("click", function (e) {
      const tab = e.target.closest("[data-tab]");
      if (tab) {
        $$("[data-tab]", buy).forEach(function (x) { x.setAttribute("aria-selected", x === tab ? "true" : "false"); });
        $$("[data-panel]", buy).forEach(function (panel) { panel.hidden = panel.getAttribute("data-panel") !== tab.getAttribute("data-tab"); });
        return;
      }
      const b = e.target.closest("[data-opt]");
      if (!b) return;
      sel[b.getAttribute("data-opt")] = b.getAttribute("data-val");
      $$('[data-opt="' + b.getAttribute("data-opt") + '"]', buy).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      refresh();
    });
    const input = $("#engrave");
    if (input) input.addEventListener("input", function () {
      if (input.value.length > 10) input.value = input.value.slice(0, 10);
      const prev = $("#preview");
      if (prev) prev.textContent = input.value || "山月";
      const c = $("#encount");
      if (c) c.textContent = input.value.length + "/10";
      refresh();
    });
    function addCurrent() {
      if (!p.stock) return;
      const v = (p.options || []).map(function (o) { return sel[o.key]; }).join(" · ");
      const text = currentEngrave();
      addLine({ k: p.id + "|" + v + "|" + text, id: p.id, v: v, q: 1, price: unitPrice(p, sel), stack: "", engrave: text });
    }
    const addBtn = $("#addBtn");
    if (addBtn) addBtn.addEventListener("click", addCurrent);
    const stAdd = $("#stAdd");
    if (stAdd) { stAdd.disabled = !p.stock; stAdd.textContent = p.stock ? "Add to bag" : "Sold out"; stAdd.addEventListener("click", addCurrent); }
    bindStack("#pdpStack", "#pdpLive", "#pdpStackAdd");
    refresh();
  }
  function mountCheckout() {
    const form = $("#coForm");
    if (!form) return;
    const sum = $("#coSummary");
    function draw() {
      if (!sum) return;
      const t = totals();
      sum.innerHTML = (cart.map(function (l) {
        const p = byId[l.id];
        return '<div class="sumline"><span>' + l.q + " × " + esc(p ? p.name : l.id) + (l.v ? " · " + esc(l.v) : "") + (l.engrave ? " · " + esc(l.engrave) : "") + "</span><span>" + money(l.price * l.q) + "</span></div>";
      }).join("") || "<p>Your bag is empty.</p>") +
        '<div class="sumline"><span>Subtotal</span><span>' + money(t.sub) + "</span></div>" +
        '<div class="sumline"><span>Stack savings</span><span>−' + money(t.saveAmt) + "</span></div>" +
        '<div class="sumline"><span>Shipping</span><span>' + (cart.length ? (t.ship ? money(t.ship) : "Free") : "—") + "</span></div>" +
        '<div class="sumline"><span>Total</span><span>' + money(cart.length ? t.total : 0) + "</span></div>";
    }
    draw();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const errors = [];
      function bad(input, msg) { if (input) input.setAttribute("aria-invalid", "true"); errors.push(msg); }
      $$("[aria-invalid]", form).forEach(function (el) { el.removeAttribute("aria-invalid"); });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim())) bad(form.email, "Enter a valid email.");
      if (!form.first.value.trim()) bad(form.first, "Enter a first name.");
      if (!form.last.value.trim()) bad(form.last, "Enter a last name.");
      if (!form.address.value.trim()) bad(form.address, "Enter a street address.");
      if (!form.city.value.trim()) bad(form.city, "Enter a city.");
      if (!form.postal.value.trim()) bad(form.postal, "Enter a postal code.");
      if (!/^\d{16}$/.test(form.card.value.replace(/\s+/g, ""))) bad(form.card, "Enter a 16-digit demo card number.");
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.exp.value.trim())) bad(form.exp, "Use expiry as MM/YY.");
      if (!/^\d{3,4}$/.test(form.cvc.value.trim())) bad(form.cvc, "Enter a 3 or 4 digit CVC.");
      if (!cart.length) errors.push("Your bag is empty.");
      const box = $("#coErrors");
      if (errors.length) {
        box.hidden = false;
        box.innerHTML = "<ul>" + errors.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + "</ul>";
        box.focus();
        return;
      }
      box.hidden = true;
      const num = "SY" + Math.floor(1000 + Math.random() * 9000);
      cart = [];
      save();
      form.hidden = true;
      $("#coDone").hidden = false;
      $("#coNum").textContent = num;
    });
  }
  function bindNews() {
    const form = $("#news");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const input = $("#newsEmail");
      if (input && !input.checkValidity()) { input.reportValidity(); return; }
      const ok = $("#newsOk");
      if (ok) ok.hidden = false;
      if (input) input.value = "";
    });
  }
  document.addEventListener("DOMContentLoaded", function () {
    bindChrome();
    renderCart();
    bindAnnounce();
    bindHero();
    bindTabs();
    bindQuick();
    bindStack("#bestStack", "#bestLive", "#bestAdd");
    bindGuard();
    bindFilters();
    bindNews();
    mountPdp();
    mountCheckout();
  });
})();
