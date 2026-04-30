import {packages, sdTableState, updateData} from "../types/types";
import {LocalStorageHelper} from "./local-storage-helper";
import {Log} from "./logging-helper";
import {
    aggregatePackageUpdates,
    buildCoordVillageIdMap,
    buildMassUtLink,
    buildMassUtQuerySuffix,
    calculateDisplayedLeftAmounts,
    calculateSentPackageMarkers,
    parseForumPostUpdates,
    parseSdTableRows
} from "./table-domain";
import {
    appendQueryToMassUtLinks,
    applyLeftAmountUpdates,
    applySentPackageMarkers,
    readForumPostSources,
    readSdTableRenderRows,
    readSdTableRowSources,
    readVillageAnchorSources
} from "./table-dom";

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

function summarizePackagesMap(packagesToSummarize: packages) {
    return {
        packageCount: packagesToSummarize.size,
        entries: Array.from(packagesToSummarize.entries()).slice(0, 10)
    };
}

export function parseSdPosts(currentThreadId: string): updateData {
    const localStorageService = LocalStorageHelper.getInstance();
    const sdPostId = localStorageService.getSdPostId(currentThreadId);
    const villageAnchors = readVillageAnchorSources();
    const forumPosts = readForumPostSources(sdPostId);

    log.info("Parsing SD posts from thread view", {
        currentThreadId,
        sdPostId,
        villageAnchorCount: villageAnchors.length,
        postCount: forumPosts.length
    });

    const parsedUpdateData = parseForumPostUpdates(forumPosts, buildCoordVillageIdMap(villageAnchors));
    log.state("Finished parsing SD posts", {
        coordVillageMappingCount: villageAnchors.length,
        summary: summarizeUpdateDataMap(parsedUpdateData)
    });
    return parsedUpdateData;
}

export function parseTableHtmlElemToSdState(tableBodyElem: any): sdTableState {
    return parseSdTableRows(readSdTableRowSources(tableBodyElem));
}

export function displayUpdatedSdTable(currentThreadId: string, packagesToUpdate: packages) {
    const localStorageService = LocalStorageHelper.getInstance();
    const sdPostId = localStorageService.getSdPostId(currentThreadId);
    const renderRows = readSdTableRenderRows(sdPostId);
    const nextLeftAmounts = calculateDisplayedLeftAmounts(renderRows, packagesToUpdate);

    log.state("Applying package deltas to SD table DOM", {
        currentThreadId,
        sdPostId,
        packages: summarizePackagesMap(packagesToUpdate),
        renderedUpdates: summarizePackagesMap(nextLeftAmounts)
    });

    applyLeftAmountUpdates(sdPostId, nextLeftAmounts);
}

export function updateSentPackagesInSdTable(currentThreadId: string) {
    const localStorageService = LocalStorageHelper.getInstance();
    const sdPostId = localStorageService.getSdPostId(currentThreadId);
    const sentPackages = localStorageService.getPackagesSent(currentThreadId);
    const renderRows = readSdTableRenderRows(sdPostId);
    const sentMarkers = calculateSentPackageMarkers(renderRows, sentPackages);

    log.state("Syncing sent packages marker into SD table DOM", {
        currentThreadId,
        sdPostId,
        packages: summarizePackagesMap(sentPackages),
        markerCount: sentMarkers.size
    });

    applySentPackageMarkers(sdPostId, sentMarkers);
}

export function applySettingsToMassUtLink(currentThreadId: string) {
    log.info("Applying settings to mass-ut links");
    const localStorageService = LocalStorageHelper.getInstance();
    const automate = localStorageService.getAutomateMassenUt;
    const sdGroupId = localStorageService.getSdGroupId;
    const orderBy = localStorageService.getSortBy;
    const additionalLinkText = buildMassUtQuerySuffix(currentThreadId, automate, sdGroupId, orderBy);
    const updatedLinkCount = appendQueryToMassUtLinks(additionalLinkText);

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
