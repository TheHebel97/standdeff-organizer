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
            dateFrom: Number(optionalData[3]) || undefined,
            dateUntil: Number(optionalData[4]) || undefined
        };

        // Add the requestData object to the array
        requests.push(request);
    }
    return requests;
}

export function convertRequestArrayToMessageString(requests: sdInquiry[]): string {
    // Array to hold the lines
    let lines: string[] = [];

    // Iterate over each requestData object
    for (const request of requests) {
        // Create the line
        let line = `${request.coords} ${request.amount} "${request.playerName || ''}"${request.comment || ''}"${request.dateFrom || ''}"${request.dateUntil || ''}`;
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
            Log.error("coords or village id is undefined")
        }
    });

    // Get the post container
    const newInquiryRegex = /(\d{3}\|\d{3})\)\sK\d+\s+(\d+)\s+["|“](.+)?["|“](.+)?["|“](\d+)?["|“](\d+)?/; // hier die anführungszeichen für mac hinzufügen todo:
    const packagesSentRegex = /(\d+)\s(\d+|done)/; // evtl noch optimieren todo:
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
                    Log.error("coords not found in map")
                }
                const villageId = coordVilIdMap.get(inquiryMatch[1]) || 0;

                let sdInquiry: sdInquiry = {
                    coords: inquiryMatch[1],
                    amount: parseInt(inquiryMatch[2]),
                    playerName: inquiryMatch[3],
                    comment: inquiryMatch[4],
                    dateFrom: inquiryMatch[5] ? parseInt(inquiryMatch[5]) : undefined,
                    dateUntil: inquiryMatch[6] ? parseInt(inquiryMatch[6]) : undefined
                }
                inquiries.set(villageId, sdInquiry);
            } else if (packagesMatch) {
                if (packagesSent.has(packagesMatch[1])) {
                    let oldVal = packagesSent.get(packagesMatch[1]);
                    if (oldVal === "done" || oldVal === undefined) {
                        return;
                    }
                    if (packagesMatch[2] === "done") {
                        packagesSent.set(packagesMatch[1], "done");
                        return;
                    }
                    let newVal = parseInt(oldVal) + parseInt(packagesMatch[2]);
                    packagesSent.set(packagesMatch[1], newVal.toString());
                    return;
                }
                packagesSent.set(packagesMatch[1], packagesMatch[2]);

            }
        })
        updateData.set(postId, {inquiries: inquiries, packages: packagesSent});


    });
    return updateData;
}

export function parseEditSdTableData(tableText: string, cacheText: string): sdState {


    const villageIdPattern = /target=(\d+)/;
    const playerPattern = /[player]([a-zA-Z0-9.]+)[/player]/;
    let sdTableState = new Map<number, rowSdTable>();
    tableText.split("[*]").forEach((line) => {
        const cells = line.split("[|]")
        if (cells.length < 5) {
            return;
        }
        cells[8] = cells[8].match(villageIdPattern)?.[1] || "";
        cells[4] = cells[4].replace(/\[player]/, "").replace(/\[\/player]/, "");
        const dateFrom = isNaN(parseInt(cells[6])) ? 0 : parseInt(cells[6]);
        const dateUntil = isNaN(parseInt(cells[7])) ? 0 : parseInt(cells[7]);
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
            if (summarizedData.packagesSent.has(sdId)) {
                let existingPackage = summarizedData.packagesSent.get(sdId);
                if (existingPackage !== "done") {
                    let newPackage = packageSent === "done" ? "done" : (parseInt(existingPackage || "0") + parseInt(packageSent)).toString();
                    summarizedData.packagesSent.set(sdId, newPackage);
                } else {
                    summarizedData.packagesSent.set(sdId, packageSent);
                }
            } else {
                summarizedData.packagesSent.set(sdId, packageSent);
            }
        });
    });


    Log.info(summarizedData)
    Log.info("sdTableState")
    Log.info(sdTableState)

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
                dateFrom: inquiry.dateFrom || 0,
                dateUntil: inquiry.dateUntil || 0
            });

        }
    })

    Log.info("sdTableState after update")
    Log.info(sdTableState)

    summarizedData.packagesSent.forEach((amount, sdId) => {
        let matchingEntry = Array.from(sdTableState.entries()).find(([_, row]) => row.sdId === sdId);
        if (matchingEntry) {
            let [villageId, row] = matchingEntry;
            row.leftAmount -= amount === "done" ? row.leftAmount : parseInt(amount);
            sdTableState.set(villageId, row);
        } else {
            Log.error(`no matching sdTableRowEntry found for package Id: ${sdId} -> I will ignore it :)`)

        }


    });
    Log.info("sdTableState after package update")
    Log.info(sdTableState)

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
    Log.info("sdTableState after cleanup")
    Log.info(sdTableState, newPostCache)

    return [sdTableState, newPostCache] as sdState;
}

export function parseSdStateToTableString(sdState: sdState): [string, string] {
    const [sdTableState, cache] = sdState;
    let tableString = "";
    sdTableState.forEach((row, villageId) => {
        tableString += `[*]${row.sdId}[|]${" " + row.coords + " "}[|]${row.startAmount}[|]${row.leftAmount}[|][player]${row.playerName}[/player][|]${row.comment}[|]${row.dateFrom}[|]${row.dateUntil}[|][url=${generateMassUtLink(villageId)}]Massen UT-Link[/url][/*]\n`;
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
            dateFrom: parseInt(rowSdTableArray[6].text().trim()),
            dateUntil: parseInt(rowSdTableArray[7].text().trim())

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
    Log.info(packagesToUpdate)
    let result = $("a[name='" + sdPostId + "']").parent().find("table").find("tbody").find("tr").map((index, row) => {
        let rowData: any = $(row).find("td").map((tdIndex, td) => $(td).text()).get();
        rowData.push(row); // Add the current row element to the end of the array
        return [rowData];
    }).get();

    Log.info(result);


    result.forEach((rowData: any[]) => {
        // Die ID ist der erste Wert im rowData Array
        let id = rowData[0];
        // Überprüfe, ob die ID in packageToUpdate vorhanden ist
        if (packagesToUpdate.has(id)) {
            // Hole den zu aktualisierenden Wert
            if (rowData[3] === "done") {
                return;
            }
            let updateValue = parseInt(packagesToUpdate.get(id) || "0");
            let oldValue = parseInt(rowData[3]);
            let newVal = Math.max(0, oldValue - updateValue);
            let addionalText = "";

            // Nehmen Sie an, dass result Ihr Array ist und das letzte Element das gespeicherte tr-Element ist
            let savedTr = result[id][9];
            $("a[name='" + sdPostId + "']").parent().find("table").find("tbody").find("tr").each((index, tr) => {
                // Überprüfen Sie, ob das aktuelle tr-Element mit dem gespeicherten tr-Element übereinstimmt
                if ($(tr).is(savedTr)) {
                    // Das aktuelle tr-Element stimmt mit dem gespeicherten tr-Element überein
                    // Sie können hier Code hinzufügen, um das tr-Element zu bearbeiten
                    // Zum Beispiel, um den Text des ersten td-Elements zu ändern:
                    $(tr).find("td").eq(3).text(newVal.toString());
                    if (addionalText !== "") {
                        $(tr).find("td").eq(3).append(addionalText);
                    }
                }
            });
        }
    });
}

export function updateSentPackagesInSdTable() {
    const localStorageService = LocalStorageHelper.getInstance();
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const currentThreadId: string = urlParams.get('thread_id') || "";
    const sdPostId = localStorageService.getSdPostId(currentThreadId);
    let sentPackages = localStorageService.getPackagesSent(currentThreadId);

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
    Log.info("apply settings to mass ut link")
    const localStorageService = LocalStorageHelper.getInstance();
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const currentThreadId: string = urlParams.get('thread_id') || "";
    const automate = localStorageService.getAutomateMassenUt;
    const sdGroupId = localStorageService.getSdGroupId;
    const orderBy = localStorageService.getSortBy;
    let addionalLinkText = "&dir=0&sdTableId=" + currentThreadId;
    if (automate) {
        Log.info("automate mass ut")

        if (sdGroupId !== "") addionalLinkText += "&group=" + sdGroupId;
        if (orderBy !== "") addionalLinkText += "&order=" + orderBy;
    }
    $(".bbcodetable").find("a[referrerpolicy^='no-ref']").each(function () {
        let oldHref = $(this).attr('href');
        if (oldHref) {
            let newHref = oldHref + addionalLinkText;
            $(this).attr('href', newHref);
        }
    });

}

