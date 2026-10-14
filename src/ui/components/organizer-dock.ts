import {LocalStorageHelper} from '../../helpers/local-storage-helper';
import {OrganizerDockPosition, forumQuickSettingsPosition} from '../../types/types';
import {arrangeDock, balanceDockSides, dockHeightLimits, DOCK_GAP} from './organizer-dock-layout';

const HEADER_HEIGHT = 48;
type Panel = {element:HTMLElement; position:OrganizerDockPosition; handle:HTMLElement; dispose:()=>void};
const panels = new Map<string,Panel>();
let observingDocument:Document|null = null;

function prune():void {
    panels.forEach((panel,id)=>{if (!panel.element.isConnected) {panel.dispose();panels.delete(id);}});
}

function savePositions():void {
    const storage=LocalStorageHelper.getInstance();
    const saved=storage.getOrganizerDockPositions;
    panels.forEach(panel=>{
        const previous=saved[panel.element.id];
        if (previous?.side!==panel.position.side || previous?.top!==panel.position.top) storage.setOrganizerDockPosition(panel.element.id,{...panel.position});
    });
}

export function layoutOrganizerDocks(preferred?:HTMLElement):void {
    prune();
    const visible = [...panels.values()].filter(p=>!p.element.hidden);
    if (!visible.length) return;
    const naturalHeight = (p:Panel) => Math.max(p.element.scrollHeight + p.element.offsetHeight - p.element.clientHeight, p.element.getBoundingClientRect().height);
    const width = (p:Panel) => p.element.getBoundingClientRect().width;
    const wide = window.innerWidth >= Math.max(...visible.map(width)) * 2 + DOCK_GAP;
    let sideChanged=false;
    if (wide) {
        const sides = balanceDockSides(visible.map(p=>({side:p.position.side,height:naturalHeight(p)})),window.innerHeight-HEADER_HEIGHT-8,visible.findIndex(p=>p.element===preferred));
        visible.forEach((p,i)=>{if (p.position.side!==sides[i]) sideChanged=true;p.position.side=sides[i];});
    }
    const groups = wide ? ['left','right'].map(side=>visible.filter(p=>p.position.side===side)) : [visible];
    groups.forEach(group=>{
        const limits = dockHeightLimits(group.map(naturalHeight), window.innerHeight-HEADER_HEIGHT-8-DOCK_GAP*(group.length-1));
        group.forEach((p,i)=>{
            p.element.style.maxHeight=`${limits[i]}px`;
            p.element.style.left=p.position.side === 'left' ? '0px' : 'auto';
            p.element.style.right=p.position.side === 'right' ? '0px' : 'auto';
            p.element.style.bottom='auto';
            p.element.classList.toggle('sd-dock-left',p.position.side==='left');
            p.element.classList.toggle('sd-dock-right',p.position.side==='right');
        });
        const tops=arrangeDock(group.map(p=>({top:p.position.top,height:p.element.getBoundingClientRect().height})),window.innerHeight,HEADER_HEIGHT,8);
        group.forEach((p,i)=>{p.position.top=tops[i];p.element.style.top=`${tops[i]}px`;});
    });
    if (sideChanged) savePositions();
}

export function dockOrganizerPanel(element:HTMLElement, options:{side?:'left'|'right'; top?:number; legacyPosition?:forumQuickSettingsPosition|null}={}):void {
    prune();
    const current=panels.get(element.id);
    if (current?.element === element) {layoutOrganizerDocks(element);return;}
    current?.dispose(); panels.delete(element.id);
    const storage=LocalStorageHelper.getInstance();
    const saved=storage.getOrganizerDockPositions[element.id];
    const legacy=options.legacyPosition;
    const position:OrganizerDockPosition={...saved ?? {side:legacy ? (legacy.left < window.innerWidth/2 ? 'left' : 'right') : options.side ?? 'right',top:legacy?.top ?? options.top ?? 140}};
    element.classList.add('sd-dock');
    const handle=element.querySelector<HTMLElement>('.sd-organizer-handle') ?? document.createElement('button');
    if (!handle.parentNode) {handle.setAttribute('type','button');handle.textContent='⠿ Verschieben';element.prepend(handle);}
    handle.classList.add('sd-organizer-handle','sd-dock-handle');
    if (handle.tagName!=='BUTTON') handle.setAttribute('role','button');
    handle.tabIndex=0;
    handle.title='Am Rand ziehen · zur anderen Bildschirmseite wechseln · Pfeiltasten zum Verschieben';
    handle.setAttribute('aria-label','Fenster am Bildschirmrand verschieben');
    let drag:{id:number; offsetY:number; side:'left'|'right'}|null=null;
    const save=savePositions;
    const down=(event:PointerEvent)=>{
        const control=(event.target as HTMLElement).closest('button,a,input,select');
        if (event.button!==0 || (control && control!==handle)) return;
        drag={id:event.pointerId,offsetY:event.clientY-element.getBoundingClientRect().top,side:position.side};
        handle.setPointerCapture?.(event.pointerId); event.preventDefault();
    };
    const move=(event:PointerEvent)=>{
        if (!drag || drag.id!==event.pointerId) return;
        position.side=drag.side==='left' ? (event.clientX>=window.innerWidth*.4 ? 'right':'left') : (event.clientX<=window.innerWidth*.6 ? 'left':'right');
        position.top=Math.max(HEADER_HEIGHT,event.clientY-drag.offsetY);
        layoutOrganizerDocks(element);
    };
    const end=()=>{if (drag) {drag=null;save();}};
    const keys=(event:KeyboardEvent)=>{
        if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key) || event.target!==handle) return;
        event.preventDefault();
        if (event.key==='ArrowLeft') position.side='left';
        if (event.key==='ArrowRight') position.side='right';
        if (event.key==='ArrowUp') position.top-=event.shiftKey ? 1:10;
        if (event.key==='ArrowDown') position.top+=event.shiftKey ? 1:10;
        layoutOrganizerDocks(element); save();
    };
    handle.addEventListener('pointerdown',down);handle.addEventListener('pointermove',move);
    handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);handle.addEventListener('lostpointercapture',end);
    handle.addEventListener('keydown',keys);
    const resize=typeof ResizeObserver!=='undefined' ? new ResizeObserver(()=>layoutOrganizerDocks()) : null;
    resize?.observe(element);
    const content=new MutationObserver(()=>layoutOrganizerDocks());
    content.observe(element,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['open','hidden']});
    panels.set(element.id,{element,position,handle,dispose:()=>{
        resize?.disconnect();content.disconnect();handle.removeEventListener('pointerdown',down);handle.removeEventListener('pointermove',move);
        handle.removeEventListener('pointerup',end);handle.removeEventListener('pointercancel',end);handle.removeEventListener('lostpointercapture',end);handle.removeEventListener('keydown',keys);
    }});
    if (observingDocument!==document) {
        observingDocument=document;
        $(window).off('resize.sdOrganizerDock').on('resize.sdOrganizerDock',()=>{layoutOrganizerDocks();savePositions();});
    }
    layoutOrganizerDocks(element);
}
