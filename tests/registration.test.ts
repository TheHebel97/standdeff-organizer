import {resolveScriptContext} from '../src/helpers/script-context';
import {LocalStorageHelper} from '../src/helpers/local-storage-helper';
import {addThreadIdToLocalStorage} from '../src/helpers/helper-functions';
import {addSdPopup} from '../src/ui/components/first-start-thread-popup';
import {viewThread} from '../src/ui/view-thread';
import {sdTable} from '../src/ui/components/sd-table';

jest.mock('../src/ui/components/sd-table', () => ({sdTable: jest.fn()}));
jest.mock('../src/ui/components/forum-quick-settings', () => ({addForumQuickSettings: jest.fn()}));

function fixture() {
    window.history.replaceState({}, '', '/game.php?screen=forum&screenmode=view_thread&thread_id=7396');
    document.body.innerHTML = `<div id="ds_body"><div class="forum-container"><div class="selected"><a href="/game.php?screen=forum&forum_id=2532">Allgemein</a></div></div>
      <div class="clearfix"><table><tr><td><h2>sdsd</h2></td></tr></table></div>
      <div class="post"><a name="last"></a><a name="50624"></a><div class="text"><b>SD Tabelle Paketsystem</b><table class="bbcodetable"><tr><th>ID</th></tr></table></div></div></div>`;
}

beforeEach(() => {
    jest.clearAllMocks();
    (LocalStorageHelper as any).instance = undefined;
});

test('redirect URL resolves the selected forum without guessing from other links', () => {
    fixture();
    expect(resolveScriptContext().forumId).toBe('2532');
});

test('registration reports a failed write instead of pretending success', () => {
    fixture();
    LocalStorageHelper.getInstance().getAllThreads;
    const write = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {throw new Error('quota');});
    try {
        expect(addThreadIdToLocalStorage('7396', '50624', 'sdsd', 'Allgemein', '2532')).toBe(false);
    } finally {write.mockRestore();}
    expect(LocalStorageHelper.getInstance().getAllThreads['7396']).toBeUndefined();
});

test('popup saves the numeric SD post and closes on success', () => {
    fixture();
    addSdPopup('7396', resolveScriptContext().forumId);
    $('#safeThreadAsSd').trigger('click');
    expect(LocalStorageHelper.getInstance().getAllThreads['7396']?.sdPostId).toBe('50624');
    expect($('#dbInfo_popup_box').length).toBe(0);
});

test('new SD thread renders with the newly registered state immediately', () => {
    fixture();
    LocalStorageHelper.getInstance().setNewThread = true;
    sessionStorage.setItem("sd-created-title", "sdsd");
    viewThread(resolveScriptContext());
    expect(sdTable).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({'7396': expect.objectContaining({sdPostId: '50624'})}));
    expect($('#dbInfo_popup_box').length).toBe(0);
    expect(LocalStorageHelper.getInstance().getNewThread).toBe(false);
});
