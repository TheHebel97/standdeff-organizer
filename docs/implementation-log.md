# Umsetzung des großen Updates

Stand: 2026-10-06. Branch: `codex/next-major-update`. Export: `2.0.0-rc.1`.

## Implementiert

Alle sieben Arbeitspakete des [Plans](next-major-update-plan.md) sind im Code umgesetzt; die abschließende Browser-Abnahme ist noch nicht vollständig.

1. Registrierung mit Forum-ID-Fallback, Reparatur ungültiger alter Post-Anker ohne Entwurfsverlust, numerischem SD-Post, Erfolgs-/Fehlerstatus und sofortiger Initialisierung. Erstellungsvormerkung ist an Tab, Titel und zuvor bekannte Threads gebunden.
2. `done`, stabile IDs, erhaltener Post-Cache, Migration der lokalen Dorfzuordnung sowie persistente, idempotente Versand-/Post-Vorgänge. Unklare Ergebnisse bleiben sichtbar und bestätigen sich nicht allein durch Klicks.
3. Zentrale lokale Datumswerte, Handy-Feldtrenner, sichere Mengen, Escaping und Beschränkung auf den SD-Post. Nicht aufgelöste Dorf-Anfragen erzeugen einen Hinweis und bleiben für ein weiteres Update offen.
4. Gemeinsame beige/braune Oberfläche; Generator im Organizer, Infanterie-Skalierung, Leeren per Klick und Titelprüfung auch bei Tastatur-Submit.
5. Dual-/Trial-Presets, einklappbare eigene Mengen, separate Power und sofortige Vorschau. Vorhandene Auswahl-/Unter-5-Änderungen integriert.
6. Kontext-/rollenspezifische Einführung mit gespeichertem Fortschritt, Pause, Fortsetzen, Überspringen und Neustart. Die Thread-Einführung erklärt den Zuordnungsbutton im Organizer; das separate Registrierungs-Popup und dessen Einstellung entfallen.
7. Port- und Metadatenabgleich, Production-Export ohne Development-eval, portable Befehle, aktuelle Doku und Release-Notizen.

## Prüfung

- Jest/jsdom: 48 Regressionstests bestehen (Registrierung, Parser/Datum, stabile IDs, Zwei-Tab-Änderungen, Sendungen, Komprimierung, Kontext/Checkboxen, Generator, Import und Einführung).
- TypeScript-/webpack-Build und Production-Export bestehen; JavaScript-Syntax und fehlendes Development-eval werden geprüft.
- Live auf Welt 259: Organizer-Umbenennung/-Design, Dual setzt Bogen und andere Anteile auf 0, 200er-Generator ergibt 200/200/200/10, Vorlage wird eingefüllt, Einführung erscheint, tatsächlicher Forenadmin-Link und Massen-UT-Formular geprüft.
- Live-Nachprüfung: Im SD-Thread zeigt der Organizer „SD-Tabelle festgelegt“; der erste Einführungsschritt hebt diesen Button hervor. Das separate Registrierungs-Popup erscheint nicht.
- Im geöffneten Account sind keine Massen-UT-Quelldörfer auswählbar und keine abgestellten Truppen sichtbar. Die Rechnung/Vorschau wurde zusätzlich mit DOM-Fixtures geprüft.

## Vor endgültigem Release offen

- Production-Script in Tampermonkey installieren und einen vollständigen Foren- und Versanddurchlauf mit passenden Testdörfern prüfen.
- Erfolg, Fehler und Teilversand im echten Spiel bestätigen; insbesondere Abgleich der tatsächlichen Paketanzahl.
- Mod und normalen Nutzer, Welt ohne Bogen, gefilterte/paginierte Truppen und Support-Speedboost live prüfen. Automatisierte Abdeckung ersetzt diese Prüfung der Spiel-DOM nicht.

Diese offenen Punkte sind Abnahme, keine bereits erfolgreich getesteten Live-Abläufe. Der aktuelle Commit-Stand und Export bleiben bis dahin ein Testkandidat. Es wurden keine Forenbeiträge oder Truppen durch den Agenten versendet.

UI-Vorschauen: [Generator und Einführung](screenshots/organizer-2.0-preview.jpg), [Zuordnungsbutton in der Einführung](screenshots/onboarding-registration-preview.jpg).
