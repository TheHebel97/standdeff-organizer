# Changelog

## 2.0.0-rc.2 – 2026-10-14

Update-Prüfstand für das bestehende Script **Standdeff Tabelle**; Oberflächenname **SD Organizer**. Die bisherige Freigabe gilt nicht automatisch für diese Änderungen.

### Bedienung und Einrichtung

- Geführte Einrichtung im Forum neben Neuer Thread/Neue Umfrage, ausdrücklich gestartet und über Seitenwechsel fortgesetzt.
- Gruppen und Truppen-Vorlagen direkt erkennen, neu angelegte SD-Einträge eindeutig zuordnen und im Assistenten auswählen. Weiter/Abschluss verlangen aktuelle Spielbestätigung, Zuordnung und eine gültige Schwert-Laufzeit.
- Zwei parallele, lesende Ajax-Abfragen der nativen Gruppen-/Vorlagenseiten; kein zusätzlicher Massen-UT-Einleseschritt. Diese neue Funktion ist ein ausdrücklich dokumentierter Prüf-/Ausnahmebedarf.
- Kompakte Randfenster mit gespeichertem links/rechts Andocken, Verschieben und Kollisionslayout.
- Native Settings mit dezenten Gültigkeitsmarkierungen und genau einem Header-Fragezeichen: alle passenden Erklärungen während des Hoverns, sofortiges Ausblenden beim Verlassen.
- Eigenes eingebettetes SVG-Symbol am Einrichtungsbutton, ohne externen Bildabruf.

### Auslieferung und Update-Einreichung

- Offiziellen Scriptnamen **Standdeff Tabelle** aus dem bestehenden Freigabethread übernommen. UI, Dateinamen und Persistenzkeys bleiben erhalten.
- Offizielle Zwei-Zeilen-ScriptAPI-Registrierung vor dem UI-Start; keine Umgehung oder Behandlung nativer Registrierungsfehler.
- Lesbares, nicht minifiziertes `compiledScript.js` mit vollständigem Header und MIT-Hinweis, ohne eval, Source-Maps oder lokalen Loader.
- Match-Regeln auf deutsche Spielwelten und benötigte Ansichten begrenzt; keine Ausführung in Frames.
- Offline-Prüfung des tatsächlichen Bundles: Syntax, Header/Lizenz, window/unsafeWindow sowie fehlende oder ablehnende ScriptAPI vor DOM-Änderungen.
- Deutscher Update-Forentext als Änderungstabelle ohne Initialisierungscode. Bestehende Hinweise zu Schmiede-Symbol, Erststart-Popup und Massen-UT-Einlesen werden ersetzt.
- GitHub als Prüfquelle; freigegebene Spieler-Auslieferung durch das Stämme-Team. Noch keine erneute Freigabe behauptet.

## 2.0.0-rc.1 – 2026-10-06

- Generator im Organizer, eigene Paketzeilen, gekoppelte Infanteriemengen und 5 % Späher; löschbarer Titelvorschlag bei leerem Threadtitel.
- Explizite Zuordnung bestehender SD-Threads und Reparatur alter Post-Anker ohne Entwurfsverlust.
- Dual-/Trial-Presets und getrennte Paket-/Power-Einstellungen im Bunker-Import.
- Robustere SD-Post-Auswertung, stabile Anfrage-IDs, `done`, erhaltene Datumswerte und Handy-Anführungszeichen.
- Schema 2, Sicherung beschädigter Daten und Änderungsjournal für parallele Tabs; idempotente Versandbestätigung und prüfbare offene Vorgänge.
- Versionierter Production-Export und einheitlicher Entwicklungsport 9000.

Der vollständige Versand-/Post-Durchlauf mit dem aktuellen Auslieferungsskript ist weiterhin als Abnahme offen; siehe [Umsetzungsstand](docs/implementation-log.md).
