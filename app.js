/* Marketingseite Elsewhere Maps: Etsy-Links und Sprachumschalter. Keine Daten, kein Tracking. */
"use strict";

// ---------------------------------------------------------------- Etsy-Links (HIER eintragen)
// Am besten die "Share & Save"-Links aus dem Etsy Shop Manager (Marketing -> Share & Save),
// dann erstattet Etsy einen Teil der Gebuehren fuer Kaeufe ueber diese Seite.
// Leer = Knopf wird ausgegraut ("Coming soon on Etsy").
const ETSY = {
  shop: "",            // z. B. https://www.etsy.com/shop/<Shopname>?...  (Share-&-Save-Link des Shops)
  earthAroundYou: "",  // Anzeige The Earth Around You (bzw. eine Kollektion mit allen vier Anzeigen)
  oneOcean: "",        // Anzeige One Ocean Map
};

const LANGS = ["en", "de", "fr", "es"];
let UI = "en";
const t = (k) => (window.UI_STRINGS[UI] || {})[k] ?? window.UI_STRINGS.en[k] ?? k;

function apply() {
  document.documentElement.lang = UI;
  document.title = t("page_title");
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.innerHTML = t(el.dataset.i18n); });   // eigene feste Texte
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => { el.alt = t(el.dataset.i18nAlt); });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  document.querySelectorAll(".uilang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.ui === UI)));
  document.querySelectorAll("[data-etsy]").forEach((a) => {
    const url = ETSY[a.dataset.etsy];
    if (url && /^https:\/\/(www\.)?etsy\.com\//.test(url)) {
      a.href = url; a.rel = "noopener"; a.target = "_blank"; a.removeAttribute("aria-disabled"); a.classList.remove("soon");
    } else {
      a.removeAttribute("href"); a.setAttribute("aria-disabled", "true"); a.classList.add("soon"); a.textContent = t("link_soon");
    }
  });
}

function setUI(l, remember) {
  UI = LANGS.includes(l) ? l : "en";
  if (remember) try { localStorage.setItem("ui", UI); } catch {}
  apply();
}

document.addEventListener("DOMContentLoaded", () => {
  let saved = null; try { saved = localStorage.getItem("ui"); } catch {}
  const q = new URLSearchParams(location.search).get("ui");
  const nav = (navigator.languages || [navigator.language || "en"]).map((x) => String(x).slice(0, 2).toLowerCase());
  setUI([q, saved, ...nav].find((x) => LANGS.includes(x)) || "en", false);
  document.querySelectorAll(".uilang button").forEach((b) => b.addEventListener("click", () => setUI(b.dataset.ui, true)));
});
