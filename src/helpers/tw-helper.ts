import {Log} from "./logging-helper";

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


export function villageBBCodeToCoordinates(bbcode: string): string {
    const coordRegex = /\b\d{3}\|\d{3}\b/g;
    const match = bbcode.match(coordRegex);
    if (match) {
        return match[match.length - 1];
    } else {
        Log.error("Invalid village BBCode format");
        return "";
    }
}

export function distanceXY(a:string, b:string) {
    const [x1, y1] = a.split("|").map(Number);
    const [x2, y2] = b.split("|").map(Number);

    return Math.hypot(x2 - x1, y2 - y1);
}
