import {keepOrganizerInViewport} from "./components/organizer-style";
import {isUserForumMod} from "../helpers/tw-helper";
import {LocalStorageHelper} from "../helpers/local-storage-helper";
import {Log} from "../helpers/logging-helper";
import {PageContext} from "../helpers/script-context";
import {addForumQuickSettings} from "./components/forum-quick-settings";

const log = Log.scope("new-thread");

export function createNewTable(pageContext: PageContext) {
    const localStorageService = LocalStorageHelper.getInstance();
    log.info("Initializing new-thread controller", {href: pageContext.href});
    sessionStorage.removeItem("sd-created-title");
    addForumQuickSettings();

    if (!isUserForumMod()) return;
    const $panel = $("#sd-forum-quick-settings");
    $panel.css("width", "330px").find(".sd-organizer-body").empty().append(`
      <div style="font-weight:bold">Neue SD-Tabelle</div>
      <p>Infanterie eingeben: Speer, Schwert und gegebenenfalls Bogen werden gleich skaliert. Späher: 5 %.</p>
      <div class="inputCollection"></div>
      <input type="button" class="btn" id="newPaketLine" value="Weiteres Paket" style="margin:10px 0">
      <input type="button" class="btn" id="setupTable" value="SD Tabelle generieren">
      <p id="sd-generator-error" class="sd-organizer-error" role="alert"></p>`);
    const addRow = () => {
        const units = [{unit:'spear', name:'Speer', field:'inputSpear'}, {unit:'sword', name:'Schwert', field:'inputSword'},
            ...(game_data.units.includes('archer') ? [{unit:'archer', name:'Bogen', field:'inputBow'}] : []),
            {unit:'spy', name:'Späher', field:'inputSpy'}];
        const $row = $('<div class="sd-package-row">');
        units.forEach(({unit,name,field}) => $row.append(`<label><img src="/graphic/unit/unit_${unit}@2x.png" alt="${name}" title="${name}"><input type="number" min="0" step="1" class="${field}" aria-label="${name}"></label>`));
        $panel.find('.inputCollection').append($row);
    };
    addRow();
    keepOrganizerInViewport($panel);
    $panel.off('.sdGenerator').on('click.sdGenerator', '#newPaketLine', addRow)
      .on('click.sdGenerator', '.sd-package-row input', function () { if ($(this).val() !== '') $(this).val(''); })
      .on('input.sdGenerator', '.inputSpear,.inputSword,.inputBow', function () {
          if ($(this).val() === '') return;
          const amount = Number($(this).val());
          if (!Number.isSafeInteger(amount) || amount < 0) return;
          const $row = $(this).closest('.sd-package-row');
          $row.find('.inputSpear,.inputSword,.inputBow').val(amount);
          $row.find('.inputSpy').val(Math.round(amount * 0.05));
      }).on('click.sdGenerator', '#setupTable', newThread);
    const $form = $('#message').closest('form');
    $form.off('submit.sdGenerator').on('submit.sdGenerator', function (event) {
        if (String($form.find('input[name=subject]').val() ?? '').trim().length < 3) {
            event.preventDefault();
            $('#sd-generator-error').text('Bitte einen Titel mit mindestens 3 Zeichen eingeben.');
            $form.find('input[name=subject]').trigger('focus');
        }
    });
}


function newThread() {
    const localStorageService = LocalStorageHelper.getInstance();
    const $inputs = $('#sd-forum-quick-settings .sd-package-row input');
    if ($inputs.toArray().some(input => { const raw = String($(input).val() ?? ''); return raw !== '' && (!Number.isSafeInteger(Number(raw)) || Number(raw) < 0); })) {
        $('#sd-generator-error').text('Truppenzahlen müssen ganze, nicht negative Zahlen sein.');
        return;
    }
    $('#sd-generator-error').empty();
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
    log.info("Generated package configuration for new SD thread", {
        packageCount: troopArray.length,
        usedDefaultValues: allInputsEmpty,
        includesArchers: game_data.units.includes("archer")
    });
    $("#message").closest("form").off("submit.sdCreated").on("submit.sdCreated", function () {
        localStorageService.setNewThread = true;
        sessionStorage.setItem('sd-created-title', String($('input[name=subject]').val() ?? '').trim());
        const knownIds=$('a[href*="thread_id="]').map((_,a)=>new URL(a.getAttribute('href')!,location.href).searchParams.get('thread_id')).get();
        sessionStorage.setItem('sd-created-existing',JSON.stringify(knownIds));
        log.info("Marked next forum view as freshly created SD thread");

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
567|123 200 "TheHebel97"ohne den Bunker front rip""
897|123 2 "-EDM"2 Pakete für Bruder Marwin""
234|123 444 "alt_f4 " mauer_f4""
432|848 222 "Manu|RWE"""
345|123 1 "Andimacht"""
345|123 1 """"
  [/code]
[b]Bearbeiten:[/b]
 [code] id5 20
  2 20
  1 70Pakete
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
[spoiler=postCache]
[/spoiler]
[/spoiler]

`

    $("#message").val(text);
    log.info("Inserted generated SD thread template into message textarea", {
        messageLength: text.length
    });
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
