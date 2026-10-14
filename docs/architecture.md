# Standdeff-Organizer Architekturüberblick

## Zweck des Repos
Das Projekt liefert ein Tampermonkey-Userscript, das an mehreren Stellen von *Die Stämme* (Massen-Unterstützen, Forum, Spieleinstellungen) zusätzliche UI- und Automatisierungsfunktionen anbietet. Der produktive Userscript-Code wird aus den TypeScript-Quellen unter `src/` kompiliert (siehe `devUserscript.js`).

## Einstiegspunkt & Kontexte
Der Einstiegspunkt `src/index.ts` registriert ein `$(document).ready`-Callback und ermittelt anhand der URL-Parameter den aktuellen Seitenkontext. Anschließend wird genau eine der fünf UI-Routinen geladen:

| Kontext (screen) | Einstiegsfunktion | Beschreibung |
| --- | --- | --- |
| `place` | `displayMassUt` (`src/ui/mass-ut.ts`) | Automatisiert Checkboxen im Massen-UT-Formular, setzt Filter/Gruppe/Vorlage und protokolliert verschickte Pakete pro SD-Thread. |
| `overview_villages` (`mode=units&type=away_detail`) | `displayAwayDetail` (`src/ui/away-detail.ts`) | Liest abgestellte Deff pro Dorf aus, rechnet sie ueber konfigurierbare Unit-Power- und Split-Werte in Bunkeranfragen um, zeigt die Ergebnisse als auswaehlbare Vorschau und schreibt die markierten Eintraege in den ausgewaehlten SD-Thread-Cache. |
| `forum-view_thread` | `viewThread` (`src/ui/view-thread.ts`) | Erkennt SD-Threads, ergänzt Buttons/Popups zum Registrieren neuer Threads und zeigt bei bekannten Threads die SD-Tabelle (`sdTable`) an. |
| `forum-new_thread` | `createNewTable` (`src/ui/new-thread.ts`) | Stellt Eingabemasken für Paket-Vorlagen bereit und generiert auf Knopfdruck den initialen Thread-Text inkl. SD-Tabelle und Spoiler-Erklärungen. |
| `settings` | `displaySettings` (`src/ui/settings.ts`) | Verwendet native Tabellen mit Hover-Hilfe, Gültigkeitsmarkierungen, Checkboxen und Gruppen-/Vorlagenauswahl und einer Liste bekannter SD-Threads samt Reset für den gespeicherten Versandstatus. |

> **Hinweis:** Jede dieser Funktionen kapselt den kompletten jQuery-Manipulationscode für ihren Kontext. Dadurch lässt sich das Script gezielt auf den Seiten aktivieren, auf denen Tampermonkey es injiziert.

Die Einrichtung wird neben Neuer Thread/Neue Umfrage in der Forum-Aktionsleiste ausdrücklich gestartet und erst dann auf anderen Seiten fortgesetzt. `game-catalog.ts` liest Gruppen und Vorlagen direkt auf den nativen Gruppen- und Vorlagenseiten und aktualisiert die Settings zusätzlich im Hintergrund. Während der passenden Einrichtungsschritte neu angelegte Einträge werden bei eindeutiger Identifikation übernommen. Ein aktives Onboarding läuft auch ohne Seitencontroller weiter; Hover-Hilfen lassen seinen Fortschritt unverändert. Randfenster teilen einen Dock-Manager mit gespeicherter Seite/Höhe und Überlappungsvermeidung.

## Persistenz & Datenmodell
Alle nutzerbezogenen Informationen (allgemeine Settings, bekannte Threads, Thread-spezifische Cache-Daten) werden über die Singleton-Klasse `LocalStorageHelper` verwaltet (`src/helpers/local-storage-helper.ts`).

- Beim Instanziieren wird der Schlüssel `standdeff-organizer` aus dem LocalStorage geladen oder mit Default-Werten initialisiert.
- Getter/Setter aktualisieren vor jedem Zugriff den lokalen Cache (`updateFromLocalStorage`) und serialisieren Maps zu Arrays, um sie persistieren zu können.
- Thread-Daten bestehen aus Metadaten (`threadName`, `forumId`, `sdPostId`), einem Post-Cache für Bunkeranfragen sowie zwei Maps: `stateOfSdTable` (Stand der Tabellenzeilen, key = Dorf-ID) und `packagesSent` (gesendete Paketanzahl pro interner SD-ID).
- Zusaetzlich liegen in den allgemeinen Settings jetzt auch die zuletzt gewaehlte Ziel-Thread-ID fuer den Bunker-Import, die Position des Import-Panels sowie die konfigurierten Split-/Unit-Power-Werte.

## Helfer & Komponenten
- **Helper** (`src/helpers/`):
  - `helper-functions.ts`: Utility-Funktionen rund um Thread-Erkennung, Parsing und DOM-Aktionen.
  - `table-helper.ts`: Parsen von Posts/Tabelle zu Maps, Rendering der SD-Tabelle und Anwenden von Settings auf Massen-UT-Links.
  - `tw-helper.ts`: Browser-spezifische Checks (z. B. ob der aktuelle Nutzer Forum-Mod ist) sowie Zugriff auf globale `game_data`.
  - `logging-helper.ts`: Wrapper rund um `console` mit Level-Methoden.
- **UI-Komponenten** (`src/ui/components/`): Teilroutinen, die innerhalb von `viewThread` eingebunden werden, z. B. Popups, Request-Formulare oder die Visualisierung/Edition der SD-Tabelle.

## Build & Ausführung
- **Entwicklung:** `npm run dev`/`npm start` startet webpack auf Port 9000. Der versionierte `devUserscript.js` lädt das aktuelle Bundle beim Seitenaufruf. `npm run build` prüft die TypeScript-Quellen.
- **Produktion:** `npm run release` bündelt ohne Development-eval und exportiert `compiledScript.js` mit Metadaten sowie den Dev-Loader. Version und Match-Regeln werden zentral erzeugt.

Dieses Dokument dient als Ausgangspunkt, wenn neue Contributor:innen sich schnell orientieren oder weitere Kontexte ergänzen möchten.


## Stand des Updates 2.0

- `resolveScriptContext()` liefert allen Controllern einen gemeinsamen `PageContext`. Fehlende Forum-IDs werden aus dem ausgewählten Forum aufgelöst; Massen-UT läuft nur auf `mode=call`, Post-Bearbeitung bleibt im Thread-Kontext.
- `table-domain.ts` enthält Parser, Berechnungen und Formatter; `table-dom.ts` liest/rendert gezielt den registrierten SD-Post. `date-helper.ts` konvertiert Epoch-Sekunden, lokale Eingaben und deutsches Datumsformat.
- `local-storage-repository.ts` speichert Änderungen mit eindeutigen Schlüsseln und reproduzierbarer Reihenfolge. Versand-/Post-Erfolge werden als idempotente Vorgänge projiziert; `local-storage-serializer.ts` validiert Thread-Felder und Map-Arrays.
- Journal-Komprimierung schreibt zuerst einen vollständigen Snapshot mit den bereits enthaltenen Änderungsschlüsseln. Erst danach werden genau diese Einträge entfernt. Web Locks koordinieren parallele Komprimierungen; spätere Tab-Änderungen bleiben replaybar.
- Neue Anfrage-IDs werden nicht recycelt. `sd-next-id=N` im bestehenden postCache-Spoiler hält den nächsten freien Wert fest; numerische Post-IDs werden weiterhin gesondert geparst.
- `pending-operation.ts` hält Vorbereitung und Erfolgsbestätigung getrennt. Unklare Rückmeldungen erhalten Entwürfe und eine sichtbare Prüfung, inklusive tatsächlicher Menge bei Teilversand.
- `organizer-style.ts` und `onboarding.ts` stellen gemeinsame Spielstile und kontextbezogene Hover-Hilfen bereit; `setup-onboarding.ts` verwaltet die geführte Einrichtung.

Regressionen werden mit Jest/jsdom geprüft. Die reale DOM-Kopplung erfordert zusätzlich Browser-Abnahme; deren Grenzen stehen in `implementation-log.md`.

Die Einrichtung validiert Gruppen und Vorlagen gegen einen aktuell bestätigten Spielbestand und ermöglicht ihre Zuordnung im Assistenten. Der persistente Fortschritt ersetzt diese Prüfung nicht. Die Settings erhalten keine Fensterstile; `sd-settings-controls.ts` unterstützt native Checkboxen in den Einstellungen und die bisherigen Schalter in den Randfenstern. Ein Fragezeichen im Header zeigt während des Hoverns alle passenden Infos gemeinsam. Gültige Werte/aktive Schutzfunktionen werden in den nativen Settings dezent grün markiert; Gruppe/Vorlage erst nach aktueller Spielbestätigung.
