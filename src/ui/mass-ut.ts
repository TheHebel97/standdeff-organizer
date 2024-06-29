import {groupData, templateData} from "../types/types";
import {LocalStorageService} from "../logic/local-storage-service";

export function displayMassUt() {
    console.log("standdeff-organizer loaded in mass-ut");
    storeGroupData();
    storeTemplateData();


    const localStorageService = LocalStorageService.getInstance();
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const refererThreadId = urlParams.get('sdTableId');
    if (refererThreadId !== null) {
        let threadData = localStorageService.getThreadData(refererThreadId);
        console.log(threadData)
        const destinationVillageId = urlParams.get('target');


    }
}


function storeGroupData() {
    const groupData: groupData[] = [];
    $(document).ready(function () {
        const localStorageService = LocalStorageService.getInstance();
        $(".vis_item").find(".group-menu-item").each(function () {
            const groupId = $(this).attr("data-group-id");
            const groupName = $(this).text().trim().slice(1, -1);
            if (groupId !== undefined && groupName !== undefined) {
                groupData.push({id: groupId, name: groupName});
                return;
            }
            console.error("group id or group name is undefined")
        });
        localStorageService.setGroupData = groupData;
    });

}

function storeTemplateData() {
    let optionArray: templateData[] = [];
    $(document).ready(function () {
        const localStorageService = LocalStorageService.getInstance();
        $("select[name='template'] > option").each(function () {
            if ($(this).val() === "") return;
            const optionValue: string = String($(this).val());
            const optionObj = JSON.parse(optionValue);
            const returnObj: templateData = {id: optionObj.id, name: optionObj.name};
            optionArray.push(returnObj);
        })
        localStorageService.setTemplateData = optionArray;
    });
}
