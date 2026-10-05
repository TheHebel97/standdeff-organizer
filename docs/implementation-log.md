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

Weitere Arbeitspakete und Abnahmekriterien: [next-major-update-plan.md](next-major-update-plan.md).
