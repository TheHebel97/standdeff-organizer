# Plan fuer das naechste grosse Update

Stand: 2026-10-06. Grundlage: Repo-Sichtung und abgeschlossene UI-Feedbackrunde.

Nachträgliche UX-Entscheidung (2026-10-06): Das separate Registrierungs-Popup entfällt. Stattdessen erklärt die Einführung den Button „Als SD-Tabelle festlegen“ im Organizer; die folgenden Popup-Punkte beschreiben den ursprünglichen Plan.

Ziel: Ein einheitlicher SD Organizer mit einfacherer Paketkonfiguration, verlaesslicher Thread-Registrierung, korrektem Pakettracking und einer kurzen Einfuehrung in die wichtigsten Ablaeufe.

Dies ist der ursprüngliche Umsetzungsplan. Die Codeänderungen sind inzwischen implementiert; aktueller Prüfstand und verbleibende Browser-Abnahme stehen in [implementation-log.md](implementation-log.md). Befunde und Reproduktionsbeispiele stehen in [review-2026-10-05.md](review-2026-10-05.md).

## Prioritaeten und Reihenfolge

| Reihenfolge | Arbeitspaket | Ergebnis | Prioritaet |
| --- | --- | --- | --- |
| 1 | Thread-Registrierung und Popup | Neue und bestehende SD-Threads lassen sich zuverlaessig speichern | P0 |
| 2 | Tabellenlogik, Versandstatus und Persistenz | Keine falschen Zuordnungen, Doppelzaehlungen oder verlorenen Entwuerfe | P0 |
| 3 | Datum, Parser und Eingabevalidierung | Mengen und Zeitfenster bleiben korrekt | P0 |
| 4 | Gemeinsames Organizer-UI und Thread-Erstellung | Einheitliches Design und automatische Paket-Skalierung | P1 |
| 5 | Bunkerimport mit Dual-/Trial-Vorschlaegen | Standardpakete sind mit einem Klick konfiguriert | P1 |
| 6 | Kontextbezogenes Onboarding | Nutzer verstehen Einrichtung und Arbeitsablaeufe | P1 |
| 7 | Release-Export, Doku und Gesamtpruefung | Reproduzierbares, getestetes Userscript-Update | P0 fuer Auslieferung |

Regressionstests fuer die Kernlogik entstehen in den jeweiligen Arbeitspaketen. Die gemeinsame UI-Gestaltung beginnt vor der Umsetzung der beiden Organizer-Kontexte; das Onboarding folgt erst auf deren fertige Bedienelemente.

## 1. Thread-Registrierung und Popup reparieren

Betroffen: `script-context.ts`, `helper-functions.ts`, `view-thread.ts`, `thread-guards.ts`, `first-start-thread-popup.ts`, `options-sd-thread.ts` und `new-thread.ts`.

- Forum-ID zentral aufloesen: URL-Parameter bevorzugen, bei fehlendem Parameter den Link des ausgewaehlten Forums auslesen. Keine beliebige andere Forum-ID von der Seite uebernehmen.
- Numerischen Post-Anker der SD-Tabelle bestimmen; Sonderanker wie `last` ausschliessen. Bei manueller Registrierung den passenden Tabellenpost erkennen, statt ungeprueft irgendeinen ersten Beitrag zu speichern.
- Registrierung gibt einen eindeutigen Erfolgs-/Fehlerstatus zurueck. Erfolg bedeutet auch, dass der Storage-Schreibvorgang erfolgreich war. Bereits registrierte Threads sinnvoll als bestehenden Erfolg behandeln.
- Erst nach erfolgreichem Speichern Markierung, Buttons und Popup aktualisieren. Bei Fehlern eine sichtbare Rueckmeldung mit konkreter Ursache anzeigen.
- Nach automatischer oder manueller Registrierung Thread-Daten neu lesen und die SD-Ansicht sofort initialisieren. Den vor der Registrierung berechneten Snapshot nicht weiterverwenden.
- Den Marker fuer einen neuen SD-Thread erst nach erfolgreicher Zuordnung abschliessen und an den Erstellungsvorgang binden, damit ein anderer geoeffneter Thread nicht versehentlich registriert wird.
- Das gemeldete Haengenbleiben des Popups gezielt reproduzieren und beheben. Die fehlende Forum-ID erklaert den Speicherabbruch, aber allein noch nicht das offen bleibende Popup.

**Abnahme:** Ein neu generierter Thread ist beim ersten Aufruf registriert, auch ohne `forum_id` in der URL. Erfolgreiche manuelle Registrierung schliesst das Popup und aktiviert die SD-Funktionen ohne Reload. Ein fehlgeschlagener Speichervorgang erzeugt keine falsche Erfolgsmeldung.

## 2. Tabellenlogik, Versandstatus und Persistenz absichern

Betroffen: Tabellen-Domain/DOM, `mass-ut.ts`, `post-layout.ts`, Storage-Helper/Repository/Serializer und beide Typwelten.

- `done` in allen Rechenpfaden einheitlich behandeln. Bei aktivem Doppelversandschutz keine erneute Vorauswahl fuer erledigte Anfragen. Eine spaetere numerische Meldung darf `done` nicht wieder aufheben.
- Anfrage-Identitaeten stabil halten: Beim Entfernen erledigter Zeilen keine IDs anderer Anfragen umnummerieren oder alte IDs fuer neue Anfragen wiederverwenden. Forum-Meldungen und lokaler Versandstatus muessen dieselbe Anfrage meinen. Die Vergabe neuer IDs und der Uebergang fuer bestehende Tabellen werden gemeinsam festgelegt.
- Vorhandene Versanddaten anhand des gespeicherten Tabellenstands migrieren. Mehrdeutige Altdaten nicht still einem anderen Dorf zuordnen; einen erkennbaren Klaerungsstatus anbieten.
- Bisherige Post-Cache-IDs erhalten und neue IDs ergaenzen. Tabellenupdates ueber mehrere Forenseiten duerfen bereits eingelesene Meldungen nicht erneut zaehlen.
- Versand und Forenpost als Vorgang behandeln: vorbereiten, absenden, Erfolg bestaetigen. Erst nach einem verlaesslichen Erfolgssignal Pakete als verschickt buchen bzw. Anfrage-/Bearbeitungsentwuerfe leeren. Geeignetes Erfolgssignal auf der echten Spielseite zuerst pruefen; ein Buttonklick reicht nicht.
- Bei Abbruch, Fehler oder unklarer Antwort Daten erhalten und den Status sichtbar machen. Wiederholte Klicks oder Reloads duerfen denselben Vorgang nicht doppelt buchen.
- Massen-UT setzt explizite Checkbox-Sollzustaende statt unkontrollierter Klick-Toggles. Vorlage, verfuegbare Truppen, Teilversand und Zeitfenster zusammen beruecksichtigen.
- Keine kompletten alten Thread-Snapshots beim spaeteren Senden zurueckschreiben. Aenderungen auf den betroffenen Datenbereich begrenzen und fuer gleichzeitige Tabs eine Konfliktstrategie einfuehren. Ein blosses Nachladen vor `setItem` ist noch keine Garantie gegen gleichzeitige Schreibvorgaenge.
- Storage mit Schema-Version, validierten Thread-Feldern und Migration erweitern. Beschaedigte Daten vor einer Wiederherstellung sichern; fehlgeschlagene Persistenz an die UI weiterreichen.
- `generalSettings` und Datums-/Status-Typen vereinheitlichen. Schemaaenderungen in `src/types/types.ts` und `src/types/localStorageTypes.ts` gemeinsam umsetzen; Maps und Array-Serialisierung vollstaendig mitpruefen.

**Abnahme:** Entfernen von Dorf A veraendert weder Identitaet noch Versandstatus von Dorf B. `done` bleibt in Ansicht und Post-Update konsistent. Zwei Tabs verlieren keine unabhaengigen Aenderungen. Fehlgeschlagene Posts/Versandversuche behalten Entwuerfe. Wiederholtes Einlesen ist idempotent.

## 3. Datumslogik, Parsing und Validierung korrigieren

Betroffen: `helper-functions.ts`, `table-domain.ts`, `table-dom.ts`, `request-popup.ts` und Massen-UT-Zeitfenster.

- Ein internes Datumsformat festlegen und Konvertierung zu deutschem Forenformat sowie lokalem `datetime-local` zentralisieren. Bestehende numerische und deutsche Datumswerte beim Laden normalisieren.
- UTC-Ausgabe nicht als lokale Eingabe wiederverwenden. Sommer-/Winterzeit, ungueltige Werte und leere Felder korrekt behandeln; Feldanzeige und gespeicherter Wert duerfen nicht auseinanderlaufen.
- Paketmeldungen nur als bewusst unterstuetzte Statuszeilen lesen. Historische Kurzformate gegen bestehende Doku pruefen und deren Kompatibilitaet ausdruecklich definieren; normaler Fliesstext mit Zahlen ist keine Meldung.
- Manuell geschriebene Bunkeranfragen auch mit typografischen Handy-Anfuehrungszeichen akzeptieren: gerade `"` sowie `“`, `”` und `„`, einschliesslich ueblicher Apple-Smart-Quotes und gemischter Schreibweisen. Die erlaubten Zeichen an den Feldtrennern normalisieren; die bestehende Anfrage-Syntax und optionale/leere Felder beibehalten. Nicht pauschal alle Anfuehrungszeichen aus Namen oder Bemerkungen entfernen. In der Anleitung Beispiele fuer manuelle Handy-Anfragen ergaenzen.
- Unbekannte Dorfkoordinaten nicht unter einem gemeinsamen Map-Key 0 zusammenfassen. Aufloesen oder mit einer sichtbaren Validierungsrueckmeldung aus dem Update ausschliessen.
- Paketmengen und Truppenzahlen auf gueltige ganze Werte pruefen. Negative Werte, Bruchteile und nicht endliche Werte abweisen; leere optionale Felder weiterhin erlauben.
- Nutzereingaben und aus der Seite gelesene Namen als Text/Feldwert rendern, statt sie ungeprueft in HTML einzusetzen.
- Tabellenoperationen auf den registrierten SD-Post begrenzen. Rollenpruefung gezielt absichern; Mod-Funktionen und normale Nutzerfunktionen getrennt halten.

**Abnahme:** Lokal eingegebene 12:00 bleiben nach Speichern und erneutem Oeffnen 12:00. Parser/Formatter erhalten Zeitfenster. Bunkeranfragen mit geraden, Apple-/typografischen oder gemischten Anfuehrungszeichen ergeben dieselben Feldwerte, auch bei leeren optionalen Feldern. Normaler Zahlentext veraendert keine Tabelle. Andere Tabellen im Thread bleiben von SD-Operationen unberuehrt.

## 4. Einheitlicher SD Organizer und Thread-Erstellung

Betroffen: `forum-quick-settings.ts`, `sd-settings-controls.ts`, `new-thread.ts`, eigene UI-Assets/Stile und die anderen Skript-Oberflaechen.

### Panel und Design

- `SD Quick Settings` und `SD Bunker Import` heissen kuenftig `SD Organizer`.
- Gemeinsame Panel- und Formularstile verwenden: beige/braune Flaechen, Spielrahmen, vorhandene Spiel-Buttons und neutrale Eingabefelder.
- Rot, Gruen und weitere Akzentfarben sparsam und konsistent fuer relevante Aktionen, Warnungen und Status einsetzen. Einstellungen nicht allein ueber Farbe erklaeren.
- Deutsche, verstaendliche Beschriftungen, Einheitennamen/-icons und benannte Icon-Buttons verwenden. Tastaturbedienung und sichtbaren Fokus beibehalten.
- Panel-Inhalt nach Seitenkontext aufbauen: Thread-Erstellung, Forum-/Versandoptionen oder Bunkerimport. Gemeinsame Struktur, aber keine unpassenden Aktionen auf jeder Seite.
- Bestehende verschiebbare Panels und gespeicherte Positionen beruecksichtigen. Das im Screenshot abgeschnittene Panel war durch den Chat verursacht und ist kein bestaetigter Skriptfehler.

### Thread-Generator

- Paketkonfiguration, weitere Paketzeilen und `SD Tabelle generieren` in das Organizer-Panel verschieben.
- Die separate Einstellungsanzeige bzw. der Generator-Schalter neben der Thread-Ueberschrift entfaellt.
- Eingaben in Speer, Schwert oder Bogen skalieren dieselbe Paketzeile im Verhaeltnis `1 : 1 : 1 : 0,05` fuer Speer/Schwert/Bogen/Spaeher. Auf Welten ohne Bogen gibt es kein Bogenfeld.
- Beispiel: `200` in einem Infanteriefeld setzt `200 / 200 / 200 / 10`. Mehrere Paketzeilen beeinflussen sich nicht gegenseitig.
- Ein erneuter Klick auf ein befuelltes Truppenfeld leert das angeklickte Feld. Erst eine neue gueltige Eingabe loest die Skalierung aus; das Leeren alleine setzt nicht alle anderen Mengen auf 0.
- Titelvalidierung am Eingabe-/Absendeablauf statt nur bei Maus-Hover durchfuehren. Ein Tastatur-Submit muss dieselben Regeln einhalten.

**Vorgeschlagene Detaildefaults:** Nicht ganzzahlige Spaehermengen auf die naechste ganze Zahl runden. Direkte Spaeher-Eingabe aendert nur Spaeher, ohne Rueckwaertsskalierung der Infanterie. Diese beiden Details waren nicht ausdruecklich festgelegt und sind als Umsetzungsvorschlag markiert.

**Abnahme:** Erstellen wird vollstaendig ueber das Organizer-Panel bedient; keine doppelte Konfiguration. Die 100er-/200er-Beispiele und das Leeren per Klick funktionieren mit und ohne Bogen sowie bei mehreren Paketzeilen.

## 5. Bunkerimport vereinfachen

Betroffen: `away-detail.ts`, `bunker-import-settings.ts` und gemeinsame Organizer-Stile.

Oben im Panel stehen folgende Vorschlagsbuttons:

| Button | Speer | Schwert | Bogen | Verfuegbarkeit |
| --- | --- | --- | --- | --- |
| 100 Dual | 100 | 100 | 0 | Alle Welten |
| 200 Dual | 200 | 200 | 0 | Alle Welten |
| 100 Trial | 100 | 100 | 100 | Nur Bogenwelten |
| 200 Trial | 200 | 200 | 200 | Nur Bogenwelten |

- Ein Vorschlag setzt die gesamte Split-Zusammensetzung; andere Split-Anteile sind 0. Die Import-Vorschlaege enthalten die genannten Einheiten. Die Spaeherregel der Thread-Erstellung ist davon getrennt.
- Aktive Paketwahl sichtbar anzeigen. Berechnung und Vorschau nach der Auswahl sofort aktualisieren.
- Manuelle Split-Mengen in einen standardmaessig eingeklappten Bereich `Eigene Paketgroesse` verschieben. Manuelle Abweichungen als eigene Konfiguration kennzeichnen und speichern.
- Power-Gewichtungen als getrennte erweiterte Berechnungseinstellungen anbieten. Eine Paketwahl veraendert nicht ungefragt die gespeicherten Gewichtungen.
- Hauptablauf: Paket waehlen, Ziel-Thread waehlen, Vorschau/Koordinaten markieren, uebernehmen. Anzahl der ausgewaehlten Anfragen und Ergebnis klar zeigen.
- Sichtbar machen, welche aktuell angezeigten/gefilterten Truppen in die Berechnung eingehen. Pagination nicht als vollstaendigen Import ausgeben.
- Vorhandene Auswahl- und Unter-5-Funktionen erhalten. Die Unter-5-Aktion veraendert derzeit auch bestehende Anfragen derselben Koordinaten im Ziel-Thread; Umfang und Auswirkung deutlich benennen. Dieses Verhalten wurde noch nicht als Aenderungswunsch neu festgelegt.

**Abnahme:** Dual setzt auch auf Bogenwelten den Bogenanteil auf 0. Trial erscheint nur bei verfuegbaren Bogenschuetzen. Eigene Mengen bleiben moeglich. Vorschau, ausgewaehlte Mengen und gespeicherter Anfrage-Entwurf stimmen ueberein.

## 6. Onboarding integrieren

Neue, kleine Onboarding-Komponente mit lokal gespeichertem Fortschritt; Integration in die fertigen Organizer-Kontexte.

- Kurzer Einstieg zum Skript und zur SD-Thread-Zuordnung, danach seitenbezogene Touren mit Hinweisen direkt an den betreffenden Bedienelementen.
- **Mods:** Paket definieren, Tabelle generieren, Thread erstellen/registrieren und spaeter Meldungen in die SD-Tabelle uebernehmen.
- **Bunkerimport:** Dual/Trial oder eigene Groesse, Ziel-Thread, Vorschau/Auswahl und Uebernahme. Deutlich sagen, dass Uebernehmen einen Entwurf erstellt und keinen Forenpost sendet.
- **Anfragen:** Koordinaten/Mengen, optionale Zeitfenster, Beitrag einfuellen und absenden.
- **Massen-UT:** Gruppen/Vorlagen einlesen und einstellen, Auswahl pruefen, Uebernehmen, Senden und anschliessend Bearbeitung im Forum eintragen.
- Nur Schritte zeigen, die zur aktuellen Seite und Rolle passen. Fehlende Voraussetzungen mit einem konkreten naechsten Schritt erklaeren; fehlende DOM-Ziele duerfen die Seite nicht blockieren.
- `Weiter`, `Zurueck`, Ueberspringen/spaeter fortsetzen und Neustart ueber `Einfuehrung starten` im Organizer.
- Fortschritt und Onboarding-Version speichern. Keine Wiederholung bei jedem Laden; spaetere Update-Hinweise auf neue Funktionen begrenzen.
- Touren erklaeren Aktionen; sie senden keine Posts oder Truppen automatisch. Das bestehende Registrierungs-Popup und die Einfuehrung sollen sich nicht gegenseitig ueberlagern.

**Abnahme:** Frische Nutzer werden durch einen kompletten relevanten Ablauf gefuehrt. Bestandsnutzer koennen die Tour starten oder ueberspringen. Neustart und Fortsetzen funktionieren; Mod-Schritte fehlen bei normalen Nutzern.

## 7. Build, Doku und Auslieferung

- Port von Dev-Loader und Entwicklungsserver angleichen; dokumentierte npm-Befehle muessen existieren und unter Windows funktionieren.
- Reproduzierbaren Production-Export ohne Development-`eval` bereitstellen, inklusive Userscript-Metadaten, konsistenter Versionsnummer und klarer Ausgabe fuer `compiledScript.js`.
- `devUserscript.js` und `compiledScript.js` behalten und ihre jeweilige Verwendung dokumentieren. Bestehenden Abgabeweg fuer Die Staemme beruecksichtigen.
- Match-Regeln zwischen Loader und Auslieferung angleichen; alternative URL-Parameterreihenfolgen, neue Links, Sitter-Kontext und unterstuetzte Welt-Domains pruefen.
- README, Architektur-, UI- und Projektzusammenfassung an Code und Defaults angleichen. Bereits umgesetzte Refactor-Vorschlaege als erledigt kennzeichnen. Release-Notizen mit Funktionen, Fehlerkorrekturen und Migration schreiben.
- Refactors auf die benoetigten Bereiche begrenzen: vorhandenen PageContext, Domain-/DOM-Trennung und Repository/Serializer weiterverwenden. Keine pauschale Neuimplementierung des Skripts.

## Pruefungen vor dem Release

Automatisierte Regressionstests nutzen die vorhandene Jest-Toolchain fuer Kernlogik und passende DOM-Fixtures. Reine Stilaenderungen werden visuell geprueft.

| Bereich | Erforderliche Szenarien |
| --- | --- |
| Registrierung | URL mit/ohne Forum-ID, automatischer neuer Thread, manuelle Zuordnung, bestehender Thread, fehlender Post, Speicherfehler, Popup-Abschluss |
| Tabellenstatus | `done` vor/nach Zahlenmeldung, geloeschte Zeile, neue Anfrage, stabile Identitaeten, mehrfaches Update, paginierter Post-Cache |
| Persistenz | Map-Rundlauf, Altdatenmigration, unvollstaendiger Datensatz, Schreibfehler, zwei Tabs und konkurrierende Versandvorgaenge |
| Datum/Parser | Lokaler Rundlauf im Sommer/Winter, Zeitumstellung, leere/ungueltige Werte, deutsche Datumsstrings, gerade/typografische/gemischte Anfuehrungszeichen bei manuellen Handy-Anfragen, leere optionale Anfragefelder, normaler Zahlentext, unbekannte Koordinaten |
| Generator | 100/200-Skalierung in jedem Infanteriefeld, Klick leert Feld, Spaeherdefault, mehrere Paketzeilen, Titelvalidierung |
| Import | Alle Dual-/Trial-Vorschlaege, Welt ohne Bogen, eigene Groesse, Gewichtungen, Auswahl, bestehende Anfragen, Unter-5-Aktion, Filter/Pagination |
| Massen-UT/Forum | Mod und normaler Nutzer, Vorlage/Gruppe, vorhandene Checkboxen, Truppenmangel, Teilversand, Zeitfenster/Speedboost, Erfolg/Fehler/Abbruch, Eintragen der Bearbeitung |
| Onboarding/UI | Erststart/Bestandsnutzer, Neustart/Fortsetzen/Ueberspringen, Rollen, fehlende Bedienelemente, Tastatur, lesbare Status, Panelpositionen |
| Auslieferung | Build und Tests erfolgreich, Userscript aus Release-Artefakt installiert, relevante Seiten und URL-Varianten im echten Browser geprueft |

Release erst nach erfolgreichem Build, bestandenen Regressionstests und einem vollstaendigen Browserdurchlauf mit dem gebauten Userscript. Vorhandene lokale Aenderungen am Import und an der Doku in die Umsetzung integrieren und erhalten.

## Noch fachlich zu pruefen

Diese Punkte verhindern den Start nicht; vor der jeweiligen Umsetzung bzw. Abnahme werden sie konkret entschieden:

- Vorgeschlagene Spaeher-Rundung und direkte Spaeher-Eingabe im Generator.
- Sicheres Erfolgssignal fuer Versand und Forenpost sowie Verhalten bei unklarer Rueckmeldung.
- Migration historischer Anfrage-IDs und Versandstatus ohne falsche Zuordnung.
- Historische Statussyntax und Verhalten bei Teilversand/Doppelversandschutz.
- Auswirkungen der vorhandenen Unter-5-Aktion auf manuell angelegte Anfrage-Entwuerfe.

Nach Abschluss dieser Arbeitspakete sind alle gesammelten UI-Wuensche, das Onboarding, die bestaetigten Kernfehler und die benoetigte Release-Absicherung abgedeckt.
