

Anforderungen:
- [x] Bereitstellen einer Standdeff Tabelle
- [x] Auslesen der geschickten Deff Truppen
- [x] Hilfe bei der Bedienung für normale User
- [x] Unterscheidung zwischen SF und normale User
- [x] Flexibel einsetzbar bzgl flex oder sd
- [ ] Logging der Anfragen
- [x] Erkennung auf welcher Seite das Skript aktiv ist
- [x] Passende Gruppe wird ausgewählt
- [x] checkboxen beim Massenut werden passend gecheckt
- [ ] matching von pakete angabe und sd vorlage

Todos:
- [ ] bunker anfragen und bearbeiten überschreibt sich]
- [ ] handling von doppelten anfragen im bunker anfragen ui
- [ ] regex im koords einfügen bereich fixen
- [ ] bearbeiten button für normale nutzer entfernen
- [ ] mac gänsefüßchen beachten
- [ ] falls das paket vorlagen matching implementiert wird, muss es entsprechende fehlermeldungen und settings geben
- [ ] ab und bis feature für die sd tabelle
- [ ] verhalten kontrollieren wenn aktionen nur halb performed werden 


Behavior Checkliste:
SD Tabelle erstellen: (nur als admin)
- [x] erstellen einer Tabelle in jedem thread möglich
- [x] erstellen einer tabelle nur als admin möglich
- [ ] je nach welt werden truppen angezeigt
- [x] default truppen werden verwendet
- [x] formular kann nicht abgeschickt werden, wenn kein name eingetragen ist
- [x] hinweis wen formular nicht abschickbar

Settings:
- [x] settings werden angezeigt
- [x] hinzugefügte Sd Thread werden angezeigt und können gelöscht werden
- [x] popup beim starte ist default true
- [x] das setting funktioniert auf den seiten
- [x] massen ut vereinfachen ist default false
- [ ] das settings beinflusst ob die annehmlichkeiten ausgeführt werden
- [x] verhindere doppeltes schicken ist default false
- [x] das settings beinflusst inwieweit checkboxen beim massenut gecheckt werden
- [x] sortieren nach ist default leer
- [x] das settings beinflusst wie die truppen sortiert werden / durch veränderung im link
- [x] sd verschicken gruppen id ist ein input mit dem defaultwert 0
- [x] sobald gruppen eingelsen wurden, wird statt dem input ein dropdown angezeigt
- [x] das settings beeinflusst die gruppen id die beim sd verschicken verwendet wird / durch veränderung im link
- [x] sd vorlagen ist ein input mit dem defaultwert 0
- [x] sobald vorlagen eingelsen wurden, wird statt dem input ein dropdown angezeigt
- [x] das settings beeinflusst die vorlagen id die beim sd verschicken verwendet wird / durch veränderung im link


SD Tabelle anschauen: alle user
- [x] es wird angezeigt dass es sich um eine sd tabelle handelt, sofern es eine ist
- [x] falls es keine ist wird ein button angezeigt, um den thread zu den sd threads hinzuzufügen
- [x] veränderungen an der sd tabelle durch drunterliegende posts werden nach dem laden der seite in die tabele übernommen
- [x] veränderungen an der sd tabelle durch geschickte pakete via massen ut werden in der tabelle gesondert angezeigt
- [x] die zuvor eingestellten filter werden in dem massenunterstützen link angewendet

SD Tabelle anschauen: normaler user
- [x] posts im post cache sind für den normalen nutzer nicht sichtbar um verwirrung vorzubeugen
- [x] sämtiche bearbeiten buttons sind für den normalen nutzer nicht sichtbar
- [x] zitat funktion ist für den normalen nutzer nicht sichtbar

SD Tabelle anschauen: admin
- [x] außerdem werden diese post rot hervorgehoben um dem admin zu singalisieren, dass er sie löschen sollte
- [x] bereits eingelesene Posts, die aber noch nicht gelöscht wurden, werden im cache der tabelle hinterlegt, um doppeltes einlesen zu verhindern

Neuen Beitrag erstellen: alle user
- [x] es existiert ein button um das bunker anragen ui zu öffnen
- [x] das bunker anfragen ui wird geöffnet
- [x] es existiert ein button um bearbeitete bunker einzufügen
- [x] der bearbeitete bunker einfügen button wird gehighlighted, wenn pakte geschickt wurden


Neuen Beitrag erstellen: normaler user
- [x] das message feld ist deaktiviert und blockiert, sodass der normale nutzer keine nachrichten schreiben kann
- [x] mit doppelklick kann diese blockierung aufgehoben werden

Neuen Beitrag erstellen: admin
- [x] das message feld ist nicht deaktiviert und blockiert, sodass der admin nachrichten schreiben kann

Bunkeranfragen UI:
- [x] zuvor erstellte und nicht abgeschickte anfragen werden beim erneuten anzeigen wieder hinzugefügt
- [x] koordinaten können in beliebiger form eingegeben werden
- [x] fehler bei den angaben werden entsprechend rot im input markiert
- [x] leer inputfelder in denselben spalten werden gleichermaßen befüllt beim eingeben von daten
- [x] löschen löscht die entsprechende zeile
- [x] dopplungen werden verhindert


Beitrag editieren:
- [x] bearbeiten button ist nur für den admin sichtbar

SD Post bearbeiten:
- [x] bearbeiten button ist nur für den admin sichtbar
- [x] update sd tabelle ist immer sichtbar, aber mehrfaches drücken hat kinen einfluss auf die daten, durch den post cache

Massenut:
- [x] gruppen wechseln ist möglich
- [ ] wenn massen ut vereinfachen aus ist, wird die vorlage nicht ausgewählt
- [ ] wenn massen ut vereinfachen aus ist, werden filter nicht angewendet
- [ ] wenn massen ut vereinfachen aus ist, werden gruppen nicht angewendet

- [ ] wenn massen ut vereinfachen an ist, wird die vorlage ausgewählt
- [ ] wenn massen ut vereinfachen an ist, werden filter angewendet
- [ ] wenn massen ut vereinfachen an ist, werden gruppen angewendet

- [ ] wenn verhindere doppeltes schicken aus ist, werden checkboxen unabhängig von geschickten paketen die checkboxen gecheckt
- [ ] wenn verhindere doppeltes schicken an ist, werden checkboxen nur gecheckt, wenn sie nicht schon geschickt wurden

- [ ] die unterstützung wie welche buttons gedrückt werden müssen wird unabhängig von den settings angezeigt
- [ ] die passende anzahl wie viele checkboxen gecheckt werden müssen wird unabhängig von den settings angewendet

- [ ] tab schließen nach ut?
