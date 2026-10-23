import {resolveScriptContext} from '../src/helpers/script-context';
import {LocalStorageHelper} from '../src/helpers/local-storage-helper';
import {addThreadIdToLocalStorage} from '../src/helpers/helper-functions';
import {viewThread} from '../src/ui/view-thread';
import {sdTable} from '../src/ui/components/sd-table';

jest.mock('../src/ui/components/sd-table', () => ({sdTable: jest.fn()}));
jest.mock('../src/ui/components/forum-quick-settings', () => ({addForumQuickSettings: jest.fn()}));

function fixture() {
    window.history.replaceState({}, '', '/game.php?screen=forum&screenmode=view_thread&thread_id=7396');
    document.body.innerHTML = `<div id="ds_body"><div id="sd-forum-quick-settings"><div class="sd-organizer-body"></div></div><div class="forum-container"><div class="selected"><a href="/game.php?screen=forum&forum_id=2532">Allgemein</a></div></div>
      <div class="clearfix"><table><tr><td><h2>sdsd</h2></td></tr></table></div>
      <div class="post"><a name="last"></a><a name="50624"></a><div class="text"><b>SD Tabelle Paketsystem</b><table class="bbcodetable"><tr><th>ID</th></tr></table></div></div></div>`;
}

beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
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

test('opening a recognizable SD table saves its numeric post and renders without a permanent registered badge', () => {
    fixture();
    viewThread(resolveScriptContext());
    expect($('#sd-register-thread,#sd-thread-registration-status').length).toBe(0);
    expect(sdTable).toHaveBeenCalledTimes(1);
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

test('invalid legacy post anchor is repairable without losing request drafts',()=>{
    fixture();
    const storage=LocalStorageHelper.getInstance();
    storage.addThread('7396',{threadName:'sdsd',forumName:'Allgemein',forumId:'2532',sdPostId:'last',bunkerInquiryCache:[],packagesSent:new Map(),stateOfSdTable:new Map(),updatedPostIds:[]});
    storage.setSdInquiry('7396',[{coords:'123|123',amount:10,playerName:undefined,comment:undefined,dateFrom:undefined,dateUntil:undefined}]);
    viewThread(resolveScriptContext());
    $('#sd-register-thread').trigger('click');
    expect(storage.getSdPostId('7396')).toBe('50624');
    expect(storage.getSdInquiry('7396')[0].amount).toBe(10);
});

test('failed registration stays actionable and shows the error next to the button', () => {
    fixture();
    LocalStorageHelper.getInstance();
    const write = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {throw new Error('quota');});
    try { viewThread(resolveScriptContext());$('#sd-register-thread').trigger('click'); } finally { write.mockRestore(); }
    expect($('#sd-register-thread').prop('disabled')).toBe(false);
    expect($('#sd-thread-registration .sd-registration-error').text()).toContain('konnte nicht gespeichert werden');
    expect(sdTable).not.toHaveBeenCalled();
    expect($('#dbInfo_popup_box').length).toBe(0);
});

test('missing SD post never registers an ordinary thread and repeated rendering keeps one button', () => {
    fixture(); $('.post').remove();
    viewThread(resolveScriptContext()); viewThread(resolveScriptContext());
    expect($('#sd-register-thread').length).toBe(1);
    $('#sd-register-thread').trigger('click');
    expect($('#sd-thread-registration .sd-registration-error').text()).toContain('Keine SD-Tabelle');
    expect(LocalStorageHelper.getInstance().getAllThreads['7396']).toBeUndefined();
    expect($('#dbInfo_popup_box').length).toBe(0);
});
