import {getDataFromLocalStorage, storeDataInLocalStorage} from "./helper-functions";
import {isUserForumMod} from "./tw-helper";

export function setupScriptUI(this: any, currentScriptContext: string) {
    if (currentScriptContext === "place") {
        console.log("standdeff-organizer loaded in place");
    } else if (currentScriptContext === "forum-view_thread") {
        console.log("standdeff-organizer loaded in view_thread");

        const urlParams = new URLSearchParams(window.location.search);

        const currentThreadId: string | null = urlParams.get('thread_id');


//sd tabellen thread ids aus dem localstorage auslesen
        if (getDataFromLocalStorage("newThread")) {
            console.log("new thread data found")
            storeDataInLocalStorage(false, "newThread")
            const edit_post_id = $(".post > a").attr("name")
            if (edit_post_id !== undefined) {
                addThreadIdToLocalStorage(currentThreadId, edit_post_id);
                console.log(getDataFromLocalStorage("threadIds"))
            } else {
                console.error("edit_post_id is undefined")
            }


        } else {
            console.log("no new thread data found")
        }
        //check if there is a thread id in the local storage
        let threadIds: { [key: string]: string } = getDataFromLocalStorage("threadIds");
        console.log(threadIds)
        if (threadIds !== undefined && currentThreadId !== null) {
            console.log("thread ids found")
            if (threadIds.hasOwnProperty(currentThreadId)) {
                //visuell anzeigen, dass es sich um die sd tabelle handelt
                const sdTableTitle = `<span style="color: #002bff; font-size: x-small"> (SD Tabelle)</span>`
                $(".clearfix > table").first().find("h2").append(sdTableTitle)
                console.log("thread id is in sd thread ids")
                const edit_post_id: string | null = urlParams.get('edit_post_id');
                if (edit_post_id === threadIds[currentThreadId]) {
                    //
                    //
                    //
                    //todo: hier eigentliches skript
                    console.log("bearbeitenmodus")

                    return;
                }
                console.log("tabellenmodus")
                const writingNewPost:boolean = urlParams.get('answer') === "true";
                if (writingNewPost) {
                    console.log("writing new post")
                    return;
                }
                console.log("bearbeitung der tabelle")

            } else {
                console.log("thread id is not in thread ids")
                //button zum hinzufügen der thread id anheften
                const addThreadELem = `<img class="addThread" style="cursor: pointer" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMESURBVDhPrZVpSFRRFMf/740zo+hgmjpODqNpmYWQwZgLZIL5oYxwiyJoFcJoozIjIsoPQYQgWYQ1TSAaKbmippKFpZaS5kZaUoimuGaoM46z9+71OSYaqPT78t4957z/vefcw3kMOHTTQ9bmkidoKs6CZmKImFaMk6sMIXHJUMaehoNExjBErPDOKXxvrITX1mB4bQniQxcwGk0QCu341WIGv7VhsPsTNoXuRcKNZ2DqctKsb9S3EJWUhpD4JD5sdTQVqTGvwaTHy6zOUjmOpxfz7rWRnRKHyZEBsKRmy6W5WogG0VpUGL3egO6vPZia0oBhGLi5ucDHWwF7ezF6e/sxMjpG60lgWQYyTynk8g0Qi0XURrAJErH39R+hUudifHwCApZFQMBmXL6YzH0kQ5YqG7XvPsDBwZ5eEMuw8Pf3Q0L8fuxU7uBVuI34J4aHR3D3XiaOHklEVXkeql/l02AniSP12wkEOHHsEAry1aipKkB56XN4eLgh8+FTtLZ1YnbWQONsgiaTGa6uLpxDz6Vl5FJiERkRDne39XzEYkQiIVKvnIPvRgWaW9qh0f0lSOqykXMEbQ9EYUkFyiqq0dXdA51ulgb9Czs7AYKVQTCZTdBotdRmOyE50fXUC0iIjUFxaSUy7j/G29p6TE9r+IjlsVoBrWYGFvLCQQX1et3cghM9mHgAL3KyEB0VgcwHKnxu7aTlWA6LxYrR0XFIpe4QCwXUZjuhVjuDXxO/bfWL2RcNF9d16P85AN3s0tQtFgvaO76grqERfn4+cHSYax3aNgbNJN2JpOjJ7SaRSDA2Ng6z2QyZTAqxSERT6+sbQGNjM5ydnWE0GZGT+xK7d4XT2jd0lC0IEry95RjiWqewqBwGo4HrQwHOnjmJsBAlbVyFwgvVr2vR0tpO40VCEa5dPY+wUCW98XmY25GwbttzGLGX0nnT2ijJSEFXTR5YMs8mB3/w5rVDNIgWS4YjmWc1qjTetXoqH92kGkRryYD18A20tdFKICdbNGCJ8f/9AmTMH8N0QjyBbMOkAAAAAElFTkSuQmCC"/>`

                $(".thread_answer").parent().parent().append(addThreadELem)
                $(".addThread").on("click", function () {
                    const edit_post_id = $(".post > a").attr("name")
                    if (edit_post_id !== undefined) {
                        addThreadIdToLocalStorage(currentThreadId, edit_post_id);
                        console.log(getDataFromLocalStorage("threadIds"))
                        $(".addThread").remove()
                        $("#tooltip").css({
                            "display": "none",
                        })
                        const sdTableTitle = `<span style="color: #002bff; font-size: x-small"> (SD Tabelle)</span>`
                        $(".clearfix > table").first().find("h2").append(sdTableTitle)
                    } else {
                        console.error("edit_post_id is undefined")
                    }

                });
                $(".addThread").on("mousemove", function (event) {
                    //get mouse position
                    let x = event.clientX;
                    let y = event.clientY;

                    //position des tooltips
                    $("#tooltip").css({
                        "top": `${y + 15}px`,
                        "left": `${x + 12}px`,
                        "right": "auto",
                        "display": "",
                    }).addClass("tooltip-style");
                    $("#tooltip > h3").text("SD Tabelle hinzufügen")
                });
                $(".addThread").on("mouseout", function () {
                    $("#tooltip").css({
                        "display": "none",
                    })
                });
            }
        } else {
            console.log("no thread ids found")

            const popupBox = `
                    <div class="popup_box_container" id="dbInfo_popup_box">
                        <div class='popup_box show'>
                            <a class='popup_box_close tooltip-delayed' href='#' onclick='$(\"#dbInfo_popup_box\").remove()'>&nbsp</a>
                            <div class='popup_box_content'>
                              <div class='center'>
                                <h2>Handelt es sich bei dem Thread um die Sd Tabelle?</h2>
                                <input id="safeThreadAsSd" type="button" value="Ja, bitte abspeichern" class="btn" style="margin-top: 5px;">
                              </div>
                            </div>
                        </div>
                        <div class='fader'></div>
                    </div>
    `
            $('#ds_body')[0].insertAdjacentHTML('beforeend', popupBox)
            $("#safeThreadAsSd").on("click", function () {
                const edit_post_id = $(".post > a").attr("name")
                if (edit_post_id !== undefined) {
                    addThreadIdToLocalStorage(currentThreadId, edit_post_id);
                    console.log(getDataFromLocalStorage("threadIds"))
                    $("#dbInfo_popup_box").remove()
                } else {
                    console.error("edit_post_id is undefined")
                }

            });
        }
        // if (isUserForumMod()) {
        //     console.log("user is forum mod");
        // }


    } else if (currentScriptContext === "forum-new_thread-null") {
        console.log("standdeff-organizer loaded in new_thread");
        storeDataInLocalStorage(false, "newThread")
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
            //++$("input[name=send]").on("click", function () {


        }

//else nothing

    }
    /*let test = {"test": 1};
    console.log(typeof test);

    storeDataInLocalStorage(test, "test1")
    window.addEventListener('storage', (event) => {
        // Prüfen Sie den Schlüssel, der geändert wurde
        if (event.key === 'test1') {
            // Führen Sie Ihre Aktion aus
            console.log('Der Wert von "meinSchlüssel" hat sich geändert!');
        }
    });
    setTimeout(() => {
        test = {"test": 2};
        storeDataInLocalStorage(test, "test1")
        console.log(getDataFromLocalStorage("test1"))
    }, 2000);


*/

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


function addThreadIdToLocalStorage(currentThreadId: string | null, postId: string | null) {
    let threadIds: { [key: string]: string } | undefined = getDataFromLocalStorage("threadIds");
    if (threadIds !== undefined && currentThreadId !== null && postId !== null) {
        if (!threadIds.hasOwnProperty(currentThreadId)) {
            threadIds[currentThreadId] = postId;
            storeDataInLocalStorage(threadIds, "threadIds")
            return;
        } else {
            console.error("thread id is already in thread ids")
            return;
        }

    } else {
        if (threadIds === undefined) {
            console.error("thread ids are undefined")
        }
        if (currentThreadId === null) {
            console.error("current thread id is null")
        }
        if (postId === null) {
            console.error("post id is null")
        }
        return;
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
    $(".clearfix > form > input[value=Senden]").on("click", function () {
        storeDataInLocalStorage(true, "newThread")
    });
    let text = `[b]SD Tabelle Paketsystem[/b]

[table]
[**]ID[||]Dorfkoordinaten[||][color=#001c83]Massenutlink[/color][||]angefordert[||][color=#8d0100]noch benötigt[/color] [||]Spieler[||]Bemerkung[/**]
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

