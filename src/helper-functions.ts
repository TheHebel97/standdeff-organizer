export function storeDataInLocalStorage<T>(data: T, key: string) {
        let newData:any;
        const type = typeof data;
        if (type === undefined) {
            console.error("Error storing data in GM: data is undefined");
            return;
        }
        if (type === "object" || Array.isArray(data)) {
             newData = JSON.stringify(data);
        }
        if (type === "string"||type === "number"||type === "boolean") {
            newData = data;
        }
        localStorage.setItem(key, newData);
}

export function getDataFromLocalStorage<T>(key: string) :T {

        const storedData:string|null = localStorage.getItem(key);
        let result:T;
        if (storedData === null) {
            console.error("Error getting data from GM: data is null");
            return undefined as unknown as T;
        }

        return isStringValidJson(storedData) ? JSON.parse(storedData) : storedData as T;
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

