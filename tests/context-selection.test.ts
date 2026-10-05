import {resolveScriptContext} from '../src/helpers/script-context';
import {hasEnoughTemplateTroops, setCheckboxState} from '../src/helpers/mass-ut-selection';

test.each([
    ['?screen=forum&screenmode=view_thread&mode=edit&thread_id=9','forum-view_thread'],
    ['?mode=new_thread&screen=forum&screenmode=view_forum','forum-new_thread'],
    ['?t=42&mode=call&target=12&screen=place','place'],
    ['?screen=place','unknown'],
    ['?type=away_detail&group=2&screen=overview_villages&mode=units','overview-away_detail']
])('context handles parameter ordering and editing: %s',(query,expected)=>{
    window.history.replaceState({},'','/game.php'+query);
    expect(resolveScriptContext().context).toBe(expected);
});

test('prechecked selection is deterministic and troop shortage is excluded',()=>{
    (global as any).game_data={units:['spear','sword']};
    document.body.innerHTML='<table><tr id="source"><td data-unit="spear" data-count="200"></td><td data-unit="sword" data-count="99"></td></tr></table><input type="checkbox" checked id="source-check">';
    const checkbox=$('#source-check');
    setCheckboxState(checkbox,false); expect(checkbox.prop('checked')).toBe(false);
    setCheckboxState(checkbox,true); setCheckboxState(checkbox,true); expect(checkbox.prop('checked')).toBe(true);
    expect(hasEnoughTemplateTroops($('#source'),JSON.stringify({spear:100,sword:100}))).toBe(false);
    expect(hasEnoughTemplateTroops($('#source'),JSON.stringify({spear:100,sword:50}))).toBe(true);
});
