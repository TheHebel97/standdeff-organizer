# Standdeff-Organizer Architekturüberblick

## Zweck des Repos
Das Projekt liefert ein Tampermonkey-Userscript, das an mehreren Stellen von *Die Stämme* (Massen-Unterstützen, Forum, Spieleinstellungen) zusätzliche UI- und Automatisierungsfunktionen anbietet. Der produktive Userscript-Code wird aus den TypeScript-Quellen unter `src/` kompiliert (siehe `devUserscript.js`).

## Einstiegspunkt & Kontexte
Der Einstiegspunkt `src/index.ts` registriert ein `$(document).ready`-Callback und ermittelt anhand der URL-Parameter den aktuellen Seitenkontext. Anschließend wird genau eine der vier UI-Routinen geladen:

| Kontext (screen) | Einstiegsfunktion | Beschreibung |
| --- | --- | --- |
| `place` | `displayMassUt` (`src/ui/mass-ut.ts`) | Automatisiert Checkboxen im Massen-UT-Formular, setzt Filter/Gruppe/Vorlage und protokolliert verschickte Pakete pro SD-Thread. |
| `forum-view_thread` | `viewThread` (`src/ui/view-thread.ts`) | Erkennt SD-Threads, ergänzt Buttons/Popups zum Registrieren neuer Threads und zeigt bei bekannten Threads die SD-Tabelle (`sdTable`) an. |
| `forum-new_thread` | `createNewTable` (`src/ui/new-thread.ts`) | Stellt Eingabemasken für Paket-Vorlagen bereit und generiert beim Absenden den initialen Thread-Text inkl. SD-Tabelle und Spoiler-Erklärungen. |
| `settings` | `displaySettings` (`src/ui/settings.ts`) | Rendert eine Konfigurations-Tabelle in den Spieleinstellungen, inkl. toggles, Dropdowns für Gruppen/Vorlagen und einer Liste aller bekannten SD-Threads. |

> **Hinweis:** Jede dieser Funktionen kapselt den kompletten jQuery-Manipulationscode für ihren Kontext. Dadurch lässt sich das Script gezielt auf den Seiten aktivieren, auf denen Tampermonkey es injiziert.

## Persistenz & Datenmodell
Alle nutzerbezogenen Informationen (allgemeine Settings, bekannte Threads, Thread-spezifische Cache-Daten) werden über die Singleton-Klasse `LocalStorageHelper` verwaltet (`src/helpers/local-storage-helper.ts`).

- Beim Instanziieren wird der Schlüssel `standdeff-organizer` aus dem LocalStorage geladen oder mit Default-Werten initialisiert.
- Getter/Setter aktualisieren vor jedem Zugriff den lokalen Cache (`updateFromLocalStorage`) und serialisieren Maps zu Arrays, um sie persistieren zu können.
- Thread-Daten bestehen aus Metadaten (`threadName`, `forumId`, `sdPostId`), einem Post-Cache für Bunkeranfragen sowie zwei Maps: `stateOfSdTable` (Stand der Tabellenzeilen, key = Dorf-ID) und `packagesSent` (gesendete Paketanzahl pro interner SD-ID).

## Helfer & Komponenten
- **Helper** (`src/helpers/`):
  - `helper-functions.ts`: Utility-Funktionen rund um Thread-Erkennung, Parsing und DOM-Aktionen.
  - `table-helper.ts`: Parsen von Posts/Tabelle zu Maps, Rendering der SD-Tabelle und Anwenden von Settings auf Massen-UT-Links.
  - `tw-helper.ts`: Browser-spezifische Checks (z. B. ob der aktuelle Nutzer Forum-Mod ist) sowie Zugriff auf globale `game_data`.
  - `logging-helper.ts`: Wrapper rund um `console` mit Level-Methoden.
- **UI-Komponenten** (`src/ui/components/`): Teilroutinen, die innerhalb von `viewThread` eingebunden werden, z. B. Popups, Request-Formulare oder die Visualisierung/Edition der SD-Tabelle.

## Build & Ausführung
- **Entwicklung:** TypeScript-Quellen werden über webpack/babel gebündelt. `npm run dev` baut `devUserscript.js`, welches direkt in Tampermonkey importiert werden kann.
- **Produktion:** Tampermonkey führt ausschließlich die gebaute Datei aus; alle TypeScript/ES-Modul-Features werden während des Builds transpiliert.

Dieses Dokument dient als Ausgangspunkt, wenn neue Contributor:innen sich schnell orientieren oder weitere Kontexte ergänzen möchten.
