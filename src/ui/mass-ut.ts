import {groupData} from "../types/types";
import {storeDataInLocalStorage} from "../logic/helpers/helper-functions";

export function displayMassUt() {
    console.log("standdeff-organizer loaded in mass-ut");
    storeGroupData();
}



function storeGroupData() {
    const groupData :groupData[] = [];
    $(document).ready(function() {
        // Your code here
        $(".vis_item").find("a").each(function () {
            const groupId = $(this).attr("data-group-id");
            const groupName = $(this).text().slice(1, -1);
            if (groupId !== undefined && groupName !== undefined){
                groupData.push({id: groupId, name: groupName});
                return;
            }
            console.error("group id or group name is undefined")
        });
        storeDataInLocalStorage(groupData, "groupData")
    });

}
