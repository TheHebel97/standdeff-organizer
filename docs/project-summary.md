# Projektzusammenfassung

Stand: 2026-10-14, Update-Prüfstand 2.0.0-rc.2 für das bestehende Script Standdeff Tabelle.

Das TypeScript-/jQuery-Userscript organisiert Standdeff auf Die Stämme und Tribal Wars. Forum, Massen-UT, Truppenimport und Einstellungen teilen denselben lokal gespeicherten Zustand.

## Einstieg und Fachlogik

- `src/index.ts`: ein Controller pro gemeinsamem `PageContext`, anschließend offene Vorgänge und Einführung.
- `src/helpers/script-context.ts`: URL-Kontext einschließlich Post-Bearbeitung, unabhängiger Parameterreihenfolge und Forum-ID-Fallback.
- `src/helpers/table-domain.ts`: Parsing, stabile Anfrage-IDs, Post-Cache, Paketrechnung und BBCode-Formatierung.
- `src/helpers/table-dom.ts`: DOM-Adapter für den registrierten SD-Post.
- `src/helpers/date-helper.ts`: gültige lokale Datumswerte und Epoch-Sekunden, keine UTC-Verschiebung in Eingabefeldern.
- `src/helpers/local-storage-helper.ts`, Repository und Serializer: validierte Daten, Schema 2, journalisierte Änderungen und Map-Arrays.
- `src/helpers/pending-operation.ts`: persistente Vorbereitung und idempotente Erfolgsbestätigung für Versand/Post.

## Benutzeroberfläche

- SD Organizer: Spielstile in Beige/Braun, neutrale Felder und native Buttons.
- Erstellung: Paketzeilen, 1:1:1:0,05-Skalierung, Leeren eines befüllten Felds per Klick, Generator und Titelvalidierung.
- Import: 100/200 Dual, auf Bogenwelten zusätzlich Trial, eigene Mengen und Power getrennt einklappbar, Vorschau und vorhandene Auswahlfunktionen.
- Forum: zuverlässige Registrierung, Rollen getrennt, Anfrage- und Versandentwürfe bleiben bis zur Bestätigung erhalten.
- Einrichtung: neun Schritte, ausdrücklich als dritte Aktion neben Neuer Thread/Neue Umfrage im Forum gestartet; Fenster nur bei aktiver Einrichtung. Gruppen und Vorlagen werden direkt erkannt und beim Einrichten eindeutig neue Einträge übernommen. Kein Massen-UT-Einleseschritt. Randfenster im Reliquien-Stil mit gespeichertem Andocken; Spieleinstellungen nutzen native Tabellen, Checkboxen und Felder ohne Fensterrahmen, samt Infos. Die Einrichtung prüft den aktuellen Spielbestand und die Zuordnung, Ein Fragezeichen im Header zeigt alle passenden Infos während des Hoverns; gültige Settings werden dezent grün markiert. Der Einrichtungsbutton besitzt ein eingebettetes SVG-Symbol.

## Validierung und Auslieferung

- `npm test -- --runInBand`: Jest/jsdom-Regressionen für Fachlogik, Storage und DOM-Ablaeufe.
- `npm run build`: Development-Bundle nach `dist/bundle.js`.
- `npm run dev` / `npm start`: lokaler Server auf Port 9000 für den versionierten Dev-Loader.
- `npm run release`: lesbarer Production-Export nach `compiledScript.js`, aktualisierter `devUserscript.js` und Offline-Bundleprüfung; zentrale Version, deutsche Matches, MIT-Hinweis und offizielle ScriptAPI. Keine Minifizierung oder eval.
- [Auslieferungsregeln](auslieferung-und-einreichung.md), [Update-Forentabelle](forum-einreichung.txt) und [Changelog](../CHANGELOG.md): GitHub-Prüfstand, erneute Prüfung der Änderungen und spätere Spieler-Auslieferung durch das Stämme-Team. Ajax-Katalogabfragen sind als Prüf-/Ausnahmebedarf beschrieben.

Die DOM-Kopplung an das echte Spiel bleibt ein Wartungsrisiko. Der vollständige Versand-/Post-Durchlauf mit installiertem Production-Script ist noch als Browser-Abnahme offen. Details stehen im [Umsetzungsstand](implementation-log.md) und in den [Release-Notizen](release-notes-2.0.md).

Spätere Refactors betreffen kleinere Controller, ausgelagerte BBCode-Vorlagen und weitere Selektor-Fixtures. Defaults sind konsistent: automatische Massen-UT-Vorbereitung aus, doppeltes Schicken aus (`preventDuplicateDestination=true`), Einrichtung nur nach Aktivierung im Forum. Das frühere Registrierungs-Popup entfällt.
