export function storeDataInGM<T>(data: T, key: string) {
    if (typeof GM_setValue === "function") {
        let newData:any;
        const type = typeof data;
        if (type === undefined) {
            console.error("Error storing data in GM: data is undefined");
            return;
        }
        if (type === "object" && isStringValidJson(data as string)) {
             newData = JSON.stringify(data);
        }
        if (type === "string"||type === "number"||type === "boolean") {
            newData = data;
        }
        GM_setValue(key, newData);
    }else{
        console.error("Error storing data in GM: GM_setValue is not a function");
    }
}

export function getDataFromGM<T>(key: string) :T {
    if (typeof GM_getValue === "function") {
        const storedData:string|null = GM_getValue(key);
        let result:T;
        if (storedData === null) {
            console.error("Error getting data from GM: data is null");
            return undefined as unknown as T;
        }

        return isStringValidJson(storedData) ? JSON.parse(storedData) : storedData as T;

    } else {
        console.error("Error getting data from GM: GM_getValue is not a function");
        return undefined as unknown as T;
    }
}



//private helper functions
function isStringValidJson(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        console.error("Error parsing string to JSON: " + str);
        return false;
    }
    return true;
}

function isObject<T>(data: T) {
    return typeof data === "object";
}
