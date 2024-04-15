import {requestData} from "../../types/types";

export function showRequestPopup(pastRequests: requestData[]) {
    console.log("show request popup");

    if (pastRequests === undefined) {
        pastRequests = [{
            "coords": "123|123",
            "amount": 300,
            "playerName": "TheHebel97",
            "comment": "test",
            "dateFrom": 1713214717465,
            "dateUntil": 1713214717465
        }, {
            "coords": "123|123",
            "amount": 300,
            "playerName": "TheHebel97",
            "comment": "test",
            "dateFrom": undefined,
            "dateUntil": undefined
        }];
    }

    const initPopopBox = `
                    <div class="popup_box_container" id="dbInfo_popup_box">
                        <div class='popup_box show'>
                            <a class='popup_box_close tooltip-delayed' href='#' onclick='$(\"#dbInfo_popup_box\").remove()'>&nbsp</a>
                            <div class='popup_box_content'>
                              <div class='center'>
                                <h2>Bunker Anfragen</h2>
                                <table class="requestContent">
                                </table>
                                <hr style="margin-top: 15px; margin-bottom: 15px">
                                <textarea class="textAreaKoords" style="background-color:#EAD5AA;" ></textarea>
                                <input type="button" value="Hinzufügen" class="addBunkerAnfrage btn" style="">
                              </div>
                            </div>
                        </div>
                        <div class='fader'></div>
                    </div>
    `

    $('#ds_body')[0].insertAdjacentHTML('beforeend', initPopopBox)
    let requestHtml: string = "<tr style='margin=2px;'><th>Koordinate</th><th>Pakete</th><th>Spieler</th><th>Anmerkung</th><th>ab (Zeitlich)</th><th>bis (Zeitlich)</th><th>Löschen</th></tr>";

    pastRequests.forEach((request: requestData, index: number) => {
        const dateFrom = request.dateFrom !== undefined ? new Date(request.dateFrom).toISOString().split('T')[0] : '';
        const dateUntil = request.dateUntil !== undefined ? new Date(request.dateUntil).toISOString().split('T')[0] : '';


        requestHtml += `<tr>
<td>${request.coords}</td>
<td><input type="number" value="${request.amount}"></td>
<td><input type="text" value="${request.playerName}"></td>
<td><input type="text" value="${request.comment}"></td>
<td><input type="date" value="${dateFrom}"></td>
<td><input type="date" value="${dateUntil}"></td>
<td><input style="background: url(https://dsde.innogamescdn.com/asset/c045337f/graphic/delete.png)" onclick="deleteRequest(${index})></td>
</tr>`
    });
//todo: deleteRequest function / siehe aussehen xD
    function deleteRequest(index: number) {
        pastRequests.splice(index, 1);
        // @ts-ignore
        //$(this).closest('tr').remove();
    }

    console.log("requestHtml");
    console.log(requestHtml);
    $(".requestContent").append(requestHtml)
    $(".textAreaKoords").on("change", function () {
        console.log("change")
        console.log($(".textAreaKoords").val())
    });

}

//<tr>
//                                         <th>Koordinate</th>
//                                         <th>Pakete</th>
//                                         <th>Spieler</th>
//                                         <th>Anmerkung</th>
//                                         <th>ab (Zeitlich)</th>
//                                         <th>bis (Zeitlich)</th>
//                                     </tr>
//                                     <tr class="">
//                                         <td></td>
//                                         <td><input type="number" class="inputAnzahl" style="margin:2px;width:50px;background-color:#EAD5AA"></td>
//                                         <td><input type="text" class="inputName" style="margin:2px;width:50px;background-color:#EAD5AA"></td>
//                                         <td><input type="text" class="inputComment" style="margin:2px;width:90px;background-color:#EAD5AA"></td>
//                                         <td><input type="datetime-local" class="inputTimeFrom" style="margin:2px;width:100px;background-color:#EAD5AA"></td>
//                                         <td><input type="datetime-local" class="inputTimeUntil" style="margin:2px;width:100px;background-color:#EAD5AA"></td>
//                                     </tr>


