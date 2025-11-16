# Refactor-Vorschläge

Die folgenden Punkte sind bei der Analyse der aktuellen Codebasis aufgefallen und könnten in künftigen Iterationen adressiert werden.

## 1. Kontext-spezifische Controller verkleinern
- **Problem:** Dateien wie `src/ui/mass-ut.ts` oder `src/ui/settings.ts` enthalten jeweils 200+ Zeilen mit Inline-jQuery-Manipulationen. Das erschwert Tests und Wiederverwendung.
- **Idee:** Aufbrechen in kleinere Service-Klassen (z. B. `MassUtSelectionService`, `SettingsViewModel`), die nur Daten vorbereiten, während dedizierte Renderer die DOM-Strukturen erzeugen. Dadurch lassen sich Kernfunktionen einfacher unit-testen und zukünftige Layout-Änderungen isolieren.

## 2. Template-Strings auslagern
- **Problem:** `src/ui/new-thread.ts` enthält lange Template-Strings (mehrere hundert Zeilen) für den initialen Forenbeitrag. Bereits kleine Textänderungen erzeugen unübersichtliche Diffs und erhöhen die Gefahr von Tippfehlern.
- **Idee:** Die Textbausteine in eigene Markdown/BBCode-Dateien unter `src/assets/` auslagern und beim Build via `raw-loader` importieren. Alternativ könnte ein JSON-Template genutzt werden, das die Paketzeilen dynamisch injiziert. So bleibt der TypeScript-Code schlanker und Übersetzer:innen können Texte leichter anpassen.

## 3. LocalStorage-Serialisierung vereinheitlichen
- **Problem:** `LocalStorageHelper` konvertiert Maps an mehreren Stellen manuell zu Arrays und zurück. Änderungen am Schema müssen an vielen Methoden vorgenommen werden.
- **Idee:** Ein generischer Serializer (z. B. `mapToRecord`, `recordToMap`) oder eine kleine ORM-ähnliche Schicht würde die Konvertierung zentralisieren. Ergänzend könnten Zod/TypeBox-Schemas validieren, ob LocalStorage-Daten die erwartete Struktur haben, bevor sie benutzt werden.

## 4. Events statt Polling
- **Problem:** Komponenten wie `sd-table.ts` registrieren einen globalen `storage`-Listener und müssen dann das komplette DOM neu parsen, wenn sich etwas ändert.
- **Idee:** Ein internes Event-Bus-Modul (z. B. via `mitt` oder eine simple Custom-Event-Implementation) könnte gezielt Signale ("Pakete aktualisiert", "Thread hinzugefügt") verschicken. Dadurch lassen sich DOM-Updates auf die tatsächlich betroffenen Bereiche beschränken, was Performance und Lesbarkeit verbessert.

## 5. Typsichere DOM-Zugriffe
- **Problem:** Viele Selektoren werden mehrfach wiederholt (z. B. `$(".clearfix > form > input[value=Senden]")`). Ein Tippfehler bleibt unbemerkt, bis Tampermonkey die Seite lädt.
- **Idee:** Konstanten für wiederkehrende Selektoren oder kleine Wrapper-Komponenten ("`ForumForm`", "`MassUtForm`") würden Redundanzen verringern. In Kombination mit `data-*`-Attributen auf eigenen Elementen könnte man sogar auf fragile Struktur-Selektoren verzichten.
