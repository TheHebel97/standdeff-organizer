# Projektzusammenfassung

Stand: 2026-10-06, Testkandidat 2.0.0-rc.1.

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
- Einführung: pro Kontext und Rolle, pausierbar, überspringbar und neu startbar.

## Validierung und Auslieferung

- `npm test -- --runInBand`: Jest/jsdom-Regressionen für Fachlogik, Storage und DOM-Ablaeufe.
- `npm run build`: Development-Bundle nach `dist/bundle.js`.
- `npm run dev` / `npm start`: lokaler Server auf Port 9000 für den versionierten Dev-Loader.
- `npm run release`: Production-Export nach `compiledScript.js` und aktualisierter `devUserscript.js`, zentrale Version und Matches; kein Development-eval im Production-Script.

Die DOM-Kopplung an das echte Spiel bleibt ein Wartungsrisiko. Der vollständige Versand-/Post-Durchlauf mit installiertem Production-Script ist noch als Browser-Abnahme offen. Details stehen im [Umsetzungsstand](implementation-log.md) und in den [Release-Notizen](release-notes-2.0.md).

Spätere Refactors betreffen kleinere Controller, ausgelagerte BBCode-Vorlagen und weitere Selektor-Fixtures. Defaults sind konsistent: Massen-UT-Hilfe aus, doppeltes Schicken aus (`preventDuplicateDestination=true`), Registrierungs-Popup an.
