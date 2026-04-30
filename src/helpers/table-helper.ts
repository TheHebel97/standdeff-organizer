import {
    newInquiry,
    updateData,
    rowSdTable,
    sdInquiry,
    sdState,
    sdTableState,
    postData,
    packages
} from "../types/types";
import {LocalStorageHelper} from "./local-storage-helper";
import {Log} from "./logging-helper";

const log = Log.scope("table-helper");

/**
 * Treats undefined, null, "", "0" and numeric 0 as "no date" for Ab/Bis cells.
 * Returns "" in those cases; otherwise returns the value as string (trimmed if string).
 * Does not treat date strings (e.g. "01.01.2025 12:00") as empty.
 */
function normalizeDateCell(value: any): string {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed === "" || trimmed === "0") return "";
        return trimmed;
    }
    if (typeof value === "number" && (value === 0 || isNaN(value))) return "";
    return String(value);
}

function summarizeUpdateDataMap(data: updateData) {
    let postCount = 0;
    let inquiryCount = 0;
    let packageCount = 0;
    data.forEach((post) => {
        postCount++;
        inquiryCount += post.inquiries.size;
        packageCount += post.packages.size;
    });
    return {
        postCount,
        inquiryCount,
        packageCount
    };
}

function summarizeSdTableStateMap(state: sdTableState) {
    return {
        rowCount: state.size,
        rows: Array.from(state.entries()).slice(0, 5).map(([villageId, row]) => ({
            villageId,
            sdId: row.sdId,
            coords: row.coords,
            startAmount: row.startAmount,
            leftAmount: row.leftAmount,
            dateFrom: row.dateFrom,
            dateUntil: row.dateUntil
        }))
    };
}

function summarizePackagesMap(packagesToSummarize: Map<string, any>) {
    return {
        packageCount: packagesToSummarize.size,
        entries: Array.from(packagesToSummarize.entries()).slice(0, 10)
    };
}

export function convertMessageRequestStringToRequestArray(messageString: String): sdInquiry[] {
    // Split the messageString into lines
    const lines = messageString.split('\n');

    // Array to hold the requestData objects
    let requests: sdInquiry[] = [];

    // Iterate over each line
    //evtl auch mit regex
    for (const line of lines) {
        // Split the line at the first space to get coords and amount
        let [coords, amount, ...optionalData] = line.split(' ', 3);
        // Check if coords matches the pattern "3digits | 3 digits"
        const coordsPattern = /^\d{3}\|\d{3}$/;
        const amountPattern = /^\d+$/;
        if (!coordsPattern.test(coords) || !amountPattern.test(amount)) {
            continue;  // Skip this line if coords does not match the pattern
        }
        // Split the optional data at the delimiter "
        optionalData = optionalData[0]?.split('"') || [];
        // Create the requestData object
        let request: sdInquiry = {
            coords: coords,
            amount: Number(amount),
            playerName: optionalData[1] || undefined,
            comment: optionalData[2] || undefined,
            dateFrom: normalizeDateCell(optionalData[3]) === "" ? undefined : (optionalData[3] ?? undefined),
            dateUntil: normalizeDateCell(optionalData[4]) === "" ? undefined : (optionalData[4] ?? undefined)
        };

        // Add the requestData object to the array
        requests.push(request);
    }
    return requests;
}

export function convertRequestArrayToMessageString(requests: sdInquiry[]): string {
    // Array to hold the lines
    let lines: string[] = [];

    // helper to format numeric date values into DD.MM.YYYY HH:MM (handles seconds, ms, yyyymmdd and year)
    function pad(n: number) { return n < 10 ? '0' + n : String(n); }
    function formatDate(value?: number): string {
        // treat undefined, null, NaN and 0 as empty (no date)
        if (value === undefined || value === null) return "";
        const v = Number(value);
        if (isNaN(v) || v === 0) return "";

        let date: Date | null = null;

        if (v > 1e12) { // milliseconds
            date = new Date(v);
        } else if (v > 1e9) { // seconds
            date = new Date(v * 1000);
        } else if (/^\d{8}$/.test(String(v))) { // yyyymmdd -> date only, time = 00:00
            const s = String(v);
            const y = parseInt(s.slice(0, 4));
            const m = parseInt(s.slice(4, 6));
            const d = parseInt(s.slice(6, 8));
            date = new Date(y, m - 1, d, 0, 0);
        } else if (v >= 1970 && v <= 3000) { // year only -> date = 01.01.<year> 00:00
            date = new Date(v, 0, 1, 0, 0);
        } else {
            // unknown format: return numeric value as string to avoid data loss
            return String(v);
        }

        if (!date || isNaN(date.getTime())) return String(v);
        const day = pad(date.getDate());
        const month = pad(date.getMonth() + 1);
        const year = date.getFullYear();
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        // always append hours:minutes (for date-only sources this will be 00:00)
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }

    // Iterate over each requestData object
    for (const request of requests) {
        // Create the line

        let dateFrom = formatDate(request.dateFrom as any);
        let dateUntil = formatDate(request.dateUntil as any);

        let line = `${request.coords} ${request.amount} "${request.playerName || ''}"${request.comment || ''}"${dateFrom}"${dateUntil}`;
        // Add the line to the array
        lines.push(line);
    }

    // Join the lines with a newline character
    return lines.join('\n');
}

export function parseSdPosts(): updateData {
    const localStorageService = LocalStorageHelper.getInstance();
    const urlParams = new URLSearchParams(window.location.search);
    const currentThreadId = urlParams.get("thread_id") || "";
    const sdPostId = localStorageService.getSdPostId(currentThreadId);

    log.info("Parsing SD posts from thread view", {
        currentThreadId,
        sdPostId,
        postCount: $(".post").length
    });


    let coordVilIdMap = new Map<string, number>();

    let updateData: updateData = new Map<string, postData>();

    //parse all village links on page to get the village id and store into map
    $(".village_anchor").each((index, element) => {
        const coordsMatch = /(\d{3}\|\d{3})\)\sK/
        const possibleCoords = $(element).text().trim().split("(");
        const coords = possibleCoords[possibleCoords.length - 1].match(coordsMatch)?.[1];
        const villageId = $(element).attr("data-id");
        if (coords && villageId) {
            coordVilIdMap.set(coords, parseInt(villageId));
        } else {
            log.error("coords or village id is undefined");
        }
    });

    // Get the post container
    const newInquiryRegex = /(\d{3}\|\d{3})\)\sK\d+\s+(\d+)\s+["\u201c](.+)?["\u201c](.+)?["\u201c](.+)?["\u201c](.+)?/; // hier die anführungszeichen für mac hinzufügen todo:
    const packagesSentRegex = /(\d+)\s(\d+|done)/i;
    $(".post").each((index, element) => {
        let packagesSent: packages = new Map<string, string>();
        let inquiries: newInquiry = new Map<number, sdInquiry>();
        let finished = false; // for skipping the signature
        if ($(element).find("a").first().attr("name") === sdPostId) { // or already updated and not deleted todo:
            return; // skip sd thread id
        }
        const postId = $(element).find("a").first().attr("name") || "";
        const postContent = $(element).find(".text").text();
        const postContentSplit = postContent.split("\n");


        postContentSplit.forEach((line) => {
            if (finished || line === "______________________________") {
                finished = true;
                return;
            }

            let inquiryMatch = line.match(newInquiryRegex);
            let packagesMatch = line.match(packagesSentRegex);
            if (inquiryMatch) {

                if (!coordVilIdMap.has(inquiryMatch[1])) {
                    log.error("coords not found in village map", {coords: inquiryMatch[1]});
                }
                const villageId = coordVilIdMap.get(inquiryMatch[1]) || 0;

                let sdInquiry: sdInquiry = {
                    coords: inquiryMatch[1],
                    amount: parseInt(inquiryMatch[2]),
                    playerName: inquiryMatch[3],
                    comment: inquiryMatch[4],
                    dateFrom: normalizeDateCell(inquiryMatch[5]) === "" ? undefined : (inquiryMatch[5] ?? undefined),
                    dateUntil: normalizeDateCell(inquiryMatch[6]) === "" ? undefined : (inquiryMatch[6] ?? undefined)
                }
                inquiries.set(villageId, sdInquiry);
            } else if (packagesMatch) {
                const pkgVal = packagesMatch[2].toLowerCase();
                const isDone = pkgVal === "done";
                const valueToSet = isDone ? "done" : packagesMatch[2];
                if (packagesSent.has(packagesMatch[1])) {
                    let oldVal = packagesSent.get(packagesMatch[1]);
                    if (oldVal === "done" || oldVal === undefined) {
                        return;
                    }
                    if (isDone) {
                        packagesSent.set(packagesMatch[1], "done");
                        return;
                    }
                    let newVal = parseInt(oldVal) + parseInt(packagesMatch[2]);
                    packagesSent.set(packagesMatch[1], newVal.toString());
                    return;
                }
                packagesSent.set(packagesMatch[1], valueToSet);

            }
        })
        updateData.set(postId, {inquiries: inquiries, packages: packagesSent});


    });
    log.state("Finished parsing SD posts", {
        coordVillageMappingCount: coordVilIdMap.size,
        summary: summarizeUpdateDataMap(updateData)
    });
    return updateData;
}

export function parseEditSdTableData(tableText: string, cacheText: string): sdState {


    const villageIdPattern = /target=(\d+)/;
    // const playerPattern = /[player]([a-zA-Z0-9.]+)[/player]/; // unused - entfernt
    let sdTableState = new Map<number, rowSdTable>();
    tableText.split("[*]").forEach((line) => {
        const cells = line.split("[|]")
        if (cells.length < 5 || cells.length > 9) {
            return;
        }
        while (cells.length < 9) cells.push("");
        cells[8] = cells[8].match(villageIdPattern)?.[1] || "";
        cells[4] = cells[4].replace(/\[player]/, "").replace(/\[\/player]/, "");
        const dateFrom = normalizeDateCell(cells[6] ? cells[6].trim() : "");
        const dateUntil = normalizeDateCell(cells[7] ? cells[7].trim() : "");
        sdTableState.set(parseInt(cells[8]), {
            coords: cells[1].trim(),
            sdId: cells[0],
            startAmount: parseInt(cells[2]),
            leftAmount: parseInt(cells[3]),
            playerName: cells[4],
            comment: cells[5],
            dateFrom: dateFrom,
            dateUntil: dateUntil
        });
    })

    let cache = cacheText.replace(/\[spoiler=postCache]/, "").replace(/\[\/spoiler]/, "").split(",");

    return [sdTableState, cache];
}

export function calculateSdTableState(updateData: updateData, sdState: sdState): sdState {
    const addUpSetting = true;
    const [sdTableState, postCache] = sdState;
    let updateDataWithoutCache: updateData = new Map();
    let newPostCache: string[] = [];

    log.state("Calculating SD table state", {
        addUpSetting,
        postCacheCount: postCache.length,
        incomingUpdates: summarizeUpdateDataMap(updateData),
        currentTableState: summarizeSdTableStateMap(sdTableState)
    });

    updateData.forEach((postData, postId) => {
        if (!postCache.includes(postId)) {
            updateDataWithoutCache.set(postId, postData);
        }
        newPostCache.push(postId);
    });

    let summarizedData = {
        inquiries: new Map<number, sdInquiry>(),
        packagesSent: new Map<string, string>()
    };

    updateDataWithoutCache.forEach((postData) => {
        postData.inquiries.forEach((inquiry, villageId) => {
            if (summarizedData.inquiries.has(villageId)) {
                let existingInquiry = summarizedData.inquiries.get(villageId);
                if (existingInquiry && existingInquiry.amount < inquiry.amount) {
                    summarizedData.inquiries.set(villageId, inquiry);
                }
            } else {
                summarizedData.inquiries.set(villageId, inquiry);
            }
        });

        postData.packages.forEach((packageSent, sdId) => {
            const packageSentLower = String(packageSent ?? "").toLowerCase();
            const isPackageDone = packageSentLower === "done";
            if (summarizedData.packagesSent.has(sdId)) {
                let existingPackage = summarizedData.packagesSent.get(sdId);
                const existingLower = String(existingPackage ?? "").toLowerCase();
                if (existingLower !== "done") {
                    let newPackage = isPackageDone ? "done" : (parseInt(existingPackage || "0") + parseInt(packageSent)).toString();
                    summarizedData.packagesSent.set(sdId, newPackage);
                } else {
                    summarizedData.packagesSent.set(sdId, packageSent);
                }
            } else {
                summarizedData.packagesSent.set(sdId, packageSent);
            }
        });
    });


    log.state("Summarized updates before table merge", {
        inquiryCount: summarizedData.inquiries.size,
        packageCount: summarizedData.packagesSent.size
    });

    summarizedData.inquiries.forEach((inquiry, villageId) => {
        if (sdTableState.has(villageId)) {
            if (addUpSetting) {
                let existingRow = sdTableState.get(villageId);
                if (existingRow) {
                    let newLeftAmount = existingRow.leftAmount + inquiry.amount;
                    let newStartAmount = existingRow.startAmount + inquiry.amount;
                    sdTableState.set(villageId, {
                        ...existingRow,
                        startAmount: newStartAmount,
                        leftAmount: newLeftAmount
                    });
                }
            }
        } else {
            sdTableState.set(villageId, {
                coords: inquiry.coords,
                sdId: String(sdTableState.size + 1),
                startAmount: inquiry.amount,
                leftAmount: inquiry.amount,
                playerName: inquiry.playerName || "",
                comment: inquiry.comment || "",
                dateFrom: normalizeDateCell(inquiry.dateFrom),
                dateUntil: normalizeDateCell(inquiry.dateUntil)
            });

        }
    })

    log.state("SD table after inquiry merge", summarizeSdTableStateMap(sdTableState));

    summarizedData.packagesSent.forEach((amount, sdId) => {
        const amountLower = String(amount ?? "").toLowerCase();
        const isDone = amountLower === "done";
        let matchingEntry = Array.from(sdTableState.entries()).find(([_, row]) => row.sdId === sdId);
        if (matchingEntry) {
            let [villageId, row] = matchingEntry;
            row.leftAmount -= isDone ? row.leftAmount : parseInt(amount);
            sdTableState.set(villageId, row);
        } else {
            log.error(`no matching sdTableRowEntry found for package Id: ${sdId} -> I will ignore it :)`);

        }


    });
    log.state("SD table after package merge", summarizeSdTableStateMap(sdTableState));

    //clean up sdTableState and delete everything with leftAmount = 0 // hier logging von fertigen anfragen einbauen wenn gewünscht :)
    let newId = 1;
    sdTableState.forEach((row, villageId) => {
        if (row.leftAmount === 0) {
            sdTableState.delete(villageId);
            newId--;
        }
        row.sdId = String(newId);
        newId++;
    });
    log.state("SD table after cleanup", {
        tableState: summarizeSdTableStateMap(sdTableState),
        newPostCacheCount: newPostCache.length
    });

    return [sdTableState, newPostCache] as sdState;
}

export function parseSdStateToTableString(sdState: sdState): [string, string] {
    const [sdTableState, cache] = sdState;
    let tableString = "";
    sdTableState.forEach((row, villageId) => {
        tableString += `[*]${row.sdId}[|]${" " + row.coords + " "}[|]${row.startAmount}[|]${row.leftAmount}[|][player]${row.playerName}[/player][|]${row.comment}[|]${normalizeDateCell(row.dateFrom)}[|]${normalizeDateCell(row.dateUntil)}[|][url=${generateMassUtLink(villageId)}]Massen UT-Link[/url][/*]\n`;
    });
    let cacheString = `[spoiler=postCache]${cache.join(",")}[/spoiler]`;
    return [tableString, cacheString];
}

function generateMassUtLink(villageId: number): string {
    const world = game_data.world;
    return `https://${world}.die-staemme.de/game.php?village=0&screen=place&mode=call&target=${villageId}`;
}


export function parseTableHtmlElemToSdState(tableBodyElem: any): sdTableState {
    let sdTableState = new Map<number, rowSdTable>();

    tableBodyElem.find("tr").each((index: number, row: any) => {
        //skip the first
        if (index === 0) {
            return;
        }
        //build up rowSdTable

        let rowSdTableArray: any[] = [];
        $(row).find("td").each((index: number, cell: any) => {
            rowSdTableArray.push($(cell));
        })
        let coords = parseTwCoordsToCoords(rowSdTableArray[1].text().trim());
        let villageId = parseTwLinkToVillageId(rowSdTableArray[8]);
        let rowSdTable: rowSdTable = {
            coords: coords,
            sdId: rowSdTableArray[0].text().trim(),
            startAmount: parseInt(rowSdTableArray[2].text().trim()),
            leftAmount: parseInt(rowSdTableArray[3].text().trim()),
            playerName: rowSdTableArray[4].text().trim(),
            comment: rowSdTableArray[5].text().trim(),
            dateFrom: normalizeDateCell(rowSdTableArray[6].text().trim()),
            dateUntil: normalizeDateCell(rowSdTableArray[7].text().trim())

        };
        sdTableState.set(villageId, rowSdTable);
    });


    return sdTableState;
}


function parseTwCoordsToCoords(coords: string): string {
    const coordsPattern = /\d{3}\|\d{3}/g;
    const found = coords.match(coordsPattern)
    return found ? found[found.length - 1] : "";
}


function parseTwLinkToVillageId(linkElem: string): number {
    const link = $(linkElem).find("a").attr("href") || "";
    const villageIdPattern = /target=(\d+)/;
    const found = link.match(villageIdPattern);
    return found ? parseInt(found[1]) : 0;
}


export function displayUpdatedSdTable(packagesToUpdate: Map<string, any>) {
    const localStorageService = LocalStorageHelper.getInstance();
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const currentThreadId: string = urlParams.get('thread_id') || "";
    //let sentPackages = localStorageService.getPackagesSent(currentThreadId);
    const sdPostId = localStorageService.getSdPostId(currentThreadId);
    log.state("Applying package deltas to SD table DOM", {
        currentThreadId,
        sdPostId,
        packages: summarizePackagesMap(packagesToUpdate)
    });
    let result = $("a[name='" + sdPostId + "']").parent().find("table").find("tbody").find("tr").map((index, row) => {
        let rowData: any = $(row).find("td").map((tdIndex, td) => $(td).text()).get();
        rowData.push(row); // Add the current row element to the end of the array
        return [rowData];
    }).get();


    result.forEach((rowData: any[]) => {
        // Die ID ist der erste Wert im rowData Array
        let id = rowData[0];
        // Überprüfe, ob die ID in packageToUpdate vorhanden ist
        if (!packagesToUpdate.has(id)) {
            return;
        }
        const cellValueRaw = rowData[3];
        const cellValueLower = String(cellValueRaw ?? "").toLowerCase();
        if (cellValueLower === "done") {
            return;
        }
        // Hole den zu aktualisierenden Wert
        const updateRaw = packagesToUpdate.get(id);
        const updateLower = String(updateRaw ?? "").toLowerCase();
        const isDone = updateLower === "done";
        let displayVal: number;
        if (isDone) {
            displayVal = 0;
        } else {
            const updateValue = parseInt(updateRaw || "0", 10);
            const oldValue = parseInt(cellValueRaw, 10);
            const newVal = isNaN(oldValue) ? 0 : oldValue - (isNaN(updateValue) ? 0 : updateValue);
            displayVal = Math.max(0, newVal);
        }
        const addionalText = "";
        // Das letzte Element im rowData ist das gespeicherte tr-Element
        let savedTr = rowData[9];
        $("a[name='" + sdPostId + "']").parent().find("table").find("tbody").find("tr").each((index, tr) => {
            // Überprüfen Sie, ob das aktuelle tr-Element mit dem gespeicherten tr-Element übereinstimmt
            if ($(tr).is(savedTr)) {
                // Das aktuelle tr-Element stimmt mit dem gespeicherten tr-Element überein
                // Zum Beispiel, um den Text des ersten td-Elements zu ändern:
                $(tr).find("td").eq(3).text(displayVal.toString());
                if (addionalText !== "") {
                    $(tr).find("td").eq(3).append(addionalText);
                }
            }
        });
    });
}

export function updateSentPackagesInSdTable() {
    const localStorageService = LocalStorageHelper.getInstance();
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const currentThreadId: string = urlParams.get('thread_id') || "";
    const sdPostId = localStorageService.getSdPostId(currentThreadId);
    let sentPackages = localStorageService.getPackagesSent(currentThreadId);

    log.state("Syncing sent packages marker into SD table DOM", {
        currentThreadId,
        sdPostId,
        packages: summarizePackagesMap(sentPackages)
    });

    let result = $("a[name='" + sdPostId + "']").parent().find("table").find("tbody").find("tr").map((index, row) => {
        let rowData: any = $(row).find("td").map((tdIndex, td) => $(td).text()).get();
        rowData.push(row); // Add the current row element to the end of the array
        return [rowData];
    }).get();


    result.forEach((rowData: any[]) => {
        // Die ID ist der erste Wert im rowData Array
        let id = rowData[0];
        // Überprüfe, ob die ID in packageToUpdate vorhanden ist
        if (sentPackages.has(id)) {
            let sentAmount = sentPackages.get(id);
            let addionalText = "";
            if (sentAmount) {
                addionalText = " <span id='sent-info' style='color:#FF0000;'>(-" + sentAmount + ")</span>";
            }
            // Nehmen Sie an, dass result Ihr Array ist und das letzte Element das gespeicherte tr-Element ist
            let savedTr = result[id][9];
            $("a[name='" + sdPostId + "']").parent().find("table").find("tbody").find("tr").each((index, tr) => {
                // Überprüfen Sie, ob das aktuelle tr-Element mit dem gespeicherten tr-Element übereinstimmt
                if ($(tr).is(savedTr)) {
                    // Das aktuelle tr-Element stimmt mit dem gespeicherten tr-Element überein
                    // Sie können hier Code hinzufügen, um das tr-Element zu bearbeiten
                    // Zum Beispiel, um den Text des ersten td-Elements zu ändern:
                    if($(tr).find("#sent-info").length > 0){
                        if(sentAmount) {
                            $(tr).find("#sent-info").text("(-"+sentAmount+")");
                            return;
                        }
                    }

                    if (addionalText !== "") {
                        $(tr).find("td").eq(3).append(addionalText);
                    }
                }
            });
        }

    });

}


export function applySettingsToMassUtLink() {
    log.info("Applying settings to mass-ut links");
    const localStorageService = LocalStorageHelper.getInstance();
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const currentThreadId: string = urlParams.get('thread_id') || "";
    const automate = localStorageService.getAutomateMassenUt;
    const sdGroupId = localStorageService.getSdGroupId;
    const orderBy = localStorageService.getSortBy;
    let addionalLinkText = "&dir=0&sdTableId=" + currentThreadId;
    if (automate) {
        log.info("Mass-ut automation is enabled for link rewriting");

        if (sdGroupId !== "") addionalLinkText += "&group=" + sdGroupId;
        if (orderBy !== "") addionalLinkText += "&order=" + orderBy;
    }
    let updatedLinkCount = 0;
    $(".bbcodetable").find("a[referrerpolicy^='no-ref']").each(function () {
        let oldHref = $(this).attr('href');
        if (oldHref) {
            let newHref = oldHref + addionalLinkText;
            $(this).attr('href', newHref);
            updatedLinkCount++;
        }
    });
    log.info("Mass-ut links updated", {
        currentThreadId,
        automate,
        sdGroupId,
        orderBy,
        updatedLinkCount
    });

}

export function trimVillageNameText(){
    log.info("Trimming village names in SD table");
    $(".village_anchor>a").each((index, element) => {
        const coordsPattern = /(\d{3}\|\d{3})/;
        const match = $(element).text().match(coordsPattern);
        if(match){
            $(element).text(match[1]);
        }
    });

}

export function trimYearFromDateStrings(){
    log.info("Trimming year from date strings in SD table");
    $(".bbcodetable>tbody").children().each((index, element) => {

        // skip header row if present (index 0)
        if (index === 0) return;

        const $cells = $(element).find('td');
        const $dateFrom = $cells.eq(6);
        const $dateUntil = $cells.eq(7);

        function stripYear($cell: JQuery<HTMLElement>) {
            if (!$cell || $cell.length === 0) return;
            const text = $cell.text().trim();
            if (!text) return;
            // Match formats like "DD.MM.YYYY HH:MM" or "DD.MM.YYYY" (be tolerant)
            const m = text.match(/^(\d{2}\.\d{2})\.(\d{4})(?:\s+(\d{1,2}:\d{2}))?.*$/);
            if (m) {
                const dayMonth = m[1];
                const time = m[3] ? m[3] : "00:00"; // if no time present, show 00:00 to keep consistent visual
                $cell.text(`${dayMonth} ${time}`);
            }
        }

        stripYear($dateFrom);
        stripYear($dateUntil);

    });
}
