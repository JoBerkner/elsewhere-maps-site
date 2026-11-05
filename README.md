# Marketingseite elsewhere-maps.com

Statische Seite ohne Tracking und ohne fremde Quellen: `index.html`, `style.css`, `app.js` (Etsy-Links, Sprachumschalter), `i18n.js` (Texte EN/DE/FR/ES), `federo.ttf`, `favicon.svg`, `img/` (aus `etsy_bilder/` und dem Projekt ocean_map, auf max. 1600 px verkleinert).

Gekauft wird nur auf Etsy. Die Seite verlinkt auf die Anzeigen, hat keine eigenen Preise und keine Kasse.

## Etsy-Links eintragen

Ganz oben in `app.js`:

```js
const ETSY = { shop: "", earthAroundYou: "", oneOcean: "" };
```

Am besten die **Share-&-Save-Links** aus dem Etsy Shop Manager (Marketing → Share & Save) nehmen, dann erstattet Etsy einen Teil der Gebühren. Erlaubt sind nur Adressen, die mit `https://www.etsy.com/` oder `https://etsy.com/` beginnen. Leere Links erscheinen als ausgegrauter Knopf „Coming soon on Etsy“.

## Veröffentlichen (GitHub Pages)

1. Öffentliches Repo `JoBerkner/elsewhere-maps-site` anlegen und den Inhalt dieses Ordners hochladen.
2. Settings → Pages: Branch `main`, Ordner `/`, Custom domain `elsewhere-maps.com`, danach *Enforce HTTPS*.
3. DNS beim Domain-Anbieter (z. B. INWX):
   - Hauptdomain `elsewhere-maps.com`: vier **A**-Einträge auf `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` und vier **AAAA**-Einträge auf `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.
   - `www`: **CNAME** auf `joberkner.github.io` (GitHub leitet dann www auf die Hauptdomain um).
   - `design` (Bestelltool) bleibt wie in `bestelltool/README.md`: CNAME auf `joberkner.github.io`.
4. Unter GitHub → Settings → Pages → *Verified domains* die Domain bestätigen (TXT-Eintrag), damit niemand sie für ein fremdes Repo nutzen kann.

Impressum und Datenschutz liegen beim Bestelltool (`https://design.elsewhere-maps.com/imprint.html`, `privacy.html`); die Datenschutzerklärung sollte die Marketingseite mit erwähnen (nur Zugriffsdaten bei GitHub Pages, keine Cookies).

## Lokal ansehen

```
python3 -m http.server 8790 -d marketing
```
