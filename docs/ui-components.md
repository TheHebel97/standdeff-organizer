# UI-Komponenten & Verantwortlichkeiten

Dieses Dokument fasst zusammen, welche UI-Bausteine in welchem Kontext greifen und wie sie zusammenspielen.

## Kontext-spezifische Controller

### `displayMassUt` (`src/ui/mass-ut.ts`)
- Läuft ausschließlich auf `screen=place` und initialisiert beim Laden sofort `storeGroupData` und `storeTemplateData`, um aktuelle Gruppen/Vorlagen für spätere Settings bereitzustellen.
- Liest `sdTableId`, Ziel-Dorf (`target`) sowie Einstellungen wie `getPreventDuplicateDestination` oder `getAutomateMassenUt` aus dem `LocalStorageHelper`.
- Wählt automatisch die passende Vorlage im Dropdown, setzt Checkboxen für Truppenanfragen und berücksichtigt dabei das UI-Setting `Doppeltes Schicken`, während gesendete Pakete im `ThreadData.packagesSent`-Map aktualisiert werden.
- Für `ab`/`bis` liest der Controller auf der Massen-UT-Seite die angezeigte Schwert-Laufzeit und Distanz aus, leitet daraus einen eventuellen Support-Speedboost ab und nutzt bevorzugt die echte Zeilen-Laufzeit für die Checkbox-Auswahl.

- Neben dem Uebernehmen-Button wird ein `SD erneut schicken`-Button eingeblendet, der die Massen-UT-Seite mit den passenden SD-Parametern (`sdTableId`, `group`, `order`, `dir`) neu aufruft; wenn kein passendes Zieldorf in einer gespeicherten SD-Tabelle gefunden wird, bleibt der Button deaktiviert.

### `displayAwayDetail` (`src/ui/away-detail.ts`)
- Laeuft auf `screen=overview_villages&mode=units&type=away_detail`.
- Rendert ein verschiebbares Panel fuer Ziel-Thread, Split-Zusammensetzung, Unit-Power-Werte und eine Import-Vorschau.
- Liest die auf der Seite abgestellten Truppen pro Koordinate aus, summiert deren Power und wandelt das Ergebnis in Paketmengen um.
- Schreibt die berechneten Bunkeranfragen direkt in denselben `sdInquiry`-Cache, den spaeter das Forum-Request-Popup rendert; einzelne importierte Koordinaten koennen vor dem Uebernehmen ab- oder angewaehlt werden. Ein Schnellbutton entfernt dabei auf Wunsch alle Vorschau-Eintraege unter 5 Paketen aus der aktuellen Auswahl und bereinigt die betroffenen Eintraege im Ziel-Thread.

### `viewThread` (`src/ui/view-thread.ts`)
- Erkennt nach dem Laden, ob gerade ein neuer SD-Thread erstellt wurde (`getNewThread`). Falls ja, werden Thread-Metadaten zusammen mit der `sdPostId` über `addThreadIdToLocalStorage` persistiert.
- Prüft anhand des LocalStorage, ob das aktuelle `thread_id` bekannt ist.
  - **Bekannt:** Rendert die Tabellenansicht über `sdTable(threads)`.
  - **Unbekannt:** Zeigt „Als SD-Tabelle festlegen“ (`addSdOptions`) im SD Organizer. Die Einführung erklärt die Zuordnung; ein separates Registrierungs-Popup erscheint nicht.

### `createNewTable` (`src/ui/new-thread.ts`)
- Nur für Forum-Moderator:innen aktiv. Rendert Paketzeilen und Generator im SD Organizer. Infanterie skaliert dieselbe Zeile, Späher werden auf 5 % gerundet; ein Klick leert das einzelne befüllte Feld.
- `newThread()` sammelt die Eingaben, setzt Defaultwerte falls alles leer ist, generiert daraus `[unit]`-Zeilen und ersetzt den Post-Inhalt durch einen vorgefertigten Block (inkl. Tabelle, Spoiler-Erklärungen und PostCache-Sektion).
- Beim Absenden wird `setNewThread = true` gesetzt, sodass `viewThread` im Anschluss die `sdPostId` auslesen kann.

### `displaySettings` (`src/ui/settings.ts`)
- Rendert eine Settings-Tabelle in den Spieleinstellungen und spiegelt die aktiven Einstellungen aus `LocalStorageHelper.generalSettings` wider. Das alte `firstStartPopup` bleibt nur zur Datenkompatibilität im Speicher.
- Falls bereits Gruppen- oder Vorlagen-Daten aus Massen-UT eingelesen wurden, werden die numerischen Inputs durch Dropdowns ersetzt.
- Listet alle bekannten Threads (`getAllThreads`) inklusive Link, Delete-Button und Reset fuer den gespeicherten Versandstatus (`packagesSent`) pro Thread.
- Registriert Event-Listener für alle Buttons/Inputs, die den LocalStorage unmittelbar aktualisieren (z. B. `setAutomateMassenUt`, `setSdGroupId`, `setSelectedTemplate`).

## Komponenten innerhalb von `viewThread`

| Datei | Kurzbeschreibung |
| --- | --- |
| `components/sd-table.ts` | Kernansicht der SD-Tabelle: parst Posts (`parseSdPosts`), synchronisiert den lokalen Cache (`setSdTableState`), aktualisiert Paketstände (`displayUpdatedSdTable`, `updateSentPackagesInSdTable`) und blendet moderationsspezifische Aktionen ein/aus. |
| `components/edit-sd-post.ts` | Unterstützt Moderator:innen beim Aktualisieren des Original-SD-Posts, indem bestehende Werte in das Formular geschrieben werden; Restmengen werden dabei nie negativ fortgeschrieben. |
| `components/request-popup.ts` | UI für neue Bunkeranfragen, inkl. Validierung, Parsing der Koordinaten, Support fuer das Vollformat `123\|123 123 """"` bzw. den Shortcut `123\|123 123` und Bulk-Editing-Funktionen. |
| `components/post-layout.ts` | Ersetzt oder blockiert Textareas für Nicht-Admins, fügt Buttons für die Bunkeranfragen-Bearbeitung ein und zeigt Badges für gespeicherte Versandstatus- bzw. Bunkeranfrage-Daten an. |
| `components/options-sd-thread.ts` | Rendert den Zuordnungsbutton im Organizer, zeigt bei bekannten Threads den gespeicherten Status und bei Fehlern einen Hinweis direkt darunter. |
| `components/onboarding.ts` | Kontextbezogene Einführung; erklärt zuerst den Zuordnungsbutton und speichert Fortschritt, Pause und Abschluss. |

> Die Komponenten greifen intensiv auf Hilfsfunktionen aus `src/helpers/table-helper.ts` sowie `LocalStorageHelper` zu, sodass die Tabelle immer denselben Stand zwischen Forum und Massen-UT hat.

## SD Organizer im Forum und beim Import
- `viewThread` und `createNewTable` blenden ein verschiebbares SD-Organizer-Panel auf Forum-Seiten ein.
- `components/forum-quick-settings.ts` rendert das Panel.
- Die zuletzt verschobene Position des Panels wird in den allgemeinen Script-Settings gespeichert und beim naechsten Einblenden wiederhergestellt.
- `components/sd-settings-controls.ts` kapselt die gemeinsame Initialisierung und die Event-Bindings fuer Massen-UT, doppeltes Schicken, Sortierung, SD Gruppe und SD Vorlage.
- Auf bestehenden Threads enthält das Panel den Zuordnungsbutton/-status, Versandoptionen und Reset. Beim Erstellen zeigt es ausschließlich Paketkonfiguration und Generator.
- Aenderungen an den Quick-Settings werden auf der SD-Tabellenansicht sofort auf die sichtbaren Massen-UT-Links angewendet.
- Tabellenzeilen mit gesetztem `ab` oder `bis` erzwingen fuer ihren Massen-UT-Link `order=distance` und `dir=1`, also eine aufsteigende Entfernungs-Sortierung statt der normalen Truppen-Sortierung.
- Der Reset wird ohne Rueckfrage ausgefuehrt und synchronisiert die Versand-Markierungen auf der SD-Tabelle sofort neu.


## Import, offene Vorgänge und Einführung

- Import: oben 100/200 Dual; auf Bogenwelten zusätzlich 100/200 Trial. Andere Split-Anteile werden auf 0 gesetzt, Power-Gewichtungen bleiben erhalten. Aktive Wahl und Vorschau werden sofort aktualisiert.
- `Eigene Paketgröße` und `Erweiterte Berechnung: Power` sind getrennte, zunächst geschlossene Bereiche. Vorschau/Auswahl und die Unter-5-Aktion bleiben erhalten; der Hinweis benennt die Auswirkung auf bestehende Entwürfe.
- `pending-operations.ts` zeigt unbestätigte Versand-/Post-Vorgänge. Bei Teilversand kann die tatsächlich geschickte Menge reduziert werden; Verwerfen erhält den fachlichen Entwurf. Automatische Post-Bestätigung verlangt einen neuen eigenen Post mit exakt passendem Text.
- `onboarding.ts` erklärt die aktuelle Seite und Rolle, markiert vorhandene Ziele und toleriert fehlende Bedienelemente. Weiter/Zurück, Pausieren, Überspringen, Fortsetzen und Neustart sind verfügbar; keine Touraktion sendet Posts oder Truppen.
- Panels verwenden neutrale beige/braune Spielstile, Textstatus, native Buttons und sichtbare Tastaturfokusse. Nach Größenänderungen werden gespeicherte Positionen auf den sichtbaren Bereich begrenzt.
