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
    localStorage.clear(); localStorage.setItem('standdeff-organizer-log-level','silent'); localStorage.setItem('standdeff-organizer','{bad');
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

test('table migration replays against concurrent send status instead of an old package snapshot',()=>{
    const storage=new LocalStorageHelper(); storage.addThread('9',thread());
    const repository=new StandDeffStorageRepository(); const stale=JSON.parse(repository.load()!);
    stale.threads['9'].stateOfSdTable[0][1].sdId='7';
    storage.confirmOperation(createPendingOperation({kind:'send',threadId:'9',villageId:12,amount:10,leftAmount:200}));
    repository.save(stale);
    expect(storage.getPackagesSent('9').get('7')).toBe('10');
});

test('confirmation clears imported drafts with omitted optional fields after normalization',()=>{
    const storage=new LocalStorageHelper();storage.addThread('9',thread());
    storage.setSdInquiry('9',[{coords:'123|123',amount:10,playerName:undefined,comment:undefined,dateFrom:undefined,dateUntil:undefined}]);
    const operation=createPendingOperation({kind:'forum',threadId:'9',inquiries:storage.getSdInquiry('9')});
    storage.confirmOperation(operation);
    expect(storage.getSdInquiry('9')).toEqual([]);
});

test('parallel edits to separate inquiry fields and villages survive',()=>{
    const storage=new LocalStorageHelper();storage.addThread('9',thread());
    storage.setSdInquiry('9',[{coords:'123|123',amount:10,playerName:'',comment:'',dateFrom:0,dateUntil:0}]);
    const first=new StandDeffStorageRepository(),second=new StandDeffStorageRepository();
    const a=JSON.parse(first.load()!),b=JSON.parse(second.load()!);
    a.threads['9'].bunkerInquiryCache[0].amount=20;
    b.threads['9'].bunkerInquiryCache[0].comment='Hinweis';
    b.threads['9'].bunkerInquiryCache.push({coords:'124|124',amount:5});
    first.save(a);second.save(b);
    expect(storage.getSdInquiry('9')).toEqual(expect.arrayContaining([
        expect.objectContaining({coords:'123|123',amount:20,comment:'Hinweis'}),expect.objectContaining({coords:'124|124',amount:5})
    ]));
});

test('pending send for a removed request is never booked against a new request at the same village',()=>{
    const storage=new LocalStorageHelper();storage.addThread('9',thread());
    const operation=createPendingOperation({kind:'send',threadId:'9',villageId:12,requestId:'1',amount:10,leftAmount:200});
    storage.setSdTableState('9',new Map());
    const replacement=thread().stateOfSdTable;replacement.get(12)!.sdId='2';storage.setSdTableState('9',replacement);
    storage.confirmOperation(operation);
    expect(storage.getPackagesSent('9').size).toBe(0);
    expect(storage.getThreadData('9')!.unresolvedPackages).toHaveLength(1);
});

test('journal compaction keeps exactly-once confirmation and writes added during compaction',async()=>{
    const storage=new LocalStorageHelper(); storage.addThread('9',thread());
    const operation=createPendingOperation({kind:'send',threadId:'9',villageId:12,amount:10,leftAmount:200});
    storage.confirmOperation(operation);
    Object.defineProperty(navigator,'locks',{configurable:true,value:{request:async (_name:string,callback:()=>boolean)=>callback()}});
    try {
        const repository=new StandDeffStorageRepository();
        const setItem=Storage.prototype.setItem;
        const write=jest.spyOn(Storage.prototype,'setItem').mockImplementation(function(key,value) {
            if (key === 'standdeff-organizer') {
                setItem.call(this,'standdeff-organizer:change:concurrent',JSON.stringify({revision:100,patches:[{path:['generalSettings','sortBy'],value:'sword'}]}));
            }
            setItem.call(this,key,value);
        });
        await repository.compact(); write.mockRestore();
        storage.confirmOperation(operation);
        expect(storage.getPackagesSent('9').get('1')).toBe('10');
        expect(storage.getSortBy).toBe('sword');
    } finally {Object.defineProperty(navigator,'locks',{configurable:true,value:undefined});}
});
