import {initializeSetupOnboarding} from '../src/ui/components/setup-onboarding';
import {initializeOnboarding} from '../src/ui/components/onboarding';
import {displaySettings} from '../src/ui/settings';
import {LocalStorageHelper} from '../src/helpers/local-storage-helper';
import {resolveScriptContext} from '../src/helpers/script-context';
import {SETUP_TOUR_KEY,initializeGameCatalog,updateGameCatalog} from '../src/helpers/game-catalog';
jest.mock('../src/helpers/tw-helper',()=>({isUserForumMod:()=>false}));
jest.mock('../src/helpers/game-catalog',()=>({...jest.requireActual('../src/helpers/game-catalog'),refreshGameCatalogs:jest.fn()}));

const progress=()=>LocalStorageHelper.getInstance().getOnboarding?.tours[SETUP_TOUR_KEY];
const next=()=>$('#sd-setup-card button').filter((_,el)=>$(el).text()==='Weiter').trigger('click');
function visit(query:string) {
    window.history.replaceState({},'',`/game.php?village=123&t=456&${query}`);
    document.body.innerHTML='<div id="content_value"><h2>Stamm</h2><table><tr><td id="forum-actions"><a class="thread_button" href="/game.php?screen=forum&mode=new_thread">Neuer Thread</a><a class="thread_button" href="/game.php?screen=forum&mode=new_poll">Neue Umfrage</a></td></tr></table></div>';
    initializeSetupOnboarding(resolveScriptContext());
}
const start=()=>$('#sd-setup-launcher').trigger('click');
function ready() {
    updateGameCatalog('groups',[{id:'7',name:'SD'}],true);
    updateGameCatalog('templates',[{id:'8',name:'SD Dual'}],true);
    const storage=LocalStorageHelper.getInstance();storage.setSdGroupId='7';storage.setSelectedTemplate='8';
}
beforeEach(()=>{
    sessionStorage.clear();
    (LocalStorageHelper as any).instance=undefined;
    (global as any).game_data={units:['spear','sword'],screen:'settings'};
    initializeGameCatalog(resolveScriptContext());
});

test('forum has an inline launcher; first visits never show an unsolicited setup window',()=>{
    for (const query of ['screen=settings','screen=place&mode=templates','screen=overview_villages&mode=groups','screen=map']) {
        visit(query); expect($('#sd-setup-card,#sd-setup-launcher').length).toBe(0);
    }
    visit('screen=ally&mode=forum');
    expect($('#forum-actions > #sd-setup-launcher').length).toBe(1);
    expect($('#sd-setup-launcher').prev().text()).toBe('Neue Umfrage');
    expect($('#sd-setup-launcher .thread_new').text()).toBe('Einrichtung starten');
    expect($('#sd-setup-launcher img').attr('src')).toMatch(/^data:image\/svg\+xml/);
    expect($('#sd-setup-card').length).toBe(0);
    expect(progress()).toBeUndefined();
    start(); expect($('#sd-setup-card').text()).toContain('SD-Gruppe erstellen');
});

test('activated setup resumes across pages, preserves sitter/village and pauses on Escape',()=>{
    visit('screen=forum&screenmode=view_forum');ready();start();
    const link=new URL($('#sd-setup-page-link').attr('href')!);
    expect([...link.searchParams.entries()]).toEqual(expect.arrayContaining([['screen','overview_villages'],['mode','groups'],['type','static'],['village','123'],['t','456']]));
    next();visit('screen=place&mode=templates');
    expect($('#sd-setup-card').text()).toContain('Schritt 2 von 9');
    $(document).trigger($.Event('keydown',{key:'Escape'}));
    expect(progress()!.paused).toBe(true);
    visit('screen=settings');expect($('#sd-setup-card,#sd-setup-launcher').length).toBe(0);
    visit('screen=ally&mode=forum');start();
    expect($('#sd-setup-card').text()).toContain('Schritt 2 von 9');
});

test('settings retain the table layout and setup proceeds without a mass UT fetch step',()=>{
    visit('screen=forum&screenmode=view_thread&thread_id=9');ready();start();next();next();
    expect($('#sd-setup-card').text()).toContain('Schritt 3 von 9');
    expect($('#sd-setup-card').text()).not.toContain('Gruppen und Vorlagen einlesen');
    window.history.replaceState({},'','/game.php?screen=settings');
    document.body.innerHTML='<div id="content_value"></div>';
    displaySettings(resolveScriptContext());initializeSetupOnboarding(resolveScriptContext());
    expect($('#sd-settings-root').is('table.vis[data-sd-native-settings]')).toBe(true);
    expect($('#sd-settings-root.sd-organizer,.sd-settings-card').length).toBe(0);
    expect($('#sd-settings-root details').length).toBe(0);
    expect($('#sd-settings-root [data-sd-help-for]').length).toBe(0);
    for (const target of ['sd-group-id','sd-template-id','automate-massen-ut','prevent-duplicate-destination','sd-sort-by','sd-schwertLfz']) {
        expect($(`#${target}`).hasClass('sd-setup-target')).toBe(true);next();
    }
    $('#sd-setup-card button').filter((_,el)=>$(el).text()==='Einrichtung abschließen').trigger('click');
    expect(progress()!.complete).toBe(true);
    visit('screen=ally&mode=forum');expect($('#sd-setup-card').length).toBe(0);
    start();expect(progress()!.step).toBe(0);
});

test('hover help leaves shared setup and other progress intact',()=>{
    visit('screen=forum&screenmode=view_thread&thread_id=9');start();
    const storage=LocalStorageHelper.getInstance();
    storage.setOnboarding={version:1,tours:{...storage.getOnboarding!.tours,'other:user':{step:2,paused:true,complete:false}}};
    $('#content_value').append('<div id="sd-forum-quick-settings" class="sd-organizer"><div class="sd-organizer-handle">SD Organizer</div><div class="sd-organizer-body"></div></div>');
    initializeOnboarding(resolveScriptContext());$('#sd-onboarding-launcher').trigger('mouseenter');
    expect(progress()!.paused).toBe(false);expect($('#sd-setup-card').length).toBe(1);
    expect($('#sd-onboarding-card').length).toBe(0);
    expect($('#sd-hover-help').attr('role')).toBe('tooltip');
    expect(storage.getOnboarding!.tours['other:user'].step).toBe(2);
});

test('background catalog updates preserve the highlighted control and remove stale deleted options',()=>{
    visit('screen=forum&screenmode=view_thread&thread_id=9');ready();start();next();next();
    window.history.replaceState({},'','/game.php?screen=settings');
    document.body.innerHTML='<div id="content_value"></div>';
    displaySettings(resolveScriptContext());initializeSetupOnboarding(resolveScriptContext());
    const storage=LocalStorageHelper.getInstance();
    storage.setGroupData=[{id:'7',name:'SD'}];
    document.dispatchEvent(new Event('sd-catalog-updated'));
    expect($('#sd-group-id').is('select.sd-setup-target')).toBe(true);
    expect($('#sd-group-id option[value=7]').text()).toBe('SD');
    storage.setGroupData=[];document.dispatchEvent(new Event('sd-catalog-updated'));
    expect($('#sd-group-id').is('input.sd-setup-target')).toBe(true);
    expect($('#sd-group-id option').length).toBe(0);
});

test('cached IDs and the checklist cannot bypass actual game validation',()=>{
    const storage=LocalStorageHelper.getInstance();
    storage.setGroupData=[{id:'7',name:'SD'}];storage.setSdGroupId='7';
    visit('screen=forum&screenmode=view_forum');start();
    expect($('#sd-setup-next').prop('disabled')).toBe(true);
    expect($('#sd-setup-resource-select option[value=7]').text()).toBe('SD');
    expect($('#sd-setup-card button').filter((_,el)=>$(el).text()==='Als SD-Gruppe festlegen').prop('disabled')).toBe(true);
    expect($('.sd-setup-checklist button').eq(2).prop('disabled')).toBe(true);
    next();expect(progress()!.step).toBe(0);
    updateGameCatalog('groups',[{id:'7',name:'SD'}],true);
    expect($('#sd-setup-next').prop('disabled')).toBe(false);
    next();expect(progress()!.step).toBe(1);
    expect($('#sd-setup-next').prop('disabled')).toBe(true);
});

test('created group and template can be selected inside onboarding and unlock the next step only after assignment',()=>{
    visit('screen=forum&screenmode=view_forum');start();
    updateGameCatalog('groups',[{id:'7',name:'Unsere Gruppe'}],true);
    $('#sd-setup-resource-select').val('7').trigger('change');
    expect($('#sd-setup-card').text()).toContain('✓ Gruppe im Spiel gefunden');
    expect($('#sd-setup-next').prop('disabled')).toBe(true);
    $('#sd-setup-card button').filter((_,el)=>$(el).text()==='Als SD-Gruppe festlegen').trigger('click');
    expect(LocalStorageHelper.getInstance().getSdGroupId).toBe('7');
    expect($('#sd-setup-next').prop('disabled')).toBe(false);next();
    updateGameCatalog('templates',[],true);
    expect($('#sd-setup-validation').text()).toContain('Noch keine gespeicherte Vorlage');
    updateGameCatalog('templates',[{id:'8',name:'100 Dual'}],true);
    $('#sd-setup-resource-select').val('8').trigger('change');
    expect($('#sd-setup-card').text()).toContain('✓ Vorlage im Spiel gefunden');
    expect($('#sd-setup-next').prop('disabled')).toBe(true);
    $('#sd-setup-card button').filter((_,el)=>$(el).text()==='Als SD-Vorlage festlegen').trigger('click');
    expect(LocalStorageHelper.getInstance().getSelectedTemplate).toBe('8');
    expect($('#sd-setup-next').prop('disabled')).toBe(false);
    updateGameCatalog('templates',[],true);
    expect($('#sd-setup-next').prop('disabled')).toBe(true);
});

test('settings use native checkboxes and unstyled fields while preserving duplicate-toggle semantics',()=>{
    visit('screen=settings');displaySettings(resolveScriptContext());initializeOnboarding(resolveScriptContext());
    expect($('#sd-settings-root').attr('class')).toBe('vis');
    expect($('#sd-settings-root').attr('style')).toBeUndefined();
    expect($('#sd-settings-root img.addThread').length).toBe(0);
    expect($('#automate-massen-ut').is(':checkbox')).toBe(true);
    $('#automate-massen-ut').prop('checked',true).trigger('change');
    expect(LocalStorageHelper.getInstance().getAutomateMassenUt).toBe(true);
    expect($('#prevent-duplicate-destination').prop('checked')).toBe(false);
    $('#prevent-duplicate-destination').prop('checked',true).trigger('change');
    expect(LocalStorageHelper.getInstance().getPreventDuplicateDestination).toBe(false);
    expect($('#sd-group-id')[0].style.length).toBe(0);
    expect($('#sd-sort-by')[0].style.length).toBe(0);
    expect($('#sd-settings-root th > #sd-onboarding-launcher').text()).toBe('?');
    expect($('#sd-settings-root input[value="Seitenhilfe starten"]').length).toBe(0);
});

test('an invalid travel-time field blocks setup completion until corrected',()=>{
    ready();
    LocalStorageHelper.getInstance().setOnboarding={version:1,tours:{[SETUP_TOUR_KEY]:{step:7,paused:false,complete:false}}};
    window.history.replaceState({},'','/game.php?screen=settings');
    document.body.innerHTML='<div id="content_value"></div>';
    displaySettings(resolveScriptContext());initializeSetupOnboarding(resolveScriptContext());
    $('#sd-schwertLfz').val('0').trigger('input');
    expect($('#sd-setup-next').prop('disabled')).toBe(true);
    expect($('#sd-setup-validation').text()).toContain('größer als 0');
    $('#sd-schwertLfz').val('22').trigger('input');
    expect($('#sd-setup-next').prop('disabled')).toBe(false);
});

test('settings highlight verified selections only and refresh as validity changes',()=>{
    const storage=LocalStorageHelper.getInstance();
    storage.setGroupData=[{id:'7',name:'SD'}];storage.setSdGroupId='7';
    storage.setTemplateData=[{id:'8',name:'SD Dual'}];storage.setSelectedTemplate='8';
    storage.setAutomateMassenUt=true;
    visit('screen=settings');displaySettings(resolveScriptContext());
    const valid=(id:string)=>$(`#${id}`).closest('tr').hasClass('sd-setting-ready');
    expect(valid('sd-group-id')).toBe(false);
    expect(valid('sd-template-id')).toBe(false);
    expect(valid('automate-massen-ut')).toBe(false);
    updateGameCatalog('groups',[{id:'7',name:'SD'}],true);
    updateGameCatalog('templates',[{id:'8',name:'SD Dual'}],true);
    expect(valid('sd-group-id')).toBe(true);expect(valid('sd-template-id')).toBe(true);
    expect(valid('automate-massen-ut')).toBe(true);
    expect(valid('prevent-duplicate-destination')).toBe(true);
    $('#prevent-duplicate-destination').prop('checked',true).trigger('change');
    expect(valid('prevent-duplicate-destination')).toBe(false);
    $('#sd-schwertLfz').val('0').trigger('input');expect(valid('sd-schwertLfz')).toBe(false);
    $('#sd-schwertLfz').val('22').trigger('change');expect(valid('sd-schwertLfz')).toBe(true);
    updateGameCatalog('templates',[],true);
    expect(valid('sd-template-id')).toBe(false);expect(valid('automate-massen-ut')).toBe(false);
    initializeOnboarding(resolveScriptContext());
    expect($('#sd-settings-root .sd-help-icon').length).toBe(1);
    $('#sd-onboarding-launcher').trigger('mouseenter');
    expect($('#sd-hover-help').text()).toContain('Einheitmengen');
    expect($('#sd-hover-help').text()).toContain('Schwert-Laufzeit');
    $('#sd-onboarding-launcher').trigger('mouseleave');
    expect($('#sd-hover-help').length).toBe(0);
});
