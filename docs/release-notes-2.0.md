# Standdeff Tabelle / SD Organizer 2.0.0-rc.2

Update-Prüfstand vom 2026-10-14 auf `codex/next-major-update`. Der bisherige UI-Stand wurde am 14.10.2026 gepusht; keine erneute Freigabe oder Spieler-Veröffentlichung des Updates erfolgt. [Changelog](../CHANGELOG.md), [Foren-Änderungstabelle](forum-einreichung.txt) und [Auslieferungsregeln](auslieferung-und-einreichung.md) gehören zur Update-Prüfung.

## Änderungen

- Einheitlicher SD Organizer mit Spielstilen; Erstellung vollständig im Panel.
- Generator schlägt für leere Titel „SD Tabelle“ vor; ein Klick entfernt den Vorschlag und eigene Titel bleiben erhalten.
- Automatische Infanterie-Skalierung mit 5 % Spähern, unabhängige Paketzeilen und Leeren per Klick.
- 100/200 Dual und Trial beim Bunkerimport, eigene Paketgrößen, getrennte Power-Einstellungen und aktive Auswahl.
- Geführte Einrichtung vom Forum über native Gruppe/Vorlage und sechs einzelne Settings zur Thread-Zuordnung, mit aktueller Spielbestätigung und direkter Ressourcenauswahl. Kein Massen-UT-Einleseschritt.
- Kompakte Randfenster mit gespeichertem links/rechts Andocken; native Settings mit Gültigkeitsmarkierungen. Ein Header-Fragezeichen zeigt alle passenden Infos während des Hoverns.
- Zuordnung über „Als SD-Tabelle festlegen“ im Organizer, in der Header-Hilfe erklärt. Das separate Registrierungs-Popup und seine Einstellung entfallen; bekannte Threads zeigen ihren Zuordnungsstatus.
- SD-Registrierung ohne `forum_id` in Redirect-URLs, numerischer SD-Post-Anker, sofortige Initialisierung und sichtbare Speicherfehler.
- Korrektes `done`, stabile Anfrage-IDs und erhaltener Post-Cache über mehrere Seiten.
- Lokale Datumswerte bleiben unverändert; Handy-Anführungszeichen werden als manuelle Feldtrenner akzeptiert.
- Validierte Eingaben, Text-Escaping, gezielter Mod-Check und Änderungen nur am SD-Post.
- Journalisierte Persistenz mit Schema 2, Sicherung kaputter JSON-Wurzeln, Migration anhand der Dorfzuordnung und sichtbarer Klärung unsicherer Versand-IDs.
- Unbestätigte Versand-/Post-Vorgänge behalten Daten. Bestätigungen sind idempotent, parallele Sendungen additiv; Teilversand kann mit der tatsächlich geschickten Menge bestätigt werden.
- Lesbarer Production-Export ohne Minifizierung/eval, vollständiger MIT-Hinweis, offizieller Scriptname „Standdeff Tabelle“ in Header/ScriptAPI und Offline-Prüfung des tatsächlichen API-Starts. Port 9000 für Server und Dev-Loader.
- Hintergrundabfragen der Gruppen-/Vorlagenseiten per Ajax sind ausdrücklich als neuer Prüf-/Ausnahmebedarf dokumentiert; allgemeine Regeln erlauben sie nicht automatisch. Der akzeptierte Funktionsstand wird für die Prüfung erhalten.

## Migration und Nutzung

Nur eine Skriptvariante/-version gleichzeitig aktivieren. Daten werden beim Lesen validiert; fehlende optionale Felder erhalten Defaults. Die bisherige Wurzel `standdeff-organizer` bleibt erhalten, Änderungen und offene Vorgänge erhalten zusätzliche Schlüssel. Die alte Skriptversion versteht das Journal nicht.

Neue IDs werden nicht recycelt; `sd-next-id=N` im postCache-Spoiler sichert die Vergabe. Dieser Spoiler bleibt unverändert Teil des SD-Posts und darf nicht manuell geleert werden. Mehrdeutige Altdaten werden nicht auf neue Anfragen übertragen.

Unklare Rückmeldungen des Spiels erfordern eine Prüfung des tatsächlichen Ergebnisses. Versand wird anschließend im Bereich „Offene Vorgänge prüfen“ bestätigt. Ein neuer eigener Forenpost mit exakt passendem Text bestätigt einen Beitragsentwurf automatisch; ansonsten gibt es Wieder-Einfüllen, manuelle Bestätigung und Verwerfen.

## Abnahmegrenzen

Automatisierte Prüfungen und erste Live-Prüfungen sind in `implementation-log.md` dokumentiert. Im geöffneten Account fehlen auswählbare Quelldörfer für Massen-UT sowie abgestellte Truppen für einen vollständigen Import. Reale Erfolgs-/Fehlerantworten, Teilversand, ein normaler Nutzer ohne Mod-Rechte und Installation des Production-Artefakts bleiben vor dem endgültigen Release zu prüfen. Der Export ist daher ausdrücklich ein Release-Kandidat.
