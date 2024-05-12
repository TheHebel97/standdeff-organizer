import {
    newInquiry,
    updateData,
    rowSdTable,
    sdInquiry,
    sdState,
    sdTableState,
    postData,
    packages
} from "../../types/types";
import {LocalStorageService} from "../local-storage-service";

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
    const localStorageService = LocalStorageService.getInstance();
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
            console.error("coords or village id is undefined")
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


        postContentSplit.forEach((line, index) => {
            if (finished || line === "______________________________") {
                finished = true;
                return;
            }

            let inquiryMatch = line.match(newInquiryRegex);
            let packagesMatch = line.match(packagesSentRegex);
            if (inquiryMatch) {

                if (!coordVilIdMap.has(inquiryMatch[1])) {
                    console.error("coords not found in map")
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
    const localStorageService = LocalStorageService.getInstance();
    //todo: get setting of "add up double requests"
    const addUpSetting = true;
    //const [inquiries, packagesSent, postIds] = updateData;
    const [sdTableState, postCache] = sdState;

    //denke so:
    //1. iterate over all postIds in updateData and remove those which are in the cache
    // summarize all left inquiries and packages for each villageId
    // update table State with updated data
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


    console.log(summarizedData)
    console.log("sdTableState")
    console.log(sdTableState)

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

    console.log("sdTableState after update")
    console.log(sdTableState)

    summarizedData.packagesSent.forEach((amount, sdId) => {
        let matchingEntry = Array.from(sdTableState.entries()).find(([villageId, row]) => row.sdId === sdId);
        if (matchingEntry) {
            let [villageId, row] = matchingEntry;
            row.leftAmount -= amount === "done" ? row.leftAmount : parseInt(amount);
            sdTableState.set(villageId, row);
        } else {
            console.error(`no matching sdTableRowEntry found for package Id: ${sdId} -> I will ignore it :)`)

        }


    });
    console.log("sdTableState after package update")
    console.log(sdTableState)

    //clean up sdTableState and delete everything with leftAmount = 0 // hier logging von fertigen anfragen einbauen wenn gewünscht :)
    let newId=1;
    sdTableState.forEach((row, villageId) => {
        if (row.leftAmount === 0) {
            sdTableState.delete(villageId);
            newId--;
        }
        row.sdId = String(newId);
        newId++;
    });
    console.log("sdTableState after cleanup")
    console.log(sdTableState, newPostCache)


// Jetzt können Sie newUpdateData weiterverarbeiten


    return [sdTableState, newPostCache] as sdState;
}

export function parseSdStateToTableString(sdState: sdState): [string, string] {
    const [sdTableState, cache] = sdState;
    let tableString = "";
    sdTableState.forEach((row, villageId) => {
        tableString += `[*]${row.sdId}[|]${" "+row.coords+" "}[|]${row.startAmount}[|]${row.leftAmount}[|][player]${row.playerName}[/player][|]${row.comment}[|]${row.dateFrom}[|]${row.dateUntil}[|][url=${generateMassUtLink(villageId)}]Massenutlink[/url][/*]\n`;
    });
    let cacheString = `[spoiler=postCache]${cache.join(",")}[/spoiler]`;
    return [tableString, cacheString];
}

function generateMassUtLink(villageId: number): string {
    const world = game_data.world;
    return `https://${world}.die-staemme.de/game.php?village=0&screen=place&mode=call&target=${villageId}`;
}

