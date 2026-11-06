/* Marketingseite Elsewhere Maps: Etsy-Links, Produktwahl (mit Look je Karte), Sprachumschalter,
   "Ueber mich". Keine Daten, kein Tracking. */
"use strict";

// ---------------------------------------------------------------- Etsy-Links (HIER eintragen)
// Am besten die "Share & Save"-Links aus dem Etsy Shop Manager (Marketing -> Share & Save),
// dann erstattet Etsy einen Teil der Gebuehren fuer Kaeufe ueber diese Seite.
// Leere Produkt-Links fuehren vorerst auf den Shop.
const ETSY = {
  shop: "https://www.etsy.com/shop/ElsewhereMaps",
  earthAroundYou: "",  // Anzeige The Earth Around You (bzw. eine Kollektion mit allen vier Anzeigen)
  oneOcean: "",        // Anzeige One Ocean Map
};
const PRODUCTS = ["earth", "ocean"];

const LANGS = ["en", "de", "fr", "es"];
let UI = "en";
const t = (k) => (window.UI_STRINGS[UI] || {})[k] ?? window.UI_STRINGS.en[k] ?? k;
const etsyOk = (u) => typeof u === "string" && /^https:\/\/(www\.)?etsy\.com\//.test(u);

function apply() {
  document.documentElement.lang = UI;
  document.title = t("page_title");
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.innerHTML = t(el.dataset.i18n); });   // eigene feste Texte
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => { el.alt = t(el.dataset.i18nAlt); });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  document.querySelectorAll(".uilang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.ui === UI)));
  document.querySelectorAll("[data-etsy]").forEach((a) => {
    const url = etsyOk(ETSY[a.dataset.etsy]) ? ETSY[a.dataset.etsy] : ETSY.shop;   // Produkt-Link fehlt -> Shop
    a.href = url; a.target = "_blank"; a.rel = "noopener";
  });
}

function setUI(l, remember) {
  UI = LANGS.includes(l) ? l : "en";
  if (remember) try { localStorage.setItem("ui", UI); } catch {}
  apply();
}

// ---------------------------------------------------------------- Produktwahl
let current = "";
function showProduct(p, { focus = false, animate = true } = {}) {
  if (!PRODUCTS.includes(p) || p === current) return;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const panels = document.querySelectorAll(".panel");
  const swap = () => {
    current = p;
    document.body.dataset.product = p;
    document.querySelectorAll("[data-for]").forEach((el) => { el.hidden = el.dataset.for !== p; });
    document.querySelectorAll('[role="tab"]').forEach((tab) => {
      const on = tab.dataset.tab === p;
      tab.setAttribute("aria-selected", String(on)); tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    });
    try { history.replaceState(null, "", "#" + p); } catch {}
    requestAnimationFrame(() => panels.forEach((el) => el.classList.remove("fading")));
  };
  if (!animate || reduce || !current) { swap(); return; }
  panels.forEach((el) => el.classList.add("fading"));
  setTimeout(swap, 180);
}

function initTabs() {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => showProduct(tab.dataset.tab));
    tab.addEventListener("keydown", (e) => {
      let j = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % tabs.length;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") j = 0;
      if (e.key === "End") j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); showProduct(tabs[j].dataset.tab, { focus: true }); tabs[j].focus(); }
    });
  });
  const fromHash = () => location.hash.replace("#", "");
  showProduct(PRODUCTS.includes(fromHash()) ? fromHash() : "earth", { animate: false });
  window.addEventListener("hashchange", () => { if (PRODUCTS.includes(fromHash())) showProduct(fromHash()); });
}

// ---------------------------------------------------------------- Ueber mich
function initAbout() {
  // Foto img/me.jpg, sonst Initialen (ohne Inline-Handler, damit die CSP streng bleibt)
  for (const img of [document.getElementById("avatarImg"), document.getElementById("aboutImg")]) {
    const box = img.closest(".avatar");
    const fail = () => box.classList.add("noimg");
    img.addEventListener("error", fail);
    if (img.complete && img.naturalWidth === 0) fail();
  }
  const dlg = document.getElementById("about");
  const opener = document.getElementById("aboutOpen");
  opener.addEventListener("click", () => { if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", ""); });
  document.getElementById("aboutClose").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => {                       // Klick neben das Fenster schliesst
    const r = dlg.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
  });
  dlg.addEventListener("close", () => opener.focus());
}

// ---------------------------------------------------------------- Grossansicht der Bilder
function initLightbox() {
  const dlg = document.getElementById("lightbox"), big = document.getElementById("lbImg"), cap = document.getElementById("lbCap");
  let list = [], at = 0, opener = null;
  const show = (i) => {
    at = (i + list.length) % list.length; const img = list[at];
    big.src = img.currentSrc || img.src; big.alt = img.alt;
    big.classList.toggle("round", img.classList.contains("round"));
    const fc = img.closest("figure") && img.closest("figure").querySelector("figcaption");
    cap.textContent = fc ? fc.textContent : "";
    document.getElementById("lbPrev").hidden = document.getElementById("lbNext").hidden = list.length < 2;
  };
  const open = (img) => {
    // alle sichtbaren Bilder des gerade gezeigten Produkts, in Reihenfolge der Seite
    list = [...document.querySelectorAll("img.zoomable")].filter((i) => i.offsetParent !== null);
    opener = img; show(list.indexOf(img));
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  };
  document.querySelectorAll(".product-media img, .gallery img").forEach((img) => {
    img.classList.add("zoomable"); img.tabIndex = 0; img.setAttribute("role", "button");
    img.addEventListener("click", () => open(img));
    img.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(img); } });
  });
  document.getElementById("lbClose").addEventListener("click", () => dlg.close());
  document.getElementById("lbPrev").addEventListener("click", () => show(at - 1));
  document.getElementById("lbNext").addEventListener("click", () => show(at + 1));
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });   // Klick auf den dunklen Rand
  dlg.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") show(at - 1); if (e.key === "ArrowRight") show(at + 1); });
  dlg.addEventListener("close", () => { big.removeAttribute("src"); if (opener) opener.focus(); });
}

document.addEventListener("DOMContentLoaded", () => {
  initLightbox();
  let saved = null; try { saved = localStorage.getItem("ui"); } catch {}
  const q = new URLSearchParams(location.search).get("ui");
  const nav = (navigator.languages || [navigator.language || "en"]).map((x) => String(x).slice(0, 2).toLowerCase());
  setUI([q, saved, ...nav].find((x) => LANGS.includes(x)) || "en", false);
  document.querySelectorAll(".uilang button").forEach((b) => b.addEventListener("click", () => setUI(b.dataset.ui, true)));
  initTabs();
  initAbout();
});
