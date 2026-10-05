# Umsetzung des grossen Updates

Beginn: 2026-10-06. Branch: `codex/next-major-update`.

## Abgeschlossene Etappen

### Thread-Registrierung

- Forum-ID wird aus dem ausgewaehlten Forum ermittelt, wenn sie in der URL fehlt.
- Registrierung verwendet den numerischen Anker des SD-Posts und meldet Speicherfehler.
- Popup und Hinzufuegen-Button aktualisieren die Ansicht erst nach erfolgreichem Speichern.
- Neu erstellte SD-Threads werden sofort mit dem neuen Zustand gerendert.
- Validierung: vier Jest-Regressionstests und TypeScript-/webpack-Build.

## Noch ausstehend

### Tabellenstatus, Parser und lokale Datumswerte

- Erledigte Anfragen verhindern erneut automatische Auswahl; `done` bleibt bei spaeteren Mengenmeldungen erhalten.
- IDs werden nicht umnummeriert. Ein Zaehler im bestehenden Post-Cache verhindert das Wiederverwenden geloeschter IDs; bisherige Post-IDs bleiben erhalten.
- Gerade und typografische Handy-Anfuehrungszeichen werden als Anfrage-Trenner akzeptiert.
- Datumswerte werden zentral validiert und lokal formatiert; Sommer-/Winter-Rundlaeufe behalten die Uhrzeit.
- Normaler Zahlentext und unbekannte Dorfkoordinaten werden nicht als Tabellenupdates angewendet.
- Validierung: 17 Jest-Regressionstests und webpack-Build.

Weitere Arbeitspakete und Abnahmekriterien: [next-major-update-plan.md](next-major-update-plan.md).
