# AGENTS.md

## Projektueberblick

Dieses Repository enthaelt ein Tampermonkey-Userscript fuer `die-staemme.de` / Tribal Wars, das die Organisation von Standdeff unterstuetzt.

Die wichtigsten Funktionsbereiche sind:

- SD-Threads im Forum erkennen, markieren und verwalten
- SD-Tabellen aus Forenposts lesen und fortschreiben
- Massen-UT mit passenden Paketen, Gruppen und Vorlagen vorbereiten
- Einstellungen und threadbezogene Daten lokal im Browser speichern

Technisch ist das Projekt ein TypeScript-/jQuery-Skript, das ueber webpack zu JavaScript gebuendelt wird.

## Einstiegspunkte

- `src/index.ts`
  Erkennt den aktuellen URL-Kontext und aktiviert genau einen Controller.
- `src/ui/mass-ut.ts`
  Logik fuer `screen=place` / Massen-UT.
- `src/ui/view-thread.ts`
  Logik fuer `forum-view_thread`.
- `src/ui/new-thread.ts`
  Logik fuer `forum-new_thread`.
- `src/ui/settings.ts`
  Skript-Settings im Spiel.

## Wichtige Architekturpunkte

- Zentrale Persistenz: `src/helpers/local-storage-helper.ts`
  - LocalStorage-Key: `standdeff-organizer`
  - Hält allgemeine Settings, bekannte Threads, Tabellenzustand und Versandstatus
- Zentrale Fachlogik: `src/helpers/table-helper.ts`
  - Parsing von SD-Posts
  - Berechnung / Darstellung des Tabellenzustands
  - Anpassung von Massen-UT-Links
- Die UI ist stark an die echte DOM-Struktur von Tribal Wars gekoppelt.
  - Selektoren sind fragil
  - Kleine HTML-Aenderungen im Spiel koennen das Skript brechen

## Repo-spezifische Entscheidungen

- `devUserscript.js` ist absichtlich versioniert.
  - Hintergrund: Bei Die Staemme wird offiziell ein JavaScript-File abgegeben.
  - Nicht als ueberfluessiges Dev-Artefakt behandeln oder ungefragt entfernen.
- `compiledScript.js` ist ebenfalls ein relevantes JS-Artefakt fuer die Userscript-Auslieferung.
  - Vor dem Entfernen, Umbenennen oder Umstellen des Flows erst pruefen, wie die Abgabe / Nutzung konkret erfolgt.
- `docs/project-summary.md` enthaelt eine kompakte Projektsicht und die bisher identifizierten Verbesserungspunkte.

## Arbeitsregeln fuer kuenftige Aenderungen

- Aendere DOM-Selektoren moeglichst minimal und pruefe den betroffenen Spielkontext mit.
- Wenn du Parsing, Tabellenlogik oder Pakettracking anfasst, beachte immer beide Seiten:
  - Forum / SD-Tabelle
  - Massen-UT / Versandstatus
- Halte das Verhalten fuer Forum-Mods und normale Nutzer getrennt; das ist ein Kernbestandteil des Skripts.
- Wenn du die Storage-Struktur anfasst, update beide Typwelten:
  - `src/types/types.ts`
  - `src/types/localStorageTypes.ts`
- Wenn du Defaults oder Nutzerverhalten aenderst, gleiche README und Doku mit ab.

## Bekannte technische Stolperstellen

- Es gibt aktuell keine echten Projekttests.
  - `npm test` endet derzeit mit "No tests found".
- Das Skript laeuft real nur ueber Tampermonkey auf der echten Seite.
  - Lokales Validieren ist deshalb praktisch auf zwei Dinge begrenzt:
  - `npm run build` prueft, ob der TypeScript-Code sauber nach JavaScript kompiliert.
  - Verhaltensvalidierung passiert im Browser ueber `devUserscript.js` / Tampermonkey.
- `npm run build` funktioniert und baut `dist/bundle.js`.
- Datumslogik ist sensibel:
  - Es gibt Umwandlungen zwischen deutschem Datumsstring, Epoch-Sekunden und `datetime-local`.
  - Auf Zeitzonen- und UTC-/Lokalzeit-Verhalten achten.
- `LocalStorageHelper` serialisiert `Map`-Strukturen manuell zu Arrays und zurueck.
  - Bei Schemaaenderungen diese Pfade vollstaendig mitdenken.
- `package.json` enthaelt mit `build2` ein Unix-lastiges Skript via `sed`.
  - Unter Windows nicht blind als portable Build-Variante annehmen.

## Nuetzliche Befehle

- `npm run build`
  - Baut das TypeScript-Bundle nach `dist/bundle.js`
- `npm test`
  - Derzeit kein echter Testlauf, da keine Tests vorhanden sind

## Doku-Hinweise

- Vor groesseren Umbauten zuerst diese Dateien lesen:
  - `docs/project-summary.md`
  - `docs/architecture.md`
  - `docs/refactor-ideas.md`
  - `docs/ui-components.md`
- Teile der vorhandenen Doku enthalten Zeichenkodierungsartefakte. Beim Bearbeiten keine ungewollten Encoding-Aenderungen einbringen.

## Gemerkte Refactoring-Schwerpunkte

- Kontextaufloesung weiter zentralisieren:
  - Controller sollen mittelfristig ein gemeinsames `PageContext` bekommen statt selbst erneut `URLSearchParams` zu lesen.
- Programmfluss pro Seite in feste Phasen zerlegen:
  - `resolveContext -> readPageState -> deriveState -> render -> bindEvents`
- Fachlogik und DOM-Adapter staerker trennen:
  - Besonders bei SD-Tabellen-Parsing, Tabellenberechnung und Massen-UT-Link-Anpassung.
- `LocalStorageHelper` spaeter in Repository- und Serializer-Verantwortung aufteilen.
- Wiederholte Guards wie Mod-Check, Thread-Registrierung und Edit-Mode in kleine Hilfsfunktionen auslagern.
