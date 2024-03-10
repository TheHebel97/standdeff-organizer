import {getDataFromLocalStorage, storeDataInLocalStorage} from "./helper-functions";
import {isUserForumMod} from "./tw-helper";

export function setupScriptUI(currentScriptContext: string) {

    if (currentScriptContext === "place") {
        console.log("standdeff-organizer loaded in place");
    } else if (currentScriptContext === "forum-view_thread") {
        console.log("standdeff-organizer loaded in view_thread");
    } else if (currentScriptContext === "forum-new_thread") {
        console.log("standdeff-organizer loaded in new_thread");
        if (isUserForumMod()) {
            console.log("user is forum mod");
            //html elements
            const settingsBtn = `<input type="button" style="background-image: url(https://dsde.innogamescdn.com/asset/7b986b1a/graphic//buildings/smith.png);
            background-repeat: no-repeat; width:20px;height:20px; border: none; cursor: pointer; background-color: transparent; margin-left:7px;" class="configbtn">`;
            let tbBows = game_data.units.includes("archer") ? `<img src="https://dsde.innogamescdn.com/asset/b5d78b17/graphic/unit/unit_archer@2x.png" title="Bogenschütze" alt="" class="" style="width: 15px; height: 15px">
      <input type="text" class="inputBow" id="inputBow" style="width:70px;background-color:#EAD5AA">` : "";
            let config = `<br><div class="configs" style="display: none; width: 95%;margin-left: auto;margin-bottom: 20px;
      margin-right: auto;margin-top:15px;">
      <img src="https://dsde.innogamescdn.com/asset/b5d78b17/graphic/unit/unit_spear@2x.png" title="Speerträger" alt="" class="" style="width: 15px; height: 15px">
      <input type="text" class="inputSpear" id="inputSpear" style="width:70px;background-color:#EAD5AA;margin-right: 10px"> 
      <img src="https://dsde.innogamescdn.com/asset/b5d78b17/graphic/unit/unit_sword@2x.png" title="Schwertkämpfer" alt="" class="" style="width: 15px; height: 15px"> 
      <input type="text" class="inputSword" id="inputSword" style="width:70px;background-color:#EAD5AA;margin-right: 10px"> ` + tbBows + `
      <br>
      <br>

      <input type="button" class="btn" id="setupTable" value="SD Tabelle generieren">
      </div>
      `;


            //append html elements
            $(".clearfix > h2").append(settingsBtn)
            $(".clearfix > h2").append(config)
            $(".configbtn").on("click", swapConfgDisplay)
            $("#setupTable").on("click", setupTable)



        }

//else nothing


        const test = {"test": 1};
        console.log(typeof test);

        storeDataInLocalStorage(test, "test1")
        console.log(getDataFromLocalStorage("test1"))


    }

}

//private functions
function swapConfgDisplay() {
    let element = $(".configs");
    if (element.css("display") === "none") {
        element.css("display", "block")
    } else {
        element.css("display", "none")
    }
}

//todo: give multiple inputs instead of just spliiting by ","
//fix typescript errors
//rewrite manual
const createPaketString = (troopArray: any[]) => {
    let text = "";
    // @ts-ignore
    let paketRows = Math.max(parseInt(troopArray[0].length), parseInt(troopArray[1].length), game_data.units.includes("archer") ? parseInt(troopArray[2].length) : null)
    for (let i = 0; i < paketRows; i++) {
        let index = 0;
        troopArray.forEach(element => {
            text += index === 0 ? `[unit]spear[/unit][i]${element[i] === undefined ? "0" : element[i]}[/i] ` : "";
            text += index === 1 ? `[unit]sword[/unit][i]${element[i] === undefined ? "0" : element[i]}[/i] ` : "";
            text += index === 2 && game_data.units.includes("archer") ? `[unit]archer[/unit][i]${element[i] === undefined ? "0" : element[i]}[/i] ` : "";
            index++;
        })
        text += "\n"
    }
    return text;
}

function setupTable() {
    let troopArray = [];
    // @ts-ignore
    let spear = $("#inputSpear").val().split(",")
    // @ts-ignore
    let sword = $("#inputSword").val().split(",")
    // @ts-ignore
    let bow = game_data.units.includes("archer") ? $("#inputBow").val().split(",") : null;
    troopArray.push(spear, sword, bow);
    let paketText = createPaketString(troopArray)
    let text = `[b]SD Tabelle Paketsystem[/b]

[table]
[**]ID[||]Dorfkoordinaten[||]Massenutlink[||]angefordert[||]noch benötigt [||]Spieler[||]Bemerkung[/**]
[/table]

[b]1 Paket =[/b]
${paketText}

[spoiler=Erklärung Paketsystem]Zur Vereinfachung des Standdeffschickens wird ein Paketsystem verwendet.
 -regt zum Splitten an
 -einheitliche Bunker und keine komischen Ausrutscher
 -Rechnung innerhalb des Skriptes einfacher :)
 -das Pflegen der Tabelle wäre auch ohne Skript einfacher

Empfohlen wird die Verwendung des [url=https://forum.die-staemme.de/index.php?pages/userscripts/]DS-UI erweitern[/url] Userscriptes, da dieses unter Massenunterstützen(zu finden im Versammlungsplatz) die Dörfer, aus denen geschickt wird, anzeigt.
[spoiler=bspBild][img]https://i.imgur.com/s9jSCET.png[/img][/spoiler]
Diese beispielhaften "74" können dann einfach zusammen mit der ID des Zieldorfes (aus der SD Tabelle) ins Forum geschrieben werden.
((Alternativ kann man natürlich auch drauf achten wie viele Dörfer sich in der SD Splits Gruppe befinden oder aber nach dem Abschicken schauen wie viele UTs von einem auf das Zieldorf laufen (Befehle von anderen über die Befehlsteilung ausblenden empfohlen)))
Wie das genau im Forum aussehen kann/soll ist in der "Erklärung SD Skript" zu finden :)
[/spoiler]

[spoiler=Erklärung SD Skript]
Im folgenden wird die Funktionalität des Standeffskriptes erläutert. Hierbei ist es wichtig, dass bestimmte relativ einfache Richtlinien beachtet werden.
Diese teilen sich, für normale User in "Bunker anfordern" und "Bunkeranfragen abarbeiten" auf.
[b]Jedoch ist jede Bearbeitung oder Anfrage in eine neue Zeile zu schreiben.[/b]
Für die Moderatoren des Internen Forums ist eine Anleitung zur Bedienung des Skriptes im Spoiler zu finden.

[b]Bunker anfordern:[/b]
Beim Anfragen eines Bunkers ist es wichtig, dass ein bestimmtes Format eingehalten wird.
Am Anfang die Koordinate.
Dann ein Leerzeichen entfernt die Größe des Bunkers in Paketen
Dann den Spielernamen in "" (Name ist optional)
Am Ende einen optionalen Kommentar

[b]Beispiele:[/b]
[code]567|123 200"TheHebel97"ohne den Bunker front rip
897|123 2"-EDM"2 Pakete für Bruder Marwin
234|123 444 "alt_f4 " mauer_f4
345|123 1 "Antimacht"
345|123 1""[/code]

[b]Bunkeranfragen abarbeiten:[/b]
Das Wichtige beim Abarbeiten ist, dass pro Zeile 2 voneinander getrennten Zahlen zu finden sind.
Die erste Zahl steht hierbei für die ID der Anfrage. (von Anfragen die bereits in der Tabelle sind)
Die zweite Zahl steht hierbei für die Anzahl der geschickten Pakete.
Statt der zweiten Zahl kann auch done geschrieben werden. Was den Bunker als fertig einträgt.

[u]Wichtig: keine Koordinaten beim Abarbeiten von Anfragen verwenden![/u]

[b]Beispiele:[/b]
[code]id5 20
2 20
1 70Pakete
1abcdefg20
1 done[/code]

[spoiler=Erklärung Moderation]
Ablauf der Aktualisierung:
 -Bearbeiten im Post der Tabelle drücken
 -Update SD Tabelle drücken
 -Senden drücken
 -Beiträge Löschen drücken (alle Posts sollten angehakt sein)
 -Bestätigen
 -Fertig :)

[/spoiler]
[/spoiler]

`

    $("#message").val(text);
}

