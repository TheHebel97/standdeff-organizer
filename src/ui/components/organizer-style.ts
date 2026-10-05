export function ensureOrganizerStyles() {
    if (document.getElementById('sd-organizer-style')) return;
    $('<style id="sd-organizer-style">').text(`
      .sd-organizer { color:#3b2713; background:#f4e4bc; border:2px solid #7d510f;
        box-shadow:0 4px 12px #0004; border-radius:3px; max-width:calc(100vw - 24px);
        max-height:calc(100vh - 24px); overflow:auto; box-sizing:border-box; font-size:13px; }
      .sd-organizer .sd-organizer-handle { background:linear-gradient(#e8d5ac,#cfb382);
        color:#3b2713; padding:9px 10px; border-bottom:1px solid #a2814c; font-weight:bold; }
      .sd-organizer input:not([type=button]):not([type=checkbox]), .sd-organizer select {
        background:#fff8e8 !important; color:#3b2713 !important; border:1px solid #b59766 !important;
        border-radius:2px; box-sizing:border-box; padding:4px; }
      .sd-organizer .btn { background-color:transparent !important; color:#fff !important; }
      .sd-organizer :focus-visible { outline:2px solid #72501e; outline-offset:2px; }
      .sd-organizer details { margin:10px 0; } .sd-organizer summary { cursor:pointer; font-weight:bold; }
      .sd-organizer .sd-preset-buttons { display:flex; flex-wrap:wrap; gap:6px; margin:8px 0; }
      .sd-organizer [aria-pressed=true] { outline:2px solid #72501e; outline-offset:1px; }
      .sd-package-row { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; padding:10px 0; border-bottom:1px solid #c4a36b; }
      .sd-package-row label { display:flex; align-items:center; gap:5px; }
      .sd-package-row img { width:18px; height:18px; } .sd-package-row input { width:100%; min-width:0; }
      .sd-field-error { border:1px solid #8d0100 !important; } .sd-organizer-error { color:#8d0100; }
    `).appendTo('head');
}

export function escapeHtml(value: unknown): string {
    return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]!));
}
