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

const NEW_INQUIRY_REGEX = /(\d{3}\|\d{3})\)\sK\d+\s+(\d+)\s+["\u201c](.+)?["\u201c](.+)?["\u201c](.+)?["\u201c](.+)?/;
const PACKAGES_SENT_REGEX = /(\d+)\s(\d+|done)/i;
const VILLAGE_ID_PATTERN = /target=(\d+)/;

function isDoneValue(value: string | undefined | null): boolean {
    return String(value ?? "").toLowerCase() === "done";
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

export function normalizeDateCell(value: any): string {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed === "" || trimmed === "0") return "";
        return trimmed;
    }
    if (typeof value === "number" && (value === 0 || isNaN(value))) return "";
    return String(value);
}

export function buildCoordVillageIdMap(villageAnchors: villageAnchorSource[]): Map<string, number> {
    const coordVillageIdMap = new Map<string, number>();
    villageAnchors.forEach((anchor) => {
        coordVillageIdMap.set(anchor.coords, anchor.villageId);
    });
    return coordVillageIdMap;
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

            const inquiryMatch = line.match(NEW_INQUIRY_REGEX);
            const packagesMatch = line.match(PACKAGES_SENT_REGEX);
            if (inquiryMatch) {
                if (!coordVillageIdMap.has(inquiryMatch[1])) {
                    log.error("coords not found in village map", {coords: inquiryMatch[1]});
                }
                const villageId = coordVillageIdMap.get(inquiryMatch[1]) || 0;
                inquiries.set(villageId, {
                    coords: inquiryMatch[1],
                    amount: parseInt(inquiryMatch[2], 10),
                    playerName: inquiryMatch[3],
                    comment: inquiryMatch[4],
                    dateFrom: normalizeDateCell(inquiryMatch[5]) === "" ? undefined : (inquiryMatch[5] ?? undefined),
                    dateUntil: normalizeDateCell(inquiryMatch[6]) === "" ? undefined : (inquiryMatch[6] ?? undefined)
                });
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
    if (postCacheText.length <= 2) {
        return [];
    }
    return postCacheText.split(",");
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

export function buildMassUtQuerySuffix(currentThreadId: string, automate: boolean, sdGroupId: string, orderBy: string): string {
    let additionalQuery = "&dir=0&sdTableId=" + currentThreadId;
    if (!automate) {
        return additionalQuery;
    }
    if (sdGroupId !== "") {
        additionalQuery += "&group=" + sdGroupId;
    }
    if (orderBy !== "") {
        additionalQuery += "&order=" + orderBy;
    }
    return additionalQuery;
}

export function convertMessageRequestStringToRequestArray(messageString: String): sdInquiry[] {
    const lines = messageString.split("\n");
    let requests: sdInquiry[] = [];

    for (const line of lines) {
        let [coords, amount, ...optionalData] = line.split(" ", 3);
        const coordsPattern = /^\d{3}\|\d{3}$/;
        const amountPattern = /^\d+$/;
        if (!coordsPattern.test(coords) || !amountPattern.test(amount)) {
            continue;
        }
        optionalData = optionalData[0]?.split('"') || [];
        requests.push({
            coords: coords,
            amount: Number(amount),
            playerName: optionalData[1] || undefined,
            comment: optionalData[2] || undefined,
            dateFrom: normalizeDateCell(optionalData[3]) === "" ? undefined : (optionalData[3] ?? undefined),
            dateUntil: normalizeDateCell(optionalData[4]) === "" ? undefined : (optionalData[4] ?? undefined)
        });
    }
    return requests;
}

export function convertRequestArrayToMessageString(requests: sdInquiry[]): string {
    let lines: string[] = [];

    function pad(n: number) { return n < 10 ? "0" + n : String(n); }
    function formatDate(value?: number): string {
        if (value === undefined || value === null) return "";
        const v = Number(value);
        if (isNaN(v) || v === 0) return "";

        let date: Date | null = null;

        if (v > 1e12) {
            date = new Date(v);
        } else if (v > 1e9) {
            date = new Date(v * 1000);
        } else if (/^\d{8}$/.test(String(v))) {
            const s = String(v);
            const y = parseInt(s.slice(0, 4), 10);
            const m = parseInt(s.slice(4, 6), 10);
            const d = parseInt(s.slice(6, 8), 10);
            date = new Date(y, m - 1, d, 0, 0);
        } else if (v >= 1970 && v <= 3000) {
            date = new Date(v, 0, 1, 0, 0);
        } else {
            return String(v);
        }

        if (!date || isNaN(date.getTime())) return String(v);
        const day = pad(date.getDate());
        const month = pad(date.getMonth() + 1);
        const year = date.getFullYear();
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }

    for (const request of requests) {
        let dateFrom = formatDate(request.dateFrom as any);
        let dateUntil = formatDate(request.dateUntil as any);
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
            sdId: cells[0],
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
    const [sdTableState, postCache] = sdState;
    let updateDataWithoutCache: updateData = new Map();
    let newPostCache: string[] = [];

    updateData.forEach((postData, postId) => {
        if (!postCache.includes(postId)) {
            updateDataWithoutCache.set(postId, postData);
        }
        newPostCache.push(postId);
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
                    summarizedData.packagesSent.set(sdId, packageSent);
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
                sdId: String(sdTableState.size + 1),
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
            row.leftAmount -= isDoneValue(amount) ? row.leftAmount : parseInt(amount, 10);
            sdTableState.set(villageId, row);
        } else {
            log.error(`no matching sdTableRowEntry found for package Id: ${sdId} -> I will ignore it :)`);
        }
    });

    let newId = 1;
    sdTableState.forEach((row, villageId) => {
        if (row.leftAmount === 0) {
            sdTableState.delete(villageId);
            newId--;
        }
        row.sdId = String(newId);
        newId++;
    });

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
