import {
    convertDateToEpoch,
    convertEpochToDate
} from "../../helpers/helper-functions";
import {convertRequestArrayToMessageString} from "../../helpers/table-helper";
import {sdInquiry} from "../../types/types";
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import {Log} from "../../helpers/logging-helper";

export function showRequestPopup() {
    const localStorageService = LocalStorageHelper.getInstance();
    const urlParams = new URLSearchParams(window.location.search);
    const currentThreadId = urlParams.get("thread_id") || "";

    Log.info("show request popup");
    // requestData-Objekt aus dem LocalStorage abrufen

    const initPopopBox = `
                    <div class="popup_box_container" id="dbInfo_popup_box">
                        <div class='popup_box show'>
                            <a class='popup_box_close tooltip-delayed' href='#' onclick='$(\"#dbInfo_popup_box\").remove()'>&nbsp</a>
                            <div class='popup_box_content'>
                              <div class='center'>
                                <h2>Bunker Anfragen</h2>
                                <table class="requestContent">
                                  
                                    
                                </table>
                                <hr style="margin-top: 15px; margin-bottom: 15px">
                                <textarea class="textAreaKoords" id="textAreaKoords" style="background-color:#EAD5AA;" placeholder="Koordinaten"></textarea>
                                <input type="button" value="Bunker anfragen" class="addBunkerAnfrage btn" disabled style="float: right; margin-top: 15px">
                              </div>
                            </div>
                        </div>
                        <div class='fader'></div>
                    </div>
    `
    $('#ds_body')[0].insertAdjacentHTML('beforeend', initPopopBox)
    $("#textAreaKoords").on("focusout", function () {
        const input = getFilteredInput(String($("#textAreaKoords").val()) || "");
        Log.info(input);
        addNewRequestsToArray(input);
        renderTableRows();
    });
    renderTableRows();

    $(".addBunkerAnfrage").on("click", function () {
        let isEmpty = false;
        $(".amountInput").each(function () {
            if ($(this).val() === "") {
                $(this).css("background-color", "red");
                isEmpty = true;
                return false; // break the loop
            }
        });
        if (!isEmpty) {
            const result = convertRequestArrayToMessageString(localStorageService.getSdInquiry(currentThreadId));
            $("#message").val(result);
            $("#dbInfo_popup_box").remove();
        }

    })

}


function renderTableRows(): void {
    const localStorageService = LocalStorageHelper.getInstance();
    const urlParams = new URLSearchParams(window.location.search);
    const currentThreadId = urlParams.get("thread_id") || "";
    $(".requestContent").empty();
    let requestDataArray: sdInquiry[] = localStorageService.getSdInquiry(currentThreadId);
    let returnHtml: string = `<tr style='margin=2px;'><th style="padding-left: 10px; padding-right: 10px">Koordinate</th>
                                    <th style="padding-left: 10px; padding-right: 10px">Pakete</th>
                                    <th style="padding-left: 10px; padding-right: 10px">Spieler <span style="font-size: 0.8em;">(optional)</span></th>
                                    <th style="padding-left: 10px; padding-right: 10px">Anmerkung <span style="font-size: 0.8em;">(optional)</span></th>
                                    <th style="padding-left: 10px; padding-right: 10px">ab <span style="font-size: 0.8em;">(optional)</span></th>
                                    <th style="padding-left: 10px; padding-right: 10px">bis <span style="font-size: 0.8em;">(optional)</span></th>
                                    <th style="padding-left: 10px; padding-right: 10px">Löschen <button style="cursor:pointer; background: url(https://dsde.innogamescdn.com/asset/c045337f/graphic/delete.png); width: 20px; height: 20px;  border: none" class="deleteRequest" id="deleteAll"></button></th></tr>`;
    if (requestDataArray.length === 0) {
        $(".addBunkerAnfrage").prop("disabled", true);
    } else {
        $(".addBunkerAnfrage").prop("disabled", false);
    }

    requestDataArray.forEach((requestRow, index) => {
        Object.values(requestRow).forEach((value) => {
            if (value === undefined) {
                Log.info("value is undefined");
            }
        });
        returnHtml += `<tr style='margin=2px;'><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.coords) {
            returnHtml += `<span style="font-size: 1.2em; font-weight: bold;">${requestRow.coords}</span>`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.amount) {
            returnHtml += `<input type="number" style="background-color:#EAD5AA; border: none;" id="amountInput${index}" class="amountInput" value="${requestRow.amount}">`;
        } else {
            returnHtml += `<input type="number" style="background-color:#EAD5AA; border: none;" id="amountInput${index}" class="amountInput" value="">`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.playerName) {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="playerNameInput${index}" class="playerNameInput" value="${requestRow.playerName}">`;
        } else {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="playerNameInput${index}" class="playerNameInput" value="">`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.comment) {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="commentInput${index}" class="commentInput" value="${requestRow.comment}">`;
        } else {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="commentInput${index}" class="commentInput" value="">`;
        }

        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.dateFrom) {
            let dateFrom = convertEpochToDate(requestRow.dateFrom);
            returnHtml += `<input type="datetime-local" style="background-color:#EAD5AA; border: none;" id="dateFromInput${index}" class="dateFromInput" value="${dateFrom}">`;
        } else {
            returnHtml += `<input type="datetime-local" style="background-color:#EAD5AA; border: none;" id="dateFromInput${index}" class="dateFromInput" value="">`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.dateUntil) {
            let dateUntil = convertEpochToDate(requestRow.dateUntil);
            returnHtml += `<input type="datetime-local" style="background-color:#EAD5AA; border: none;" id="dateUntilInput${index}" class="dateUntilInput" value="${dateUntil}">`;
        } else {
            returnHtml += `<input type="datetime-local" style="background-color:#EAD5AA; border: none;" id="dateUntilInput${index}" class="dateUntilInput" value="">`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        returnHtml += `<button style="cursor:pointer; background: url(https://dsde.innogamescdn.com/asset/c045337f/graphic/delete.png); width: 20px; height: 20px;  border: none" class="deleteRequest" id="deleteRequest${index}"></button>`;
        returnHtml += "</td></tr>";
    })
    $(".requestContent").append(returnHtml);

    $(".deleteRequest").on("click", function () {
        let sdInquiryCollection: sdInquiry[] = localStorageService.getSdInquiry(currentThreadId);
        let coords = $(this).closest('tr').children('td:first').text();
        let index = sdInquiryCollection.findIndex(request => request.coords === coords);
        if (index !== -1) {
            sdInquiryCollection.splice(index, 1);
            localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
            renderTableRows();
        }
    });

    $(".amountInput").on("click", function () {
        $(this).val("");
        $(this).css("background-color", "#EAD5AA");
    });

    $(".playerNameInput").on("click", function () {
        $(this).val("");
    });

    $(".commentInput").on("click", function () {
        $(this).val("");
    });

    $(".amountInput").on("focusout", function () {
        let sdInquiryCollection: sdInquiry[] = localStorageService.getSdInquiry(currentThreadId);
        let coords = $(this).closest('tr').children('td:first').text();
        let index = sdInquiryCollection.findIndex(request => request.coords === coords);
        if (index !== -1) {
            sdInquiryCollection[index].amount = Number($(this).val());
            localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
        }
        // Füllen Sie alle anderen leeren Textboxen mit dem Wert
        let value = String($(this).val());
        $(".amountInput").each(function () {
            if ($(this).val() === "") {
                $(this).val(value);
                let coords = $(this).closest('tr').children('td:first').text();
                let index = sdInquiryCollection.findIndex(request => request.coords === coords);
                if (index !== -1) {
                    sdInquiryCollection[index].amount = Number(value);
                    localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
                }
            }
        });
    });

    $(".playerNameInput").on("focusout", function () {
        let sdInquiryCollection: sdInquiry[] = localStorageService.getSdInquiry(currentThreadId);
        let coords = $(this).closest('tr').children('td:first').text();
        let index = sdInquiryCollection.findIndex(request => request.coords === coords);
        if (index !== -1) {
            sdInquiryCollection[index].playerName = String($(this).val());
            localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
        }
        // Füllen Sie alle anderen leeren Textboxen mit dem Wert
        let value = String($(this).val());
        $(".playerNameInput").each(function () {
            if ($(this).val() === "") {
                $(this).val(value);
                let coords = $(this).closest('tr').children('td:first').text();
                let index = sdInquiryCollection.findIndex(request => request.coords === coords);
                if (index !== -1) {
                    sdInquiryCollection[index].playerName = String(value);
                    localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
                }
            }
        });
    });

    $(".commentInput").on("focusout", function () {
        let sdInquiryCollection: sdInquiry[] = localStorageService.getSdInquiry(currentThreadId);
        let coords = $(this).closest('tr').children('td:first').text();
        let index = sdInquiryCollection.findIndex(request => request.coords === coords);
        if (index !== -1) {
            sdInquiryCollection[index].comment = String($(this).val());
            localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
        }
        // Füllen Sie alle anderen leeren Textboxen mit dem Wert
        let value = String($(this).val());
        $(".commentInput").each(function () {
            if ($(this).val() === "") {
                $(this).val(value);
                let coords = $(this).closest('tr').children('td:first').text();
                let index = sdInquiryCollection.findIndex(request => request.coords === coords);
                if (index !== -1) {
                    sdInquiryCollection[index].comment = String(value);
                    localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
                }
            }
        });
    });

    $(".dateFromInput").on("change", function () {
        let sdInquiryCollection: sdInquiry[] = localStorageService.getSdInquiry(currentThreadId);
        let coords = $(this).closest('tr').children('td:first').text();
        let index = sdInquiryCollection.findIndex(request => request.coords === coords);
        if (index !== -1) {
            let dateFrom = convertDateToEpoch(String($(this).val()));
            let dateUntil = sdInquiryCollection[index].dateUntil;
            if (dateUntil && dateFrom >= dateUntil) {
                $(this).css("background-color", "red");
                $(this).val("");
                return;
            }
            $(this).css("background-color", "#EAD5AA");
            sdInquiryCollection[index].dateFrom = dateFrom;
            localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
        }
    });

    $(".dateUntilInput").on("change", function () {
        let sdInquiryCollection: sdInquiry[] = localStorageService.getSdInquiry(currentThreadId);
        let coords = $(this).closest('tr').children('td:first').text();
        let index = sdInquiryCollection.findIndex(request => request.coords === coords);
        if (index !== -1) {
            let dateUntil = convertDateToEpoch(String($(this).val()));
            let dateFrom = sdInquiryCollection[index].dateFrom;
            if (dateFrom && dateFrom >= dateUntil) {
                $(this).css("background-color", "red");
                $(this).val("");
                return;
            }
            $(this).css("background-color", "#EAD5AA");
            sdInquiryCollection[index].dateUntil = dateUntil;
            localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
        }
    });

    $(".playerNameInput").on("input", function () {
        handleInput(this);

    });

    $(".commentInput").on("input", function () {
        handleInput(this);
    });

    $("#deleteAll").on("click", function () {
        localStorageService.setSdInquiry(currentThreadId, []);
        renderTableRows();
    });

}

function handleInput(htmlElement: HTMLElement) {
    let input: string = String($(htmlElement).val());
    let pattern = /^[a-zA-Z0-9_]*$/;
    if (input !== null && !pattern.test(input)) {
        let subString = input.substring(0, input.length - 1);
        $(htmlElement).css("background-color", "red");
        $(htmlElement).val(subString);
        return;
    }
    $(htmlElement).css("background-color", "#EAD5AA");
}

function getFilteredInput(input: string) {
    Log.info("getFilteredInput");
    const coordsPattern = /\d{3}\|\d{3}/g;
    let inputArray: string[] = input.split("\n");
    let resultArray: string[] = [];
    Log.info(inputArray);
    inputArray.forEach((line) => {
        let matches = line.match(coordsPattern);
        if (matches) {
            Log.info("line is valid");
            resultArray.push(...matches);
        }
    });
    $("#textAreaKoords").val("");
    return resultArray;
}

function addNewRequestsToArray(input: string[]) {

    const urlParams = new URLSearchParams(window.location.search);
    const currentThreadId = urlParams.get("thread_id") || "";
    const localStorageService = LocalStorageHelper.getInstance();
    let sdInquiryCollection: sdInquiry[] = localStorageService.getSdInquiry(currentThreadId);
    Log.info(sdInquiryCollection);
    input.forEach((line) => {
        let [coords, amount, ...optionalData] = line.split(' ', 3);
        let request: sdInquiry = {
            coords: coords,
            amount: Number(amount),
            playerName: optionalData[1] || undefined,
            comment: optionalData[2] || undefined,
            dateFrom: Number(optionalData[3]) || undefined,
            dateUntil: Number(optionalData[4]) || undefined
        };
        sdInquiryCollection.push(request);
    });
    sdInquiryCollection = removeDuplicatesByCoords(sdInquiryCollection);
    Log.info(sdInquiryCollection);
    localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);

}

function removeDuplicatesByCoords(collection: sdInquiry[]): sdInquiry[] {
    const uniqueCoords = new Set();
    return collection.filter(item => {
        if (uniqueCoords.has(item.coords)) {
            return false;
        } else {
            uniqueCoords.add(item.coords);
            return true;
        }
    });
}



