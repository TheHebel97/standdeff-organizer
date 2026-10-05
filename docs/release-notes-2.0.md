# SD Organizer 2.0.0-rc.1

Testkandidat vom 2026-10-06. Keine Veröffentlichung oder Übertragung an einen Remote-Branch erfolgt.

## Änderungen

- Einheitlicher SD Organizer mit Spielstilen; Erstellung vollständig im Panel.
- Automatische Infanterie-Skalierung mit 5 % Spähern, unabhängige Paketzeilen und Leeren per Klick.
- 100/200 Dual und Trial beim Bunkerimport, eigene Paketgrößen, getrennte Power-Einstellungen und aktive Auswahl.
- Kurze Einführungen für Erstellung, Import, Anfragen, Massen-UT und Tabellenpflege.
- SD-Registrierung ohne `forum_id` in Redirect-URLs, numerischer SD-Post-Anker, sofortige Initialisierung und sichtbare Speicherfehler.
- Korrektes `done`, stabile Anfrage-IDs und erhaltener Post-Cache über mehrere Seiten.
- Lokale Datumswerte bleiben unverändert; Handy-Anführungszeichen werden als manuelle Feldtrenner akzeptiert.
- Validierte Eingaben, Text-Escaping, gezielter Mod-Check und Änderungen nur am SD-Post.
- Journalisierte Persistenz mit Schema 2, Sicherung kaputter JSON-Wurzeln, Migration anhand der Dorfzuordnung und sichtbarer Klärung unsicherer Versand-IDs.
- Unbestätigte Versand-/Post-Vorgänge behalten Daten. Bestätigungen sind idempotent, parallele Sendungen additiv; Teilversand kann mit der tatsächlich geschickten Menge bestätigt werden.
- Reproduzierbarer Production-Export ohne Development-eval, Port 9000 für Server und Loader, portable npm-Befehle.

## Migration und Nutzung

Nur eine Skriptvariante/-version gleichzeitig aktivieren. Daten werden beim Lesen validiert; fehlende optionale Felder erhalten Defaults. Die bisherige Wurzel `standdeff-organizer` bleibt erhalten, Änderungen und offene Vorgänge erhalten zusätzliche Schlüssel. Die alte Skriptversion versteht das Journal nicht.

Neue IDs werden nicht recycelt; `sd-next-id=N` im postCache-Spoiler sichert die Vergabe. Dieser Spoiler bleibt unverändert Teil des SD-Posts und darf nicht manuell geleert werden. Mehrdeutige Altdaten werden nicht auf neue Anfragen übertragen.

Unklare Rückmeldungen des Spiels erfordern eine Prüfung des tatsächlichen Ergebnisses. Versand wird anschließend im Bereich „Offene Vorgänge prüfen“ bestätigt. Ein neuer eigener Forenpost mit exakt passendem Text bestätigt einen Beitragsentwurf automatisch; ansonsten gibt es Wieder-Einfüllen, manuelle Bestätigung und Verwerfen.

## Abnahmegrenzen

Automatisierte Prüfungen und erste Live-Prüfungen sind in `implementation-log.md` dokumentiert. Im geöffneten Account fehlen auswählbare Quelldörfer für Massen-UT sowie abgestellte Truppen für einen vollständigen Import. Reale Erfolgs-/Fehlerantworten, Teilversand, ein normaler Nutzer ohne Mod-Rechte und Installation des Production-Artefakts bleiben vor dem endgültigen Release zu prüfen. Der Export ist daher ausdrücklich ein Release-Kandidat.
