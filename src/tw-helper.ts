export function getCurrentScriptContext() :string {
    const urlParams = new URLSearchParams(window.location.search);
    let screenParamValue = urlParams.get('screen');
    let screenName:string = screenParamValue !== null ? screenParamValue : "";
    if (screenName === "place") {
        return screenName;
    }
    if (screenName === "forum") {
        const modeParamValue = urlParams.get('mode')===null ? urlParams.get('screenmode') : urlParams.get('mode');
        //const editModeParamValue = urlParams.get('edit_post_id');
        return screenName + "-" + modeParamValue;
    }
    return "unknown";
}

export function getUnitInfoData(){

}


export function isUserForumMod(){
    //only works inside the forum
    if(game_data.screen === "forum") {
        const modDefiningElement = $("#ally_content > :eq(1)").find("a")
        return modDefiningElement.length > 0;
    }else{
        console.error("you can only authenticate as a forum mod in the forum screen");
        return false;
    }
}
