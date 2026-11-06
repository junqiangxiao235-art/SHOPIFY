(function () {
  const SY = window.SY;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const money = (n) => "$" + Math.round(n);
  const colOf = (id) => SY.collections.find((c) => c.id === id) || { name: "", zh: "" };
  const byId = (id) => SY.products.find((p) => p.id === id);
  const KEY = "cart_shanyue_v3";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function save(lines) {
    localStorage.setItem(KEY, JSON.stringify(lines));
    paintBag();
    paintCart();
  }
  function priceOf(p, metal) {
    return p.price + ((p.metals && p.metals[metal]) || 0);
  }
  function defaultMetal(p) {
    return p.metals.vermeil !== undefined ? "vermeil" : Object.keys(p.metals)[0];
  }
  function defaultSize(p) {
    if (!p.sizes) return "";
    return p.sizes.find((s) => !(p.oosSizes || []).includes(s)) || p.sizes[0];
  }

  function paintBag() {
    const n = load().reduce((s, l) => s + l.q, 0);
    const el = $("#bagN");
    if (el) el.textContent = String(n);
    const btn = $("#bagBtn");
    if (btn) btn.setAttribute("aria-label", "Bag, " + n + (n === 1 ? " piece" : " pieces"));
  }

  function lineKey(o) {
    return [o.id, o.metal, o.size || "", o.engrave || "", o.font || ""].join("|");
  }

  function addLine(o) {
    const lines = load();
    const k = lineKey(o);
    const hit = lines.find((l) => l.k === k);
    if (hit) hit.q += o.q || 1;
    else lines.push(Object.assign({ k: k, q: 1 }, o));
    save(lines);
    const note = $("#cartNote");
    if (note) note.textContent = "Added to your bag.";
    const dlg = $("#cartDlg");
    if (dlg && dlg.showModal && !dlg.open) dlg.showModal();
  }

  function paintCart() {
    const box = $("#cartLines");
    if (!box) return;
    const lines = load();
    const sum = lines.reduce((s, l) => s + l.price * l.q, 0);
    box.innerHTML = lines.length ? lines.map((l) => {
      const extra = [l.metalName, l.size ? "size " + l.size : "", l.engrave ? "“" + l.engrave + "”" : ""].filter(Boolean).join(" · ");
      return '<article class="line"><img src="' + l.img + '" alt=""><div><p class="serif" style="font-size:18px">' + esc(l.name) + '</p><p class="stone" style="font-size:14px">' + esc(extra) + '</p><div class="qty"><button type="button" data-q="-1" data-k="' + esc(l.k) + '" aria-label="Decrease quantity">−</button><span>' + l.q + '</span><button type="button" data-q="1" data-k="' + esc(l.k) + '" aria-label="Increase quantity">+</button></div></div><p>' + money(l.price * l.q) + '</p></article>';
    }).join("") : '<p class="stone">Your bag is empty.</p>';
    const t = $("#cartTotal");
    if (t) t.textContent = money(sum);
    const go = $("#toCheck");
    if (go) go.toggleAttribute("hidden", !lines.length);
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function ensureChrome() {
    if ($("#cartDlg")) return;
    document.body.insertAdjacentHTML("beforeend",
      '<dialog id="cartDlg" class="sheet" aria-label="Bag"><div class="panel"><header><h2>Bag</h2><button type="button" class="x" data-close aria-label="Close bag">×</button></header><p id="cartNote" class="stone"></p><div id="cartLines"></div><div class="row-between"><span>Subtotal</span><strong id="cartTotal">$0</strong></div><a class="btn block" id="toCheck" href="checkout.html">Checkout</a><p class="note">Demo store. No payment is taken.</p></div></dialog>' +
      '<dialog id="filterDlg" class="sheet" aria-label="Filters"><div class="panel left"><header><h2>Filter</h2><button type="button" class="x" data-close aria-label="Close filters">×</button></header><div id="filterBody"></div><button type="button" class="btn" id="applyFilters">Show pieces</button></div></dialog>' +
      '<dialog id="sizeDlg" class="sheet" aria-label="Size guide"><div class="panel"><header><h2>Size guide</h2><button type="button" class="x" data-close aria-label="Close size guide">×</button></header><p class="measure">Inside circumference for a round ring. If you are between sizes, choose the larger one.</p><table class="size-table"><thead><tr><th>US size</th><th>Inside, mm</th></tr></thead><tbody><tr><td>4</td><td>46.8</td></tr><tr><td>5</td><td>49.3</td></tr><tr><td>6</td><td>51.9</td></tr><tr><td>7</td><td>54.4</td></tr><tr><td>8</td><td>57.0</td></tr><tr><td>9</td><td>59.5</td></tr></tbody></table></div></dialog>' +
      '<dialog id="quickDlg" class="sheet" aria-label="Quick view"><div class="panel"><header><h2 id="qvTitle">Quick view</h2><button type="button" class="x" data-close aria-label="Close quick view">×</button></header><div id="quickBody"></div></div></dialog>'
    );
    document.body.addEventListener("click", (e) => {
      const t = e.target;
      if (t.closest("[data-close]")) t.closest("dialog").close();
      const q = t.closest("[data-q]");
      if (q && q.closest("#cartLines")) {
        const lines = load();
        const hit = lines.find((l) => l.k === q.getAttribute("data-k"));
        if (hit) {
          hit.q += Number(q.getAttribute("data-q"));
          save(hit.q > 0 ? lines : lines.filter((l) => l.k !== hit.k));
        }
      }
    });
  }

  function card(p) {
    const c = colOf(p.col);
    const sold = p.stock === false;
    const low = Math.min.apply(null, Object.keys(p.metals).map((m) => priceOf(p, m)));
    const pos = p.pos ? ' style="object-position:' + p.pos + '"' : "";
    return '<article class="card-wrap"><div class="shot"><a href="product.html?id=' + p.id + '"><img src="' + p.img + '" srcset="' + p.img + ' 800w" sizes="(max-width: 700px) 46vw, 250px" alt="' + esc(p.alt) + '" width="800" height="800"' + pos + '><img class="b" src="' + p.imgb + '" alt="" width="800" height="800" loading="lazy"></a><button type="button" class="qv" data-quick="' + p.id + '">Quick view</button></div><a class="name" href="product.html?id=' + p.id + '">' + esc(p.name) + '</a><p class="meta"><span>' + esc(c.name) + "</span><span>" + (sold ? "Sold out" : (Object.keys(p.metals).length > 1 ? "From " : "") + money(low)) + "</span></p></article>";
  }

  function bindQuick() {
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-quick]");
      if (!b) return;
      const p = byId(b.getAttribute("data-quick"));
      if (!p) return;
      $("#qvTitle").textContent = p.name;
      const sold = p.stock === false;
      $("#quickBody").innerHTML = '<div class="qv-body"><img src="' + p.img + '" alt="' + esc(p.alt) + '"><div><p class="stone">' + esc(colOf(p.col).name) + " " + colOf(p.col).zh + '</p><p class="price">' + money(p.price) + '</p><p>' + esc(p.line) + '</p><p style="margin-top:10px"><a href="product.html?id=' + p.id + '">Choose metal and size</a></p><button type="button" class="btn" id="qvAdd"' + (sold ? " disabled" : "") + ">" + (sold ? "Sold out" : "Add to bag") + "</button></div></div>";
      const add = $("#qvAdd");
      if (add) add.onclick = () => addLine({ id: p.id, name: p.name, metal: defaultMetal(p), metalName: SY.metals[defaultMetal(p)].name, size: defaultSize(p), engrave: "", font: "", price: priceOf(p, defaultMetal(p)), img: p.img, q: 1 });
      $("#quickDlg").showModal();
    });
  }

  function readQuery() {
    return new URLSearchParams(location.search);
  }

  function passes(p, q) {
    if (q.get("collection") && p.col !== q.get("collection")) return false;
    if (q.get("metal") && p.metals[q.get("metal")] === undefined) return false;
    if (q.get("price") === "under" && p.price >= 100) return false;
    if (q.get("price") === "mid" && (p.price < 100 || p.price > 200)) return false;
    if (q.get("price") === "over" && p.price < 200) return false;
    if (q.get("stock") === "1" && p.stock === false) return false;
    return true;
  }

  function renderCollection() {
    const grid = $("#grid");
    if (!grid) return;
    const q = readQuery();
    let rows = SY.products.filter((p) => passes(p, q));
    const sort = q.get("sort") || "featured";
    if (sort === "low") rows.sort((a, b) => a.price - b.price);
    if (sort === "high") rows.sort((a, b) => b.price - a.price);
    const col = q.get("collection");
    const head = $("#colTitle");
    const dek = $("#colDek");
    if (col && head) {
      const c = colOf(col);
      head.textContent = c.name + " ";
      head.insertAdjacentHTML("beforeend", '<span class="sc">' + c.zh + "</span>");
      if (dek) dek.textContent = c.line;
    }
    grid.innerHTML = rows.length ? rows.map(card).join("") : '<p class="empty">Nothing in this edit. Clear a filter to see more.</p>';
    const count = $("#count");
    if (count) count.textContent = rows.length + (rows.length === 1 ? " piece" : " pieces");
    const chips = $("#chips");
    if (chips) {
      const bits = [];
      if (col) bits.push(["collection", colOf(col).name]);
      if (q.get("metal")) bits.push(["metal", SY.metals[q.get("metal")].name]);
      if (q.get("price")) bits.push(["price", { under: "Under $100", mid: "$100–200", over: "$200 and up" }[q.get("price")]]);
      if (q.get("stock") === "1") bits.push(["stock", "In stock"]);
      chips.innerHTML = bits.map((b) => '<button type="button" class="chip" data-drop="' + b[0] + '">' + esc(b[1]) + " ×</button>").join("");
    }
    const sel = $("#sort");
    if (sel) sel.value = sort;
  }

  function setQuery(mut) {
    const q = readQuery();
    mut(q);
    const s = q.toString();
    history.replaceState(null, "", s ? "?" + s : location.pathname);
    renderCollection();
    paintFilters();
  }

  function paintFilters() {
    const body = $("#filterBody");
    if (!body) return;
    const q = readQuery();
    const block = (title, name, options) => {
      const opts = options.map((o) => {
        const nq = new URLSearchParams(q);
        if (o.value) nq.set(name, o.value); else nq.delete(name);
        const n = SY.products.filter((p) => passes(p, nq)).length;
        const on = (q.get(name) || "") === o.value;
        return '<label class="opt"><span><input type="radio" name="f-' + name + '" value="' + esc(o.value) + '"' + (on ? " checked" : "") + "> " + esc(o.label) + '</span><span class="stone">' + n + "</span></label>";
      }).join("");
      return '<div class="group"><h3>' + title + "</h3>" + opts + "</div>";
    };
    body.innerHTML =
      block("Collection", "collection", [{ value: "", label: "All" }].concat(SY.collections.map((c) => ({ value: c.id, label: c.name })))) +
      block("Metal", "metal", [{ value: "", label: "All" }, { value: "silver", label: "Sterling silver" }, { value: "vermeil", label: "Gold vermeil" }, { value: "gold14", label: "14k yellow gold" }]) +
      block("Price", "price", [{ value: "", label: "All" }, { value: "under", label: "Under $100" }, { value: "mid", label: "$100–200" }, { value: "over", label: "$200 and up" }]) +
      block("Availability", "stock", [{ value: "", label: "All" }, { value: "1", label: "In stock" }]);
  }

  function bindCollection() {
    if (!$("#grid")) return;
    const pristine = !location.search && $("#grid .card-wrap");
    if (!pristine) renderCollection();
    paintFilters();
    $("#openFilters").addEventListener("click", () => { paintFilters(); $("#filterDlg").showModal(); });
    $("#applyFilters").addEventListener("click", () => {
      const q = readQuery();
      $$("#filterBody input:checked").forEach((input) => {
        const name = input.name.slice(2);
        if (input.value) q.set(name, input.value); else q.delete(name);
      });
      history.replaceState(null, "", q.toString() ? "?" + q.toString() : location.pathname);
      renderCollection();
      $("#filterDlg").close();
    });
    $("#chips").addEventListener("click", (e) => {
      const b = e.target.closest("[data-drop]");
      if (!b) return;
      setQuery((q) => q.delete(b.getAttribute("data-drop")));
    });
    $("#sort").addEventListener("change", () => setQuery((q) => {
      if ($("#sort").value === "featured") q.delete("sort");
      else q.set("sort", $("#sort").value);
    }));
  }

  function renderProduct() {
    const stage = $("#stage");
    if (!stage) return;
    const id = readQuery().get("id") || "lantern-solitaire";
    const p = byId(id) || SY.products[0];
    document.title = p.name + " · Shanyue";
    const metal = defaultMetal(p);
    const size = defaultSize(p);
    const sold = p.stock === false;
    const metalButtons = Object.keys(p.metals).map((idm) => {
      const m = SY.metals[idm];
      const on = idm === metal;
      return '<button type="button" class="swatch" data-metal="' + idm + '" aria-pressed="' + on + '" aria-label="' + esc(m.name) + '"><i style="background:' + m.tone + '"></i></button>';
    }).join("");
    const sizeButtons = (p.sizes || []).map((s) => {
      const off = (p.oosSizes || []).includes(s);
      const on = s === size && !off;
      return '<button type="button" class="size" data-size="' + s + '" aria-pressed="' + on + '"' + (off ? " disabled" : "") + ">" + s + "</button>";
    }).join("");
    const at = p.engraveAt || { left: "50%", top: "70%" };
    const keep = stage.getAttribute("data-boot") === id && $("#add");
    if (!keep) stage.innerHTML =
      '<div class="gallery"><div class="frame"><img id="mainImg" src="' + p.img + '" srcset="' + p.img + ' 800w" sizes="(max-width: 900px) 92vw, 58vw" alt="' + esc(p.alt) + '" width="1000" height="1000">' +
      (p.engrave ? '<span id="live" class="engrave-live serif" style="left:' + at.left + ";top:" + at.top + '"></span>' : "") +
      '</div><div class="frame"><img src="' + p.imgb + '" alt="" width="1000" height="1000" loading="lazy"></div></div>' +
      '<div class="buy"><p class="stone">' + esc(colOf(p.col).name) + ' <span class="sc">' + colOf(p.col).zh + '</span></p><h1>' + esc(p.name) + '</h1><p class="price" id="price">' + money(priceOf(p, metal)) + '</p><p class="measure">' + esc(p.line) + '</p>' +
      '<div class="field"><span id="metalLabel">Metal: ' + esc(SY.metals[metal].name) + '</span><div class="metals" role="group" aria-label="Metal">' + metalButtons + "</div></div>" +
      (p.sizes ? '<div class="field"><span>Size</span><div class="sizes" role="group" aria-label="US size">' + sizeButtons + '</div><button type="button" class="linkish" id="openSize">Size guide</button></div>' : "") +
      (p.engrave ? '<div class="field"><label class="engrave-row" for="eng">Engraving<input id="eng" type="text" maxlength="10" autocomplete="off" placeholder="Up to 10 letters"></label><span class="count" id="count">0 / 10</span><div class="fonts" role="radiogroup" aria-label="Engraving style"><label><input type="radio" name="efont" value="serif" checked> Serif</label><label><input type="radio" name="efont" value="script"> Script</label></div><p class="note">Engraved pieces ship in 7–10 days and cannot be returned.</p></div>' : "") +
      '<p class="ship" id="ship"></p><button type="button" class="btn" id="add"' + (sold ? " disabled" : "") + ">" + (sold ? "Sold out" : "Add to bag") + "</button>" +
      '<div class="tabs" role="tablist"><button type="button" role="tab" aria-selected="true" data-tab="piece">The piece</button><button type="button" role="tab" aria-selected="false" data-tab="ship">Shipping</button><button type="button" role="tab" aria-selected="false" data-tab="care">Care</button><button type="button" role="tab" aria-selected="false" data-tab="reviews">Reviews</button></div><div class="tabp" id="tabp"></div></div>';

    const state = { metal: metal, size: size, engrave: "", font: "serif" };
    const tabs = {
      piece: p.detail || p.line,
      ship: "In stock pieces leave in 2–4 days. Free shipping on orders over $80. Engraved pieces take 7–10 days and cannot be returned. Other pieces can be returned within 30 days.",
      care: "Wipe with a soft cloth. Keep vermeil away from perfume and pools. A one-year warranty covers a broken clasp or a lost stone.",
      reviews: "Reviews will show here after launch. This is a demo store, so the list is empty on purpose."
    };
    $("#tabp").textContent = tabs.piece;
    function shipText() {
      if (sold) return "This piece is out of stock.";
      if (state.engrave) return "Engraved: ships in 7–10 days.";
      return "In stock. Ships in 2–4 days. Free shipping over $80.";
    }
    function paint(animate) {
      const n = priceOf(p, state.metal);
      const el = $("#price");
      const next = money(n);
      if (animate && el.textContent !== next && !reduce) {
        el.classList.remove("tick");
        void el.offsetWidth;
        el.classList.add("tick");
      }
      el.textContent = next;
      $("#metalLabel").textContent = "Metal: " + SY.metals[state.metal].name;
      $("#ship").textContent = shipText();
      const add = $("#add");
      const sizeBad = p.sizes && !state.size;
      add.disabled = sold || sizeBad;
      add.textContent = sold ? "Sold out" : "Add to bag";
    }
    paint(false);
    stage.addEventListener("click", (e) => {
      const m = e.target.closest("[data-metal]");
      if (m) {
        state.metal = m.getAttribute("data-metal");
        $$("[data-metal]", stage).forEach((b) => b.setAttribute("aria-pressed", b === m ? "true" : "false"));
        paint(true);
      }
      const s = e.target.closest("[data-size]");
      if (s && !s.disabled) {
        state.size = s.getAttribute("data-size");
        $$("[data-size]", stage).forEach((b) => b.setAttribute("aria-pressed", b === s ? "true" : "false"));
        paint();
      }
      const tab = e.target.closest("[data-tab]");
      if (tab) {
        $$("[data-tab]", stage).forEach((b) => b.setAttribute("aria-selected", b === tab ? "true" : "false"));
        $("#tabp").textContent = tabs[tab.getAttribute("data-tab")];
      }
      if (e.target.id === "openSize") $("#sizeDlg").showModal();
      if (e.target.id === "add" && !e.target.disabled) {
        addLine({
          id: p.id, name: p.name, metal: state.metal, metalName: SY.metals[state.metal].name,
          size: state.size, engrave: state.engrave, font: state.font,
          price: priceOf(p, state.metal), img: p.img, q: 1
        });
      }
    });
    const eng = $("#eng");
    if (eng) {
      const live = $("#live");
      const sync = () => {
        state.engrave = eng.value.slice(0, 10);
        eng.value = state.engrave;
        $("#count").textContent = state.engrave.length + " / 10";
        const font = ($("input[name=efont]:checked") || {}).value || "serif";
        state.font = font;
        live.textContent = state.engrave;
        live.className = "engrave-live " + (font === "script" ? "script" : "serif");
        paint(false);
      };
      eng.addEventListener("input", sync);
      $$("input[name=efont]", stage).forEach((r) => r.addEventListener("change", sync));
    }
    const also = $("#also");
    if (also && !(keep && also.querySelector(".card-wrap"))) {
      const kin = SY.products.filter((x) => x.col === p.col && x.id !== p.id).slice(0, 3);
      const section = also.closest("section");
      if (!kin.length) {
        also.innerHTML = "";
        if (section) section.hidden = true;
      } else {
        if (section) section.hidden = false;
        also.innerHTML = kin.map(card).join("");
      }
    }
  }

  function renderHomeGrid() {
    const g = $("#homeGrid");
    if (!g || g.querySelector(".card-wrap")) return;
    g.innerHTML = SY.products.filter((p) => p.stock !== false).slice(0, 8).map(card).join("");
  }

  function bindCheckout() {
    const form = $("#checkForm");
    if (!form) return;
    const lines = load();
    const box = $("#sumLines");
    const sum = lines.reduce((s, l) => s + l.price * l.q, 0);
    const ship = sum === 0 || sum >= 80 ? 0 : 8;
    if (box) {
      box.innerHTML = lines.map((l) => "<p>" + esc(l.name) + " × " + l.q + ", " + money(l.price * l.q) + "</p>").join("") || "<p>Your bag is empty.</p>";
      box.insertAdjacentHTML("beforeend", "<p>Shipping " + (ship ? money(ship) : "free") + "</p><p><strong>Total " + money(sum + ship) + "</strong></p>");
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const need = ["name", "email", "address", "city"];
      let bad = false;
      need.forEach((id) => {
        const el = form.elements[id];
        const ok = el.value.trim().length > 1 && (id !== "email" || el.value.includes("@"));
        el.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok) bad = true;
      });
      const err = $("#formErr");
      if (!lines.length) { err.textContent = "Your bag is empty."; return; }
      if (bad) { err.textContent = "Add a name, a real email, and an address."; return; }
      err.textContent = "";
      localStorage.removeItem(KEY);
      paintBag();
      form.hidden = true;
      $("#sumLines").hidden = true;
      $("#thanks").hidden = false;
    });
  }

  ensureChrome();
  paintBag();
  paintCart();
  $("#bagBtn") && $("#bagBtn").addEventListener("click", () => { paintCart(); $("#cartDlg").showModal(); });
  bindQuick();
  bindCollection();
  renderProduct();
  renderHomeGrid();
  bindCheckout();
})();
