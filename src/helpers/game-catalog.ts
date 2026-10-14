import {LocalStorageHelper} from './local-storage-helper';
import {PageContext} from './script-context';
import {buildGameUrl} from './game-url-helper';
import {groupData, templateData} from '../types/types';

type Kind = 'groups'|'templates';
type Entry = groupData|templateData;
type CatalogCheck = {state:'idle'|'loading'|'ready'|'error'; ids:string[]};
let catalogChecks:Record<Kind,CatalogCheck>={groups:{state:'idle',ids:[]},templates:{state:'idle',ids:[]}};
export function getCatalogCheck(kind:Kind):CatalogCheck {return {...catalogChecks[kind],ids:[...catalogChecks[kind].ids]};}
export function isCatalogSelectionValid(kind:Kind,id:string):boolean {
    return catalogChecks[kind].state==='ready' && catalogChecks[kind].ids.includes(id);
}
function checkCatalog(kind:Kind,state:CatalogCheck['state'],ids:string[]=[]):void {
    catalogChecks[kind]={state,ids};
    document.dispatchEvent(new CustomEvent('sd-catalog-validated',{detail:{kind}}));
}
const CAPTURE_KEY='standdeff-organizer:catalog-creation';
export const SETUP_TOUR_KEY='setup:2';
const validId=(value:unknown):string|null => /^\d+$/.test(String(value)) && Number(value)>0 ? String(value):null;
const unique=(entries:Entry[]) => [...new Map(entries.map(entry=>[entry.id,entry])).values()];

export function readGameGroups(root:ParentNode):Entry[] {
    const result:Entry[]=[];
    root.querySelectorAll<HTMLElement>('.group-menu-item,[data-group-id],select[name=group] option,select[name=group_id] option').forEach(el=>{
        let id=validId(el.getAttribute('data-group-id') ?? el.getAttribute('value'));
        if (!id && el.getAttribute('href')) id=validId(new URL(el.getAttribute('href')!,window.location.href).searchParams.get('group'));
        const name=(el.textContent??'').trim().replace(/^\[([\s\S]*)\]$/,'$1').trim();
        if (id && name) result.push({id,name});
    });
    return unique(result);
}

function templateEntries(raw:unknown):Entry[] {
    if (!raw || typeof raw!=='object') return [];
    return unique(Object.entries(raw).flatMap(([key,value])=>{
        if (!value || typeof value!=='object') return [];
        const item=value as {id?:unknown;name?:unknown};
        const id=validId(item.id ?? (Array.isArray(raw) ? null:key));
        return id && typeof item.name==='string' ? [{id,name:item.name}]:[];
    }));
}

// Read the JSON emitted by the game without executing any fetched script.
function currentTemplatesJson(text:string):unknown {
    const start=/TroopTemplates\.current\s*=\s*/.exec(text);
    if (!start) return undefined;
    const from=start.index+start[0].length;
    let depth=0, quoted=false, escaped=false;
    for (let i=from;i<text.length;i++) {
        const char=text[i];
        if (quoted) {if (escaped) escaped=false; else if (char==='\\') escaped=true; else if (char==='"') quoted=false;}
        else if (char==='"') quoted=true;
        else if (char==='[' || char==='{') depth++;
        else if (char===']' || char==='}') {
            depth--;
            if (depth===0) {try {return JSON.parse(text.slice(from,i+1));} catch {return undefined;}}
        }
    }
    return undefined;
}

export function readGameTemplates(root:ParentNode):{entries:Entry[]; available:boolean} {
    let entries:Entry[]=[], available=false;
    root.querySelectorAll('script:not([src])').forEach(script=>{
        const raw=currentTemplatesJson(script.textContent??'');
        if (raw!==undefined) {entries=templateEntries(raw);available=true;}
    });
    if (root===document && (window as any).TroopTemplates?.current) {
        entries=templateEntries((window as any).TroopTemplates.current); available=true;
    }
    root.querySelectorAll('select[name=template] option').forEach(option=>{
        try {
            const raw=JSON.parse(option.getAttribute('value')??'');
            entries.push(...templateEntries([raw]));available=true;
        } catch { /* The empty placeholder is not a template. */ }
    });
    return {entries:unique(entries),available};
}

function readCapture():{kind:Kind; ids:string[]; name:string; useForSd:boolean; createdAt:number}|null {
    try {
        const value=JSON.parse(sessionStorage.getItem(CAPTURE_KEY)??'null');
        return value && ['groups','templates'].includes(value.kind) && Array.isArray(value.ids) && value.ids.every((id:unknown)=>typeof id==='string') && typeof value.name==='string' && typeof value.useForSd==='boolean' && Number.isFinite(value.createdAt) && Date.now()-value.createdAt>=0 && Date.now()-value.createdAt<30*60*1000 ? value:null;
    } catch {return null;}
}

export function updateGameCatalog(kind:Kind, entries:Entry[], complete=false):void {
    const storage=LocalStorageHelper.getInstance();
    const existing=kind==='groups' ? storage.getGroupData:storage.getTemplateData;
    const next=unique(complete ? entries:[...existing,...entries]);
    const capture=readCapture();
    let changed=JSON.stringify(existing)!==JSON.stringify(next);
    if (changed) {if (kind==='groups') storage.setGroupData=next;else storage.setTemplateData=next;}
    const selected=kind==='groups' ? storage.getSdGroupId:storage.getSelectedTemplate;
    if (complete && validId(selected) && !next.some(entry=>entry.id===selected)) {
        if (kind==='groups') storage.setSdGroupId='0';else storage.setSelectedTemplate='0';
        changed=true;
    }
    if (capture?.kind===kind) {
        const added=next.filter(entry=>!capture.ids.includes(entry.id) && entry.name.trim()===capture.name.trim());
        if (added.length===1) {
            if (capture.useForSd) {
                if (kind==='groups') storage.setSdGroupId=added[0].id;
                else storage.setSelectedTemplate=added[0].id;
                changed=true;
            }
            sessionStorage.removeItem(CAPTURE_KEY);
        }
    }
    if (changed) document.dispatchEvent(new CustomEvent('sd-catalog-updated',{detail:{kind}}));
    if (complete) checkCatalog(kind,'ready',next.map(entry=>entry.id));
}

export function rememberCatalogCreation(kind:Kind, name:string, ids:string[]):void {
    const storage=LocalStorageHelper.getInstance();
    const setup=storage.getOnboarding?.tours[SETUP_TOUR_KEY];
    const inSetup=setup && !setup.paused && !setup.complete && setup.step===(kind==='groups' ? 0:1);
    const empty=kind==='groups' ? !validId(storage.getSdGroupId):!validId(storage.getSelectedTemplate);
    // Arbitrary later Off/Fake templates must not replace an established SD choice.
    const useForSd=Boolean(inSetup || (empty && /(^|\W)sd(\W|$)|standdeff/i.test(name)));
    try {sessionStorage.setItem(CAPTURE_KEY,JSON.stringify({kind,name,ids,useForSd,createdAt:Date.now()}));} catch { /* Discovery still works without a capture. */ }
}

let pageObserver:MutationObserver|null=null;
export function initializeGameCatalog(context:PageContext):void {
    catalogChecks={groups:{state:'idle',ids:[]},templates:{state:'idle',ids:[]}};
    pageObserver?.disconnect();
    $(document).off('.sdCatalog');
    const groupsPage=context.screen==='overview_villages' && context.mode==='groups';
    const templatesPage=context.screen==='place' && context.mode==='templates';
    const sync=()=>{
        const groups=readGameGroups(document);
        const complete=groupsPage && Boolean(document.getElementById('add_new_group_name'));
        if (groups.length || complete) updateGameCatalog('groups',groups,complete);
        if (templatesPage) {
            const templates=readGameTemplates(document);
            if (templates.available) updateGameCatalog('templates',templates.entries,true);
        }
    };
    sync();
    if (!groupsPage && !templatesPage) return;
    pageObserver=new MutationObserver(sync);
    pageObserver.observe(document.getElementById('content_value') ?? document.body,{childList:true,subtree:true,characterData:true});
    $(document).on('submit.sdCatalog','form',function (this:HTMLFormElement) {
        if (groupsPage) {
            const input=this.querySelector<HTMLInputElement>('#add_new_group_name,#group_name');
            if (input?.value.trim()) rememberCatalogCreation('groups',input.value.trim(),readGameGroups(document).map(entry=>entry.id));
        } else {
            const id=this.querySelector<HTMLInputElement>('#template_id')?.value;
            const name=this.querySelector<HTMLInputElement>('#template_name')?.value.trim();
            if (!validId(id) && name) rememberCatalogCreation('templates',name,readGameTemplates(document).entries.map(entry=>entry.id));
        }
    });
}

let refreshInFlight:Promise<void>|null=null;
export function refreshGameCatalogs():Promise<void> {
    if (refreshInFlight) return refreshInFlight;
    const pages: {kind:Kind;url:string}[]=[
        {kind:'groups',url:buildGameUrl('overview_villages',{mode:'groups',type:'static'})},
        {kind:'templates',url:buildGameUrl('place',{mode:'templates'})}
    ];
    refreshInFlight=Promise.allSettled(pages.map(async page=>{
        checkCatalog(page.kind,'loading');
        try {
            const html=await $.get(page.url);
            if (typeof html!=='string') {checkCatalog(page.kind,'error');return;}
            const root=new DOMParser().parseFromString(html,'text/html');
            if (page.kind==='groups') {
                const groups=readGameGroups(root);
                const complete=Boolean(root.getElementById('add_new_group_name'));
                if (complete) updateGameCatalog('groups',groups,true);
                else {if (groups.length) updateGameCatalog('groups',groups);checkCatalog('groups','error');}
            } else {
                const templates=readGameTemplates(root);
                if (templates.available) updateGameCatalog('templates',templates.entries,true);
                else checkCatalog('templates','error');
            }
        } catch {checkCatalog(page.kind,'error');}
    })).then(()=>undefined).finally(()=>{refreshInFlight=null;});
    return refreshInFlight;
}
