# Umsetzung des großen Updates

Stand: 2026-10-14. Branch: `codex/next-major-update`. Export: `2.0.0-rc.2`.

## Ergänzung vom 14.10.2026

- Geführte Einrichtung, geprüfte Gruppen-/Vorlagenzuordnung, natives Settings-Layout, Rand-Andocken und gemeinsamer Header-Hover sind umgesetzt und im Opera-Browser geprüft. 74 Jest/jsdom-Regressionstests bestehen.
- Der akzeptierte UI-Stand wurde als `0ca2a90` auf `origin/codex/next-major-update` gepusht.
- Auslieferung wie im Reliquien-Repo: lesbares Standalone-Artefakt, MIT-Hinweis, direkte offizielle ScriptAPI vor UI-Änderungen und Offline-Prüfung von window/unsafeWindow, fehlender API und nativen Fehlern. Scriptname aus dem bisherigen Freigabethread: „Standdeff Tabelle“; Oberfläche weiterhin „SD Organizer“.
- Deutscher Update-Forentext als Änderungstabelle ohne Codeblock. Veraltete Beschreibungen/Bilder des Startbeitrags sind benannt. GitHub ist Prüfquelle, keine erneute Freigabe behauptet.
- Ajax-Katalogabfragen und Massen-UT-Vorauswahl sind offene Prüfpunkte. Keine Ausnahme oder erfolgreiche vollständige Live-Abnahme wird zugesichert. Siehe [Auslieferung und Einreichung](auslieferung-und-einreichung.md).

## Bisheriger Umsetzungsstand vom 06.10.2026

## Implementiert

Alle sieben Arbeitspakete des [Plans](next-major-update-plan.md) sind im Code umgesetzt; die abschließende Browser-Abnahme ist noch nicht vollständig.

1. Registrierung mit Forum-ID-Fallback, Reparatur ungültiger alter Post-Anker ohne Entwurfsverlust, numerischem SD-Post, Erfolgs-/Fehlerstatus und sofortiger Initialisierung. Erstellungsvormerkung ist an Tab, Titel und zuvor bekannte Threads gebunden.
2. `done`, stabile IDs, erhaltener Post-Cache, Migration der lokalen Dorfzuordnung sowie persistente, idempotente Versand-/Post-Vorgänge. Unklare Ergebnisse bleiben sichtbar und bestätigen sich nicht allein durch Klicks.
3. Zentrale lokale Datumswerte, Handy-Feldtrenner, sichere Mengen, Escaping und Beschränkung auf den SD-Post. Nicht aufgelöste Dorf-Anfragen erzeugen einen Hinweis und bleiben für ein weiteres Update offen.
4. Gemeinsame beige/braune Oberfläche; Generator im Organizer, Infanterie-Skalierung, Leeren per Klick, Titelvorschlag „SD Tabelle“ nur bei leerem Titel und Titelprüfung auch bei Tastatur-Submit.
5. Dual-/Trial-Presets, einklappbare eigene Mengen, separate Power und sofortige Vorschau. Vorhandene Auswahl-/Unter-5-Änderungen integriert.
6. Kontext-/rollenspezifische Einführung mit gespeichertem Fortschritt, Pause, Fortsetzen, Überspringen und Neustart. Die Thread-Einführung erklärt den Zuordnungsbutton im Organizer; das separate Registrierungs-Popup und dessen Einstellung entfallen.
7. Port- und Metadatenabgleich, Production-Export ohne Development-eval, portable Befehle, aktuelle Doku und Release-Notizen.

## Prüfung

- Jest/jsdom: 51 Regressionstests bestehen (Registrierung, Parser/Datum, stabile IDs, Zwei-Tab-Änderungen, Sendungen, Komprimierung, Kontext/Checkboxen, Generator, Import und Einführung).
- TypeScript-/webpack-Build und Production-Export bestehen; JavaScript-Syntax und fehlendes Development-eval werden geprüft.
- Live auf Welt 259: Organizer-Umbenennung/-Design, Dual setzt Bogen und andere Anteile auf 0, 200er-Generator ergibt 200/200/200/10, Vorlage wird eingefüllt, Einführung erscheint, tatsächlicher Forenadmin-Link und Massen-UT-Formular geprüft.
- Live-Nachprüfung: Im SD-Thread zeigt der Organizer „SD-Tabelle festgelegt“; der erste Einführungsschritt hebt diesen Button hervor. Das separate Registrierungs-Popup erscheint nicht.
- Live-Nachprüfung des Generators: Leerer Titel erhält „SD Tabelle“, Klick entfernt den Vorschlag, eigener Titel bleibt nach Generieren und Klick erhalten. Kein Thread wurde abgesendet.
- Im geöffneten Account sind keine Massen-UT-Quelldörfer auswählbar und keine abgestellten Truppen sichtbar. Die Rechnung/Vorschau wurde zusätzlich mit DOM-Fixtures geprüft.

## Vor endgültigem Release offen

- Production-Script in Tampermonkey installieren und einen vollständigen Foren- und Versanddurchlauf mit passenden Testdörfern prüfen.
- Erfolg, Fehler und Teilversand im echten Spiel bestätigen; insbesondere Abgleich der tatsächlichen Paketanzahl.
- Mod und normalen Nutzer, Welt ohne Bogen, gefilterte/paginierte Truppen und Support-Speedboost live prüfen. Automatisierte Abdeckung ersetzt diese Prüfung der Spiel-DOM nicht.

Diese offenen Punkte sind Abnahme, keine bereits erfolgreich getesteten Live-Abläufe. Der aktuelle Commit-Stand und Export bleiben bis dahin ein Testkandidat. Es wurden keine Forenbeiträge oder Truppen durch den Agenten versendet.

UI-Vorschauen: [Generator und Einführung](screenshots/organizer-2.0-preview.jpg), [Zuordnungsbutton in der Einführung](screenshots/onboarding-registration-preview.jpg), [Titelvorschlag im Generator](screenshots/generator-title-preview.jpg).
