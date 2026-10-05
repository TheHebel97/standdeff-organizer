import {readPendingOperations, discardPendingOperation} from '../../helpers/pending-operation';
import {LocalStorageHelper} from '../../helpers/local-storage-helper';
import {ensureOrganizerStyles} from './organizer-style';

export function showPendingOperations() {
    $('#sd-pending-operations').remove();
    const operations = readPendingOperations();
    if (!operations.length) return;
    ensureOrganizerStyles();
    const $box = $('<div id="sd-pending-operations" class="sd-organizer" style="padding:10px;margin:10px 0" role="status">');
    $box.append($('<b>').text('Offene Vorgänge prüfen'));
    operations.forEach(operation => {
        const $row = $('<div style="margin-top:8px">');
        $row.append($('<p>').text(operation.kind === 'send'
            ? `${operation.amount} Pakete für Dorf ${operation.villageId}: Versand noch nicht bestätigt. Bitte den tatsächlichen Versand im Spiel prüfen.`
            : 'Forenbeitrag noch nicht bestätigt. Der Entwurf bleibt gespeichert. Bitte im Thread prüfen, ob der Beitrag angekommen ist.'));
        if (operation.kind === 'forum' && operation.message) {
            $('<input type="button" class="btn" value="Beitrag wieder einfüllen">').on('click', () => $('#message').val(operation.message!)).appendTo($row);
        }
        $('<input type="button" class="btn" value="Erfolgreich bestätigen">').on('click', () => { LocalStorageHelper.getInstance().confirmOperation(operation); showPendingOperations(); }).appendTo($row);
        $('<input type="button" class="btn" value="Versuch verwerfen">').on('click', () => { discardPendingOperation(operation.id); showPendingOperations(); }).appendTo($row);
        $box.append($row);
    });
    $('#content_value').length ? $('#content_value').prepend($box) : $('body').append($box);
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
