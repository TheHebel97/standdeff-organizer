import {initializeOnboarding, getOnboardingSteps} from '../src/ui/components/onboarding';
import {closeHoverHelp,addHoverHelp} from '../src/ui/components/hover-help';
import {LocalStorageHelper} from '../src/helpers/local-storage-helper';
import {resolveScriptContext} from '../src/helpers/script-context';
import {addForumQuickSettings} from '../src/ui/components/forum-quick-settings';
jest.mock('../src/helpers/tw-helper', () => ({isUserForumMod: () => false}));

beforeEach(()=>{
    (LocalStorageHelper as any).instance=undefined;
    (global as any).game_data={screen:'forum',units:['spear','sword']};
    window.history.replaceState({},'','/game.php?screen=forum&screenmode=view_thread&thread_id=9');
    document.body.innerHTML='<div id="content_value"><div id="sd-forum-quick-settings" class="sd-organizer"><div class="sd-organizer-handle">SD Organizer</div><div class="sd-organizer-body"><input type="button" id="sd-register-thread" value="Als SD-Tabelle festlegen"></div></div></div>';
});
afterEach(()=>closeHoverHelp());

test('hover help is contextual, has no tour controls and does not save tour progress',()=>{
    initializeOnboarding(resolveScriptContext());
    const $help=$('#sd-onboarding-launcher');
    $help.trigger('mouseenter');
    expect($('#sd-hover-help').text()).toContain('Als SD-Tabelle festlegen');
    expect($('#sd-hover-help').attr('role')).toBe('tooltip');
    expect($('#sd-onboarding-card,input[value=Weiter],input[value=Überspringen]').length).toBe(0);
    expect(LocalStorageHelper.getInstance().getOnboarding?.tours).toEqual({});
    expect($help.attr('aria-describedby')).toBe('sd-hover-help');
    $(document).trigger($.Event('keydown',{key:'Escape'}));
    expect($('#sd-hover-help').length).toBe(0);
    expect($help.attr('aria-describedby')).toBeUndefined();
});

test('help works with keyboard focus and closes on blur or pointer departure',()=>{
    const $help=addHoverHelp($('#content_value'),'Option','Erklärung');
    $help.trigger('focus');expect($('#sd-hover-help').text()).toContain('Erklärung');
    $help.trigger('blur');expect($('#sd-hover-help').length).toBe(0);
    $help.trigger('mouseenter');$help.trigger('mouseleave');
    expect($('#sd-hover-help').length).toBe(0);
});

test('normal users never receive mod-only table editing hints',()=>{
    const context=resolveScriptContext();
    expect(getOnboardingSteps(context,false).some(step=>step.title === 'SD-Tabelle pflegen')).toBe(false);
    expect(getOnboardingSteps(context,true).some(step=>step.title === 'SD-Tabelle pflegen')).toBe(true);
});

test('header help is a question mark and repeated initialization does not duplicate contextual icons',()=>{
    initializeOnboarding(resolveScriptContext());initializeOnboarding(resolveScriptContext());
    expect($('#sd-forum-quick-settings .sd-organizer-handle > #sd-onboarding-launcher').text()).toBe('?');
    expect($('.sd-help-icon').length).toBe(1);
    $('#sd-onboarding-launcher').trigger('mouseenter');
    expect($('#sd-hover-help').text()).toContain('SD-Tabelle festlegen');
    expect($('input[value="Seitenhilfe starten"],input[value="Seitenhilfe fortsetzen"]').length).toBe(0);
});

test('one header question mark shows all setting and reset explanations during hover only',()=>{
    document.body.innerHTML='<div id="content_value"></div>';
    addForumQuickSettings();addForumQuickSettings();
    initializeOnboarding(resolveScriptContext());
    expect($('#sd-forum-quick-settings [data-sd-help-for]').length).toBe(0);
    expect($('.sd-help-icon').length).toBe(1);
    $('#sd-onboarding-launcher').trigger('mouseenter');
    for (const title of ['Massen-UT automatisch vorbereiten','Doppeltes Schicken','Sortieren nach','SD-Gruppe','SD-Vorlage','Geschickte Pakete zurücksetzen']) {
        expect($('#sd-hover-help').text()).toContain(title);
    }
    expect($('#sd-hover-help').text()).toContain('lokal gespeicherten Versand-Einträge');
    expect($('#sd-hover-help').text()).toContain('Forenbeiträge bleiben bestehen');
    $('#sd-onboarding-launcher').trigger('click').trigger('mouseleave');
    expect($('#sd-hover-help').length).toBe(0);
});
