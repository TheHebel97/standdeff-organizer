import {isUserForumMod} from "../helpers/tw-helper";
import {LocalStorageHelper} from "../helpers/local-storage-helper";
import {Log} from "../helpers/logging-helper";



export function createNewTable() {
    const localStorageService = LocalStorageHelper.getInstance();
    Log.info("standdeff-organizer loaded in new_thread");
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
        Log.info("user is forum mod");
        //html elements
        const settingsBtn = `<input type="button" style="background-image: url(https://dsde.innogamescdn.com/asset/7b986b1a/graphic//buildings/smith.png);
            background-repeat: no-repeat; width:20px;height:20px; border: none; cursor: pointer; background-color: transparent; margin-left:7px;" class="configbtn">`;
        let tbBows = game_data.units.includes("archer") ? `<img src="https://dsde.innogamescdn.com/asset/b5d78b17/graphic/unit/unit_archer@2x.png" title="Bogenschütze" alt="" class="" style="width: 15px; height: 15px">
      <input type="text" class="inputBow" style="width:70px;background-color:#EAD5AA">` : "";
        let newPaketLineButton = `<input type="button" class="btn" id="newPaketLine" style="background-image: url('https://media.innogamescdn.com/TribalWars/emoji/274e.png'); background-size: cover; width: 15px; height: 15px; border: none; cursor: pointer; transform: rotate(45deg);">`;

        let configContent = `<br><img src="https://dsde.innogamescdn.com/asset/b5d78b17/graphic/unit/unit_spear@2x.png" title="Speerträger" alt="" class="" style="width: 15px; height: 15px">
<input type="text" class="inputSpear" style="width:70px;background-color:#EAD5AA;margin-right: 10px">
<img src="https://dsde.innogamescdn.com/asset/b5d78b17/graphic/unit/unit_sword@2x.png" title="Schwertkämpfer" alt="" class="" style="width: 15px; height: 15px">
<input type="text" class="inputSword" style="width:70px;background-color:#EAD5AA;margin-right: 10px">` + tbBows + `
<img src="https://dsde.innogamescdn.com/asset/b5d78b17/graphic/unit/unit_spy@2x.png" title="Späher" alt="" class="" style="width: 15px; height: 15px">
<input type="text" class="inputSpy" style="width:70px;background-color:#EAD5AA;margin-right: 10px">` ;

        let config = `<br><div class="configs" style="display: none; width: 95%;margin-left: auto;margin-bottom: 20px;
  margin-right: auto;margin-top:15px;"><div class="inputCollection">` + configContent + newPaketLineButton + `</div>
  <br>
  <br>
  <input type="button" class="btn" id="setupTable" value="SD Tabelle generieren">
</div>`;


        //append html elements
        $(".clearfix > h2").append(settingsBtn)
        $(".clearfix > h2").append(config)
        $(".configbtn").on("click", swapConfgDisplay)
        $("#setupTable").on("click", newThread)
        $("#newPaketLine").on("click", function () {
            $(".inputCollection").append(configContent);

        });

    }

}


function newThread() {
    const localStorageService = LocalStorageHelper.getInstance();
    let troopArray = [];

// Collect values from input elements with the class 'inputSpear'
    let spear = $(".inputSpear").map(function () {
        return $(this).val();
    }).get();

// Collect values from input elements with the class 'inputSword'
    let sword = $(".inputSword").map(function () {
        return $(this).val();
    }).get();

// Collect values from input elements with the class 'inputBow' if 'archer' is included in game_data.units
    let bow = game_data.units.includes("archer") ? $(".inputBow").map(function () {
        return $(this).val();
    }).get() : null;

    let spy = $(".inputSpy").map(function () {
        return $(this).val();
    }).get();

    const allInputsEmpty = spear.every(val => val === "") && sword.every(val => val === "") && (!bow || bow.every(val => val === "")) && spy.every(val => val === "");

    // Set default values if all inputs are empty
    if (allInputsEmpty) {
        spear = spear.map(() => "100");
        sword = sword.map(() => "100");
        if (bow) {
            bow = bow.map(() => "100");
        }
        spy = spy.map(() => "5");
    }

    // Determine the maximum number of rows
    let maxRows = Math.max(spear.length, sword.length, bow ? bow.length : 0, spy.length);

    // Group values row by row
    for (let i = 0; i < maxRows; i++) {
        let row = [];
        row.push(spear[i] || "");
        row.push(sword[i] || "");
        if (bow) {
            row.push(bow[i] || "");
        }
        row.push(spy[i] || "");
        troopArray.push(row);
    }
    troopArray = troopArray.filter(row => row.some(value => value !== ""));
    let paketText = createPaketHtml(troopArray)
    $(".clearfix > form > input[value=Senden]").on("click", function () {
        localStorageService.setNewThread = true;

    });
    let text = `[b]SD Tabelle Paketsystem[/b]

[table]
[**]ID[||]Dorfkoordinaten[||]angefordert[||][color=#8d0100]noch benötigt[/color] [||]Spieler[||]Bemerkung[||]ab[||]bis[||][color=#001c83]Massen UT-Link[/color][/**]
[/table]

${paketText}

[spoiler=Erklärung Paketsystem]Zur Vereinfachung des Standdeffschickens wird ein Paketsystem verwendet.
- regt zum Splitten an
- einheitliche Bunker und keine komischen Ausrutscher
- Rechnung innerhalb des Skriptes einfacher :)
- das Pflegen der Tabelle wäre auch ohne Skript einfacher

Ein Paket besteht aus einer festen hoffentlich sinnvollen (keine skav in sd splits) Anzahl an Einheiten.
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
[b]Beispiele: 
Anfordern:[/b]
[code]
567|123 200"TheHebel97"ohne den Bunker front rip""
897|123 2"-EDM"2 Pakete für Bruder Marwin""
234|123 444 "alt_f4 " mauer_f4""
432|848 222 "Manu|RWE"""
345|123 1 "Andimacht"""
345|123 1""""
  [/code]
[b]Bearbeiten:[/b]
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
- um Filter und ähnliches in Massen Ut auszuführen, muss das Setting in den Spieleinstellungen aktiviert werden
- Gruppen werden beim erstmaligen Öffnen von Massen UT eingelesen, im Anschluss daran kann in den Settings ausgewählt werden, was die SD Gruppe ist
- für die normalen Nutzer ist das Textfeld blockiert, dies kann durch einen Doppelklick entfernt werden. Das dient dazu, dass die Sd posts clean bleiben. Sozialer Overhead in der SD Tabelle ist nicht erwünscht.
- normale Nutzer haben ebenfalls keine bearbeiten Funktionen im sd Thread, außerdem sehen diese keine posts

[/spoiler]
[spoiler=playerRanking]
[/spoiler]
[spoiler=postCache]
[/spoiler]
[/spoiler]

`

    $("#message").val(text);
}

const createPaketHtml = (troopArray: any[]) => {
    let text = "";
    troopArray.forEach((row, index) => {
        text += `[b]Paket ${index + 1}:[/b]\n`;
        text += `[unit]spear[/unit] ${row[0] || 0} `;
        text += `[unit]sword[/unit] ${row[1] || 0} `;
        if (row.length > 3) {
            text += `[unit]archer[/unit] ${row[2] || 0} `;
        }
        text += `[unit]spy[/unit] ${row[row.length - 1] || 0}\n `;
        text += `\n`;
    });
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

