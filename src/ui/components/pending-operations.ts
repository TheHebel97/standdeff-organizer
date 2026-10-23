import {readPendingOperations, discardPendingOperation} from '../../helpers/pending-operation';
import {LocalStorageHelper} from '../../helpers/local-storage-helper';
import {ensureOrganizerStyles} from './organizer-style';
import {dockOrganizerPanel,layoutOrganizerDocks} from './organizer-dock';

export function showPendingOperations() {
    const expanded=$('#sd-pending-operations').prop('open')===true;
    $('#sd-pending-operations').remove();
    const operations = readPendingOperations();
    if (!operations.length) {$('#sd-pending-panel').remove();layoutOrganizerDocks();return;}
    ensureOrganizerStyles();
    const $box = $('<details id="sd-pending-operations" style="margin-top:12px;border-top:1px solid #b59766;padding-top:8px">').prop('open',expanded);
    $box.append($('<summary>').text(`Offene Vorgänge prüfen (${operations.length})`));
    operations.forEach(operation => {
        const $row = $('<div style="margin-top:8px">');
        $row.append($('<p>').text(operation.kind === 'send'
            ? `${operation.amount} Pakete für Dorf ${operation.villageId}: Versand noch nicht bestätigt. Bitte den tatsächlichen Versand im Spiel prüfen.`
            : 'Forenbeitrag noch nicht bestätigt. Der Entwurf bleibt gespeichert. Bitte im Thread prüfen, ob der Beitrag angekommen ist.'));
        if (operation.kind === 'forum' && operation.message) {
            $('<input type="button" class="btn" value="Beitrag wieder einfüllen">').on('click', () => $('#message').val(operation.message!)).appendTo($row);
        }
        const $amount=$('<input type="number" min="1" step="1" aria-label="Tatsächlich verschickte Pakete" style="width:65px">').val(operation.amount ?? 0).attr('max',operation.amount ?? 0);
        if (operation.kind === 'send') $row.append($('<label>').text('Tatsächlich verschickte Pakete: ').append($amount));
        $('<input type="button" class="btn" value="Erfolgreich bestätigen">').on('click', () => {
            const amount=Number($amount.val());
            if (operation.kind === 'send' && (!Number.isSafeInteger(amount) || amount <= 0 || amount > (operation.amount ?? 0))) {
                UI.ErrorMessage('Bitte die tatsächlich verschickte Paketmenge prüfen.',4000); return;
            }
            try {
                LocalStorageHelper.getInstance().confirmOperation(operation.kind === 'send' ? {...operation,amount} : operation);
                showPendingOperations();
            } catch { UI.ErrorMessage('Bestätigung konnte nicht gespeichert werden. Der Vorgang bleibt erhalten.',5000); }
        }).appendTo($row);
        $('<input type="button" class="btn" value="Versuch verwerfen">').on('click', () => { discardPendingOperation(operation.id); showPendingOperations(); }).appendTo($row);
        $box.append($row);
    });
    const $organizer=$('#sd-forum-quick-settings .sd-organizer-body,#sd-bunker-import-panel').first();
    if ($organizer.length) {$('#sd-pending-panel').remove();$organizer.append($box);}
    else {
        let $panel=$('#sd-pending-panel');
        if (!$panel.length) $panel=$('<aside id="sd-pending-panel" class="sd-organizer" style="width:285px;z-index:9999"><div class="sd-organizer-handle">SD Organizer</div></aside>').appendTo('body');
        $panel.append($box);
        dockOrganizerPanel($panel[0],{side:'right',top:140});
    }
    layoutOrganizerDocks();
}

export function confirmVisibleForumPosts(threadId:string) {
    // Require a new numeric post anchor, the player's own author link, and exact message text.
    const playerId = String(game_data.player.id);
    readPendingOperations().filter(op => op.kind === 'forum' && op.threadId === threadId).forEach(operation => {
        const normalize = (text:string) => text.replace(/\r/g,'').trim();
        const found = $('.post').toArray().some(post => {
            const $post=$(post);
            const id=$post.children('a[name]').map((_,a)=>a.getAttribute('name')).get().find(id=>/^\d+$/.test(id));
            return id && !operation.knownPostIds?.includes(id) && $post.find(`.igmline a[href*="id=${playerId}"]`).length > 0
                && normalize($post.find('.text').text()) === normalize(operation.message ?? '');
        });
        if (found) LocalStorageHelper.getInstance().confirmOperation(operation);
    });
}
