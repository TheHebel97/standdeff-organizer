import {layoutOrganizerDocks} from './organizer-dock';

export function ensureOrganizerStyles() {
    if (document.getElementById('sd-organizer-style')) return;
    $('<style id="sd-organizer-style">').text(`
      .sd-organizer { color:#412b13; background:#f1e3c3; border:1px solid #a78c61;
        box-shadow:0 2px 5px #0002; border-radius:9px; max-width:calc(100vw - 24px);
        max-height:calc(100vh - 80px); overflow:auto; box-sizing:border-box; font:12px/1.5 Verdana,sans-serif; }
      .sd-organizer .sd-organizer-handle { background:#f1e3c3;
        color:#6e593b; padding:7px 10px; border-bottom:1px solid #c8b58e; font-size:11px; font-weight:normal; }
      .sd-organizer input:not([type=button]):not([type=checkbox]), .sd-organizer select {
        background:#fff8e8 !important; color:#3b2713 !important; border:1px solid #b59766 !important;
        border-radius:2px; box-sizing:border-box; padding:4px; }
      .sd-organizer .btn { background:#f4e4c2 !important; color:#412b13 !important;
        border:1px solid #b39a6b; border-radius:6px; padding:5px 10px; font:inherit; cursor:pointer; box-sizing:border-box; max-width:100%; }
      .sd-organizer .btn[aria-pressed=true] { background:#76502d !important; color:#fff4d9 !important; border-color:#563716; }
      .sd-organizer :focus-visible { outline:2px solid #72501e; outline-offset:2px; }
      .sd-organizer details { margin:10px 0; } .sd-organizer summary { cursor:pointer; font-weight:bold; }
      .sd-organizer .sd-preset-buttons { display:flex; flex-wrap:wrap; gap:6px; margin:8px 0; }
      .sd-organizer [aria-pressed=true] { outline:2px solid #72501e; outline-offset:1px; }
      .sd-package-row { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; padding:10px 0; border-bottom:1px solid #c4a36b; }
      .sd-package-row label { display:flex; align-items:center; gap:5px; }
      .sd-package-row img { width:18px; height:18px; } .sd-package-row input { width:100%; min-width:0; }
      .sd-field-error { border:1px solid #8d0100 !important; } .sd-organizer-error { color:#8d0100; }
      .sd-tour-target,.sd-setup-target { outline:3px solid #915dac; outline-offset:3px; }
      .sd-button { display:inline-block; cursor:pointer; font:12px/1.5 Verdana,sans-serif;
        padding:5px 10px; border:1px solid #b39a6b; border-radius:6px; background:#f4e4c2; color:#412b13; text-decoration:none; box-sizing:border-box; max-width:100%; }
      .sd-button:hover { background:#fff4d9; } .sd-button:disabled { opacity:.5; cursor:default; }
      .sd-button.sd-primary { background:#76502d; color:#fff4d9; border-color:#563716; }
      .sd-button:focus-visible { outline:2px solid #915dac; outline-offset:2px; }
      #sd-setup-card { position:fixed; width:400px; z-index:10001; padding:16px; box-shadow:0 4px 24px #0004; }
      .sd-setup-header { display:flex; align-items:center; justify-content:space-between; gap:8px; }
      .sd-setup-header h2 { font-size:18px; margin:0; }
      .sd-setup-close { padding:2px 8px; font-size:18px; }
      .sd-setup-progress,.sd-setup-status { font-size:11px; color:#6e593b; }
      .sd-tip { padding:10px; margin:10px 0; background:#fff4d9; border:1px solid #c8b58e; border-radius:6px; }
      .sd-tip-primary { border-top:3px solid #76502d; }
      .sd-tip h3 { font-size:13px; margin:0 0 4px; }
      .sd-tip p { margin:0; } .sd-setup-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
      .sd-setup-checklist { padding:0; list-style:none; } .sd-setup-checklist .sd-button { width:100%; text-align:left; margin:2px 0; }
      .sd-setup-checklist [aria-current=step] { border-left:3px solid #76502d; font-weight:bold; }
      .sd-hover-help { position:fixed; z-index:10010; width:330px; max-width:calc(100vw - 16px);
        max-height:calc(100vh - 16px); overflow:auto; box-sizing:border-box; padding:10px 12px;
        background:#fff4d9; color:#412b13; border:1px solid #a78c61; border-radius:5px;
        box-shadow:0 3px 10px #0003; font:12px/1.5 Verdana,sans-serif; }
      .sd-hover-help p { margin:5px 0 0; white-space:pre-line; }
      .sd-hover-help-all { width:720px; }
      .sd-help-sections { columns:2; column-gap:20px; margin-top:10px; }
      .sd-help-sections section { break-inside:avoid; margin-bottom:12px; }
      #sd-settings-root .sd-setting-ready > td { background:#e8edcf; }
      .sd-setting-status { display:inline-block; margin-left:10px; color:#766347; font-size:10px; }
      .sd-setting-ready .sd-setting-status { color:#365b25; }
      .sd-help-icon { float:right; display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px;
        padding:0; margin:0 0 0 6px; border:1px solid #a78c61; border-radius:50%; background:transparent; color:#6e593b;
        font:bold 12px Verdana,sans-serif; cursor:help; box-sizing:border-box; }
      .sd-help-icon:focus-visible { outline:2px solid #915dac; outline-offset:2px; }
      .sd-organizer .sd-help-header { display:flow-root; }
      .sd-setup-resource select { width:100%; margin:6px 0; }
      .sd-setup-resource label { font-weight:bold; }
      .sd-setup-checks { margin:6px 0; padding-left:18px; }
      .sd-check-pending { color:#6e593b; } .sd-check-done { color:#365b25; }
      .sd-dock { position:fixed; padding:7px; }
      .sd-dock-left { border-radius:0 9px 9px 0; }
      .sd-dock-right { border-radius:9px 0 0 9px; }
      .sd-dock .sd-dock-handle { position:sticky; top:0; z-index:1; width:100%; border:0; border-bottom:1px solid #c8b58e;
        border-radius:0; background:#f1e3c3; color:#6e593b; font:11px Verdana,sans-serif; text-align:left;
        font-weight:normal !important; padding:4px 2px 6px !important; cursor:ns-resize !important; touch-action:none; user-select:none; box-sizing:border-box; }
      @media (max-width:600px) { #sd-setup-card { padding:12px; max-height:calc(100vh - 80px); }
        .sd-help-sections { columns:1; } }
    `).appendTo('head');
}

export function escapeHtml(value: unknown): string {
    return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]!));
}

export function keepOrganizerInViewport($panel:JQuery<HTMLElement>) {
    if ($panel.hasClass('sd-dock')) {layoutOrganizerDocks($panel[0]);return;}
    const clamp = () => {
        const rect=$panel[0]?.getBoundingClientRect();
        if (!rect) return;
        const left=Math.max(12,Math.min(rect.left,window.innerWidth-rect.width-12));
        const top=Math.max(12,Math.min(rect.top,window.innerHeight-rect.height-12));
        $panel.css({left:`${left}px`,top:`${top}px`,right:'auto'});
    };
    clamp();
    $(window).off('resize.sdOrganizerViewport').on('resize.sdOrganizerViewport',clamp);
}
