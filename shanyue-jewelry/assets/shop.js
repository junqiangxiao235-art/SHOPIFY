(function () {
  const DATA = window.SY_DATA || { products: [], looks: [] };
  const products = DATA.products;
  const byId = Object.fromEntries(products.map(function (p) { return [p.id, p]; }));
  const KEY = "cart_shanyue";
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) {
    return "$" + (Math.round((Number(n) + Number.EPSILON) * 100) / 100).toFixed(2);
  }
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }
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
    lines.forEach(function (l) {
      if (l.stack) (groups[l.stack] || (groups[l.stack] = [])).push(l);
    });
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
    const total = Math.round((due + ship) * 100) / 100;
    return { sub: sub, saveAmt: saveAmt, due: due, ship: ship, total: total };
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(cart)); renderCart(); }

  function imgSrc(key, w) { return "assets/img/" + key + "-" + w + ".webp"; }
  function srcset(key) { return imgSrc(key, 720) + " 720w, " + imgSrc(key, 1280) + " 1280w"; }

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
    if (!cart.length) {
      box.innerHTML = '<p>Your bag is empty.</p>';
    } else {
      box.innerHTML = cart.map(function (l, i) {
        const p = byId[l.id];
        const name = p ? p.name : l.id;
        const key = p ? p.img : "hero";
        return '<div class="line"><img src="' + imgSrc(key, 720) + '" alt="" width="64" height="80">' +
          '<div><div>' + esc(name) + '</div>' +
          (l.v ? '<div class="muted">' + esc(l.v) + '</div>' : '') +
          (l.engrave ? '<div class="muted">Engraved: ' + esc(l.engrave) + '</div>' : '') +
          (l.stack ? '<div class="muted">Stack · 10% off</div>' : '') +
          '<div class="qty"><button type="button" data-i="' + i + '" data-d="-1" aria-label="Decrease quantity">−</button><span>' + l.q + '</span><button type="button" data-i="' + i + '" data-d="1" aria-label="Increase quantity">+</button><button type="button" class="rm" data-rm="' + i + '">Remove</button></div></div>' +
          '<div class="price">' + money(l.price * l.q) + '</div></div>';
      }).join("");
    }
    const sub = $("#sub"), sav = $("#saveAmt"), ship = $("#shipAmt"), tot = $("#totalAmt");
    if (sub) sub.textContent = money(t.sub);
    if (sav) sav.textContent = "−" + money(t.saveAmt);
    if (ship) ship.textContent = cart.length ? (t.ship ? money(t.ship) : "Free") : "—";
    if (tot) tot.textContent = money(cart.length ? t.total : 0);
    const link = $("#checkoutLink");
    if (link) {
      link.setAttribute("aria-disabled", cart.length ? "false" : "true");
      link.style.opacity = cart.length ? "1" : ".45";
    }
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
      if (e.key !== "Escape") return;
      const d = $("#drawer");
      if (d && d.classList.contains("on")) closeCart();
      const sheet = $("#stackBuilder");
      if (sheet && sheet.classList.contains("on")) sheet.classList.remove("on");
    });
  }

  function bindAnnounce() {
    const el = $("#annText");
    if (!el) return;
    const msgs = [
      "Free shipping on orders over $60",
      "30-day returns",
      "2-year warranty"
    ];
    let i = 0, timer = null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function tick() { i = (i + 1) % msgs.length; el.textContent = msgs[i]; }
    function start() { stop(); timer = setInterval(tick, 4000); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    const pause = $("#annPause");
    if (!reduce) start();
    if (pause) pause.addEventListener("click", function () {
      const on = pause.getAttribute("aria-pressed") === "true";
      if (on) { pause.setAttribute("aria-pressed", "false"); pause.textContent = "Pause"; start(); }
      else { pause.setAttribute("aria-pressed", "true"); pause.textContent = "Play"; stop(); }
    });
  }

  function bindStack() {
    const root = $("#stackPicks");
    if (!root) return;
    function update() {
      const picked = $$("#stackPicks input:checked").map(function (b) {
        return { id: b.value, name: b.getAttribute("data-name"), price: Number(b.getAttribute("data-price")) };
      });
      const sum = picked.reduce(function (s, r) { return s + r.price; }, 0);
      const saveAmt = picked.length === 3 ? Math.round(sum * 0.1 * 100) / 100 : 0;
      const live = $("#stackLive");
      if (live) {
        if (!picked.length) live.innerHTML = "<p>Select 3 pieces.</p><p>You save $0.00</p>";
        else live.innerHTML = "<p>Selected: " + picked.map(function (r) { return esc(r.name); }).join(", ") + "</p>" +
          "<p>Set " + money(sum) + "</p><p>You save " + money(saveAmt) + "</p><p>Due " + money(sum - saveAmt) + "</p>";
      }
      const add = $("#addStack");
      if (add) add.disabled = picked.length !== 3;
    }
    root.addEventListener("change", function (e) {
      const boxes = $$("#stackPicks input:checked");
      const note = $("#stackNote");
      if (boxes.length > 3 && e.target.checked) {
        e.target.checked = false;
        if (note) note.textContent = "Choose any 3 pieces.";
      } else if (note) note.textContent = "";
      update();
    });
    const add = $("#addStack");
    if (add) add.addEventListener("click", function () {
      const picked = $$("#stackPicks input:checked");
      if (picked.length !== 3) return;
      const sid = "s" + Date.now();
      picked.forEach(function (b) {
        cart.push({
          k: b.value + "|Everyday option|" + sid,
          id: b.value,
          v: "Everyday option",
          q: 1,
          price: Number(b.getAttribute("data-price")),
          stack: sid,
          engrave: ""
        });
      });
      save();
      openCart();
    });
    const open = $("#openStack");
    const sheet = $("#stackBuilder");
    const shut = $("#stackClose");
    if (open && sheet) open.addEventListener("click", function () { sheet.classList.add("on"); if (shut) shut.focus(); });
    if (shut && sheet) shut.addEventListener("click", function () { sheet.classList.remove("on"); if (open) open.focus(); });
    update();
  }

  function bindLooks() {
    const dlg = $("#lookDlg");
    if (!dlg) return;
    $$("[data-look]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const ids = (btn.getAttribute("data-ids") || "").split(",").filter(Boolean);
        const body = $("#lookBody");
        body.innerHTML = '<p class="sample">Sample customer photo — demo content</p><p class="look-note">Tag @shanyue</p>' +
          ids.map(function (id) {
            const p = byId[id];
            if (!p) return "";
            return '<div class="look-row"><img src="' + imgSrc(p.img, 720) + '" alt="" width="64" height="80"><div><a href="product.html?id=' + esc(p.id) + '">' + esc(p.name) + '</a><div class="price">' + money(p.price) + '</div></div><button type="button" data-add="' + esc(p.id) + '"' + (p.stock ? "" : " disabled") + '>' + (p.stock ? "Add to bag" : "Sold out") + "</button></div>";
          }).join("");
        body.querySelectorAll("[data-add]").forEach(function (b) {
          b.addEventListener("click", function () {
            const p = byId[b.getAttribute("data-add")];
            if (!p || !p.stock) return;
            addLine({ k: p.id + "|Everyday option|", id: p.id, v: "Everyday option", q: 1, price: p.price, stack: "", engrave: "" });
          });
        });
        if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
      });
    });
    const shut = $("#lookClose");
    if (shut) shut.addEventListener("click", function () { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); });
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

  function bindFilters() {
    const form = $("#filters");
    if (!form) return;
    form.addEventListener("change", function () {
      const params = new URLSearchParams();
      ["price", "material", "gem", "collection"].forEach(function (k) {
        const v = form.elements[k] ? form.elements[k].value : "";
        if (v) { document.documentElement.setAttribute("data-" + k, v); params.set(k, v); }
        else document.documentElement.removeAttribute("data-" + k);
      });
      const stock = form.elements.stock;
      if (stock && stock.checked) { document.documentElement.setAttribute("data-stock", "1"); params.set("stock", "1"); }
      else document.documentElement.removeAttribute("data-stock");
      const qs = params.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
      showEmpty();
    });
    showEmpty();
  }
  function showEmpty() {
    const note = $("#emptyNote");
    if (!note) return;
    const cards = $$(".grid .card");
    if (!cards.length) return;
    const any = cards.some(function (c) { return getComputedStyle(c).display !== "none"; });
    note.hidden = any;
  }

  function mountPdp() {
    const root = $("#pdp");
    if (!root) return;
    document.body.classList.add("is-pdp");
    const id = new URLSearchParams(location.search).get("id");
    const p = byId[id] || products[0];
    if (!p) return;
    document.title = p.name + " – SHANYUE";
    const imgs = (p.gallery && p.gallery.length ? p.gallery : [p.img]).slice(0, 6);
    const frame = $("#frame");
    let main = $("#mainImg");
    if (!main) {
      main = document.createElement("img");
      main.width = 720;
      main.height = 900;
      main.setAttribute("fetchpriority", "high");
      main.sizes = "(max-width: 800px) 100vw, 50vw";
      frame.appendChild(main);
    }
    main.alt = p.name;
    function show(key) {
      var next = imgSrc(key, 1280);
      if (main.getAttribute("src") !== next) {
        main.src = next;
        main.srcset = srcset(key);
      } else if (!main.getAttribute("srcset")) {
        main.srcset = srcset(key);
      }
    }
    show(imgs[0]);
    const thumbs = $("#thumbs");
    imgs.forEach(function (key, i) {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show image " + (i + 1) + " of " + p.name);
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      const im = document.createElement("img");
      im.src = imgSrc(key, 720);
      im.alt = "";
      im.width = 64;
      im.height = 80;
      if (i) im.loading = "lazy";
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
      return '<div class="opt"><span id="lab-' + o.key + '">' + esc(o.label) + '</span><div class="chips" role="group" aria-labelledby="lab-' + o.key + '">' +
        o.choices.map(function (c, i) {
          return '<button type="button" data-opt="' + esc(o.key) + '" data-val="' + esc(c.name) + '" aria-pressed="' + (i === 0 ? "true" : "false") + '">' + esc(c.name) + (c.add ? " +" + money(c.add) : "") + "</button>";
        }).join("") + "</div></div>";
    }).join("");
    const engrave = p.engrave ? '<div class="opt"><label for="engrave">Engraving <span class="muted" id="encount">0/10</span></label><div class="plate" aria-hidden="true"><span id="preview">山月</span></div><input id="engrave" maxlength="10" autocomplete="off" placeholder="Up to 10 characters"></div>' : "";
    const love = (p.love || []).map(function (row) { return "<div><b>" + esc(row[0]) + "</b><span>" + esc(row[1]) + "</span></div>"; }).join("");
    const specs = (p.specs || []).map(function (row) { return "<tr><th scope=\"row\">" + esc(row[0]) + "</th><td>" + esc(row[1]) + "</td></tr>"; }).join("");
    const suggestions = products.filter(function (x) { return x.id !== p.id && x.stock; })
      .sort(function (a, b) { return (b.collection === p.collection) - (a.collection === p.collection); })
      .slice(0, 3);
    buy.innerHTML =
      '<p class="eyebrow"><a href="collection.html?collection=' + esc(p.collection) + '">' + esc(p.collectionName) + '</a> <span class="seal">' + esc(p.zh) + "</span></p>" +
      "<h1>" + esc(p.name) + "</h1>" +
      '<ul class="promises"><li>Free shipping over $60</li><li>30-day returns</li><li>2-year warranty</li></ul>' +
      '<p class="price" id="priceNow"></p>' +
      '<p>' + esc(p.blurb) + "</p>" +
      (p.badge ? '<p class="badge" style="position:static;display:inline-block;margin-top:10px">' + esc(p.badge) + "</p>" : "") +
      opts + engrave +
      '<p id="shipNote" class="muted" style="margin:8px 0"></p>' +
      '<button class="btn block" type="button" id="addBtn"' + (p.stock ? "" : " disabled") + ">" + (p.stock ? "Add to bag" : "Sold out") + "</button>" +
      "<h2 style=\"font-size:28px;margin:22px 0 8px\">Why you'll love it</h2><div class=\"love\">" + love + "</div>" +
      "<h2 style=\"font-size:28px;margin:8px 0\">Details</h2><table class=\"specs\">" + specs + "</table>" +
      '<a class="baiyun" href="story.html#workshop"><span class="seal">白云工坊</span><strong>Made in our Baiyun workshop</strong><span>Modelled, cast, set, and checked in Baiyun District, Guangzhou.</span></a>' +
      '<h2 style="font-size:28px;margin:22px 0 8px">Complete the stack</h2><div class="also">' +
      suggestions.map(function (s) {
        return '<a class="pcard" href="product.html?id=' + esc(s.id) + '"><div class="ph"><img src="' + imgSrc(s.img, 720) + '" alt="' + esc(s.name) + '" width="720" height="900" loading="lazy"></div><span class="name">' + esc(s.name) + '</span><span class="price">' + money(s.price) + "</span></a>";
      }).join("") + "</div>";

    function currentEngrave() {
      const input = $("#engrave");
      return input ? input.value.slice(0, 10) : "";
    }
    function refresh() {
      const price = unitPrice(p, sel);
      const node = $("#priceNow");
      if (node) node.textContent = money(price);
      const st = $("#stPrice");
      if (st) st.textContent = money(price);
      const note = $("#shipNote");
      if (note) {
        if (!p.stock) note.textContent = "Sold out.";
        else if (p.engrave && currentEngrave()) note.textContent = "Engraved pieces ship in 6–8 business days.";
        else note.textContent = "In stock: ships in 2–4 business days.";
      }
      const stName = $("#stName");
      if (stName) stName.textContent = p.name;
    }
    buy.addEventListener("click", function (e) {
      const b = e.target.closest("[data-opt]");
      if (!b) return;
      const key = b.getAttribute("data-opt");
      sel[key] = b.getAttribute("data-val");
      $$('[data-opt="' + key + '"]', buy).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
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
    const addBtn = $("#addBtn");
    function addCurrent() {
      if (!p.stock) return;
      const v = (p.options || []).map(function (o) { return sel[o.key]; }).join(" · ");
      const engraveText = currentEngrave();
      addLine({
        k: p.id + "|" + v + "|" + engraveText,
        id: p.id,
        v: v,
        q: 1,
        price: unitPrice(p, sel),
        stack: "",
        engrave: engraveText
      });
    }
    if (addBtn) addBtn.addEventListener("click", addCurrent);
    const stAdd = $("#stAdd");
    if (stAdd) {
      stAdd.disabled = !p.stock;
      stAdd.textContent = p.stock ? "Add to bag" : "Sold out";
      stAdd.addEventListener("click", addCurrent);
    }
    refresh();
  }

  function mountCheckout() {
    const form = $("#coForm");
    if (!form) return;
    const sum = $("#coSummary");
    function draw() {
      const t = totals();
      if (!sum) return;
      const rows = cart.map(function (l) {
        const p = byId[l.id];
        return '<div class="sumline"><span>' + l.q + " × " + esc(p ? p.name : l.id) + (l.v ? " · " + esc(l.v) : "") + (l.engrave ? " · Engraved: " + esc(l.engrave) : "") + "</span><span>" + money(l.price * l.q) + "</span></div>";
      }).join("");
      sum.innerHTML = (rows || '<p>Your bag is empty.</p>') +
        '<div class="sumline"><span>Subtotal</span><span>' + money(t.sub) + "</span></div>" +
        '<div class="sumline"><span>Stack savings</span><span>−' + money(t.saveAmt) + "</span></div>" +
        '<div class="sumline"><span>Shipping</span><span>' + (cart.length ? (t.ship ? money(t.ship) : "Free") : "—") + "</span></div>" +
        '<div class="sumline"><span>Total</span><span>' + money(cart.length ? t.total : 0) + "</span></div>";
    }
    draw();
    function setErr(input, msg) {
      if (!input) return;
      input.setAttribute("aria-invalid", "true");
      input.classList.add("bad");
      return msg;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      $$("[aria-invalid]", form).forEach(function (el) { el.removeAttribute("aria-invalid"); el.classList.remove("bad"); });
      const errors = [];
      const email = form.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push(setErr(form.email, "Enter a valid email."));
      if (!form.first.value.trim()) errors.push(setErr(form.first, "Enter a first name."));
      if (!form.last.value.trim()) errors.push(setErr(form.last, "Enter a last name."));
      if (!form.address.value.trim()) errors.push(setErr(form.address, "Enter a street address."));
      if (!form.city.value.trim()) errors.push(setErr(form.city, "Enter a city."));
      if (!form.postal.value.trim()) errors.push(setErr(form.postal, "Enter a postal code."));
      const card = form.card.value.replace(/\s+/g, "");
      if (!/^\d{16}$/.test(card)) errors.push(setErr(form.card, "Enter a 16-digit demo card number."));
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.exp.value.trim())) errors.push(setErr(form.exp, "Use expiry as MM/YY."));
      if (!/^\d{3,4}$/.test(form.cvc.value.trim())) errors.push(setErr(form.cvc, "Enter a 3 or 4 digit CVC."));
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
      const done = $("#coDone");
      done.hidden = false;
      $("#coNum").textContent = num;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindChrome();
    renderCart();
    bindAnnounce();
    bindStack();
    bindLooks();
    bindNews();
    bindFilters();
    mountPdp();
    mountCheckout();
  });
})();
