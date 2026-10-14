import {dockOrganizerPanel,layoutOrganizerDocks} from '../src/ui/components/organizer-dock';
import {arrangeDock,dockHeightLimits} from '../src/ui/components/organizer-dock-layout';
import {LocalStorageHelper} from '../src/helpers/local-storage-helper';
beforeEach(()=>{(LocalStorageHelper as any).instance=undefined;});
function panel(id:string,width=300,height=220):HTMLElement {
    const element=document.createElement('aside');element.id=id;
    element.innerHTML='<button type="button" class="sd-organizer-handle">Verschieben</button>';
    element.getBoundingClientRect=()=>({left:0,top:140,width,height,right:width,bottom:140+height,x:0,y:140,toJSON(){}});
    document.body.append(element);return element;
}

test('windows stay attached to an edge, can switch by keyboard and restore their persisted side',()=>{
    const element=panel('dock-test');dockOrganizerPanel(element);
    expect(element.style.right).toBe('0px');
    const handle=element.querySelector('button')!;
    handle.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
    expect(element.style.left).toBe('0px');
    expect(LocalStorageHelper.getInstance().getOrganizerDockPositions['dock-test'].side).toBe('left');
    element.remove();const replacement=panel('dock-test');dockOrganizerPanel(replacement);
    expect(replacement.style.left).toBe('0px');
});

test('pointer movement switches edges and release stores the final position',()=>{
    const element=panel('dock-pointer');dockOrganizerPanel(element,{side:'right'});
    const handle=element.querySelector('button')!;
    const event=(type:string,x:number,y:number)=>{const e=new Event(type,{bubbles:true,cancelable:true});Object.assign(e,{button:0,pointerId:1,clientX:x,clientY:y});handle.dispatchEvent(e);};
    event('pointerdown',window.innerWidth-20,150);event('pointermove',20,250);event('pointerup',20,250);
    expect(element.classList.contains('sd-dock-left')).toBe(true);
    expect(LocalStorageHelper.getInstance().getOrganizerDockPositions['dock-pointer']).toEqual({side:'left',top:240});
});

test('coexisting panels fit below the header without overlap and legacy free positions become edge positions',()=>{
    const first=panel('dock-a'),second=panel('dock-b');
    dockOrganizerPanel(first,{side:'left',top:140});dockOrganizerPanel(second,{legacyPosition:{left:5,top:140}});
    layoutOrganizerDocks();
    expect(Number.parseFloat(second.style.top)).toBeGreaterThanOrEqual(Number.parseFloat(first.style.top)+220+8);
    expect(first.style.left).toBe('0px');expect(second.style.left).toBe('0px');
    const limits=dockHeightLimits([100,700],400);
    expect(limits).toEqual([100,300]);
    expect(arrangeDock([{top:90,height:limits[0]},{top:90,height:limits[1]}],456,48)).toEqual([48,156]);
});

test('moving a tall window saves the displaced window too, so their sides survive a reload',()=>{
    const guide=panel('guide',300,500),tools=panel('tools',300,500);
    dockOrganizerPanel(guide,{side:'left'});dockOrganizerPanel(tools,{side:'right'});
    tools.querySelector('button')!.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
    const storage=LocalStorageHelper.getInstance();
    expect(storage.getOrganizerDockPositions['tools'].side).toBe('left');
    expect(storage.getOrganizerDockPositions['guide'].side).toBe('right');
    guide.remove();tools.remove();
    const restoredTools=panel('tools',300,500),restoredGuide=panel('guide',300,500);
    dockOrganizerPanel(restoredTools);dockOrganizerPanel(restoredGuide);
    expect(restoredTools.classList.contains('sd-dock-left')).toBe(true);
    expect(restoredGuide.classList.contains('sd-dock-right')).toBe(true);
});
