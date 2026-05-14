import {forumPostSource, packages, sdTableRenderRow, sdTableRowSource, villageAnchorSource} from "../types/types";
import {Log} from "./logging-helper";

const log = Log.scope("table-dom");

type SdTableDomRenderRow = sdTableRenderRow & {
    rowElement: HTMLElement;
};

function getSdTablePost(sdPostId: string) {
    return $("a[name='" + sdPostId + "']").parent();
}

function getSdTableBody(sdPostId: string) {
    return getSdTablePost(sdPostId).find("table").find("tbody");
}

export function readVillageAnchorSources(): villageAnchorSource[] {
    const sources: villageAnchorSource[] = [];
    $(".village_anchor").each((index, element) => {
        const coordsMatch = /(\d{3}\|\d{3})\)\sK/;
        const possibleCoords = $(element).text().trim().split("(");
        const coords = possibleCoords[possibleCoords.length - 1].match(coordsMatch)?.[1];
        const villageId = $(element).attr("data-id");
        if (coords && villageId) {
            sources.push({
                coords,
                villageId: parseInt(villageId, 10)
            });
            return;
        }
        log.error("coords or village id is undefined");
    });
    return sources;
}

export function readForumPostSources(sdPostId: string): forumPostSource[] {
    const sources: forumPostSource[] = [];
    $(".post").each((index, element) => {
        if ($(element).find("a").first().attr("name") === sdPostId) {
            return;
        }
        sources.push({
            postId: $(element).find("a").first().attr("name") || "",
            lines: $(element).find(".text").text().split("\n")
        });
    });
    return sources;
}

export function readSdTableRowSources(tableBodyElem: any): sdTableRowSource[] {
    const sources: sdTableRowSource[] = [];
    tableBodyElem.find("tr").each((index: number, row: any) => {
        if (index === 0) {
            return;
        }

        const cells = $(row).find("td");
        sources.push({
            sdId: cells.eq(0).text().trim(),
            coordsText: cells.eq(1).text().trim(),
            startAmountText: cells.eq(2).text().trim(),
            leftAmountText: cells.eq(3).text().trim(),
            playerNameText: cells.eq(4).text().trim(),
            commentText: cells.eq(5).text().trim(),
            dateFromText: cells.eq(6).text().trim(),
            dateUntilText: cells.eq(7).text().trim(),
            villageHref: cells.eq(8).find("a").attr("href") || ""
        });
    });
    return sources;
}

export function readSdTableRenderRows(sdPostId: string): SdTableDomRenderRow[] {
    const rows: SdTableDomRenderRow[] = [];
    getSdTableBody(sdPostId).find("tr").each((index, row) => {
        if (index === 0) {
            return;
        }
        const cells = $(row).find("td");
        rows.push({
            sdId: cells.eq(0).text().trim(),
            leftAmountText: cells.eq(3).text().trim(),
            rowElement: row as HTMLElement
        });
    });
    return rows;
}

export function applyLeftAmountUpdates(sdPostId: string, updates: packages) {
    const rows = readSdTableRenderRows(sdPostId);
    rows.forEach((row) => {
        const nextValue = updates.get(row.sdId);
        if (nextValue === undefined) {
            return;
        }
        $(row.rowElement).find("td").eq(3).text(nextValue);
    });
}

export function applySentPackageMarkers(sdPostId: string, markers: Map<string, string>) {
    const rows = readSdTableRenderRows(sdPostId);
    rows.forEach((row) => {
        const markerText = markers.get(row.sdId);
        const amountCell = $(row.rowElement).find("td").eq(3);
        const markerElement = amountCell.find(".sent-info");
        if (!markerText) {
            markerElement.remove();
            return;
        }
        if (markerElement.length > 0) {
            markerElement.text(markerText);
            return;
        }
        amountCell.append(` <span class="sent-info" style="color:#FF0000;">${markerText}</span>`);
    });
}

export function appendQueryToMassUtLinks(additionalQuery: string): number {
    const normalizedQuery = additionalQuery.startsWith("&") ? additionalQuery.slice(1) : additionalQuery;
    const additionalParams = new URLSearchParams(normalizedQuery);
    const managedKeys = ["dir", "sdTableId", "group", "order"];
    let updatedLinkCount = 0;
    $(".bbcodetable").find("a[referrerpolicy^='no-ref']").each(function () {
        const oldHref = $(this).attr("href");
        if (!oldHref) {
            return;
        }
        const nextUrl = new URL(oldHref, window.location.origin);
        managedKeys.forEach((key) => nextUrl.searchParams.delete(key));
        additionalParams.forEach((value, key) => {
            nextUrl.searchParams.set(key, value);
        });
        $(this).attr("href", nextUrl.toString());
        updatedLinkCount++;
    });
    return updatedLinkCount;
}
