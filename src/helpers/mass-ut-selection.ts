export function setCheckboxState($checkbox:JQuery<HTMLElement>, checked:boolean) {
    if ($checkbox.prop('checked') !== checked) $checkbox.trigger('click');
    if ($checkbox.prop('checked') !== checked) $checkbox.prop('checked',checked).trigger('change');
}

export function hasEnoughTemplateTroops($row:JQuery<HTMLElement>, rawTemplate:string):boolean {
    if (!rawTemplate) return true; // The player may fill troops manually in the game.
    let template:any;
    try { template=JSON.parse(rawTemplate); } catch { return false; }
    if (!template || typeof template !== 'object') return false;
    const units=game_data.units;
    let hasRequired=false;
    for (const unit of units) {
        const required=Number(template[unit] ?? 0);
        if (!Number.isSafeInteger(required) || required < 0) return false;
        if (required === 0) continue;
        hasRequired=true;
        const available=Number($row.find(`td[data-unit='${unit}']`).attr('data-count') ?? 0);
        if (!Number.isFinite(available) || available < required) return false;
    }
    if (hasRequired) return true;
    return (Array.isArray(template.use_all) ? template.use_all : []).some((unit:string) => units.includes(unit as any)
        && Number($row.find(`td[data-unit='${unit}']`).attr('data-count') ?? 0) > 0);
}
