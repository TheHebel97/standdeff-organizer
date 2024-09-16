import {isUserForumMod} from "../logic/helpers/tw-helper";
import {LocalStorageService} from "../logic/local-storage-service";

export function createNewTable() {
    const localStorageService = LocalStorageService.getInstance();
    console.log("standdeff-organizer loaded in new_thread");
    localStorageService.setNewThread = false;

    $(".clearfix > form > input[value=Senden]").on("mouseenter", function () {
        // @ts-ignore
        if ($("input[name=subject]").val().length < 3) {
            $(".clearfix > form > input[value=Senden]").attr("disabled", "true")
        }
    });
   $(".clearfix > form > input[value=Senden]").on("mouseleave", function () {
    $(".clearfix > form > input[value=Senden]").removeAttr("disabled");
});


    //debugger;
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
        $("#setupTable").on("click", newThread)
        //++$("input[name=send]").on("click", function () {


    }

}

function newThread() {
    const localStorageService = LocalStorageService.getInstance();
    let troopArray = [];
    // @ts-ignore
    let spear = $("#inputSpear").val().split(",")
    // @ts-ignore
    let sword = $("#inputSword").val().split(",")
    // @ts-ignore
    let bow = game_data.units.includes("archer") ? $("#inputBow").val().split(",") : null;
    troopArray.push(spear, sword, bow);
    let paketText = createPaketString(troopArray)
    $(".clearfix > form > input[value=Senden]").on("click", function () {
        localStorageService.setNewThread = true;

    });
    let text = `[b]SD Tabelle Paketsystem[/b]

[table]
[**]ID[||]Dorfkoordinaten[||]angefordert[||][color=#8d0100]noch benötigt[/color] [||]Spieler[||]Bemerkung[||]ab[||]bis[||][color=#001c83]Massen UT-Link[/color][/**]
[/table]

[b]1 Paket =[/b]
${paketText}

[spoiler=Erklärung Paketsystem]Zur Vereinfachung des Standdeffschickens wird ein Paketsystem verwendet.
- regt zum Splitten an
- einheitliche Bunker und keine komischen Ausrutscher
- Rechnung innerhalb des Skriptes einfacher :)
- das Pflegen der Tabelle wäre auch ohne Skript einfacher

Ein Paket besteht aus !einer! festen (hoffentlich sinnvollen @loserSfs: keine skav in sd splits) Anzahl an Einheiten. 
Dadruch entstehen im Stamm einheitliche Bunker und keine komischen Ausrutscher. Durch diese Art des Deffens können Verluste aufgeteilt und schneller nachgebaut werden.
[/spoiler]

[spoiler=Erklärung SD Skript]
Das SD Skript besteht seit dem Update aus mehreren Bereichen:
- Spieloptionen ganz unten -> Settings: Hier können die Einstellungen für das Skript vorgenommen werden
- Massenunterstützung: Hierüber wird die Deff verschickt und das Skript (wenn eingeschaltet) trackt wieviele Einheiten benötigt werden und im Anschluss geschickt wurde.
- SD Tabelle: Die Sd Tabelle ist die Übersicht, welche Auskunft über die Deffanfragen gibt. Es ist bei jedem Nutzer einzustellen in welchem Forum sich die SD Tabelle befindet. Dies kann über einen Button oder über ein Popup vermerkt werden.
- Bearbeiten und Erstellen von Posts: 
  ->über den Button "Bunker Anfragen" wird eine neue Anfrage erstellt. Diese wird innerhalb einem UI bearbeitet.
  ->über den Button "Bearbeitung eintragen" werden die bisher bearbeiteten Anfragen in das Nachrichtenfenster eingetragen.


Handling ohne das Skript: (wieso auch immer)
[b]Beispiele: [/b]
- anfordern:
[code]
567|123 200"TheHebel97"ohne den Bunker front rip""
897|123 2"-EDM"2 Pakete für Bruder Marwin""
234|123 444 "alt_f4 " mauer_f4""
345|123 1 "ma.exe"""
345|123 1""""
  [/code]
- bearbeiten:
 [code] id5 20
  2 20
  1 70Pakete
  1abcdefg20
  1 done
  [/code]


[spoiler=Wissenswertes für SFs]
Moin SFs:
- postCache Spoiler ignorieren und nicht bearbeiten
- nun muss jeder im Stamm das entsprechende Skript installieren um von den Neuerungen zu profitieren (gl beim einrichten xD)
- das automatische Ausfüllen innerhalb Massenut muss in den Settings explizit aktiviert werden
- Gruppen werden beim erstmaligen Öffnen von Massen UT eingelesen, im Anschluss daran kann in den Settings ausgewählt werden, was die SD Gruppe ist
- für die normalen Nutzer ist das Textfeld blockiert, dies kann durch einen Doppelklick entfernt werden. Das dient dazu, dass die Sd posts clean bleiben. Sozialer Overhead in der SD Tabelle ist nicht erwünscht.

[/spoiler]
[spoiler=postCache]
[/spoiler]
[/spoiler]

`

    $("#message").val(text);
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

function swapConfgDisplay() {
    let element = $(".configs");
    if (element.css("display") === "none") {
        element.css("display", "block")
    } else {
        element.css("display", "none")
    }
}

