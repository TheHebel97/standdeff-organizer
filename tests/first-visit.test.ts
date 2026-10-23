import {viewThread} from '../src/ui/view-thread';
import {initializeOnboarding} from '../src/ui/components/onboarding';
import {showPendingOperations} from '../src/ui/components/pending-operations';
import {createPendingOperation,readPendingOperations} from '../src/helpers/pending-operation';
import {LocalStorageHelper} from '../src/helpers/local-storage-helper';
import {resolveScriptContext} from '../src/helpers/script-context';
import {SETUP_TOUR_KEY} from '../src/helpers/game-catalog';

jest.mock('../src/ui/components/sd-table',()=>({sdTable:jest.fn()}));
jest.mock('../src/helpers/tw-helper',()=>({isUserForumMod:()=>false}));
jest.mock('../src/helpers/game-catalog',()=>({...jest.requireActual('../src/helpers/game-catalog'),refreshGameCatalogs:jest.fn()}));

beforeEach(()=>{
    (LocalStorageHelper as any).instance=undefined;
    sessionStorage.clear();
    (global as any).game_data={units:['spear','sword'],player:{id:1}};
    window.history.replaceState({},'','/game.php?screen=forum&screenmode=view_thread&thread_id=9&forum_id=3');
    document.body.innerHTML='<div id="content_value"><h2>Stamm (Stufe 1)</h2><div class="forum-container"><a class="selected">Allgemein</a></div><div class="clearfix"><table><tr><td><h2>SD vom SF</h2></td></tr></table></div><div class="post"><a name="42"></a><div class="text"><b>SD Tabelle Paketsystem</b><table class="bbcodetable"><tr><th>ID</th></tr></table></div></div></div>';
});
const visit=()=>{viewThread(resolveScriptContext());initializeOnboarding(resolveScriptContext());};

test('a new member opening the SF table is locally registered and guided without a New Thread toolbar',()=>{
    visit();
    expect(LocalStorageHelper.getInstance().getAllThreads['9']?.sdPostId).toBe('42');
    expect($('#sd-setup-card').text()).toContain('SD-Gruppe');
    expect($('#sd-forum-quick-settings .sd-organizer-body #sd-thread-setup-launcher').length).toBe(1);
    expect($('#sd-register-thread,#sd-thread-registration-status').length).toBe(0);
});

test('an explicit pause is respected and can be resumed inside the table organizer',()=>{
    visit();
    $('#sd-setup-card button[aria-label="Einrichtung pausieren"]').trigger('click');
    visit();expect($('#sd-setup-card').length).toBe(0);
    expect($('#sd-thread-setup-launcher').text()).toContain('fortsetzen');
    $('#sd-thread-setup-launcher').trigger('click');
    expect($('#sd-setup-card').length).toBe(1);
});

test('complete settings avoid auto-start but keep an organizer entry; stale completion cannot hide missing setup',()=>{
    const storage=LocalStorageHelper.getInstance();
    storage.setSdGroupId='7';storage.setSelectedTemplate='8';storage.setSwordLfz=22;
    storage.setOnboarding={version:1,tours:{[SETUP_TOUR_KEY]:{step:8,paused:false,complete:true}}};
    visit();expect($('#sd-setup-card').length).toBe(0);
    expect($('#sd-thread-setup-launcher').length).toBe(1);
    storage.setSdGroupId='0';visit();
    expect($('#sd-setup-card').text()).toContain('Schritt 1 von 9');
});

test('pending work stays collapsed inside the organizer and never before the game heading',()=>{
    viewThread(resolveScriptContext());
    createPendingOperation({kind:'forum',threadId:'9',message:'Entwurf'});
    showPendingOperations();
    expect($('#content_value').children().first().is('h2')).toBe(true);
    expect($('#sd-forum-quick-settings #sd-pending-operations').length).toBe(1);
    expect($('#sd-pending-operations').is('details:not([open])')).toBe(true);
    expect(readPendingOperations()).toHaveLength(1);
    $('#sd-pending-operations').prop('open',true);showPendingOperations();
    expect($('#sd-pending-operations').prop('open')).toBe(true);
});

test('the final setup step returns directly to the locally configured table',()=>{
    const storage=LocalStorageHelper.getInstance();
    storage.setOnboarding={version:1,tours:{[SETUP_TOUR_KEY]:{step:8,paused:false,complete:false}}};
    visit();
    expect($('#sd-setup-page-link').text()).toBe('SD-Tabelle öffnen');
    const destination=new URL($('#sd-setup-page-link').attr('href')!);
    expect(destination.searchParams.get('thread_id')).toBe('9');
    expect(destination.searchParams.get('forum_id')).toBe('3');
});

test('pending work outside a forum uses a docked script panel instead of modifying the game header',()=>{
    createPendingOperation({kind:'send',threadId:'9',villageId:12,amount:5});
    showPendingOperations();
    expect($('#content_value').children().first().is('h2')).toBe(true);
    expect($('#sd-pending-panel.sd-dock #sd-pending-operations').length).toBe(1);
});
