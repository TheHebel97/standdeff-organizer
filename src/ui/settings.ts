import {groupData, templateData, Threads} from "../types/types";
import {LocalStorageHelper} from "../helpers/local-storage-helper";
import {Log} from "../helpers/logging-helper";

const localStorageService = LocalStorageHelper.getInstance();


export function displaySettings() {
    Log.info("standdeff-organizer loaded in settings");

    let unitDropDownOptions: string = '<option value="default"></option>';
    game_data.units.forEach(unit => {
        unitDropDownOptions += `<option value="${unit}">${unit}</option>`;
    })

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
            verhindere doppeltes Schicken:
          </td>
          <td>
            <input class="btn btn-confirm-no"  type="button" value="An" id="prevent-duplicate-destination" style="width:75px;  background-color: #8d0100;color: #ffffff "/>
          </td>

        </tr>
        <tr>
            <td>
                sortieren nach:
            </td>
            <td>
                <select id="sd-sort-by" style="width:150px; background-color: #8d0100; color: #ffffff; border: none; padding: 5px 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">` + unitDropDownOptions + `</select>
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
        <tr>
          <td>
            SD Vorlagen ID:
          </td>
          <td>
            <input type="number" value="0" id="sd-template-id" style="width:68px;  background-color: #8d0100; color: #ffffff"/>
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

    $("#content_value > table > tbody > tr > td:nth-child(2)").append(settingsHtml);
    //colorize the buttons depending on the value of the setting
    if (localStorageService.getFirstStartPopup) {
        $("#first-start-popup").val("An").css("background", "#0e7a0e");
    } else {
        $("#first-start-popup").val("Aus").css("background", "#8d0100");
    }

    if (localStorageService.getAutomateMassenUt) {
        $("#automate-massen-ut").val("An").css("background", "#0e7a0e");

    } else {
        $("#automate-massen-ut").val("Aus").css("background", "#8d0100");
    }

    if (localStorageService.getPreventDuplicateDestination) {
        $("#prevent-duplicate-destination").val("An").css("background", "#0e7a0e");
    } else {
        $("#prevent-duplicate-destination").val("Aus").css("background", "#8d0100");
    }

    if (localStorageService.getSortBy !== "default") {
        $("#sd-sort-by").val(localStorageService.getSortBy).css("background", "#0e7a0e");
    } else {
        $("#sd-sort-by").val("default").css("background", "#8d0100");
    }

    // get group data from local storage
    let groupData: groupData[] = localStorageService.getGroupData;
    Log.info("groupData: ", groupData);
    let templateData: templateData[] = localStorageService.getTemplateData;

    if (groupData.length > 0) {
        let dropdown = '<select id="sd-group-id" style="width:150px; background-color: #8d0100; color: #ffffff; border: none; padding: 5px 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">';
        groupData.forEach(group => {
            dropdown += `<option value="${group.id}">${group.name}</option>`;
        });
        dropdown += '</select>';

        $("#sd-group-id").replaceWith(dropdown);

        if (localStorageService.getSdGroupId !== "0") {
            $("#sd-group-id").val(localStorageService.getSdGroupId).css("background", "#0e7a0e");
        }
    }

    if (templateData.length > 0) {
        let dropdown = '<select id="sd-template-id" style="width:150px; background-color: #8d0100; color: #ffffff; border: none; padding: 5px 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">';
        dropdown += '<option value="">nicht gesetzt</option>';
        templateData.forEach(template => {
            dropdown += `<option value="${template.id}">${template.name}</option>`;
        });
        dropdown += '</select>';

        $("#sd-template-id").replaceWith(dropdown);

        if (localStorageService.getSelectedTemplate !== "") {
            $("#sd-template-id").val(localStorageService.getSelectedTemplate).css("background", "#0e7a0e");
        }
    }

    let threads: Threads = localStorageService.getAllThreads;

    let baseUrl = window.location.origin + window.location.pathname;

    if (threads) {
        Object.entries(threads).forEach(([threadId, threadData]) => {
            let threadLink = `${baseUrl}?village=3130&screen=forum&screenmode=view_thread&forum_id=${threadData.forumId}&thread_id=${threadId}`;

            let row = `<tr>
             <td>
                 <span style="font-size: larger; font-weight: bold">${threadData.forumName}</span> -
                 <a href="${threadLink}">
                     ${threadData.threadName}
                 </a>
             </td>
             <td style="text-align: center;"><button style="background: url(https://dsde.innogamescdn.com/asset/c045337f/graphic/delete.png); width: 20px; height: 20px;  border: none" class="delete-thread" data-thread-id="${threadId}"></button></td>
         </tr>`;

            $("#activeSdThreads").append(row);
        });
    }

    //listener

    $(".delete-thread").on("click", function () {
        let threadIdToDelete = $(this).data("thread-id");

        localStorageService.deleteThread(threadIdToDelete);

        $(this).parent().parent().remove();
    });


    $("#first-start-popup").on("click", function () {
        const value = $(this).val();

        if (value === "An") {
            $(this).val("Aus");
            $("#first-start-popup").css("background", "#8d0100");
            localStorageService.setFirstStartPopup = false;
        } else {
            $(this).val("An");
            $("#first-start-popup").css("background", "#0e7a0e");
            localStorageService.setFirstStartPopup = true;
        }
    });
    $("#prevent-duplicate-destination").on("click", function () {
        const value = $(this).val();

        if (value === "An") {
            $(this).val("Aus");
            $("#prevent-duplicate-destination").css("background", "#8d0100");
            localStorageService.setPreventDuplicateDestination = false;

        } else {
            $(this).val("An");
            $("#prevent-duplicate-destination").css("background", "#0e7a0e");
            localStorageService.setPreventDuplicateDestination = true;
        }
    });


    $("#automate-massen-ut").on("click", function () {
        const value = $(this).val();

        if (value === "An") {
            $(this).val("Aus");
            $("#automate-massen-ut").css("background", "#8d0100");
            localStorageService.setAutomateMassenUt = false;

        } else {
            $(this).val("An");
            $("#automate-massen-ut").css("background", "#0e7a0e");
            localStorageService.setAutomateMassenUt = true;
        }
    });

    $("#sd-group-id").on("change", function () {
        if ($(this).val() !== "0") {
            localStorageService.setSdGroupId = String($(this).val());
            $(this).css("background", "#0e7a0e");
            return;
        }
        localStorageService.setSdGroupId = "0";
        $(this).css("background", "#8d0100");
    });

    $("#sd-template-id").on("change", function () {
        if ($(this).val() !== "0") {
            localStorageService.setSelectedTemplate = String($(this).val());
            $(this).css("background", "#0e7a0e");
            return;
        }
        localStorageService.setSelectedTemplate = "0";
        $(this).css("background", "#8d0100");
    });

    $("#sd-sort-by").on("change", function () {
        if ($(this).val() !== "default") {
            localStorageService.setSortBy = String($(this).val());
            $(this).css("background", "#0e7a0e");
            return;
        }
        localStorageService.setSortBy = "default";
        $(this).css("background", "#8d0100");
    });
}
