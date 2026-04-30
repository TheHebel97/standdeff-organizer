import {
    newInquiry,
    packages,
    postData,
    rowSdTable,
    sdInquiry,
    sdTableState,
    updateData
} from "../types/types";
import {LocalStorageHelper} from "./local-storage-helper";
import {Log} from "./logging-helper";
import {buildMassUtLink, normalizeDateCell} from "./table-domain";

const log = Log.scope("table-helper");

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

function summarizePackagesMap(packagesToSummarize: Map<string, any>) {
    return {
        packageCount: packagesToSummarize.size,
        entries: Array.from(packagesToSummarize.entries()).slice(0, 10)
    };
}

export function parseSdPosts(currentThreadId: string): updateData {
    const localStorageService = LocalStorageHelper.getInstance();
    const sdPostId = localStorageService.getSdPostId(currentThreadId);

    log.info("Parsing SD posts from thread view", {
        currentThreadId,
        sdPostId,
        postCount: $(".post").length
    });

    let coordVilIdMap = new Map<string, number>();
    let parsedUpdateData: updateData = new Map<string, postData>();

    $(".village_anchor").each((index, element) => {
        const coordsMatch = /(\d{3}\|\d{3})\)\sK/;
        const possibleCoords = $(element).text().trim().split("(");
        const coords = possibleCoords[possibleCoords.length - 1].match(coordsMatch)?.[1];
        const villageId = $(element).attr("data-id");
        if (coords && villageId) {
            coordVilIdMap.set(coords, parseInt(villageId));
        } else {
            log.error("coords or village id is undefined");
        }
    });

    const newInquiryRegex = /(\d{3}\|\d{3})\)\sK\d+\s+(\d+)\s+["\u201c](.+)?["\u201c](.+)?["\u201c](.+)?["\u201c](.+)?/;
    const packagesSentRegex = /(\d+)\s(\d+|done)/i;

    $(".post").each((index, element) => {
        let packagesSent: packages = new Map<string, string>();
        let inquiries: newInquiry = new Map<number, sdInquiry>();
        let finished = false;
        if ($(element).find("a").first().attr("name") === sdPostId) {
            return;
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
                let inquiry: sdInquiry = {
                    coords: inquiryMatch[1],
                    amount: parseInt(inquiryMatch[2]),
                    playerName: inquiryMatch[3],
                    comment: inquiryMatch[4],
                    dateFrom: normalizeDateCell(inquiryMatch[5]) === "" ? undefined : (inquiryMatch[5] ?? undefined),
                    dateUntil: normalizeDateCell(inquiryMatch[6]) === "" ? undefined : (inquiryMatch[6] ?? undefined)
                };
                inquiries.set(villageId, inquiry);
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
        });
        parsedUpdateData.set(postId, {inquiries: inquiries, packages: packagesSent});
    });

    log.state("Finished parsing SD posts", {
        coordVillageMappingCount: coordVilIdMap.size,
        summary: summarizeUpdateDataMap(parsedUpdateData)
    });
    return parsedUpdateData;
}

export function parseTableHtmlElemToSdState(tableBodyElem: any): sdTableState {
    let parsedState = new Map<number, rowSdTable>();

    tableBodyElem.find("tr").each((index: number, row: any) => {
        if (index === 0) {
            return;
        }

        let rowSdTableArray: any[] = [];
        $(row).find("td").each((cellIndex: number, cell: any) => {
            rowSdTableArray.push($(cell));
        });

        let coords = parseTwCoordsToCoords(rowSdTableArray[1].text().trim());
        let villageId = parseTwLinkToVillageId(rowSdTableArray[8]);
        let parsedRow: rowSdTable = {
            coords: coords,
            sdId: rowSdTableArray[0].text().trim(),
            startAmount: parseInt(rowSdTableArray[2].text().trim()),
            leftAmount: parseInt(rowSdTableArray[3].text().trim()),
            playerName: rowSdTableArray[4].text().trim(),
            comment: rowSdTableArray[5].text().trim(),
            dateFrom: normalizeDateCell(rowSdTableArray[6].text().trim()),
            dateUntil: normalizeDateCell(rowSdTableArray[7].text().trim())
        };
        parsedState.set(villageId, parsedRow);
    });

    return parsedState;
}

function parseTwCoordsToCoords(coords: string): string {
    const coordsPattern = /\d{3}\|\d{3}/g;
    const found = coords.match(coordsPattern);
    return found ? found[found.length - 1] : "";
}

function parseTwLinkToVillageId(linkElem: string): number {
    const link = $(linkElem).find("a").attr("href") || "";
    const villageIdPattern = /target=(\d+)/;
    const found = link.match(villageIdPattern);
    return found ? parseInt(found[1]) : 0;
}

export function displayUpdatedSdTable(currentThreadId: string, packagesToUpdate: Map<string, any>) {
    const localStorageService = LocalStorageHelper.getInstance();
    const sdPostId = localStorageService.getSdPostId(currentThreadId);

    log.state("Applying package deltas to SD table DOM", {
        currentThreadId,
        sdPostId,
        packages: summarizePackagesMap(packagesToUpdate)
    });

    let result = $("a[name='" + sdPostId + "']").parent().find("table").find("tbody").find("tr").map((index, row) => {
        let rowData: any = $(row).find("td").map((tdIndex, td) => $(td).text()).get();
        rowData.push(row);
        return [rowData];
    }).get();

    result.forEach((rowData: any[]) => {
        let id = rowData[0];
        if (!packagesToUpdate.has(id)) {
            return;
        }
        const cellValueRaw = rowData[3];
        const cellValueLower = String(cellValueRaw ?? "").toLowerCase();
        if (cellValueLower === "done") {
            return;
        }
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
        let savedTr = rowData[9];
        $("a[name='" + sdPostId + "']").parent().find("table").find("tbody").find("tr").each((index, tr) => {
            if ($(tr).is(savedTr)) {
                $(tr).find("td").eq(3).text(displayVal.toString());
            }
        });
    });
}

export function updateSentPackagesInSdTable(currentThreadId: string) {
    const localStorageService = LocalStorageHelper.getInstance();
    const sdPostId = localStorageService.getSdPostId(currentThreadId);
    let sentPackages = localStorageService.getPackagesSent(currentThreadId);

    log.state("Syncing sent packages marker into SD table DOM", {
        currentThreadId,
        sdPostId,
        packages: summarizePackagesMap(sentPackages)
    });

    let result = $("a[name='" + sdPostId + "']").parent().find("table").find("tbody").find("tr").map((index, row) => {
        let rowData: any = $(row).find("td").map((tdIndex, td) => $(td).text()).get();
        rowData.push(row);
        return [rowData];
    }).get();

    result.forEach((rowData: any[]) => {
        let id = rowData[0];
        if (sentPackages.has(id)) {
            let sentAmount = sentPackages.get(id);
            let addionalText = "";
            if (sentAmount) {
                addionalText = " <span id='sent-info' style='color:#FF0000;'>(-" + sentAmount + ")</span>";
            }
            let savedTr = result[id][9];
            $("a[name='" + sdPostId + "']").parent().find("table").find("tbody").find("tr").each((index, tr) => {
                if ($(tr).is(savedTr)) {
                    if ($(tr).find("#sent-info").length > 0) {
                        if (sentAmount) {
                            $(tr).find("#sent-info").text("(-" + sentAmount + ")");
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

export function applySettingsToMassUtLink(currentThreadId: string) {
    log.info("Applying settings to mass-ut links");
    const localStorageService = LocalStorageHelper.getInstance();
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
        let oldHref = $(this).attr("href");
        if (oldHref) {
            let newHref = oldHref + addionalLinkText;
            $(this).attr("href", newHref);
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

export function trimVillageNameText() {
    log.info("Trimming village names in SD table");
    $(".village_anchor>a").each((index, element) => {
        const coordsPattern = /(\d{3}\|\d{3})/;
        const match = $(element).text().match(coordsPattern);
        if (match) {
            $(element).text(match[1]);
        }
    });
}

export function trimYearFromDateStrings() {
    log.info("Trimming year from date strings in SD table");
    $(".bbcodetable>tbody").children().each((index, element) => {
        if (index === 0) return;

        const $cells = $(element).find("td");
        const $dateFrom = $cells.eq(6);
        const $dateUntil = $cells.eq(7);

        function stripYear($cell: JQuery<HTMLElement>) {
            if (!$cell || $cell.length === 0) return;
            const text = $cell.text().trim();
            if (!text) return;
            const m = text.match(/^(\d{2}\.\d{2})\.(\d{4})(?:\s+(\d{1,2}:\d{2}))?.*$/);
            if (m) {
                const dayMonth = m[1];
                const time = m[3] ? m[3] : "00:00";
                $cell.text(`${dayMonth} ${time}`);
            }
        }

        stripYear($dateFrom);
        stripYear($dateUntil);
    });
}

export function buildMassUtLinkForCurrentWorld(villageId: number): string {
    return buildMassUtLink(game_data.world, villageId);
}
