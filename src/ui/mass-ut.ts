import {groupData, rowSdTable, templateData, ThreadData} from "../types/types";
import {LocalStorageService} from "../logic/local-storage-service";
import {lsThreadData} from "../types/localStorageTypes";

export function displayMassUt() {
    $(document).ready(function () {
        console.log("standdeff-organizer loaded in mass-ut");
        storeGroupData();
        storeTemplateData();


        const localStorageService = LocalStorageService.getInstance();
        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        const refererThreadId = urlParams.get('sdTableId');
        const preventDuplicateDestination = localStorageService.getPreventDuplicateDestination;
        if (refererThreadId !== null) {
            let threadData = localStorageService.getThreadData(refererThreadId) || {} as ThreadData;
            console.log(threadData)
            const destinationVillageId = urlParams.get('target');
            const selectedTemplate = localStorageService.getSelectedTemplate;
            //auswahl der passenden vorlage
            if (localStorageService.getAutomateMassenUt) {
                $("select[name='template'] > option").each(function () {
                    let optionValue = $(this).val();
                    if (optionValue) {
                        let optionObj = JSON.parse(String(optionValue));
                        if (optionObj.id === selectedTemplate) {
                            $(this).prop('selected', true);
                            return false; // Beendet die each-Schleife, sobald das passende Element gefunden wurde
                        }
                    }
                });
            }

            const sendingObj = threadData?.stateOfSdTable.get(Number(destinationVillageId)) || {} as rowSdTable;
            const alreadySentAmount = parseInt(String(threadData?.packagesSent.get(sendingObj?.sdId))) | 0;
            console.log(sendingObj)
            console.log(alreadySentAmount)
            let packagesToSend = sendingObj.leftAmount - alreadySentAmount;
            //!(alreadySentAmount!==undefined && preventDuplicateDestination)
            if ((alreadySentAmount > 0 && preventDuplicateDestination) || packagesToSend < 0) {
                packagesToSend = 0;
            }

            $(".unit_checkbox").each(function () {
                if (!$(this).is(':checked')) {
                    $(this).trigger('click');
                }
            });
            // check how many checkboxes are present

            if ($(".troop-request-selector").length < packagesToSend) {
                $("#place_call_select_all").trigger('click');
            } else {
                $(".troop-request-selector").each(function () {
                    if (packagesToSend > 0) {
                        $(this).trigger('click');
                        packagesToSend--;
                    }
                });
            }
            // count checked checkboxes

            $("#place_call_form_submit").prop('disabled', true);
            $(".evt-button-fill").css("background", "#0e7a0e");

            $(".evt-button-fill").on("click", function () {
                $(this).prop('disabled', true);
                $("#place_call_form_submit").prop('disabled', false);
                $("#place_call_form_submit").css("background", "#0e7a0e");
            })

            $("#place_call_form_submit").on("click", function () {
                //$(this).prop('disabled', true);
                let checkedBoxes = $(".troop-request-selector:checked").length;
                threadData?.packagesSent.set(sendingObj.sdId, String(checkedBoxes));
                localStorageService.setThreadData(refererThreadId, threadData);
                console.log(packagesToSend)
            })


        }
    });
}


function storeGroupData() {
    const groupData: groupData[] = [];

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


}

function storeTemplateData() {
    let optionArray: templateData[] = [];

    const localStorageService = LocalStorageService.getInstance();
    $("select[name='template'] > option").each(function () {
        if ($(this).val() === "") return;
        const optionValue: string = String($(this).val());
        const optionObj = JSON.parse(optionValue);
        const returnObj: templateData = {id: optionObj.id, name: optionObj.name};
        optionArray.push(returnObj);
    })
    localStorageService.setTemplateData = optionArray;

}
