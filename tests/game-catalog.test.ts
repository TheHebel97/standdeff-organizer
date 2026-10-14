import {initializeGameCatalog,readGameGroups,readGameTemplates,updateGameCatalog,rememberCatalogCreation,refreshGameCatalogs,SETUP_TOUR_KEY,getCatalogCheck,isCatalogSelectionValid} from '../src/helpers/game-catalog';
import {LocalStorageHelper} from '../src/helpers/local-storage-helper';
import {resolveScriptContext} from '../src/helpers/script-context';

beforeEach(()=>{
    sessionStorage.clear();(LocalStorageHelper as any).instance=undefined;
    delete (window as any).TroopTemplates;
    (global as any).game_data={units:['spear','sword']};
    initializeGameCatalog(resolveScriptContext());
});
afterEach(()=>{jest.restoreAllMocks();});

test('reads actual group-menu hrefs and template JSON safely, including nested arrays and escaped names',()=>{
    const root=new DOMParser().parseFromString(`<a class="group-menu-item" href="/game.php?screen=overview_villages&group=7">[SD]</a>
      <a class="group-menu-item" data-group-id="0">[alle]</a>
      <script>TroopTemplates.current = ${JSON.stringify({'8':{id:8,name:'SD "Dual" ];',use_all:['spear'],sword:100}})};</script>`,'text/html');
    expect(readGameGroups(root)).toEqual([{id:'7',name:'SD'}]);
    expect(readGameTemplates(root)).toEqual({available:true,entries:[{id:'8',name:'SD "Dual" ];'}]});
});

test('a native creation made during setup is identified after reload and adopted without mass UT',()=>{
    const storage=LocalStorageHelper.getInstance();
    storage.setOnboarding={version:1,tours:{[SETUP_TOUR_KEY]:{step:0,paused:false,complete:false}}};
    window.history.replaceState({},'','/game.php?screen=overview_villages&mode=groups&type=static');
    document.body.innerHTML='<div id="content_value"><a class="group-menu-item" data-group-id="2">[Off]</a><form><input id="add_new_group_name" value="SD"></form></div>';
    initializeGameCatalog(resolveScriptContext());
    $('form')[0].dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    document.body.innerHTML='<div id="content_value"><a class="group-menu-item" data-group-id="2">[Off]</a><a class="group-menu-item" data-group-id="7">[SD]</a></div>';
    initializeGameCatalog(resolveScriptContext());
    expect(storage.getSdGroupId).toBe('7');
    storage.setOnboarding={version:1,tours:{[SETUP_TOUR_KEY]:{step:1,paused:false,complete:false}}};
    window.history.replaceState({},'','/game.php?screen=place&mode=templates');
    document.body.innerHTML='<div id="content_value"><script>TroopTemplates.current = [];</script><form><input id="template_id" value="0"><input id="template_name" value="100 Dual"></form></div>';
    initializeGameCatalog(resolveScriptContext());
    $('form')[0].dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    document.body.innerHTML='<div id="content_value"><script>TroopTemplates.current = {"8":{"id":8,"name":"100 Dual","spear":100,"sword":100}};</script></div>';
    initializeGameCatalog(resolveScriptContext());
    expect(storage.getSelectedTemplate).toBe('8');
    expect(storage.getTemplateData).toEqual([{id:'8',name:'100 Dual'}]);
});

test('ambiguous additions, unrelated templates and edits do not replace the SD choice',()=>{
    const storage=LocalStorageHelper.getInstance();storage.setSelectedTemplate='8';
    rememberCatalogCreation('templates','Off',[]);
    updateGameCatalog('templates',[{id:'9',name:'Off'}]);
    expect(storage.getSelectedTemplate).toBe('8');
    storage.setOnboarding={version:1,tours:{[SETUP_TOUR_KEY]:{step:1,paused:false,complete:false}}};
    rememberCatalogCreation('templates','SD',[]);
    updateGameCatalog('templates',[{id:'10',name:'SD'},{id:'11',name:'SD'}]);
    expect(storage.getSelectedTemplate).toBe('8');
    window.history.replaceState({},'','/game.php?screen=place&mode=templates');
    document.body.innerHTML='<div id="content_value"><form><input id="template_id" value="8"><input id="template_name" value="SD edited"></form></div>';
    sessionStorage.clear();initializeGameCatalog(resolveScriptContext());
    $('form')[0].dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    expect(sessionStorage.getItem('standdeff-organizer:catalog-creation')).toBeNull();
});

test('settings refresh fetches native catalogs in parallel and unavailable pages preserve cached data',async()=>{
    const storage=LocalStorageHelper.getInstance();storage.setGroupData=[{id:'7',name:'SD'}];storage.setTemplateData=[{id:'8',name:'SD Dual'}];
    const get=jest.spyOn($,'get').mockImplementation((url:any)=>Promise.resolve(String(url).includes('mode=templates') ? '<script>TroopTemplates.current = {"8":{"id":8,"name":"SD Dual"},"9":{"id":9,"name":"SD Trial"}};</script>' : '<p>Premium erforderlich</p>') as any);
    await refreshGameCatalogs();
    expect(get).toHaveBeenCalledTimes(2);
    expect(get.mock.calls.every(call=>!String(call[0]).includes('mode=call'))).toBe(true);
    expect(storage.getGroupData).toEqual([{id:'7',name:'SD'}]);
    expect(storage.getTemplateData).toHaveLength(2);
    expect(getCatalogCheck('groups').state).toBe('error');
    expect(isCatalogSelectionValid('groups','7')).toBe(false);
    expect(isCatalogSelectionValid('templates','8')).toBe(true);
});

test('a stored catalog becomes verifiable only after the authoritative game response',async()=>{
    const storage=LocalStorageHelper.getInstance();storage.setGroupData=[{id:'7',name:'SD'}];
    let resolveGroup!:(html:string)=>void;
    const groupResponse=new Promise<string>(resolve=>{resolveGroup=resolve;});
    const get=jest.spyOn($,'get').mockImplementation((url:any)=>String(url).includes('mode=groups') ? groupResponse as any : Promise.resolve('<script>TroopTemplates.current = [];</script>') as any);
    const pending=refreshGameCatalogs();
    expect(getCatalogCheck('groups').state).toBe('loading');
    expect(isCatalogSelectionValid('groups','7')).toBe(false);
    const same=refreshGameCatalogs();expect(same).toBe(pending);
    resolveGroup('<input id="add_new_group_name"><a class="group-menu-item" href="/game.php?group=7">[SD]</a>');
    await pending;
    expect(get).toHaveBeenCalledTimes(2);
    expect(isCatalogSelectionValid('groups','7')).toBe(true);
    expect(getCatalogCheck('templates')).toEqual({state:'ready',ids:[]});
});

test('outside setup only a new explicitly named SD entry fills an empty selection',()=>{
    const storage=LocalStorageHelper.getInstance();
    rememberCatalogCreation('templates','SD Dual',[]);
    updateGameCatalog('templates',[{id:'8',name:'SD Dual'}]);
    expect(storage.getSelectedTemplate).toBe('8');
    rememberCatalogCreation('templates','SD Trial',['8']);
    updateGameCatalog('templates',[{id:'9',name:'SD Trial'}]);
    expect(storage.getSelectedTemplate).toBe('8');
});

test('an authoritative empty catalog clears a deleted choice; unavailable pages do not',()=>{
    const storage=LocalStorageHelper.getInstance();
    storage.setGroupData=[{id:'7',name:'SD'}];storage.setSdGroupId='7';
    updateGameCatalog('groups',[],false);
    expect(storage.getSdGroupId).toBe('7');expect(storage.getGroupData).toHaveLength(1);
    updateGameCatalog('groups',[],true);
    expect(storage.getSdGroupId).toBe('0');expect(storage.getGroupData).toEqual([]);
});
