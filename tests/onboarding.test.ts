import {initializeOnboarding, getOnboardingSteps} from '../src/ui/components/onboarding';
import {LocalStorageHelper} from '../src/helpers/local-storage-helper';
import {resolveScriptContext} from '../src/helpers/script-context';
jest.mock('../src/helpers/tw-helper', () => ({isUserForumMod: () => false}));

beforeEach(()=>{
    (LocalStorageHelper as any).instance=undefined;
    (global as any).game_data={screen:'forum',units:['spear','sword']};
    window.history.replaceState({},'','/game.php?screen=forum&screenmode=view_thread&thread_id=9');
    document.body.innerHTML='<div id="content_value"><div id="sd-forum-quick-settings"><div class="sd-organizer-body"></div></div></div>';
});
test('tour survives missing controls, pauses, resumes, completes and restarts',()=>{
    const context=resolveScriptContext(); initializeOnboarding(context);
    $('input[value="Einführung starten"]').trigger('click');
    $('input[value=Weiter]').trigger('click');
    expect($('#sd-onboarding-card').text()).toContain('2/4');
    $('input[value="Später fortsetzen"]').trigger('click');
    expect($('#sd-onboarding-card').length).toBe(0);
    initializeOnboarding(context); $('input[value="Einführung fortsetzen"]').trigger('click');
    expect($('#sd-onboarding-card').text()).toContain('2/4');
    $('input[value=Überspringen]').trigger('click');
    initializeOnboarding(context); expect($('.sd-tour-invite').length).toBe(0);
    $('input[value="Einführung starten"]').trigger('click'); expect($('#sd-onboarding-card').text()).toContain('1/4');
});
test('normal users never see mod-only table editing step',()=>{
    const context=resolveScriptContext();
    expect(getOnboardingSteps(context,false).some(step=>step.title === 'SD-Tabelle pflegen')).toBe(false);
    expect(getOnboardingSteps(context,true).some(step=>step.title === 'SD-Tabelle pflegen')).toBe(true);
});
