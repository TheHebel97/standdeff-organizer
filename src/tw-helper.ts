export function getCurrentScriptContext() :string {
    const urlParams = new URLSearchParams(window.location.search);
    let screenParamValue = urlParams.get('screen');
    let screenName:string = screenParamValue !== null ? screenParamValue : "";
    if (screenName === "place") {
        return screenName;
    }
    if (screenName === "forum") {
        const modeParamValue = urlParams.get('mode')===null ? urlParams.get('screenmode') : urlParams.get('mode');
        return screenName + "-" + modeParamValue;
    }
    return "unknown";
}
