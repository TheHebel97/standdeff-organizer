export function showRequestPopup(pastRequests: any[]) {
    console.log("show request popup");

    const popupBoxBunkerAnfragen = `
                    <div class="popup_box_container" id="dbInfo_popup_box">
                        <div class='popup_box show'>
                            <a class='popup_box_close tooltip-delayed' href='#' onclick='$(\"#dbInfo_popup_box\").remove()'>&nbsp</a>
                            <div class='popup_box_content'>
                              <div class='center'>
                                <h2>Bunker Anfragen</h2>
                                <table>
                                    <tr>
                                        <th>ID</th>
                                        <th>Anzahl</th>
                                    </tr>
                                    <tr>
                                        <td><input type="text" class="inputId" style="width:50px;background-color:#EAD5AA"></td>
                                        <td><input type="text" class="inputAnzahl" style="width:50px;background-color:#EAD5AA"></td>
                                    </tr>
                                </table>
                              </div>
                            </div>
                        </div>
                        <div class='fader'></div>
                    </div>
    `

    //$('#ds_body')[0].insertAdjacentHTML('beforeend', popupBoxBunkerAnfragen)


}
