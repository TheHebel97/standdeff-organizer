# UI-Komponenten & Verantwortlichkeiten

Dieses Dokument fasst zusammen, welche UI-Bausteine in welchem Kontext greifen und wie sie zusammenspielen.

## Kontext-spezifische Controller

### `displayMassUt` (`src/ui/mass-ut.ts`)
- Läuft ausschließlich auf `screen=place` und initialisiert beim Laden sofort `storeGroupData` und `storeTemplateData`, um aktuelle Gruppen/Vorlagen für spätere Settings bereitzustellen.
- Liest `sdTableId`, Ziel-Dorf (`target`) sowie Einstellungen wie `getPreventDuplicateDestination` oder `getAutomateMassenUt` aus dem `LocalStorageHelper`.
- Wählt automatisch die passende Vorlage im Dropdown, setzt Checkboxen für Truppenanfragen und berücksichtigt dabei das UI-Setting `Doppeltes Schicken`, während gesendete Pakete im `ThreadData.packagesSent`-Map aktualisiert werden.
- Für `ab`/`bis` liest der Controller auf der Massen-UT-Seite die angezeigte Schwert-Laufzeit und Distanz aus, leitet daraus einen eventuellen Support-Speedboost ab und nutzt bevorzugt die echte Zeilen-Laufzeit für die Checkbox-Auswahl.

- Neben dem Uebernehmen-Button wird ein `SD erneut schicken`-Button eingeblendet, der die Massen-UT-Seite mit den passenden SD-Parametern (`sdTableId`, `group`, `order`, `dir`) neu aufruft; wenn kein passendes Zieldorf in einer gespeicherten SD-Tabelle gefunden wird, bleibt der Button deaktiviert.

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
- Listet alle bekannten Threads (`getAllThreads`) inklusive Link, Delete-Button und Reset fuer den gespeicherten Versandstatus (`packagesSent`) pro Thread.
- Registriert Event-Listener für alle Buttons/Inputs, die den LocalStorage unmittelbar aktualisieren (z. B. `setAutomateMassenUt`, `setSdGroupId`, `setSelectedTemplate`).

## Komponenten innerhalb von `viewThread`

| Datei | Kurzbeschreibung |
| --- | --- |
| `components/sd-table.ts` | Kernansicht der SD-Tabelle: parst Posts (`parseSdPosts`), synchronisiert den lokalen Cache (`setSdTableState`), aktualisiert Paketstände (`displayUpdatedSdTable`, `updateSentPackagesInSdTable`) und blendet moderationsspezifische Aktionen ein/aus. |
| `components/edit-sd-post.ts` | Unterstützt Moderator:innen beim Aktualisieren des Original-SD-Posts, indem bestehende Werte in das Formular geschrieben werden; Restmengen werden dabei nie negativ fortgeschrieben. |
| `components/request-popup.ts` | UI für neue Bunkeranfragen, inkl. Validierung, Parsing der Koordinaten, Support fuer das Vollformat `123\|123 123 """"` bzw. den Shortcut `123\|123 123` und Bulk-Editing-Funktionen. |
| `components/post-layout.ts` | Ersetzt oder blockiert Textareas für Nicht-Admins, fügt Buttons für die Bunkeranfragen-Bearbeitung ein und verhindert versehentliche Änderungen. |
| `components/options-sd-thread.ts` | Bindet Buttons an unbekannte Threads, um sie als SD-Thread zu registrieren oder aus der Liste zu entfernen. |
| `components/first-start-thread-popup.ts` | Popup beim ersten Start, das erklärt, wie Threads verknüpft werden; abhängig vom Setting `firstStartPopup`.

> Die Komponenten greifen intensiv auf Hilfsfunktionen aus `src/helpers/table-helper.ts` sowie `LocalStorageHelper` zu, sodass die Tabelle immer denselben Stand zwischen Forum und Massen-UT hat.

## Quick Settings im Forum
- `viewThread` und `createNewTable` blenden ein verschiebbares Quick-Settings-Panel auf Forum-Seiten ein.
- `components/forum-quick-settings.ts` rendert das Panel.
- Die zuletzt verschobene Position des Panels wird in den allgemeinen Script-Settings gespeichert und beim naechsten Einblenden wiederhergestellt.
- `components/sd-settings-controls.ts` kapselt die gemeinsame Initialisierung und die Event-Bindings fuer Massen-UT, doppeltes Schicken, Sortierung, SD Gruppe und SD Vorlage.
- Auf bestehenden Threads enthaelt das Panel zusaetzlich einen Reset fuer den gespeicherten Versandstatus; beim Erstellen neuer Threads bleibt dieser deaktiviert.
- Aenderungen an den Quick-Settings werden auf der SD-Tabellenansicht sofort auf die sichtbaren Massen-UT-Links angewendet.
- Tabellenzeilen mit gesetztem `ab` oder `bis` erzwingen fuer ihren Massen-UT-Link `order=distance` und `dir=1`, also eine aufsteigende Entfernungs-Sortierung statt der normalen Truppen-Sortierung.
- Der Reset wird ohne Rueckfrage ausgefuehrt und synchronisiert die roten Versand-Markierungen auf der SD-Tabelle sofort neu.
