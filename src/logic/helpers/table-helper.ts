import {requestData} from "../../types/types";

export function convertMessageRequestStringToRequestArray(messageString: String): requestData[] {
    // Split the messageString into lines
    const lines = messageString.split('\n');

    // Array to hold the requestData objects
    let requests: requestData[] = [];

    // Iterate over each line
    for (const line of lines) {
        // Split the line at the first space to get coords and amount
        let [coords, amount, ...optionalData] = line.split(' ', 3);
        // Split the optional data at the delimiter "
        optionalData = optionalData[0]?.split('"') || [];
        // Create the requestData object
        let request: requestData = {
            coords: coords,
            amount: Number(amount),
            playerName: optionalData[1] || undefined,
            comment: optionalData[3] || undefined,
            dateFrom: Number(optionalData[5]) || undefined,
            dateUntil: Number(optionalData[7]) || undefined
        };

        // Add the requestData object to the array
        requests.push(request);
    }
    return requests;
}
