# Standdeff Organizer 🛡️

Ein Userscript, das das Organisieren von Standdeff in Tribal Wars deutlich vereinfacht. 
Es unterstützt sowohl Admins (SF) als auch normale User bei:

- Erstellen und Verwalten von Standdeff-Tabellen
- Auslesen und Aufbereiten geschickter Deff-Truppen
- Vereinfachen von Massen-Unterstützungsaktionen (Massen-UT)
- Komfortfunktionen rund um Bunkeranfragen und SD-Threads

---

## Inhaltsverzeichnis

1. [Features](#features)
2. [Funktionsweise im Überblick](#funktionsweise-im-überblick)
   - [SD-Tabelle erstellen (Admin)](#sd-tabelle-erstellen-admin)
   - [SD-Tabelle ansehen (Alle User)](#sd-tabelle-ansehen-alle-user)
   - [Neuen Beitrag erstellen & Bunkeranfragen](#neuen-beitrag-erstellen--bunkeranfragen)
   - [Massen-UT Unterstützung](#massen-ut-unterstützung)
   - [Rollen: Admin vs. Normaler User](#rollen-admin-vs-normaler-user)
3. [Installation & Nutzung](#installation--nutzung)
4. [Settings](#settings)
5. [Architektur & Code-Überblick](#architektur--code-überblick)

---

## Features

**Bereits umgesetzt**

- ✅ Bereitstellen einer Standdeff-Tabelle pro Thread
- ✅ Auslesen der geschickten Deff-Truppen
- ✅ Unterstützung für normale User (vereinfachte Bedienung)
- ✅ Unterscheidung zwischen SF/Admin und normalen Usern
- ✅ Flexibel einsetzbar für unterschiedliche Welten / Flex / SD
- ✅ Erkennung, auf welcher Seite das Script aktiv ist
- ✅ Passende Gruppe wird automatisch ausgewählt (falls konfiguriert)
- ✅ Checkboxen beim Massen-UT werden passend gesetzt
- ✅ SD-Threads können markiert und verwaltet werden
- ✅ Post-Cache zur Vermeidung doppelter Einlesungen
- ✅ Vereinfachte Bedienung beim Bunkeranfragen-UI
- ✅ "Ab"- und "Bis"-Zeitraum-Feature für die SD-Tabelle

---

## Funktionsweise im Überblick

### SD-Tabelle erstellen (Admin)

- Admins können in jedem Thread eine eigene SD-Tabelle anlegen.
- Es werden je nach Welt passende Truppentypen angezeigt.
- Standard-/Default-Truppen werden automatisch verwendet.
- Das Formular kann erst abgeschickt werden, wenn ein Name eingetragen ist.
- Wenn das Formular nicht abschickbar ist, wird ein Hinweis angezeigt.

### SD-Tabelle ansehen (Alle User)

- Wenn der Thread eine SD-Tabelle enthält, wird dies sichtbar angezeigt.
- Wenn es noch keine SD-Tabelle ist, wird ein Button angezeigt, um den Thread als SD-Thread zu markieren.
- Veränderungen an der SD-Tabelle durch spätere Posts werden nach dem Laden der Seite in die Tabelle übernommen.
- Über Massen-UT geschickte Pakete werden in der Tabelle gesondert hervorgehoben.
- Die im Massen-UT eingestellten Filter werden im erzeugten Massenunterstützungs-Link berücksichtigt.

### Neuen Beitrag erstellen & Bunkeranfragen

- Im "Neuen Beitrag"-Bereich gibt es:
  - Einen Button, um das **Bunkeranfragen-UI** zu öffnen.
  - Einen Button, um **bearbeitete Bunker** einzufügen (wird gehighlightet, wenn Pakete verschickt wurden).
- Bereits erstellte, aber noch nicht abgeschickte Anfragen werden beim erneuten Öffnen wiederhergestellt.
- Koordinaten können in nahezu beliebigem Format eingegeben werden; eine Regex fasst die Eingabe sinnvoll zusammen.
- Fehlerhafte Angaben werden rot im Input markiert.
- Leere Inputfelder in derselben Spalte können automatisch befüllt werden.
- Zeilen können gelöscht werden; Dopplungen werden verhindert.

### Massen-UT Unterstützung

- Gruppenwechsel im Massen-UT ist möglich.
- **Setting: Massen UT vereinfachen**
  - Aus: Vorlage wird nicht automatisch ausgewählt; Filter und Gruppen werden nicht angewendet.
  - An: Vorlage wird automatisch ausgewählt; Filter und Gruppen werden angewendet.
- **Setting: Verhindere doppeltes Schicken**
  - Aus: Checkboxen werden unabhängig von bereits geschickten Paketen gesetzt.
  - An: Checkboxen werden nur gesetzt, wenn noch nicht geschickt wurde.
- Unabhängig von den Settings:
  - Es wird gezeigt, welche Buttons in welcher Reihenfolge zu drücken sind.
  - Es wird die passende Anzahl an Checkboxen gesetzt.

### Rollen: Admin vs. Normaler User

**Normaler User**

- Sieht, dass es sich um eine SD-Tabelle handelt (falls vorhanden).
- Sieht keinen Post-Cache zur Vermeidung von Verwirrung.
- Sieht keine Bearbeiten-Buttons und keine Zitierfunktion bei SD-Posts.
- Im "Neuen Beitrag"-Formular ist das Nachrichtenfeld standardmäßig blockiert (deaktiviert), um unnötige Posts zu verhindern.
- Mit Doppelklick kann die Blockierung aufgehoben werden (falls der User doch schreiben soll).

**Admin**

- Kann SD-Tabellen erstellen, bearbeiten und aktualisieren.
- Sieht Bearbeiten-Buttons und zusätzliche Hinweise.
- Im SD-Tabellen-View werden bereits eingelesene, aber noch nicht gelöschte Posts rot hervorgehoben, damit der Admin sie löschen kann.
- Bereits eingelesene Posts werden im Cache hinterlegt, um doppeltes Einlesen zu verhindern.
- Der Button „SD-Post bearbeiten“ ist nur für Admins sichtbar.
- Der Button „SD-Tabelle updaten“ ist immer sichtbar, mehrfaches Drücken verändert die Daten dank Cache nicht.

---

## Installation & Nutzung

> Hinweis: Das Projekt ist als Userscript gedacht. Die folgenden Schritte beschreiben eine typische Nutzung über einen Userscript-Manager (z.B. Tampermonkey) sowie die lokale Entwicklung.

### Für Spieler / Anwender

1. **Userscript installieren**
   - Erzeuge das gebaute Script (z.B. `compiledScript.js`) aus diesem Repository oder nutze eine bereitgestellte URL.
   - Füge das Script in Tampermonkey (oder vergleichbarem Add-on) als neues Userscript ein.

2. **Seiten aufrufen**
   - Öffne das Forum / die Seiten, auf denen Standdeff organisiert wird.
   - Das Script erkennt automatisch, auf welcher Seite es aktiv sein soll.

3. **SD-Threads konfigurieren**
   - Über das Settings-UI können Threads als SD-Threads markiert oder entfernt werden.
   - Je nach Rolle (Admin/Normaler User) stehen unterschiedliche Funktionen im UI zur Verfügung.

### Für Entwickler

Voraussetzungen:

- Node.js (LTS)

Installieren der Abhängigkeiten:

```bash
npm install
```

Build / Entwicklung (abhängig von deiner bestehenden Toolchain, z.B. Webpack/Babel):

```bash
# Beispiel
npm run build
# oder
npm run dev
```

Das gebaute Userscript (z.B. `compiledScript.js` oder `devUserscript.js`) kann dann in Tampermonkey importiert werden.

---

## Settings

Die Settings werden in einem eigenen UI verwaltet und sind zentral für das Verhalten des Scripts.

Bereits implementierte Settings:

- ✅ **SD-Threads verwalten**
  - Liste der hinzugefügten SD-Threads
  - Threads können wieder aus der Liste entfernt werden
- ✅ **Popup beim Start**
  - Default: `true`
  - Steuert, ob beim Laden ein Info-/Hilfepopup angezeigt wird
- ✅ **Massen UT vereinfachen**
  - Default: `false`
  - Steuert, ob Komfortfunktionen bei Massen-UT aktiviert werden
- ✅ **Verhindere doppeltes Schicken**
  - Default: `false`
  - Steuert, ob bereits geschickte Pakete erkannt und ausgeschlossen werden
- ✅ **Sortieren nach**
  - Default: leer
  - Beeinflusst Sortierung der Truppen (z.B. durch Parameter im Link)
- ✅ **SD verschicken – Gruppen-ID**
  - Initial als Input mit Default `0`
  - Sobald Gruppen eingelesen wurden, erscheint stattdessen ein Dropdown
  - Beeinflusst die Gruppen-ID im SD-Verschicken-Link
- ✅ **SD-Vorlagen-ID**
  - Initial als Input mit Default `0`
  - Sobald Vorlagen eingelesen wurden, erscheint stattdessen ein Dropdown
  - Beeinflusst die verwendete Vorlage beim Verschicken
- ✅ **Schwert Laufzeit**
    - Initial als Input mit Default `0`
    - Sollte die Laufzeit der Schwerttruppen in Minuten angegeben werden
    - Beeinflusst die Berechnung des "ab bis" Zeitraums

---

## Architektur & Code-Überblick

Der Quellcode liegt im Ordner `src/` und ist in verschiedene Bereiche unterteilt:

- `src/index.ts`
  - Einstiegspunkt des Scripts; entscheidet anhand der aktuellen Seite, welche Funktionen aktiviert werden.

- `src/ui/`
  - UI-spezifische Logik für die verschiedenen Bereiche:
  - `mass-ut.ts`: Logik und UI-Helfer für das Massen-UT.
  - `new-thread.ts`: Verhalten beim Erstellen neuer Threads/Posts.
  - `settings.ts`: Settings-Dialog / Konfigurationsoberfläche.
  - `view-thread.ts`: Darstellung und Verhalten beim Betrachten eines Threads mit/ohne SD-Tabelle.
  - `components/`: Wiederverwendbare UI-Komponenten (z.B. `sd-table`, Edit-Dialoge, Popups).

- `src/helpers/`
  - Hilfsfunktionen, z.B.:
  - `helper-functions.ts`: Allgemeine Utilities.
  - `local-storage-helper.ts`: Abstraktion für LocalStorage (z.B. Settings, Thread-Listen).
  - `logging-helper.ts`: (geplant/teilweise) für Logging.
  - `table-helper.ts`: Helfer für Tabellenoperationen (Einlesen, Aktualisieren, Caching).
  - `tw-helper.ts`: Funktionen speziell für die Interaktion mit der TW-Oberfläche.

- `src/types/`
  - Typdefinitionen für LocalStorage-Modelle, TW-spezifische Datentypen, interne Datenstrukturen.

Build-Setup:

- `webpack.config.js`: Bundle-Konfiguration für das Userscript.
- `babel.config.js`: Transpile-Einstellungen.
- `tsconfig.json`: TypeScript-Konfiguration.

Weitere Architektur-Details und geplante Refactors findest du in `docs/architecture.md`, `docs/refactor-ideas.md` und `docs/ui-components.md`.

Hinweis zur Anfrage-Syntax:
- Neben dem bisherigen Vollformat `123|123 123 """"` wird auch die Kurzform `123|123 123` unterstuetzt.


