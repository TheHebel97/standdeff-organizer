export function isUserForumMod(){
    //only works inside the forum
    if(game_data.screen === "forum") {
        const modDefiningElement = $("#ally_content > :eq(1)").find("a")
        //return false;
        return modDefiningElement.length > 0;
    }else{
        Log.error("you can only authenticate as a forum mod in the forum screen");
        return false;
    }
}
