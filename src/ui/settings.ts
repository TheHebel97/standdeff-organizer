import {groupData, sdSettings, sdThreadData} from "../types/types";
import {
    getDataFromLocalStorage,
    getSetting,
    saveSetting,
    storeDataInLocalStorage
} from "../logic/helpers/helper-functions";

export function displaySettings() {
    console.log("standdeff-organizer loaded in settings");
    let sdSettings: sdSettings = getSetting()
    const colorRed = "#8d0100";
    const colorGreen = "#0e7a0e";
    const settingsHtml = `<table class="vis settings" width="100%" style="margin-top: 15px">
  <tbody>
  <tr>
    <th colspan="4" style="text-align: center">
      <img class="addThread" style="cursor: pointer"
           src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMESURBVDhPrZVpSFRRFMf/740zo+hgmjpODqNpmYWQwZgLZIL5oYxwiyJoFcJoozIjIsoPQYQgWYQ1TSAaKbmippKFpZaS5kZaUoimuGaoM46z9+71OSYaqPT78t4957z/vefcw3kMOHTTQ9bmkidoKs6CZmKImFaMk6sMIXHJUMaehoNExjBErPDOKXxvrITX1mB4bQniQxcwGk0QCu341WIGv7VhsPsTNoXuRcKNZ2DqctKsb9S3EJWUhpD4JD5sdTQVqTGvwaTHy6zOUjmOpxfz7rWRnRKHyZEBsKRmy6W5WogG0VpUGL3egO6vPZia0oBhGLi5ucDHWwF7ezF6e/sxMjpG60lgWQYyTynk8g0Qi0XURrAJErH39R+hUudifHwCApZFQMBmXL6YzH0kQ5YqG7XvPsDBwZ5eEMuw8Pf3Q0L8fuxU7uBVuI34J4aHR3D3XiaOHklEVXkeql/l02AniSP12wkEOHHsEAry1aipKkB56XN4eLgh8+FTtLZ1YnbWQONsgiaTGa6uLpxDz6Vl5FJiERkRDne39XzEYkQiIVKvnIPvRgWaW9qh0f0lSOqykXMEbQ9EYUkFyiqq0dXdA51ulgb9Czs7AYKVQTCZTdBotdRmOyE50fXUC0iIjUFxaSUy7j/G29p6TE9r+IjlsVoBrWYGFvLCQQX1et3cghM9mHgAL3KyEB0VgcwHKnxu7aTlWA6LxYrR0XFIpe4QCwXUZjuhVjuDXxO/bfWL2RcNF9d16P85AN3s0tQtFgvaO76grqERfn4+cHSYax3aNgbNJN2JpOjJ7SaRSDA2Ng6z2QyZTAqxSERT6+sbQGNjM5ydnWE0GZGT+xK7d4XT2jd0lC0IEry95RjiWqewqBwGo4HrQwHOnjmJsBAlbVyFwgvVr2vR0tpO40VCEa5dPY+wUCW98XmY25GwbttzGLGX0nnT2ijJSEFXTR5YMs8mB3/w5rVDNIgWS4YjmWc1qjTetXoqH92kGkRryYD18A20tdFKICdbNGCJ8f/9AmTMH8N0QjyBbMOkAAAAAElFTkSuQmCC"/>
      SD-Tabellen-Skript-Einstellungen
      <img class="addThread" style="cursor: pointer"
           src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMESURBVDhPrZVpSFRRFMf/740zo+hgmjpODqNpmYWQwZgLZIL5oYxwiyJoFcJoozIjIsoPQYQgWYQ1TSAaKbmippKFpZaS5kZaUoimuGaoM46z9+71OSYaqPT78t4957z/vefcw3kMOHTTQ9bmkidoKs6CZmKImFaMk6sMIXHJUMaehoNExjBErPDOKXxvrITX1mB4bQniQxcwGk0QCu341WIGv7VhsPsTNoXuRcKNZ2DqctKsb9S3EJWUhpD4JD5sdTQVqTGvwaTHy6zOUjmOpxfz7rWRnRKHyZEBsKRmy6W5WogG0VpUGL3egO6vPZia0oBhGLi5ucDHWwF7ezF6e/sxMjpG60lgWQYyTynk8g0Qi0XURrAJErH39R+hUudifHwCApZFQMBmXL6YzH0kQ5YqG7XvPsDBwZ5eEMuw8Pf3Q0L8fuxU7uBVuI34J4aHR3D3XiaOHklEVXkeql/l02AniSP12wkEOHHsEAry1aipKkB56XN4eLgh8+FTtLZ1YnbWQONsgiaTGa6uLpxDz6Vl5FJiERkRDne39XzEYkQiIVKvnIPvRgWaW9qh0f0lSOqykXMEbQ9EYUkFyiqq0dXdA51ulgb9Czs7AYKVQTCZTdBotdRmOyE50fXUC0iIjUFxaSUy7j/G29p6TE9r+IjlsVoBrWYGFvLCQQX1et3cghM9mHgAL3KyEB0VgcwHKnxu7aTlWA6LxYrR0XFIpe4QCwXUZjuhVjuDXxO/bfWL2RcNF9d16P85AN3s0tQtFgvaO76grqERfn4+cHSYax3aNgbNJN2JpOjJ7SaRSDA2Ng6z2QyZTAqxSERT6+sbQGNjM5ydnWE0GZGT+xK7d4XT2jd0lC0IEry95RjiWqewqBwGo4HrQwHOnjmJsBAlbVyFwgvVr2vR0tpO40VCEa5dPY+wUCW98XmY25GwbttzGLGX0nnT2ijJSEFXTR5YMs8mB3/w5rVDNIgWS4YjmWc1qjTetXoqH92kGkRryYD18A20tdFKICdbNGCJ8f/9AmTMH8N0QjyBbMOkAAAAAElFTkSuQmCC"/>
    </th>
  </tr>
  <tr>
    <td width="40%">
      <table class="vis settings">
        <tbody>
        <tr>
          <td>
            Popup beim ersten Start:
          </td>
          <td>
            <input class="btn btn-confirm-no" type="button" value="An" id="first-start-popup" style="width:75px; background-color: #8d0100; color: #ffffff !important;"/>
          </td>
        </tr>
        <tr>
          <td>
            Massen-UT vereinfachen:
          </td>
          <td>
            <input class="btn btn-confirm-no"  type="button" value="Aus" id="automate-massen-ut" style="width:75px;  background-color: #8d0100;color: #ffffff "/>
          </td>

        </tr>
        <tr>
          <td>
            SD verschicken Gruppen ID:
          </td>
          <td>
            <input type="number" value="0" id="sd-group-id" style="width:68px;  background-color: #8d0100; color: #ffffff"/>
          </td>

        </tr>
        </tbody>
      </table>

    </td>
    <td width="50%">
      <table class="vis settings" width="100%">
        <tbody id="activeSdThreads">
        <tr>
          <th width="85%">
            Forenname
          </th>
          <th> Löschen
          </th>
        </tr>
        </tbody>
      </table>
    </td>
  </tr>

</table>`;

    $("#dialog-sync").parent().append(settingsHtml);
    //setzen des ui je nach settings:
    if (sdSettings.firstStartPopup) {
        $("#first-start-popup").val("An");
        $("#first-start-popup").css("background", "#0e7a0e");
    } else {
        $("#first-start-popup").val("Aus");
        $("#first-start-popup").css("background", "#8d0100");
    }

    if (sdSettings.automateMassenUt) {
        $("#automate-massen-ut").val("An");
        $("#automate-massen-ut").css("background", "#0e7a0e");

    } else {
        $("#automate-massen-ut").val("Aus");
        $("#automate-massen-ut").css("background", "#8d0100");
    }

    // Laden der Gruppendaten aus dem lokalen Speicher
    let groupData: groupData[] = getDataFromLocalStorage("groupData");
    console.log("groupData: ", groupData);

// Überprüfen, ob Gruppendaten vorhanden sind
    if (groupData) {
        // Erstellen eines Dropdown-Menüs mit den Gruppendaten
        let dropdown = '<select id="sd-group-id" style="width:150px; background-color: #8d0100; color: #ffffff; border: none; padding: 5px 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">';
        groupData.forEach(group => {
            dropdown += `<option value="${group.id}">${group.name}</option>`;
        });
        dropdown += '</select>';

        // Ersetzen des Texteingabefelds durch das Dropdown-Menü
        $("#sd-group-id").replaceWith(dropdown);

        if(sdSettings.sdGroupId !== "0"){
            $("#sd-group-id").val(sdSettings.sdGroupId);
            $("#sd-group-id").css("background", "#0e7a0e");
        }
    }


    // Laden der Thread-IDs aus dem lokalen Speicher
    let threadIds: sdThreadData[] = getDataFromLocalStorage("threadIds");

// Extrahieren des Basis-URL-Teils aus der aktuellen URL
    let baseUrl = window.location.origin + window.location.pathname;

// Überprüfen, ob Thread-IDs vorhanden sind
    if (threadIds) {
        // Durchlaufen jeder Thread-ID
        threadIds.forEach(threadData => {
            // Erstellen des vollständigen Links für den Thread
            let threadLink = `${baseUrl}?village=3130&screen=forum&screenmode=view_thread&forum_id=${threadData.forumId}&thread_id=${threadData.threadId}`;

            // Erstellen einer neuen Tabellenzeile für den Thread
            let row = `<tr>
            <td>
                <span style="font-size: larger; font-weight: bold">${threadData.forumName}</span> -
                <a href="${threadLink}">
                    ${threadData.threadName}
                </a>
            </td>
            <td style="text-align: center;"><button style="background: url(https://dsde.innogamescdn.com/asset/c045337f/graphic/delete.png); width: 20px; height: 20px;  border: none" class="delete-thread" data-thread-id="${threadData.threadId}"></button></td>
        </tr>`;

            // Hinzufügen der Tabellenzeile zum tbody-Element
            $("#activeSdThreads").append(row);
        });
    }

    //setzen der listener

    // Event-Listener für die Löschen-Buttons hinzufügen
    $(".delete-thread").on("click", function() {
        // Thread-ID des zu löschenden Threads abrufen
        let threadIdToDelete = $(this).data("thread-id");

        // Thread-IDs aus dem LocalStorage abrufen
        let threadIds: sdThreadData[] = getDataFromLocalStorage("threadIds");

        // Den zu löschenden Thread aus den Thread-IDs entfernen
        threadIds = threadIds.filter(threadData => threadData.threadId !== threadIdToDelete);

        // Die aktualisierten Thread-IDs im LocalStorage speichern
        storeDataInLocalStorage(threadIds, "threadIds");

        // Die Tabellenzeile des gelöschten Threads entfernen
        $(this).parent().parent().remove();
    });



    $("#first-start-popup").on("click", function () {
        const value = $(this).val();

        if (value === "An") {
            $(this).val("Aus");
            $("#first-start-popup").css("background", "#8d0100");
            sdSettings.firstStartPopup = false;

        } else {
            $(this).val("An");
            $("#first-start-popup").css("background", "#0e7a0e");
            sdSettings.firstStartPopup = true;
        }
        saveSetting(sdSettings);
    });

    $("#automate-massen-ut").on("click", function () {
        const value = $(this).val();

        if (value === "An") {
            $(this).val("Aus");
            $("#automate-massen-ut").css("background", "#8d0100");
            sdSettings.automateMassenUt = false;

        } else {
            $(this).val("An");
            $("#automate-massen-ut").css("background", "#0e7a0e");
            sdSettings.automateMassenUt = true;
        }
        saveSetting(sdSettings);
    });

    $("#sd-group-id").on("change", function () {
        if ($(this).val() !== "0") {
            sdSettings.sdGroupId = String($(this).val());
            $(this).css("background", "#0e7a0e");
            saveSetting(sdSettings);
            return;
        }
        sdSettings.sdGroupId = "0";
        $(this).css("background", "#8d0100");
        saveSetting(sdSettings);
    });
}
