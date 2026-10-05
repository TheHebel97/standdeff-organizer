import {registerSdThread} from "../../helpers/thread-registration";

export function addSdOptions(currentThreadId: string | null, forumId: string | null, onRegistered?: () => void, registered = false) {
    let $controls = $("#sd-thread-registration");
    if (!$controls.length) {
        $controls = $('<div id="sd-thread-registration" style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #b59766">');
        $('<input type="button" class="btn" id="sd-register-thread" aria-describedby="sd-thread-registration-status" style="width:100%">').appendTo($controls);
        $('<div id="sd-thread-registration-status" role="status" style="margin-top:6px;font-size:12px">').appendTo($controls);
        $('#sd-forum-quick-settings .sd-organizer-body').prepend($controls);
    }
    const update = (saved: boolean) => {
        $controls.find('#sd-register-thread').prop('disabled', saved).val(saved ? 'SD-Tabelle festgelegt' : 'Als SD-Tabelle festlegen');
        $controls.find('#sd-thread-registration-status').text(saved ? 'Dieser Thread ist als SD-Tabelle zugeordnet.' : 'Öffne den Tabellenbeitrag und lege diesen Thread als SD-Tabelle fest.');
    };
    update(registered);
    $controls.find('#sd-register-thread').off('click.sdThreadRegistration').on('click.sdThreadRegistration', () => {
        if (registerSdThread(currentThreadId, forumId)) {
            update(true);
            onRegistered?.();
        }
    });
}
