# Projektzusammenfassung

Stand: 2026-04-29

## Kurzbild

`standdeff-organizer` ist ein Tampermonkey-Userscript fuer `die-staemme.de`.
Es erweitert drei Hauptbereiche des Spiels:

- Forum: SD-Threads erkennen, markieren, anzeigen und bearbeiten
- Massen-UT: Pakete passend selektieren und Versand tracken
- Einstellungen: Skript-Settings, Gruppen, Vorlagen und bekannte Threads verwalten

Technisch ist das Projekt ein TypeScript-/jQuery-Skript mit webpack-Build. Der Code ist stark auf DOM-Manipulation gegen die bestehende Tribal-Wars-Oberflaeche ausgelegt.

## Struktur

- `src/index.ts`
  Routing nach URL-Kontext (`place`, `forum-view_thread`, `forum-new_thread`, `settings`)
- `src/ui/`
  Kontext-spezifische Controller fuer Massen-UT, Thread-Ansicht, Thread-Erstellung und Settings
- `src/ui/components/`
  Teilfunktionen fuer SD-Tabelle, Popups, Request-UI und Post-Layout
- `src/helpers/`
  Parsing, Datumsfunktionen, TW-Helfer, Logging und LocalStorage-Zugriff
- `src/types/`
  Typen fuer SD-Daten, Thread-Daten und LocalStorage
- `docs/`
  Bereits vorhandene Architektur- und Refactor-Notizen

## Wie das Projekt arbeitet

Das Skript erkennt zuerst den aktuellen Spielkontext und aktiviert genau einen UI-Controller. Die fachliche Mitte des Projekts ist die SD-Tabelle:

- SD-Posts werden aus dem Forum geparst
- Anfragen und bereits geschickte Pakete werden in eine Tabellen-Ansicht ueberfuehrt
- Der lokale Zustand liegt unter dem Key `standdeff-organizer` im Browser-LocalStorage
- Thread-Daten enthalten Metadaten, Request-Cache, Tabellenzustand und Versandstatus
- Massen-UT-Links werden aus der Tabelle erzeugt und mit Settings wie Gruppe, Sortierung und `sdTableId` angereichert

Das ist funktional sinnvoll, weil Forum, Request-UI und Massen-UT ueber denselben lokalen Zustand gekoppelt werden.

## Technischer Status

- `npm run build` laeuft erfolgreich und baut `dist/bundle.js`
- `npm test` schlaegt aktuell fehl, weil keine Projekt-Tests vorhanden sind
- Es gibt bereits brauchbare Projektdoku in `docs/architecture.md`, `docs/refactor-ideas.md` und `docs/ui-components.md`

## Auffaellige Punkte

- Der Code ist klar entlang der Benutzerablaeufe organisiert, aber stark jQuery- und Selektor-getrieben.
- `LocalStorageHelper` ist die zentrale Drehscheibe und uebernimmt bereits viel Verantwortung.
- Viele Datenpfade verwenden `any`, String-Konventionen oder implizite Sonderwerte wie `0`, `""`, `undefined` und teils `NaN`.
- Dev- und Produktiv-Artefakte sind nicht sauber getrennt:
  - `devUserscript.js` laedt von `http://localhost:9000/bundle.js`
  - `compiledScript.js` ist eingecheckt, aber offenbar ein Development-Bundle mit `eval`
  - `build2` in `package.json` nutzt `sed` und ist damit Unix-lastig
- Zwischen Doku und Code gibt es leichte Drift, z. B. beim Default von `preventDuplicateDestination` (README: `false`, Code: `true`)

## Verbesserungsmoeglichkeiten

1. Tests fuer Kernlogik nachziehen
   Besonders sinnvoll fuer Parsing, Tabellenberechnung und LocalStorage-Serialisierung. Genau dort sitzt der groesste fachliche Wert und das meiste Regression-Risiko.

2. Datumslogik bereinigen
   `convertEpochToDate()` in `src/helpers/helper-functions.ts` nutzt `toISOString()` und arbeitet damit in UTC. Fuer `datetime-local` fuehrt das sehr wahrscheinlich zu Zeitzonenverschiebungen.

3. Typenmodell vereinheitlichen
   `generalSettings` ist doppelt definiert (`src/types/types.ts` und `src/types/localStorageTypes.ts`) und nicht identisch. Dazu kommen `any`-Felder bei Datumswerten. Das ist fehleranfaellig und erschwert Refactors.

4. LocalStorage-Zugriffe robuster machen
   Mehrere Getter greifen direkt auf `threads[id]` zu, ohne fehlende Daten sauber abzufangen. Ein validierter Serializer/Deserializer waere stabiler als die aktuelle verteilte `Map <-> Array`-Umwandlung.

5. UI-Controller weiter zerlegen
   Dateien wie `src/ui/settings.ts`, `src/ui/new-thread.ts` und `src/ui/components/request-popup.ts` mischen Rendering, Event-Binding und Fachlogik. Kleinere Renderer/Services wuerden Lesbarkeit und Testbarkeit verbessern.

6. Fragile DOM-Kopplung reduzieren
   Viele Selektoren haengen an der exakten HTML-Struktur der Spielseite. Schon kleine DOM-Aenderungen im Spiel koennen das Skript brechen. Wiederkehrende Selektoren sollten zentralisiert und gezielt abgesichert werden.

7. Build-/Release-Pfad sauberer machen
   Der Repo-Zustand zeigt einen funktionierenden Dev-Build, aber keinen klaren produktiven Release-Flow. Sinnvoll waeren:
   - ein echtes Production-Bundle
   - ein reproduzierbarer Export fuer Tampermonkey
   - plattformunabhaengige Build-Skripte

8. Doku an den Ist-Stand angleichen
   README, Userscript-Metadaten und Defaults sollten direkt aus dem echten Codezustand ableitbar sein. Das reduziert Verwirrung fuer spaetere Aenderungen.
