import {ensureOrganizerStyles} from './organizer-style';

let sequence=0;
let active:HTMLElement | undefined;
export type HelpSection={title:string;text:string};

export function closeHoverHelp() {
    active?.removeAttribute('aria-describedby');
    active=undefined;
    $('#sd-hover-help').remove();
}

/** A shared viewport-bound tooltip, also available by keyboard focus. */
export function addHoverHelp($host:JQuery<HTMLElement>,title:string,text:string|HelpSection[],id?:string) {
    ensureOrganizerStyles();
    const tooltipId='sd-hover-help';
    const $button=$('<button type="button" class="sd-help-icon">?</button>')
        .attr({id:id ?? `sd-help-${++sequence}`,title:'','aria-label':`Hilfe: ${title}`}).appendTo($host);
    const show=()=>{
        closeHoverHelp();
        active=$button[0];
        $button.attr('aria-describedby',tooltipId);
        const $tip=$('<div id="sd-hover-help" class="sd-hover-help" role="tooltip">')
            .append($('<strong>').text(title)).appendTo('body');
        if (typeof text==='string') $tip.append($('<p>').text(text));
        else {
            $tip.addClass('sd-hover-help-all');
            const $sections=$('<div class="sd-help-sections">').appendTo($tip);
            for (const section of text) $sections.append($('<section>').append($('<strong>').text(section.title),$('<p>').text(section.text)));
        }
        const anchor=$button[0].getBoundingClientRect();
        const rect=$tip[0].getBoundingClientRect();
        let left=Math.max(8,Math.min(anchor.right-rect.width,window.innerWidth-rect.width-8));
        let top=anchor.bottom+8+rect.height<=window.innerHeight-8 ? anchor.bottom+8 : Math.max(8,anchor.top-rect.height-8);
        const panel=$button.closest('.sd-dock')[0];
        if (panel) {
            const dock=panel.getBoundingClientRect();
            const beside=panel.classList.contains('sd-dock-right') ? dock.left-rect.width-8 : dock.right+8;
            if (beside>=8 && beside+rect.width<=window.innerWidth-8) {
                left=beside;
                top=Math.max(8,Math.min(anchor.top,window.innerHeight-rect.height-8));
            }
        }
        $tip.css({left,top});
    };
    $button.on('mouseenter focus',show).on('mouseleave blur',closeHoverHelp)
        .on('click',event=>event.preventDefault());
    $(document).off('keydown.sdHoverHelp').on('keydown.sdHoverHelp',event=>{if(event.key==='Escape') closeHoverHelp();});
    $(window).off('resize.sdHoverHelp scroll.sdHoverHelp').on('resize.sdHoverHelp scroll.sdHoverHelp',closeHoverHelp);
    return $button;
}
