import {formatGermanDate, normalizeDateEpoch} from "./date-helper";
import {
    forumPostSource,
    newInquiry,
    packages,
    rowSdTable,
    sdInquiry,
    sdState,
    sdTableRenderRow,
    sdTableRowSource,
    sdTableState,
    updateData,
    villageAnchorSource
} from "../types/types";
import {Log} from "./logging-helper";

const log = Log.scope("table-domain");

const NEW_INQUIRY_FORUM_REGEX = /(\d{3}\|\d{3})\)\sK\d+\s+(\d+)(?:\s+(.*))?/;
const NEW_INQUIRY_SHORTCUT_REGEX = /^(\d{3}\|\d{3})\s+(\d+)(?:\s+(.*))?$/;
const NEW_INQUIRY_OPTIONAL_DATA_REGEX = /^["“”„](.*?)["“”„](.*?)["“”„](.*?)["“”„](.*?)$/;
const PACKAGES_SENT_REGEX = /^\s*(?:id)?(\d+)\s+(\d+|done)(?:\s*Pakete)?\s*$/i;
const VILLAGE_ID_PATTERN = /target=(\d+)/;

export function isDoneValue(value: string | undefined | null): boolean {
    return String(value ?? "").toLowerCase() === "done";
}

export function calculatePackagesToSend(leftAmount: number, sent: string | undefined, preventDuplicate: boolean): number {
    if (!Number.isFinite(leftAmount) || leftAmount <= 0) return 0;
    if (isDoneValue(sent)) return preventDuplicate ? 0 : leftAmount;
    const alreadySent = Math.max(0, Number(sent) || 0);
    return preventDuplicate && alreadySent > 0 ? 0 : Math.max(0, leftAmount - alreadySent);
}

function parseTwCoordsText(coordsText: string): string {
    const coordsPattern = /\d{3}\|\d{3}/g;
    const found = coordsText.match(coordsPattern);
    return found ? found[found.length - 1] : "";
}

function parseVillageIdFromHref(href: string): number {
    const found = href.match(VILLAGE_ID_PATTERN);
    return found ? parseInt(found[1], 10) : 0;
}

export function normalizeDateCell(value: unknown): string {
    return formatGermanDate(value);
}

export function buildCoordVillageIdMap(villageAnchors: villageAnchorSource[]): Map<string, number> {
    const coordVillageIdMap = new Map<string, number>();
    villageAnchors.forEach((anchor) => {
        coordVillageIdMap.set(anchor.coords, anchor.villageId);
    });
    return coordVillageIdMap;
}

function parseNewInquiryLine(line: string): sdInquiry | null {
    const trimmedLine = line.trim();
    const baseMatch = trimmedLine.match(NEW_INQUIRY_FORUM_REGEX) ?? trimmedLine.match(NEW_INQUIRY_SHORTCUT_REGEX);
    if (!baseMatch || !Number.isSafeInteger(Number(baseMatch[2])) || Number(baseMatch[2]) <= 0) {
        return null;
    }

    const optionalDataRaw = baseMatch[3]?.trim() ?? "";
    if (optionalDataRaw === "") {
        return {
            coords: baseMatch[1],
            amount: parseInt(baseMatch[2], 10),
            playerName: undefined,
            comment: undefined,
            dateFrom: undefined,
            dateUntil: undefined
        };
    }

    const optionalDataMatch = optionalDataRaw.match(NEW_INQUIRY_OPTIONAL_DATA_REGEX);
    if (!optionalDataMatch || (optionalDataMatch[3] && !normalizeDateEpoch(optionalDataMatch[3])) || (optionalDataMatch[4] && !normalizeDateEpoch(optionalDataMatch[4]))) {
        return null;
    }

    return {
        coords: baseMatch[1],
        amount: parseInt(baseMatch[2], 10),
        playerName: optionalDataMatch[1] || undefined,
        comment: optionalDataMatch[2] || undefined,
        dateFrom: normalizeDateEpoch(optionalDataMatch[3]) || undefined,
        dateUntil: normalizeDateEpoch(optionalDataMatch[4]) || undefined
    };
}

export function parseForumPostUpdates(posts: forumPostSource[], coordVillageIdMap: Map<string, number>): updateData {
    const parsedUpdateData: updateData = new Map<string, { inquiries: newInquiry; packages: packages }>();

    posts.forEach((post) => {
        const packagesSent: packages = new Map<string, string>();
        const inquiries: newInquiry = new Map<number, sdInquiry>();
        let finished = false;

        post.lines.forEach((line) => {
            if (finished || line === "______________________________") {
                finished = true;
                return;
            }

            const parsedInquiry = parseNewInquiryLine(line);
            const packagesMatch = line.match(PACKAGES_SENT_REGEX);
            if (parsedInquiry) {
                if (!coordVillageIdMap.has(parsedInquiry.coords)) {
                    log.error("coords not found in village map; inquiry not applied", {coords: parsedInquiry.coords});
                    return;
                }
                const villageId = coordVillageIdMap.get(parsedInquiry.coords) || 0;
                inquiries.set(villageId, parsedInquiry);
                return;
            }

            if (!packagesMatch) {
                return;
            }

            const sdId = packagesMatch[1];
            const packageValue = packagesMatch[2];
            if (packagesSent.has(sdId)) {
                const previousValue = packagesSent.get(sdId);
                if (isDoneValue(previousValue)) {
                    return;
                }
                if (isDoneValue(packageValue)) {
                    packagesSent.set(sdId, "done");
                    return;
                }
                const nextValue = (parseInt(previousValue || "0", 10) || 0) + (parseInt(packageValue, 10) || 0);
                packagesSent.set(sdId, String(nextValue));
                return;
            }
            packagesSent.set(sdId, isDoneValue(packageValue) ? "done" : packageValue);
        });

        parsedUpdateData.set(post.postId, {inquiries, packages: packagesSent});
    });

    return parsedUpdateData;
}

export function parseSdTableRows(rows: sdTableRowSource[]): sdTableState {
    const parsedState = new Map<number, rowSdTable>();
    rows.forEach((row) => {
        const villageId = parseVillageIdFromHref(row.villageHref);
        if (!villageId || !/^\d+$/.test(row.sdId.trim())) return;
        parsedState.set(villageId, {
            coords: parseTwCoordsText(row.coordsText),
            sdId: row.sdId,
            startAmount: parseInt(row.startAmountText, 10),
            leftAmount: parseInt(row.leftAmountText, 10),
            playerName: row.playerNameText,
            comment: row.commentText,
            dateFrom: normalizeDateCell(row.dateFromText),
            dateUntil: normalizeDateCell(row.dateUntilText)
        });
    });
    return parsedState;
}

export function parsePostCacheIds(postCacheText: string): string[] {
    return Array.from(new Set(postCacheText.split(",").map(id => id.trim()).filter(id => /^\d+$/.test(id))));
}

export function aggregatePackageUpdates(updateData: updateData): packages {
    const aggregatedPackages: packages = new Map<string, string>();

    updateData.forEach((value) => {
        value.packages.forEach((amount: string, id: string) => {
            if (aggregatedPackages.has(id)) {
                const existingAmount = aggregatedPackages.get(id);
                if (isDoneValue(existingAmount)) {
                    return;
                }
                if (isDoneValue(amount)) {
                    aggregatedPackages.set(id, "done");
                    return;
                }
                const existingNum = parseInt(existingAmount || "0", 10);
                const amountNum = parseInt(amount, 10);
                aggregatedPackages.set(id, String((isNaN(existingNum) ? 0 : existingNum) + (isNaN(amountNum) ? 0 : amountNum)));
                return;
            }

            aggregatedPackages.set(id, isDoneValue(amount) ? "done" : String(isNaN(parseInt(amount, 10)) ? 0 : parseInt(amount, 10)));
        });
    });

    return aggregatedPackages;
}

export function calculateDisplayedLeftAmounts(rows: sdTableRenderRow[], packagesToUpdate: packages): packages {
    const displayedLeftAmounts: packages = new Map<string, string>();

    rows.forEach((row) => {
        if (!packagesToUpdate.has(row.sdId) || isDoneValue(row.leftAmountText)) {
            return;
        }
        const updateRaw = packagesToUpdate.get(row.sdId);
        if (isDoneValue(updateRaw)) {
            displayedLeftAmounts.set(row.sdId, "0");
            return;
        }

        const updateValue = parseInt(updateRaw || "0", 10);
        const oldValue = parseInt(row.leftAmountText, 10);
        const newValue = (isNaN(oldValue) ? 0 : oldValue) - (isNaN(updateValue) ? 0 : updateValue);
        displayedLeftAmounts.set(row.sdId, String(Math.max(0, newValue)));
    });

    return displayedLeftAmounts;
}

export function calculateSentPackageMarkers(rows: sdTableRenderRow[], sentPackages: packages): Map<string, string> {
    const sentPackageMarkers = new Map<string, string>();

    rows.forEach((row) => {
        const sentAmount = sentPackages.get(row.sdId);
        if (!sentAmount) {
            return;
        }
        sentPackageMarkers.set(row.sdId, isDoneValue(sentAmount) ? "(done)" : `(-${sentAmount})`);
    });

    return sentPackageMarkers;
}

export function calculateTotalRequiredPackages(sdTableState: sdTableState): number {
    let totalRequiredPackages = 0;
    sdTableState.forEach((row) => {
        totalRequiredPackages += isNaN(row.leftAmount) ? 0 : row.leftAmount;
    });
    return totalRequiredPackages;
}

export function buildMassUtQuerySuffix(currentThreadId: string, automate: boolean, sdGroupId: string, orderBy: string): string {
    let additionalQuery = "&dir=0&sdTableId=" + currentThreadId;
    if (!automate) {
        return additionalQuery;
    }
    if (sdGroupId !== "" && sdGroupId !== "0") {
        additionalQuery += "&group=" + sdGroupId;
    }
    if (orderBy !== "" && orderBy !== "default") {
        additionalQuery += "&order=" + orderBy;
    }
    return additionalQuery;
}

export function convertMessageRequestStringToRequestArray(messageString: String): sdInquiry[] {
    const lines = messageString.split("\n");
    let requests: sdInquiry[] = [];

    for (const line of lines) {
        const parsedInquiry = parseNewInquiryLine(line);
        if (!parsedInquiry) {
            continue;
        }
        requests.push(parsedInquiry);
    }
    return requests;
}

export function convertRequestArrayToMessageString(requests: sdInquiry[]): string {
    let lines: string[] = [];

    for (const request of requests) {
        let dateFrom = formatGermanDate(request.dateFrom);
        let dateUntil = formatGermanDate(request.dateUntil);
        let line = `${request.coords} ${request.amount} "${request.playerName || ''}"${request.comment || ''}"${dateFrom}"${dateUntil}`;
        lines.push(line);
    }

    return lines.join("\n");
}

export function parseEditSdTableData(tableText: string, cacheText: string): sdState {
    let sdTableState = new Map<number, rowSdTable>();
    tableText.split("[*]").forEach((line) => {
        const cells = line.split("[|]");
        if (cells.length < 5 || cells.length > 9) {
            return;
        }
        while (cells.length < 9) cells.push("");
        cells[8] = cells[8].match(VILLAGE_ID_PATTERN)?.[1] || "";
        cells[4] = cells[4].replace(/\[player]/, "").replace(/\[\/player]/, "");
        const dateFrom = normalizeDateCell(cells[6] ? cells[6].trim() : "");
        const dateUntil = normalizeDateCell(cells[7] ? cells[7].trim() : "");
        sdTableState.set(parseInt(cells[8], 10), {
            coords: cells[1].trim(),
            sdId: cells[0].trim(),
            startAmount: parseInt(cells[2], 10),
            leftAmount: parseInt(cells[3], 10),
            playerName: cells[4],
            comment: cells[5],
            dateFrom: dateFrom,
            dateUntil: dateUntil
        });
    });

    let cache = cacheText.replace(/\[spoiler=postCache]/, "").replace(/\[\/spoiler]/, "").split(",");
    return [sdTableState, cache];
}

export function calculateSdTableState(updateData: updateData, sdState: sdState): sdState {
    const addUpSetting = true;
    const [previousTableState, postCache] = sdState;
    const sdTableState = new Map(Array.from(previousTableState, ([id, row]) => [id, {...row}]));
    let updateDataWithoutCache: updateData = new Map();
    let newPostCache = parsePostCacheIds(postCache.join(","));
    let nextId = Math.max(1, ...Array.from(sdTableState.values(), row => Number(row.sdId) + 1),
        ...postCache.filter(entry => entry.startsWith("sd-next-id=")).map(entry => Number(entry.split("=")[1]) || 1));

    updateData.forEach((postData, postId) => {
        if (!postCache.includes(postId)) {
            updateDataWithoutCache.set(postId, postData);
        }
        if (!newPostCache.includes(postId)) newPostCache.push(postId);
    });

    let summarizedData: { inquiries: newInquiry, packagesSent: packages } = {
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
                if (!isDoneValue(existingPackage)) {
                    let newPackage = isDoneValue(packageSent)
                        ? "done"
                        : (parseInt(existingPackage || "0", 10) + parseInt(packageSent, 10)).toString();
                    summarizedData.packagesSent.set(sdId, newPackage);
                } else {
                    summarizedData.packagesSent.set(sdId, "done");
                }
            } else {
                summarizedData.packagesSent.set(sdId, packageSent);
            }
        });
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
                sdId: String(nextId++),
                startAmount: inquiry.amount,
                leftAmount: inquiry.amount,
                playerName: inquiry.playerName || "",
                comment: inquiry.comment || "",
                dateFrom: normalizeDateCell(inquiry.dateFrom),
                dateUntil: normalizeDateCell(inquiry.dateUntil)
            });
        }
    });

    summarizedData.packagesSent.forEach((amount, sdId) => {
        let matchingEntry = Array.from(sdTableState.entries()).find(([_, row]) => row.sdId === sdId);
        if (matchingEntry) {
            let [villageId, row] = matchingEntry;
            const requestedPackages = isDoneValue(amount)
                ? row.leftAmount
                : parseInt(amount, 10);
            const normalizedRequestedPackages = isNaN(requestedPackages) ? 0 : requestedPackages;
            const nextLeftAmount = Math.max(0, row.leftAmount - normalizedRequestedPackages);

            if (nextLeftAmount !== row.leftAmount - normalizedRequestedPackages) {
                log.warn("Clamped SD row leftAmount to zero during post update", {
                    villageId,
                    sdId,
                    previousLeftAmount: row.leftAmount,
                    requestedPackages: normalizedRequestedPackages
                });
            }

            row.leftAmount = nextLeftAmount;
            sdTableState.set(villageId, row);
        } else {
            log.error(`no matching sdTableRowEntry found for package Id: ${sdId} -> I will ignore it :)`);
        }
    });

    sdTableState.forEach((row, villageId) => {
        if (row.leftAmount <= 0) sdTableState.delete(villageId);
    });
    newPostCache.push(`sd-next-id=${nextId}`);

    return [sdTableState, newPostCache] as sdState;
}

export function parseSdStateToTableString(
    sdState: sdState,
    buildMassUtLink: (villageId: number) => string,
): [string, string] {
    const [sdTableState, cache] = sdState;
    let tableString = "";
    sdTableState.forEach((row, villageId) => {
        tableString += `[*]${row.sdId}[|]${" " + row.coords + " "}[|]${row.startAmount}[|]${row.leftAmount}[|][player]${row.playerName}[/player][|]${row.comment}[|]${normalizeDateCell(row.dateFrom)}[|]${normalizeDateCell(row.dateUntil)}[|][url=${buildMassUtLink(villageId)}]Massen UT-Link[/url][/*]\n`;
    });
    let cacheString = `[spoiler=postCache]${cache.join(",")}[/spoiler]`;
    return [tableString, cacheString];
}
