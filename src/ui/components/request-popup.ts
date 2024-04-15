export function showRequestPopup(pastRequests: any[]) {
    console.log("show request popup");

    if (requestObj === undefined) {
        requestObj = {
            "coord": "123|123",
            "amount": 300,
            "player": "TheHebel97",
            "comment": "test",
            "timeFrom": "2021-07-01T00:00",
            "timeUntil": "2021-07-01T00:00"
        };
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
    let requestHtml: string = "<tr><th>Koordinate</th><th>Pakete</th><th>Spieler</th><th>Anmerkung</th><th>ab (Zeitlich)</th><th>bis (Zeitlich)</th></tr>";
Object.values(requestObj).forEach((request: requestTableData) => {
    requestHtml += `<tr>
<td>${request.coord}</td>
<td>${request.amount}</td>
<td>${request.player}</td>
<td>${request.comment}</td>
<td>${request.timeFrom}</td>
<td>${request.timeUntil}</td>
</tr>`
});
$("requestContent").append(requestHtml)
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

function createTr(): string {


    return "";
}
