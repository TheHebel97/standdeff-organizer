export function getCurrentScriptContext() {
    const urlParams = new URLSearchParams(window.location.search);
    let screenParamValue = urlParams.get('screen');
    if (screenParamValue === "place") {
        return screenParamValue;
    }
    if (screenParamValue === "forum") {
        const modeParamValue = urlParams.get('mode');
        return screenParamValue + "-" + modeParamValue;
    }
}
