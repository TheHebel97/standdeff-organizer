import {LocalStorageHelper} from '../src/helpers/local-storage-helper';
import {StandDeffStorageRepository} from '../src/helpers/local-storage-repository';
import {createPendingOperation, readPendingOperations} from '../src/helpers/pending-operation';
import {ThreadData} from '../src/types/types';

const thread = ():ThreadData => ({threadName:'SD',forumName:'Forum',forumId:'2',sdPostId:'3',bunkerInquiryCache:[],updatedPostIds:[],packagesSent:new Map(),
    stateOfSdTable:new Map([[12,{coords:'123|123',sdId:'1',startAmount:200,leftAmount:200,playerName:'',comment:'',dateFrom:'',dateUntil:''}]])});

test('stale helper writes preserve independent settings from another tab', () => {
    const first = new LocalStorageHelper(), second = new LocalStorageHelper();
    first.setSortBy = 'sword';
    second.setSdGroupId = '123';
    expect(first.getSortBy).toBe('sword');
    expect(first.getSdGroupId).toBe('123');
});

test('genuinely overlapping repository snapshots preserve independent field changes', () => {
    const initial = new LocalStorageHelper();
    const first = new StandDeffStorageRepository(), second = new StandDeffStorageRepository();
    const a = JSON.parse(first.load()!), b = JSON.parse(second.load()!);
    a.generalSettings.sortBy='sword'; b.generalSettings.sdGroupId='50';
    first.save(a); second.save(b);
    expect(initial.getSortBy).toBe('sword'); expect(initial.getSdGroupId).toBe('50');
});

test('confirmed sends add once across tabs; click preparation changes no package status', () => {
    const storage = new LocalStorageHelper(); storage.addThread('9',thread());
    const a = createPendingOperation({kind:'send',threadId:'9',villageId:12,amount:10,leftAmount:200});
    const b = createPendingOperation({kind:'send',threadId:'9',villageId:12,amount:20,leftAmount:200});
    expect(storage.getPackagesSent('9').size).toBe(0);
    expect(readPendingOperations().length).toBe(2);
    storage.confirmOperation(a); new LocalStorageHelper().confirmOperation(b); storage.confirmOperation(a);
    expect(storage.getPackagesSent('9').get('1')).toBe('30');
});

test('confirmed forum post clears only its submitted snapshot, keeping later drafts and sends', () => {
    const storage = new LocalStorageHelper(); storage.addThread('9',thread());
    storage.setPackagesSent('9',new Map([['1','10']]));
    const old = {coords:'123|123',amount:10,playerName:'',comment:'',dateFrom:0,dateUntil:0};
    storage.setSdInquiry('9',[old]);
    const op=createPendingOperation({kind:'forum',threadId:'9',inquiries:storage.getSdInquiry('9'),packages:[['1','10']]});
    storage.setSdInquiry('9',[{...old,amount:20}]);
    storage.confirmOperation(createPendingOperation({kind:'send',threadId:'9',villageId:12,amount:5,leftAmount:200}));
    storage.confirmOperation(op);
    expect(storage.getSdInquiry('9')[0].amount).toBe(20);
    expect(storage.getPackagesSent('9').get('1')).toBe('5');
});

test('legacy table IDs migrate by village; orphaned values are quarantined', () => {
    const storage = new LocalStorageHelper(); const data=thread(); data.packagesSent = new Map([['1','5'],['99','done']]); storage.addThread('9',data);
    const next = thread().stateOfSdTable; next.get(12)!.sdId='7'; storage.setSdTableState('9',next);
    expect(storage.getPackagesSent('9').get('7')).toBe('5');
    expect(storage.getPackagesSent('9').has('99')).toBe(false);
    expect(storage.getThreadData('9')!.unresolvedPackages).toEqual([['99','done']]);
});

test('incomplete and corrupt storage survives migration with backup', () => {
    localStorage.setItem('standdeff-organizer',JSON.stringify({threads:{'9':{threadName:'SD'}}}));
    expect(new LocalStorageHelper().getThreadData('9')!.packagesSent.size).toBe(0);
    localStorage.clear(); localStorage.setItem('standdeff-organizer','{bad');
    const storage=new LocalStorageHelper();
    expect(storage.getAllThreads).toEqual({});
    expect(Object.keys(localStorage).some(key=>key.includes(':backup:'))).toBe(true);
});

test('failed confirmation preserves pending operation and data', () => {
    const storage=new LocalStorageHelper(); storage.addThread('9',thread());
    const op=createPendingOperation({kind:'send',threadId:'9',villageId:12,amount:10});
    const mock=jest.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota');});
    expect(()=>storage.confirmOperation(op)).toThrow(); mock.mockRestore();
    expect(readPendingOperations()).toHaveLength(1); expect(storage.getPackagesSent('9').size).toBe(0);
});
