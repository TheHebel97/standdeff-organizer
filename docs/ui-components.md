# UI-Komponenten & Verantwortlichkeiten

Dieses Dokument fasst zusammen, welche UI-Bausteine in welchem Kontext greifen und wie sie zusammenspielen.

## Kontext-spezifische Controller

### `displayMassUt` (`src/ui/mass-ut.ts`)
- Läuft ausschließlich auf `screen=place` und initialisiert beim Laden sofort `storeGroupData` und `storeTemplateData`, um aktuelle Gruppen/Vorlagen für spätere Settings bereitzustellen.
- Liest `sdTableId`, Ziel-Dorf (`target`) sowie Einstellungen wie `getPreventDuplicateDestination` oder `getAutomateMassenUt` aus dem `LocalStorageHelper`.
- Wählt automatisch die passende Vorlage im Dropdown, setzt Checkboxen für Truppenanfragen und verhindert (je nach Einstellung) Doppel-Sendungen, indem gesendete Pakete im `ThreadData.packagesSent`-Map aktualisiert werden.

### `viewThread` (`src/ui/view-thread.ts`)
- Erkennt nach dem Laden, ob gerade ein neuer SD-Thread erstellt wurde (`getNewThread`). Falls ja, werden Thread-Metadaten zusammen mit der `sdPostId` über `addThreadIdToLocalStorage` persistiert.
- Prüft anhand des LocalStorage, ob das aktuelle `thread_id` bekannt ist.
  - **Bekannt:** Rendert die Tabellenansicht über `sdTable(threads)`.
  - **Unbekannt:** Zeigt ein Popup (`addSdPopup`) bzw. Optionselemente (`addSdOptions`), damit Nutzer:innen den Thread als SD-Thread markieren können.

### `createNewTable` (`src/ui/new-thread.ts`)
- Nur für Forum-Moderator:innen aktiv. Fügt neben der Thread-Überschrift einen Konfigurationsbutton ein, der Eingabefelder für Standard-Paketgrößen (Speer, Schwert, Bogenschütze, Späher) anzeigt.
- `newThread()` sammelt die Eingaben, setzt Defaultwerte falls alles leer ist, generiert daraus `[unit]`-Zeilen und ersetzt den Post-Inhalt durch einen vorgefertigten Block (inkl. Tabelle, Spoiler-Erklärungen und PostCache-Sektion).
- Beim Absenden wird `setNewThread = true` gesetzt, sodass `viewThread` im Anschluss die `sdPostId` auslesen kann.

### `displaySettings` (`src/ui/settings.ts`)
- Rendert eine Settings-Tabelle in den Spieleinstellungen und spiegelt alle Flags aus `LocalStorageHelper.generalSettings` wider.
- Falls bereits Gruppen- oder Vorlagen-Daten aus Massen-UT eingelesen wurden, werden die numerischen Inputs durch Dropdowns ersetzt.
- Listet alle bekannten Threads (`getAllThreads`) inklusive Link und Delete-Button.
- Registriert Event-Listener für alle Buttons/Inputs, die den LocalStorage unmittelbar aktualisieren (z. B. `setAutomateMassenUt`, `setSdGroupId`, `setSelectedTemplate`).

## Komponenten innerhalb von `viewThread`

| Datei | Kurzbeschreibung |
| --- | --- |
| `components/sd-table.ts` | Kernansicht der SD-Tabelle: parst Posts (`parseSdPosts`), synchronisiert den lokalen Cache (`setSdTableState`), aktualisiert Paketstände (`displayUpdatedSdTable`, `updateSentPackagesInSdTable`) und blendet moderationsspezifische Aktionen ein/aus. |
| `components/edit-sd-post.ts` | Unterstützt Moderator:innen beim Aktualisieren des Original-SD-Posts, indem bestehende Werte in das Formular geschrieben werden. |
| `components/request-popup.ts` | UI für neue Bunkeranfragen, inkl. Validierung, Parsing der Koordinaten und Bulk-Editing-Funktionen. |
| `components/post-layout.ts` | Ersetzt oder blockiert Textareas für Nicht-Admins, fügt Buttons für die Bunkeranfragen-Bearbeitung ein und verhindert versehentliche Änderungen. |
| `components/options-sd-thread.ts` | Bindet Buttons an unbekannte Threads, um sie als SD-Thread zu registrieren oder aus der Liste zu entfernen. |
| `components/first-start-thread-popup.ts` | Popup beim ersten Start, das erklärt, wie Threads verknüpft werden; abhängig vom Setting `firstStartPopup`.

> Die Komponenten greifen intensiv auf Hilfsfunktionen aus `src/helpers/table-helper.ts` sowie `LocalStorageHelper` zu, sodass die Tabelle immer denselben Stand zwischen Forum und Massen-UT hat.
