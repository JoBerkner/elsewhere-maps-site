# Aequidistante Weltkarte um einen frei waehlbaren Mittelpunkt

Basemap mit Satellitenbild, geschummerter Bathymetrie (Meer und Seen),
Entfernungsringen und der am weitesten entfernten Grossstadt in azimutal
aequidistanter Projektion. Entfernung **und** Richtung ab dem
Mittelpunkt sind exakt: Jeder Ring ist ein Kreis gleicher Grosskreisdistanz.

Die Karte zeigt die **ganze Erde** bis zum Radius π·R ≈ 20 015 km. Der
Antipode wird dabei zum kompletten Randkreis ausgewalzt; die aeussersten
~1000 km sind stark verzerrt und verschmiert – das macht sichtbar, wie gross
die Verzerrung ist. Fuer eine ruhigere Karte `R_CUT` in `projdefs.py` z.B. auf
19 000 km setzen.

## Erzeugen

Python-Umgebung `~/anaconda3/envs/equimap_env` (conda-forge: rasterio,
pyproj, fiona, geopandas, scipy, fonttools, gdal; dazu Pillow von PyPI, denn
nur dessen Wheel hat libraqm fuer verbundene Schriften wie Arabisch und
Bengalisch; `PIL.features.check("raqm")` muss True sein):
`export PATH=~/anaconda3/envs/equimap_env/bin:$PATH`.

```
./make_basemap.sh <lat> <lon> <name> [kantenlaenge_px]     # Standard 4000 px
NUR_BASIS=1 ./make_basemap.sh 59.9139 10.7522 "Oslo" 8100   # nur base.tif fuer poster.py (ca. 6 min)
python3 poster.py --stadt oslo        # alle Fassungen + Beschreibung -> karten_final/oslo/
python3 poster.py --alle              # alle Staedte aus staedte.py
```

Fuer das 80-cm-Poster (Kartenkreis 4016 px, Beschriftung doppelt so fein in
8030 px) reicht eine Basiskarte von 8100 px; auf Druckgroesse ist sie von der
40 000-px-Fassung kaum zu unterscheiden. Muenchen und New York haben noch die
40 000-px-Basiskarte.

### Staedte, Fassungen, Ausgabe

`staedte.py` listet alle Staedte (Ordner, Mittelpunkt, Name je Sprache,
Sprachen, eigene Ueberschrift) und in `PREFER` die Wunschorte je Stadt. Jede Stadt gibt es in jeder ihrer Sprachen
(Landessprache und Englisch) und in km und Meilen. `poster.py --stadt`
waehlt die Orte fuer alle Fassungen gemeinsam (`overlays.select_joint`: ein
Ort kommt nur dazu, wenn er in jeder Fassung ohne Kollision Platz hat), so
zeigen alle Fassungen dieselben Orte. Ausgabe:

```
karten_final/<stadt>/<stadt>_<sprache>_<einheit>.jpg    # z.B. munich_de_mi.jpg
karten_final/<stadt>/product_description.txt            # beschreibung.py
```

Meilen-Fassung: Ringe bei 1 000, 5 000 und 10 000 mi (`overlays.RINGS_MI`);
der freie Innenkreis bleibt bei 1 000 km, damit die Auswahl in allen
Fassungen gleich ist. Zahlen: Tausendertrennzeichen je Sprache
(`overlays.THOUSANDS`), Ziffern und Einheit (km, mi) ueberall lateinisch.

Namen: Natural Earth `NAME_xx`; Norwegisch, fehlende Namen und die Namen der
Landmarks (ausser Deutsch, Englisch) aus Wikidata (`wikidata_names.py` ->
`data/names_wikidata.json`, CC0). Schriften fuer andere Schriftsysteme:
Karte `overlays.SCRIPT_FONTS` (Hiragino, Apple SD Gothic Neo, Geeza Pro,
Kohinoor Bangla; Namen, die die Schrift nicht abdeckt, in Arial), Rahmen
`frame.SCRIPT_FRAME_FONT` (Avenir Next fuer Griechisch, sonst wie die
Karte). Federo hat von `make_federo_sz.py` ein grosses ẞ sowie İ, Ş, Ğ.

Laufzeit: ca. 1 min bei 4000 px, ca. 12 min bei 20 000 px, bei 40 000 px
rund das Vierfache. 40 000 px (1,0 km/px) entsprechen der Aufloesung von
ETOPO 30″; noch mehr bringt nur mit feineren Quelldaten etwas.

## Quelldaten

| Daten | Ort |
|---|---|
| Blue Marble Juni 2004, 500 m (15″), 8 Kacheln | `data/bmng_500m/` (+ `bmng_500m.vrt`, wird automatisch gebaut) |
| ETOPO 2022 30″ surface (Eisoberflaeche) | `data/ETOPO_2022_v1_30s_N90W180_surface.tif` |
| ETOPO 2022 30″ bed, Natural Earth Land/Seen/Schelfeis | `ocean_map` (`DATA=...`) |
| GeoNames cities15000 | `data/cities15000.txt` |

Die 1-km-Fassung der Blue Marble (1′, ca. 1,85 km) wird bei 950 m/px doppelt
hochgerechnet und ist deutlich unschaerfer; sie dient nur als Rueckfall, wenn
`data/bmng_500m/` fehlt. Neu laden:

```
B=https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/june
for t in A1 A2 B1 B2 C1 C2 D1 D2; do curl -L -o data/bmng_500m/world.200406.3x21600x21600.${t}_geo.tif $B/world.200406.3x21600x21600.${t}_geo.tif; done
curl -L -o data/ETOPO_2022_v1_30s_N90W180_surface.tif https://www.ngdc.noaa.gov/mgg/global/relief/ETOPO2022/data/30s/30s_surface_elev_gtif/ETOPO_2022_v1_30s_N90W180_surface.tif
```
Ergebnis in `basemap/<name>/` (Name klein, z.B. `new_york`), Vorschau in
`preview/<name>.png` (1600 px).

| Datei | Inhalt |
|---|---|
| `poster_hell.jpg` | **Produkt**: runder Print mit Rahmen, 4724 px, ca. 8 MB (`poster.py`) |
| `map.jpg` | Karte mit Beschriftung in 40 000 px (`overlays.py`), Georeferenz in `map.wld` – fuer die Poster nicht noetig; derzeit veraltet (alter Kartenkreis und Labelstand) |
| `base_<px>.png`, `land_2048.npy`, `ocean_2048.npy` | Caches von `poster.py`/`overlays.py` (verkleinerte Basiskarte, Land- und Ozeanmaske), werden bei Bedarf neu erzeugt |
| `base.tif` | Kartenbild ohne Beschriftung (Zwischenstand fuer `overlays.py`) |
| `cities.csv` | gezeigte Staedte mit Set, Distanz, Azimut, Richtungsgruppe |
| `rings.tif` | nur Ringe, Beschriftung und Stadtmarke, RGBA – Overlay fuer QGIS |
| `rings.gpkg` | Layer `rings` (`dist_km`, `label`), `rand` (Kartenrand), `ferne_stadt` (Punkt) |
| `sat.tif` | Blue Marble (NASA), RGB + Alpha, ganze Flaeche |
| `sat_land.tif` | dasselbe, Alpha = Landmaske (Land + Inlandeis + Schelfeis, ohne Seen) |
| `dem.tif` | ETOPO 2022 bed, 30″, Float32, NoData −99999 – Schummerung Wasser |
| `surface.tif` | ETOPO 2022 surface, 30″ – Schummerung Land (Eisoberflaeche) |
| `depth.tif` | Wassertiefe in m (positiv) fuer Meer **und** Seen, NoData an Land |
| `land.tif` | Landmaske, Byte 0–255 |
| `lakes.tif` | Seen-ID (Natural Earth FID+1), UInt16 |
| `center.json` | Mittelpunkt, Name, Groesse |

Einstellungen:

* Ringradien: `RINGS` in `projdefs.py` (Standard 1000 / 5000 / 10 000 / 15 000 km)
* Linienstaerke, Schriftgroesse, Farben, Farbskala, Schummerung: oben in
  `render_map.py`, Groessen relativ zur Kantenlaenge (bei 40 000 px: Linie
  14 px, Schrift 160 px)
* Mindesteinwohnerzahl der fernen Stadt: `MIN_POP` in `projdefs.py`

Nur die Overlays neu (Ringe, Linien, Staedte – einige Minuten, die Basemap
bleibt): `python3 overlays.py basemap/<name>`. Fuer das Poster nicht noetig:
`poster.py` zeichnet die Beschriftung selbst in Druckgroesse (ca. 15 s). Kartenbild + Overlays:
`python3 render_map.py basemap/<name>`.

## Skripte

* `make_basemap.sh` – Warps und Masken, ruft die anderen Skripte auf
* `projdefs.py` – Projektion, Schnittradius, Ringe
* `fix_poles.py` – fuellt Warp-Loecher an den Polen (siehe Fallstricke)
* `postprocess.py` – Kreismaske, Wassertiefe, `sat_land.tif`
* `make_rings.py` – Ringe als GeoPackage
* `render_map.py` – Kartenbild ohne Beschriftung -> `base.tif`, blockweise
  (40 000 px passen so in 16 GB RAM), danach die Overlays
* `overlays.py` – Ringe, Himmelsrichtungen, Staedte auf `base.tif` -> `map.jpg`
* `labels.py` – Auswahl der Staedte und Landmarks (`python3 labels.py <lat> <lon>` zeigt sie ohne Karte)
* `landmarks.py` – Tabelle der Landmarks mit Namen je Sprache
* `quick_preview.py` – schnelle Vorschau der Beschriftung (ca. 30 s)
* `frame.py` – runder Rahmen mit Stadtname, Vergleichsblaetter
* `poster.py` – fertiges Poster mit Rahmen und Legende fuer den Druck (4724 px)
* `make_federo_sz.py` – grosses ẞ fuer die Rahmenschrift Federo

## Overlays

Kartenschrift: **Arial** (gewaehlt, `FONT` in `overlays.py`; Alternativen in
`FONTS`). Groessen sind in **mm** angegeben, gestaltet fuer ein 40-cm-Poster und fuer
den echten Druck mit `LABEL_SCALE` vergroessert: Der Print ist rund, 80 cm
(`POSTER_MM`), der Kartenkreis 68 cm (`PRINT_DIAMETER_MM`); bei
`LABEL_SCALE` 1,4 sind Staedte 3,6 mm (ca. 10 pt), Distanzen 2,9 mm (8 pt),
Ringe 4,1 mm auf dem Druck - relativ zur Karte 30 % kleiner als beim
40-cm-Poster. Der Rahmen (`frame.py`, `BAND_MM`, `EDGE_MM`) ist fuer 40 cm
(`FRAME_DESIGN_MM`) gestaltet und waechst mit dem Poster; Titel, Legende und
Himmelsrichtungen behalten so ihre Groesse im Bild. Gestaltungswerte (vor
`LABEL_SCALE`): Ringschrift 2,9 mm, Staedte
2,6 mm, entfernteste Stadt 2,9 mm (Punkt mit Ring), Ringlinien 0,14 mm,
Richtungslinien 0,07 mm, Pluszeichen im Mittelpunkt. Schrift, Punkte und
Kreuz haben eine duenne dunkle Kontur (`OUTLINE_*`) und einen dunklen Schein,
damit sie auch auf hellem Grund (Eis, Wueste, Schelf) lesbar bleiben. Ringe
und Linien werden unter jeder Textzeile einzeln ausgespart. Jede Beschriftung
und jeder Punkt haelt 2,0 mm Abstand zu allem anderen (`CITY_GAP_MM`).

* **Himmelsrichtungen:** 8 duenne Linien vom Mittelpunkt; beschriftet im
  Rahmen ausserhalb der Karte in der Rahmenschrift (`frame.py`, `COMPASS_*`;
  `COMPASS_ON_MAP` in `overlays.py` setzt sie wieder an den Kartenrand), in der
  Sprache des Kartenlandes (N, NO, O ... bzw. N, NE, E ...). In
  der aequidistanten Projektion ist jede Gerade durch den Mittelpunkt ein
  Grosskreis mit exakter Anfangsrichtung.
* **Ringbeschriftung:** eine der 8 Himmelsrichtungen je Ring, per Probelauf
  die, an der am wenigsten wichtige Kandidaten verdeckt werden (oben
  bevorzugt; in der unteren Haelfte aufrecht). Die Beschriftung des
  1000-km-Rings belegt rund 90 Grad des Rings.
* **Namen** in der Sprache des Landes der Mittelpunktstadt (`LANG` in
  `labels.py`, Spalten `NAME_xx` von Natural Earth): Moskau, Peking, Kairo
  auf der Muenchenkarte.
* **Landmarks** (`landmarks.py`, 75 Eintraege: Mount Everest, Machu Picchu,
  Pyramiden von Gizeh, Marianengraben, Nord- und Suedpol, Uluru, Titanic ...):
  spitzer Stern statt Punkt (`STAR_*`), Berge ein Dreieck (`MOUNTAINS` in
  `landmarks.py`, `PEAK_MM`); Schrift wie die Staedte (kursiv mit
  `LANDMARK_ITALIC`: Georgia fett kursiv, `LANDMARK_FONTS`);
  hoechstens `MAX_LANDMARKS` (16), die sehr bekannten (Bekanntheit ≥ 4) vor den
  Sets.
* **Beschriftung am Punkt:** zwischen der Kontur des Punkts und der Kontur
  der Schrift bleiben in jeder Lage (seitlich, schraeg, darueber, darunter)
  `LABEL_CLEAR_MM`; gemessen an der tatsaechlichen Ausdehnung des Namens,
  also mit Akzenten und Umlauten (São, Ürümqi) bzw. Unterlaengen (g, p, y).
* **Aussparung der Ringlinie** um die eigene Ringbeschriftung: entlang des
  Bogens, links und rechts gleich weit (`RING_GAP_MM`) von der sichtbaren
  ersten und letzten Glyphe (Median der Zeilenraender, bei der "1" der Strich).
  Liegt eines naeher als 150 km an einer Kandidatenstadt, verliert es Gewicht
  (die Stadt geht vor).

* **Platzierung am Punkt:** unter den freien Positionen gewinnt die, die am
  wenigsten Land verdeckt (`LAND_AVOID`, Landmaske `land_2048.npy` aus
  `land.tif`); die bevorzugte Reihenfolge zaehlt nur schwach
  (`LABEL_RANK_COST`) - Reykjavik steht so neben Island statt darauf.
* **Ozeannamen** (derzeit aus, `OCEAN_LABELS = True` schaltet sie ein; `oceans.py`, wie in One Ocean): Crimson-Versalien, weit
  gesperrt, hell und halbtransparent ohne Kontur (`OCEAN_*`), immer als
  Bogen. Sie folgen dem Wasser: Um mehrere Ankerpunkte je Ozean werden
  Freihandboegen probiert, deren Kruemmung sich entlang des Namens
  gleichmaessig aendert (einfache und auslaufende Boegen, S-Kurven; Drehung
  mindestens `OCEAN_MIN_TURN`). Die grossen Ozeane folgen der Mittellinie
  ihres Beckens (quer zur Schrift wird der Kuestenabstand nicht groesser - der
  Atlantik laeuft so zwischen Amerika und Afrika/Europa von Nord nach Sued);
  Suedlicher und Arktischer Ozean (`OCEAN_COAST_KEYS`) folgen stattdessen der
  Kueste in etwa `OCEAN_COAST` Schriftgroessen Abstand (um die Antarktis).
  Bevorzugt werden ausserdem Linien, die nicht wie ein Distanzkreis verlaufen (parallel und zur
  Kartenmitte gekruemmt) und kaum
  Buchstaben auf Kreisen oder Strahlen haben. Ein Name steht nur in seinem
  Ozean (Natural Earth `geography_marine_polys` in `data/ne_marine/`,
  `ocean_2048.npy`; Flaechen gleichen Namens wie Nord- und Suedatlantik zaehlen
  zusammen); gleiche Namen (Nord-/Suedpazifik) halten 0,6 Kartenradien
  Abstand. Passt nichts, entfaellt der Name.

### Auswahl (`labels.py`)

Staedte und Landmarks bilden einen gemeinsamen Pool; alle Regeln gelten fuer
beide. Quelle ist Natural Earth *Populated Places* 10m
(`data/ne_populated_places/`, Einwohner der Agglomeration, Namen in vielen
Sprachen, `GEONAMESID` fuer spaetere Namenstabellen).

* **Bekanntheit** = 6 − `MIN_ZOOM` (ab welcher Zoomstufe Webkarten die Stadt
  beschriften) + 1 fuer Weltstaedte + 0,3 je Rang bei `SCALERANK` 0/1; staerkstes
  Einzelkriterium (`W_FAME`). Staedte mit `MIN_ZOOM` > 5 kommen gar nicht in
  den Pool (z.B. Bannu, Samarinda, Pokhara); neue Set-Mitglieder und
  Fuellorte brauchen Bekanntheit ≥ 1,5 (Hauptstaedte ausgenommen).
* **Zielregion:** westliche Laender (Europa ohne Russland/Belarus, USA,
  Kanada, Australien, Neuseeland) `W_WEST`, Industrienationen (Japan,
  Suedkorea, China, Brasilien, Taiwan, Singapur, Hongkong, Israel)
  `W_INDUSTRIAL`. Je Land hoechstens 3 (Indien eingeschlossen),
  Industrienationen 4, westliche Laender 6, das Land der Mittelpunktstadt 8.
* **Abstand zu gezeigten Orten** (`W_SPREAD`) fuellt leere Gegenden, z.B.
  Australien.
* **Reihenfolge:** Mekka und Jerusalem immer (die Gerade dorthin ist die
  Gebetsrichtung) → Wunschorte der Stadt (`staedte.PREFER`, Paare aus
  Natural-Earth-Name und Laendercode; sie kommen unabhaengig von
  Einwohnerzahl und Ausduennen in den Pool und duerfen danach in Sets) → hoechstens 3 Staedte im 1000-km-Kreis (Bekanntheit ≥ 2,
  Hauptstadt oder > 2 Mio. Einwohner), mindestens 300 km vom Mittelpunkt und
  mit 2 mm Abstand zum Kreuz → sehr bekannte Landmarks → Mindestanzahl:
  `MIN_MOUNTAINS` (3) Berge und `MIN_SPOTS` (10) besondere Orte, die
  wichtigsten zuerst → bis zu 6 bekannte Staedte
  bis 3000 km (hier passen kaum Sets) → bis zu 18 wichtige Einzelstaedte
  (`IMPORTANT`) → **Distanz-Sets** (2–5 Orte ±200 km gleich weit entfernt,
  untereinander > 3000 km; schon gezeigte Orte duerfen Mitglied werden;
  Ersetzungsregel: ein deutlich bekannterer Ort im Umkreis von 500 km ersetzt
  ein Mitglied, Band dann ±300 km) → uebrige wichtige Einzelstaedte →
  Fuellorte in gezeigten Distanzbaendern oder gleicher Richtung → zuletzt
  **Luecken**: bekannte Staedte (Bekanntheit ≥ `GAP_MIN_FAME` 2,0) dort, wo
  der naechste gezeigte Ort auf der Karte (Kartenebene, nicht Kugel) mindestens
  `GAP_KM` (750 km) entfernt ist; groesste und bekannteste Luecke zuerst
  (`GAP_W_FAME`), so lange es solche Luecken gibt (`MAX_GAP_FILL` nur als
  Sicherheitsgrenze). Ein Land darf dabei seine Grenze um `GAP_COUNTRY_EXTRA`
  ueberschreiten (Denver bei schon 6 US-Staedten).
* **Gleiche Richtung:** Azimut ±1,5°, bei zwei sehr bekannten Orten ±2,5°.
* `python3 labels.py <lat> <lon>` zeigt die Auswahl ohne Kollisionspruefung,
  `python3 quick_preview.py basemap/<name>` die Karte mit echter Platzierung in
  ca. 30 s (`preview/<name>_schnell.png`, Ringe vereinfacht).

## Rahmen und Poster (`frame.py`, `poster.py`)

Der Print ist **rund**, 80 cm Durchmesser (`POSTER_MM`) = Kantenlaenge der
Datei (4724 px, Vorgabe des Anbieters, also 150 dpi); die Ecken ausserhalb werden weggeschnitten. Um den Kartenkreis liegt ein
Ringband (27 mm, `BAND_MM`) ohne Aussenlinien, aussen davor 3 mm bis zur
Schnittkante (`EDGE_MM`). Eine feine Linie (`LINE_INSET_MM`) laeuft knapp
ausserhalb der Karte durch die Himmelsrichtungen und ist unter ihnen
ausgespart. Im Band steht der Name der Mittelpunktstadt entlang
des Bogens, unten aufrecht (oder oben), gegenueber kleiner die Ueberschrift,
die der Name vervollstaendigt ("Die Erde um" / "The Earth Around", `HEADLINE`
in `frame.py`, `--ueberschrift`). Die Schrift sitzt nicht mittig im Band,
sondern naeher an der Karte (`TEXT_POS_MM` 13,5 mm ab Kartenrand), aussen
bleibt mehr Luft. Links und rechts neben der unteren Zeile steht entlang des
Bogens eine zurueckhaltende Legende der Zeichen in Rahmenschrift und -farbe
(`LEGEND*`): links besonderer Ort und Berg, rechts Stadt und entfernteste
Grossstadt. Die Zeichen der Legende und das Kreuz am Namen zeichnet dieselbe
Funktion wie auf der Karte (`overlays.draw_symbol`), in derselben Groesse.
Unten mittig, aussen unter dem Namen, steht der Urhebervermerk
(`COPYRIGHT*`, 1,2 mm Rahmenmass = 2,4 mm auf dem 80-cm-Druck, 22,5 mm ab
Kartenrand, also gut 14 mm Abstand zur Schnittkante; `COPYRIGHT = ""` schaltet ihn ab).
Versalien schreiben das ß als grosses ẞ; Federo hat keines, daher
baut `make_federo_sz.py` es aus dem ß (Stamm ohne Unterlaenge, Boegen auf
Versalhoehe gezogen) in `fonts/Federo-Regular-SZ.ttf`. Ein Pluszeichen aussen am Stadtnamen fuer den Mittelpunkt ist abschaltbar
(`TITLE_CROSS`, derzeit aus). Die Himmelsrichtungen stehen im Band direkt am Kartenrand.

Die Datei hat direkt die Groesse des Print-on-Demand-Anbieters: 4724 px
(`POSTER_PX`), JPEG Qualitaet 95, ca. 8 MB. `poster.py` warnt ueber
150 MP oder 150 MB. Gewaehlt: **heller Rahmen**, **Federo** in gesperrten
Versalien (`TRACK_CAPS` 0,5), Name unten. Der Name wird als ganze Zeile gesetzt und auf
den Bogen abgebildet, damit auch verbundene Handschriften intakt bleiben.

`poster.py` schreibt die Beschriftung nicht auf die volle Karte, sondern
direkt in Druckgroesse (doppelt so fein gezeichnet, dann verkleinert) auf eine
verkleinerte Kopie von `base.tif` (`base_<px>.png`, einmalig ca. 20 s). Ein
Poster dauert so ca. 15 s - fuer Aenderungen an Labels, Rahmen und Legende
genuegt `poster.py`, `overlays.py` (`map.jpg` in 40 000 px, ca. 9 min) braucht
es dafuer nicht.

```
python3 poster.py basemap/<name>                  # poster_hell.jpg, 4724 px (ca. 15 s) - gewaehlte Fassung
python3 poster.py basemap/<name> --farbe dunkel   # dunkler Rahmen (nicht gewaehlt, nur zum Vergleich)
python3 poster.py basemap/<name> --px 9448        # mehr Pixel, falls ein Anbieter sie verlangt
python3 frame.py basemap/<name>                   # Vergleich aller Rahmenschriften (4000 px)
python3 frame.py basemap/<name> --effekte         # Vergleich Futura-Effekte und Art-deco-Schriften
```

Weitere Rahmenschriften zum Vergleich: die Kartenschriften, Josefin
Sans, Poiret One, Snell Roundhand, Apple Chancery, Bradley Hand, Zapfino,
Savoye LET, Great Vibes, Dancing Script, Caveat, Parisienne (Google Fonts in
`fonts/`); Effekte `gold`, `praegung`, `inline`, `schatten`, `sterne`
(`--effekt`).

## Entfernteste Grossstadt

Der eigentliche Antipode ist in dieser Projektion der ganze Randkreis und
laesst sich nicht als Punkt zeigen. Markiert wird stattdessen die bekannte
Stadt (> 100 000 Einwohner, `MIN_ZOOM` ≤ 5) mit der groessten
Grosskreisdistanz, mit Name und Distanz (Muenchen: Wellington statt Lower
Hutt). Liegt sie jenseits von `R_CUT` (nur bei kleinerem Radius), steht am
Rand ein Pfeil in ihre Richtung.

Quellen: Natural Earth Populated Places (gemeinfrei), neu laden mit

```
curl -L -o data/ne.zip https://naciscdn.org/naturalearth/10m/cultural/ne_10m_populated_places.zip && unzip -o data/ne.zip -d data/ne_populated_places && rm data/ne.zip
```

GeoNames `cities15000` (CC BY 4.0) in `data/` wird nur noch von
`projdefs.py far` benutzt; neu laden mit

```
curl -L -o data/c.zip https://download.geonames.org/export/dump/cities15000.zip && unzip -o data/c.zip -d data && rm data/c.zip
```

## Bathymetrie: Farbskala und Schummerung

Beides aus `ocean_map/spilhaus.qgz` uebernommen. Farbskala (Layer
`dem_2 copy`), linear zwischen den Stuetzstellen:

| Tiefe | Farbe |
|---|---|
| −6000 m (und tiefer) | `#04244a` |
| −3000 m | `#0f52a1` |
| −100 m | `#346fc5` |
| 0 m | `#6da6f8` |

Die obersten 100 m bekommen damit so viel Farbverlauf wie 2900 m Tiefsee –
Schelfe und Baenke heben sich deutlich ab.

Schummerung (Layer `dem_2`): Azimut 34°, Hoehe 65°, Z-Faktor 44, Helligkeit
+60, Gamma 1,4, Mischmodus Weiches Licht. Mit diesen Werten waere flaches
Gelaende reines Weiss und hellte alles stark auf; kalibriert an der Tiefsee in
`One Ocean.png` wird die Ebene mit 0,75 skaliert (`HS_SCALE`).

QGIS rechnet die Schummerung in **Ausgabeaufloesung**: Der One-Ocean-Export
(8000 px, Karte 108,8 von 150 mm) hatte ca. 5,8 km/px, Resampling naechster
Nachbar. Bei 950 m/px waere sie feinkoernig und mittelte sich beim
Herauszoomen weg. Deshalb wird das DEM vorher geglaettet (Gauss, 2,8 km,
`HS_SMOOTH_M`); 30 % feine Schummerung bleiben fuer Details (`HS_DETAIL`).
Im Flachwasser steigt der Z-Faktor bis auf das Sechsfache bei 0 m und laeuft
bis 1000 m Tiefe auf 44 aus (`HS_SHALLOW_*`) – so werden Ruecken, Baenke und
Rinnen auf den Schelfen sichtbar. Die Kachel-Layer in `ocean_map/bathymetry`
(Z 15, mehrere Lichtrichtungen) lagen dort unter der deckenden Farbskala und
waren in der Karte nicht sichtbar.

An Land wird ETOPO *surface* geschummert (unter Eis waere *bed* das Felsbett),
Z-Faktor 4, als Weiches Licht um neutral 0,5 – flaches Land bleibt, wie es ist
– plus ein leichter Multiplikationsanteil, weil Weiches Licht auf Eis und
Schnee kaum wirkt (`LAND_HS_*` in `render_map.py`).

Die Stadtbeschriftung ist doppelt so gross wie die Ringbeschriftung
(`CITY_SCALE`).

## Eis ueber Felsbett unter NN

ETOPO *bed* ist die Felsoberflaeche **unter** dem Eis. In weiten Teilen der
Antarktis und Groenlands liegt sie unter NN. Faerbt man nach `dem < 0` ein,
malt das mitten ins Inlandeis Meer. Loesung wie in `ocean_map`: Das
Satellitenbild wird auf die Landpolygone zugeschnitten und **ueber** die
Bathymetrie gelegt. In `ocean_map` war das `sat_img/clipped.tif` (Blue
Marble, per Cutline auf `ne_10m_land` geschnitten, Schwarz = transparent).
Hier sind zusaetzlich die Schelfeise enthalten, die in `ne_10m_land` fehlen.

## Seen

Die Seen (`ne_10m_lakes`) werden aus der Landmaske ausgeschnitten und wie das
Meer nach Tiefe eingefaerbt. ETOPO *bed* enthaelt fuer grosse Seen die
Bathymetrie, aber als absolute Hoehe (Baikal-Grund −1154 m, Spiegel +456 m).
Die Tiefe ist daher Wasserspiegel − bed. Den Wasserspiegel schaetzt
`postprocess.py` je See als 10-%-Quantil des Uferstreifens. Seen, fuer die
ETOPO keine Bathymetrie hat (flach auf Spiegelhoehe, z.B. Tanganjika), bekommen
Tiefe 0. Das Kaspische Meer ist in Natural Earth kein See und laeuft als Meer.

In `ocean_map` war das `bathymetry/dem_clipped_lakes.tif` (ETOPO auf die Seen
zugeschnitten) mit der Meeresfarbskala. Werte ueber NN bekamen dort alle die
hellste Farbe.

## QGIS

Reihenfolge von unten nach oben: `depth` als Pseudofarbe (Stuetzstellen oben,
aber positiv: 6000 / 3000 / 100 / 0) → `sat_land` →
`dem` als Schummerung (Mischmodus Weiches Licht) → `rings.tif` oder
`rings.gpkg` (Beschriftung „gekruemmt“ auf der Linie). Oder direkt `map.tif`.

`map.tif` und `rings.tif` bekommen Uebersichtsstufen (`gdaladdo -r average`).
Ohne sie lassen Viewer beim Herauszoomen einfach Pixel weg; duenne Linien und
Schrift wirken dann treppig, das Satellitenbild flimmert.

## Fallstricke

1. **ETOPO braucht `-s_srs EPSG:4326`.** Die Datei traegt ein COMPOUNDCRS
   („WGS 84 + EGM2008 height“); GDAL loest die Transformation daraus falsch
   auf und liefert eine Kachel, die flaechendeckend Tiefsee zeigt.
2. **Landmaske nicht mit `-r average` warpen.** Das erzeugt entlang der
   Datumsgrenze eine gepunktete Landlinie quer durch den Pazifik.
3. **Kein `-multi` bei gdalwarp.** Randblocks brauchen fast das ganze
   Quellraster als Fenster, mehrere Threads mit ETOPO fuehren zum Segfault.
4. **Loecher an den Polen.** gdalwarp schaetzt das Quellfenster eines
   Zielblocks aus dessen Rand; liegt ein Pol im Block, fehlen Laengengrade und
   es bleibt ein halbrundes Loch (bei 40 000 px ca. 120 km). `-wo SOURCE_EXTRA`
   hilft, waere fuer die ganze Karte aber sehr teuer – `fix_poles.py` warpt
   daher nur ein Fenster um jeden Pol neu.
