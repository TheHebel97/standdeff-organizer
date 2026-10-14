# Auslieferung und Update-Einreichung

Stand: 2026-10-14. Das bestehende Script ist im [Freigabethread „Standdeffübersicht automatisieren“](https://forum.die-staemme.de/index.php?threads/standdeff%C3%BCbersicht-automatisieren.193996/) unter **Standdeff Tabelle**, Autor **TheHebel97**, Premium erforderlich, beschrieben. **SD Organizer** ist der Name der neuen Oberfläche. Das Update ist ein Prüfstand, keine bereits genehmigte Spieler-Veröffentlichung.

## Verbindlicher Build-Ablauf

- `npm run build` prüft den Entwicklungsbuild. `npm test -- --runInBand` prüft die Regressionstests.
- `npm run release` / `npm run build:userscript` baut über `webpack.userscript.config.js` ohne Minifizierung oder Source-Maps, exportiert `compiledScript.js` und `devUserscript.js` und prüft das fertige Prüfskript.
- `compiledScript.js` bleibt der versionierte, lesbare und eigenständige Prüfstand. Header, Version aus `package.json`, MIT-Lizenz und ursprüngliche Autorenangaben sind enthalten. Kein Entwicklungsserver, eval oder nachgeladener Hauptcode ist nötig.
- `npm run verify:userscript` prüft Syntax, Header, Lizenz, Lesbarkeit und den tatsächlichen Registrierungsstart offline. Die offizielle Zwei-Zeilen-ScriptAPI steht vor UI-Änderungen. Native API-Fehler werden weder abgefangen noch umgangen.
- `devUserscript.js` ist ausschließlich der lokale Entwicklungsloader auf Port 9000, kein Einreichungsartefakt für Spieler. Nur eine Variante gleichzeitig aktivieren.
- Für Einreichungsupdates Version und Lockfile, [Changelog](../CHANGELOG.md), Release-Notizen und [Foren-Änderungstabelle](forum-einreichung.txt) abgleichen und den Prüfstand neu bauen.

## Prüfquelle und freigegebene Auslieferung

GitHub stellt den Update-Prüfstand bereit. Die Links im Forenentwurf zeigen auf den gepushten Branch `codex/next-major-update`; sie behaupten weder eine Freigabe noch ein Spieler-Hosting durch GitHub. Der Entwicklerloader gehört nicht in den Beitrag. Auf Wunsch des Nutzers enthält der Update-Forentext nur die Änderungstabelle, keinen Initialisierungscode.

Die tatsächliche Spieler-Auslieferung bleibt beim Stämme-Team. Eine bestehende Team-URL wird nicht erfunden oder durch eine GitHub-URL ersetzt. Die originale Beschreibung ist veraltet: Generator über Schmiede-Symbol, Erststart-Popup und das Massen-UT-Einlesen passen nicht mehr. Bilder aus dem Erstbeitrag sind vor Veröffentlichung durch aktuelle Ansichten zu ersetzen; lokale UI-Vorschauen liegen in `docs/screenshots/`.

## Offen zu beschreibende Prüfpunkte

Der derzeit akzeptierte Funktionsstand bleibt erhalten. Die zwei automatischen Ajax-GETs der nativen Gruppen-/Vorlagenseiten müssen im Update ausdrücklich zur Prüfung gestellt werden: Die allgemeinen Regeln untersagen Ajax; eine Ausnahme für das bestehende Script ist nicht durch den Code oder dieses Dokument zugesichert. Gleiches gilt für die datenabhängige Massen-UT-Vorauswahl und ihre nativen Checkbox-Ereignisse. Truppen-/Post-Senden bleibt beim Spieler; keine automatischen Klicks auf Unterstützen/Senden werden behauptet oder eingeführt.

Bestandsprüfung bestätigt vorhandene Gruppen/Vorlagen, nicht die Richtigkeit ihrer Paketmengen. Live-UI-Prüfung ersetzt keinen vollständigen Versand-/Post-Durchlauf mit dem neuen Prüfskript. Die noch offenen Abnahmepunkte bleiben im [Umsetzungsstand](implementation-log.md) sichtbar.

## Regelquellen

Die folgenden Primärquellen wurden am 14.10.2026 im Opera-Browser gelesen:

- [Genehmigungsprozess, auch für Aktualisierungen](https://forum.die-staemme.de/index.php?threads/genehmigungsprozess-f%C3%BCr-scripte-und-tools.192975/): Team-Hosting und Prüfbereitstellung. Der Nutzer verlangt wie im Reliquien-Repo GitHub als Prüfquelle statt Passwort-Pastebin; dies ist im Entwurf erkennbar.
- [Regeln für Scripte und Tools](https://forum.die-staemme.de/index.php?threads/regeln-f%C3%BCr-die-erlaubnis-und-nutzung-von-scripte-und-tools.192969/): erneute Prüfung nach Änderungen, fortlaufende Version/Changelog, Lesbarkeit, ScriptAPI, MIT oder CC BY sowie die Einschränkungen bei Ajax und automatischen Spielaktionen.
- [ScriptAPI](https://forum.die-staemme.de/index.php?threads/script-api.192973/): offizieller window/unsafeWindow-Aufruf und Forum-Kontaktadresse.
- [Einreichungs-Template](https://forum.die-staemme.de/index.php?threads/template-f%C3%BCr-script-einreichung.192974/): beschreibt neue und aktualisierte Scripte. Für dieses Update verwendet der Forenentwurf gemäß Nutzervorgabe eine Änderungstabelle zum bestehenden Thread.
