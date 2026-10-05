import {createNewTable} from '../src/ui/new-thread';
import {resolveScriptContext} from '../src/helpers/script-context';
import {LocalStorageHelper} from '../src/helpers/local-storage-helper';
import {buildBunkerPreset, describeBunkerPreset} from '../src/helpers/bunker-import-settings';
jest.mock('../src/helpers/tw-helper', () => ({isUserForumMod: () => true}));

beforeEach(() => {
    (LocalStorageHelper as any).instance = undefined;
    (global as any).game_data = {units:['spear','sword','archer','spy']};
    document.body.innerHTML = '<div class="clearfix"><h2>Neuer Thread</h2><form><input name="subject"><textarea id="message"></textarea><input type="submit" value="Senden"></form></div>';
});

test('generator lives in organizer; infantry scales its own row and click clears only that field', () => {
    createNewTable(resolveScriptContext());
    expect($('.configbtn,.configs').length).toBe(0);
    $('.inputSpear').val('200').trigger('input');
    expect($('.sd-package-row input').map((_, el) => $(el).val()).get()).toEqual(['200','200','200','10']);
    $('.inputSword').trigger('click');
    expect($('.inputSword').val()).toBe('');
    expect($('.inputSpear').val()).toBe('200');
    $('#newPaketLine').trigger('click');
    $('.inputBow').last().val('100').trigger('input');
    expect($('.inputSpear').last().val()).toBe('100');
    expect($('.inputSpear').first().val()).toBe('200');
    $('#setupTable').trigger('click');
    expect($('#message').val()).toContain('[unit]spy[/unit] 10');
});

test('no archer input on worlds without archers; rejects invalid amounts and keyboard submit without title', () => {
    (global as any).game_data.units = ['spear','sword','spy'];
    createNewTable(resolveScriptContext());
    expect($('.inputBow').length).toBe(0);
    $('.inputSpear').val('-1');
    $('#setupTable').trigger('click');
    expect($('#message').val()).toBe('');
    const event = new Event('submit',{bubbles:true,cancelable:true});
    $('form')[0].dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
});

test.each([100,200])('Dual/Trial %i presets replace every unit contribution', amount => {
    const dual = buildBunkerPreset(amount, false);
    expect(dual.archer).toBe(0);
    expect(dual.spy).toBe(0);
    expect(dual.heavy).toBe(0);
    expect(describeBunkerPreset(dual, true)).toBe(`${amount} Dual`);
    expect(describeBunkerPreset(buildBunkerPreset(amount,true), true)).toBe(`${amount} Trial`);
});
