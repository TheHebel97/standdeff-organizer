import {parseReturn, sdInquiry} from "../../types/types";
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

export function parseSdPosts(): parseReturn {
    const localStorageService = LocalStorageService.getInstance();
    const urlParams = new URLSearchParams(window.location.search);
    const currentThreadId = urlParams.get("thread_id") || "";
    const sdPostId = localStorageService.getSdPostId(currentThreadId);


    let coordVilIdMap = new Map<string, number>();
    let packagesSent = new Map<string, string>();
    let inquiries = new Map<string, sdInquiry>();
    let postIds: string[] = [];

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

        let finished = false; // for skipping the signature
        if ($(element).find("a").first().attr("name") === sdPostId) { // or already updated and not deleted todo:
            return; // skip sd thread id
        }
        const postId = $(element).find("a").first().attr("name")||"";
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
                inquiries.set(villageId.toString(), sdInquiry);
            } else if (packagesMatch) {
                if (packagesSent.has(packagesMatch[1])) {
                    let oldVal = packagesSent.get(packagesMatch[1]);
                    if (oldVal === "done" || oldVal === undefined) {
                        return;
                    }
                    let newVal = parseInt(oldVal) + parseInt(packagesMatch[2]);
                    packagesSent.set(packagesMatch[1], newVal.toString());
                    return;
                }
                packagesSent.set(packagesMatch[1], packagesMatch[2]);

            }
        })
        postIds.push(postId);


    });
    return [inquiries, packagesSent, postIds];
}
