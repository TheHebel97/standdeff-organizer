export function storeDatainGM(data: any, key: string) {
    if (typeof GM_setValue === "function") {
        GM_setValue(key, data);
    }
}

export function getDataFromGM(key: string) {
    if (typeof GM_getValue === "function") {
        return GM_getValue(key);
    }
    return null;
}
