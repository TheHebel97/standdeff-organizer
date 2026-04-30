import {
    newInquiry,
    packages,
    rowSdTable,
    sdInquiry,
    sdState,
    sdTableState,
    updateData
} from "../types/types";
import {Log} from "./logging-helper";

const log = Log.scope("table-domain");

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
            const y = parseInt(s.slice(0, 4));
            const m = parseInt(s.slice(4, 6));
            const d = parseInt(s.slice(6, 8));
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
    const villageIdPattern = /target=(\d+)/;
    let sdTableState = new Map<number, rowSdTable>();
    tableText.split("[*]").forEach((line) => {
        const cells = line.split("[|]");
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

export function buildMassUtLink(world: string, villageId: number): string {
    return `https://${world}.die-staemme.de/game.php?village=0&screen=place&mode=call&target=${villageId}`;
}

export function parseSdStateToTableString(sdState: sdState, world: string): [string, string] {
    const [sdTableState, cache] = sdState;
    let tableString = "";
    sdTableState.forEach((row, villageId) => {
        tableString += `[*]${row.sdId}[|]${" " + row.coords + " "}[|]${row.startAmount}[|]${row.leftAmount}[|][player]${row.playerName}[/player][|]${row.comment}[|]${normalizeDateCell(row.dateFrom)}[|]${normalizeDateCell(row.dateUntil)}[|][url=${buildMassUtLink(world, villageId)}]Massen UT-Link[/url][/*]\n`;
    });
    let cacheString = `[spoiler=postCache]${cache.join(",")}[/spoiler]`;
    return [tableString, cacheString];
}
