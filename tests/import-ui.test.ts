import {displayAwayDetail} from '../src/ui/away-detail';
import {resolveScriptContext} from '../src/helpers/script-context';
import {LocalStorageHelper} from '../src/helpers/local-storage-helper';
import {showRequestPopup} from '../src/ui/components/request-popup';

beforeEach(()=>{
    (LocalStorageHelper as any).instance=undefined;
    (global as any).UI={SuccessMessage:jest.fn(),ErrorMessage:jest.fn()};
    (global as any).game_data={units:['spear','sword','archer','spy']};
    const storage=LocalStorageHelper.getInstance();
    storage.addThread('9',{threadName:'SD "Test"',forumName:'Allgemein',forumId:'2',sdPostId:'3',bunkerInquiryCache:[],stateOfSdTable:new Map(),packagesSent:new Map(),updatedPostIds:[]});
    document.body.innerHTML='<div id="ds_body"><div id="content_value"></div><table id="units_table"><tr class="row_a"><td><a>Testdorf (123|123) K11</a></td><td class="unit-item">200</td><td class="unit-item">200</td><td class="unit-item">0</td><td class="unit-item">0</td></tr></table></div>';
});
test('preset recalculates visible troops and copies selected inquiries without posting',()=>{
    displayAwayDetail(resolveScriptContext());
    $('[data-preset=dual][data-amount=100]').trigger('click');
    expect($('#sd-bunker-active-preset').text()).toContain('100 Dual');
    expect($('#sd-bunker-import-preview').text()).toContain('Neu 2');
    const before=LocalStorageHelper.getInstance().getBunkerUnitPowers;
    $('[data-preset=trial][data-amount=200]').trigger('click');
    expect(LocalStorageHelper.getInstance().getBunkerUnitPowers).toEqual(before);
    $('[data-preset=dual][data-amount=100]').trigger('click');
    $('#sd-import-bunker-requests').trigger('click');
    expect(LocalStorageHelper.getInstance().getSdInquiry('9')[0].amount).toBe(2);
});
test('non-archer worlds offer only Dual presets',()=>{
    (global as any).game_data.units=['spear','sword','spy'];
    displayAwayDetail(resolveScriptContext());
    expect($('[data-preset=trial]').length).toBe(0);
});
test('request fields preserve quoted values as plain text and reject fractional amounts',()=>{
    const storage=LocalStorageHelper.getInstance();
    storage.setSdInquiry('9',[{coords:'123|123',amount:10,playerName:'"Name"',comment:'<Bemerkung>',dateFrom:undefined,dateUntil:undefined}]);
    showRequestPopup('9');
    expect($('.playerNameInput').val()).toBe('"Name"');
    expect($('.commentInput').val()).toBe('<Bemerkung>');
    $('.amountInput').val('1.5').trigger('focusout');
    expect(storage.getSdInquiry('9')[0].amount).toBe(10);
    expect($('.amountInput').attr('aria-invalid')).toBe('true');
});
