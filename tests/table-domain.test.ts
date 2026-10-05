import {aggregatePackageUpdates, calculateSdTableState, convertMessageRequestStringToRequestArray, convertRequestArrayToMessageString, parseForumPostUpdates, parsePostCacheIds} from '../src/helpers/table-domain';
import {convertEpochToDate, convertDateToEpoch, parseGermanDate} from '../src/helpers/helper-functions';
import {rowSdTable, updateData} from '../src/types/types';
import {calculatePackagesToSend} from '../src/helpers/table-domain';

const row = (id: string): rowSdTable => ({sdId:id,coords:'305|531',startAmount:10,leftAmount:10,playerName:'',comment:'',dateFrom:'',dateUntil:''});
const status = (values: string[]): updateData => new Map(values.map((value,i)=>[String(100+i),{inquiries:new Map(),packages:new Map([['1',value]])}]));

test('duplicate guard understands done and intentional repeat sending', () => {
    expect(calculatePackagesToSend(10,'done',true)).toBe(0);
    expect(calculatePackagesToSend(10,'done',false)).toBe(10);
    expect(calculatePackagesToSend(10,'3',false)).toBe(7);
    expect(calculatePackagesToSend(10,'3',true)).toBe(0);
});

test.each(['done','DONE'])('done remains final in both aggregation paths: %s', done => {
    const updates = status([done,'2']);
    expect(aggregatePackageUpdates(updates).get('1')).toBe('done');
    expect(calculateSdTableState(updates,[new Map([[11,row('1')]]),[]])[0].size).toBe(0);
});

test('deleting a row preserves other IDs and never reuses the removed highest ID', () => {
    const state = calculateSdTableState(status(['done']),[new Map([[11,row('1')],[22,row('2')]]),['90']]);
    expect(state[0].get(22)?.sdId).toBe('2');
    expect(parsePostCacheIds(state[1].join(','))).toContain('90');
    const remove = new Map([['103',{inquiries:new Map(),packages:new Map([['2','done']])}]]);
    const empty = calculateSdTableState(remove,state);
    const request = {coords:'333|444',amount:10,playerName:undefined,comment:undefined,dateFrom:undefined,dateUntil:undefined};
    const next = calculateSdTableState(new Map([['104',{inquiries:new Map([[33,request]]),packages:new Map()}]]),empty);
    expect(next[0].get(33)?.sdId).toBe('3');
    expect(calculateSdTableState(remove,empty)[0].size).toBe(0);
});

test.each(['"','“','”','„'])('mobile quotation delimiters parse like plain quotes: %s', q => {
    const request = convertMessageRequestStringToRequestArray(`305|531 200 ${q}Spieler${q}Kommentar${q}05.10.2026 12:00${q}06.10.2026 12:00`)[0];
    expect(request?.playerName).toBe('Spieler');
    expect(convertRequestArrayToMessageString([request])).toBe('305|531 200 "Spieler"Kommentar"05.10.2026 12:00"06.10.2026 12:00');
    expect(convertMessageRequestStringToRequestArray(`305|531 200 ${q}${q}${q}${q}`)[0]?.amount).toBe(200);
});

test('Apple mixed opening/closing quotes preserve optional fields', () => {
    expect(convertMessageRequestStringToRequestArray('305|531 10 “Spieler”Kommentar„”')[0]).toMatchObject({playerName:'Spieler',comment:'Kommentar'});
});

test('ordinary numeric prose and unknown villages do not become updates', () => {
    const parsed = parseForumPostUpdates([{postId:'100',lines:['Bitte morgen 10 20 Pakete bereitstellen','305|531 10','306|532 20']}],new Map()).get('100');
    expect(parsed).toBeUndefined(); // Unresolved inquiries remain outside the post cache.
});

test.each(['2026-07-05T12:00','2026-12-05T12:00'])('local datetime round-trip preserves %s', input => {
    expect(convertEpochToDate(convertDateToEpoch(input))).toBe(input);
});

test('invalid or empty dates are rejected without throwing', () => {
    expect(parseGermanDate('31.02.2026 12:00')).toBe(0);
    expect(parseGermanDate('05.10.2026')).toBe(0);
    expect(convertDateToEpoch('')).toBe(0);
});
