

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
- [ ] erstellen einer Tabelle in jedem thread möglich
- [ ] erstellen einer tabelle nur als admin möglich
- [ ] je nach welt werden truppen angezeigt
- [ ] default truppen werden wird verwendet
- [ ] optional: andere truppen typen supporten
- [ ] formular kann nicht abgeschickt werden, wenn kein name eingetragen ist
- [ ] formular kann nicht abgeschickt werden, wenn text verändert
- [ ] hinweis wen formular nicht abschickbar

Settings:
- [ ] settings werden angezeigt
- [ ] hinzugefügte Sd Thread werden angezeigt und können gelöscht werden
- [ ] popup beim starte ist default true
- [ ] das setting funktioniert auf den seiten
- [ ] massen ut vereinfachen ist default false/true?
- [ ] das settings beinflusst ob das skript auf massenut aktiv wird
- [ ] verhindere doppeltes schicken ist default false
- [ ] das settings beinflusst inwiewet checkboxen beim massenut gecheckt werden
- [ ] sortieren nach ist default leer
- [ ] das settings beinflusst wie die truppen sortiert werden / durch veränderung im link
- [ ] sd verschicken gruppen id ist ein input mit dem defaultwert 0
- [ ] sobald gruppen eingelsen wurden, wird statt dem input ein dropdown angezeigt
- [ ] das settings beeinflusst die gruppen id die beim sd verschicken verwendet wird / durch veränderung im link
- [ ] sd vorlagen ist ein input mit dem defaultwert 0
- [ ] sobald vorlagen eingelsen wurden, wird statt dem input ein dropdown angezeigt
- [ ] das settings beeinflusst die vorlagen id die beim sd verschicken verwendet wird / durch veränderung im link


SD Tabelle anschauen: alle user
- [ ] es wird angezeigt dass es sich um eine sd tabelle handelt, sofern es eine ist
- [ ] falls es keine ist wird ein button angezeigt, um den thread zu den sd threads hinzuzufügen
- [ ] veränderungen an der sd tabelle durch drunterliegende posts werden nach dem laden der seite in die tabele übernommen
- [ ] veränderungen an der sd tabelle durch geschickte pakete via massen ut werden in der tabelle gesondert angezeigt
- [ ] bereits eingelesene Posts, die aber noch nicht gelöscht wurden, werden im cache der tabelle hinterlegt, um doppeltes einlesen zu verhindern
- [ ] die zuvor eingestellten filter werden in dem massenunterstützen link angewendet

SD Tabelle anschauen: normaler user
- [ ] posts im post cache sind für den normalen nutzer nicht sichtbar um verwirrung vorzubeugen
- [ ] sämtiche bearbeiten buttons sind für den normalen nutzer nicht sichtbar
- [ ] zitat funktion ist für den normalen nutzer nicht sichtbar
- [ ] bedanken funktion ist für den normalen nutzer nicht sichtbar

SD Tabelle anschauen: admin
- [ ] außerdem werden diese post rot hervorgehoben um dem admin zu singalisieren, dass er sie löschen sollte

Neuen Beitrag erstellen: alle user
- [ ] es existiert ein button um das bunker anragen ui zu öffnen
- [ ] das bunker anfragen ui wird geöffnet
- [ ] es existiert ein button um bearbeitete bunker einzufügen
- [ ] der bearbeitete bunker einfügen button wird gehighlighted, wenn pakte geschickt wurden
- [ ] nach dem abschicken des posts wird kontrolliert ob die gesendeten pakete auch so im post zu finden sind und die geschickten pakte werden zurückgesetzt
- 

Neuen Beitrag erstellen: normaler user
- [ ] das message feld ist deaktiviert und blockiert, sodass der normale nutzer keine nachrichten schreiben kann
- [ ] mit doppelklick kann diese blockierung aufgehoben werden

Neuen Beitrag erstellen: admin
- [ ] das message feld ist nicht deaktiviert und blockiert, sodass der admin nachrichten schreiben kann

Bunkeranfragen UI:
- [ ] zuvor erstellte und nicht abgeschickte anfragen werden beim erneuten anzeigen wieder hinzugefügt
- [ ] koordinaten können in beliebiger form eingegeben werden
- [ ] sofern bunkeranfrage nicht korrekt ausgefüllt wurde, wird der bunker anfragen button deaktiviert
- [ ] fehler bei den angaben werden entsprechend rot im input markiert
- [ ] leer inputfelder in denselben spalten werden gleichermaßen befüllt beim eingeben von daten
- [ ] löschen löscht die entsprechende zeile
- [ ] dopplungen werden verhindert


Beitrag editieren:
- [ ] bearbeiten button ist nur für den admin sichtbar
- [ ] im beareiten eines normalen posts stehen die bunkeranfragen ui und die bearbeiteten bunker nicht zur verfügung

SD Post bearbeiten:
- [ ] bearbeiten button ist nur für den admin sichtbar
- [ ] update sd tabelle ist immer sichtbar, aber mehrfaches drücken hat kinen einfluss auf die daten, durch den post cache

Massenut:
- [ ] gruppen wechseln ist möglich
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
