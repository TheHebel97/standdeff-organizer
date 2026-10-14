import {escapeHtml} from "./organizer-style";
import {groupData, templateData} from "../../types/types";
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import {Log} from "../../helpers/logging-helper";
import {initializeSettingsHelp} from './settings-help';

const ACTIVE_BG = "#fff8e8";
const INACTIVE_BG = "#fff8e8";
const DEFAULT_SELECT_STYLE = "width:150px; background-color: #fff8e8; color: #3b2713; border: 1px solid #b59766; padding: 5px 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);";

type SettingsControlsLogger = Pick<ReturnType<typeof Log.scope>, "info">;

type SettingsControlsOptions = {
    selectStyle?: string;
    onSettingsChange?: () => void;
};

function buildSortOptionsHtml(): string {
    let sortOptions = '<option value="default"></option>';
    game_data.units.forEach((unit) => {
        sortOptions += `<option value="${unit}">${unit}</option>`;
    });
    return sortOptions;
}

function setControlColor($control: JQuery<HTMLElement>, isActive: boolean) {
    if ($control.closest('[data-sd-native-settings]').length || $control.is(':checkbox')) return;
    $control.css("background", isActive ? ACTIVE_BG : INACTIVE_BG);
    if ($control.is("input[type=button]")) $control.attr("aria-pressed", String(isActive));
}

function isDuplicateSendingEnabled(localStorageService: LocalStorageHelper): boolean {
    return !localStorageService.getPreventDuplicateDestination;
}

function syncDuplicateToggle($control: JQuery<HTMLElement>, duplicateSendingEnabled: boolean) {
    if ($control.is(':checkbox')) $control.prop('checked',duplicateSendingEnabled);
    else $control.val(duplicateSendingEnabled ? "An" : "Aus");
    setControlColor($control, duplicateSendingEnabled);
}

function buildGroupSelectHtml(groups: groupData[], style: string): string {
    let dropdown = `<select id="sd-group-id" style="${style}">`;
    dropdown += '<option value="0">nicht gesetzt</option>';
    groups.forEach((group) => {
        dropdown += `<option value="${escapeHtml(group.id)}">${escapeHtml(group.name)}</option>`;
    });
    dropdown += "</select>";
    return dropdown;
}

function buildTemplateSelectHtml(templates: templateData[], style: string): string {
    let dropdown = `<select id="sd-template-id" style="${style}">`;
    dropdown += '<option value="0">nicht gesetzt</option>';
    templates.forEach((template) => {
        dropdown += `<option value="${escapeHtml(template.id)}">${escapeHtml(template.name)}</option>`;
    });
    dropdown += "</select>";
    return dropdown;
}

function getConfiguredSelectStyle($root: JQuery<HTMLElement>, options?: SettingsControlsOptions): string {
    if ($root.is('[data-sd-native-settings]')) return '';
    if (options?.selectStyle) {
        return options.selectStyle;
    }
    const existingStyle = String($root.find("#sd-sort-by").attr("style") ?? "").trim();
    return existingStyle !== "" ? existingStyle : DEFAULT_SELECT_STYLE;
}

function syncToggleButtons($root: JQuery<HTMLElement>, localStorageService: LocalStorageHelper) {
    const $automateToggle = $root.find("#automate-massen-ut");
    const $duplicateToggle = $root.find("#prevent-duplicate-destination");

    const automateEnabled = localStorageService.getAutomateMassenUt;
    if ($automateToggle.is(':checkbox')) $automateToggle.prop('checked',automateEnabled);
    else $automateToggle.val(automateEnabled ? "An" : "Aus");
    setControlColor($automateToggle, automateEnabled);

    syncDuplicateToggle($duplicateToggle, isDuplicateSendingEnabled(localStorageService));
}

function syncSortByControl($root: JQuery<HTMLElement>, localStorageService: LocalStorageHelper) {
    const $sortBy = $root.find("#sd-sort-by");
    $sortBy.html(buildSortOptionsHtml());

    const storedSortBy = localStorageService.getSortBy;
    const sortByValue = storedSortBy !== "" ? storedSortBy : "default";
    $sortBy.val(sortByValue);
    setControlColor($sortBy, sortByValue !== "default");
}

function syncGroupControl($root: JQuery<HTMLElement>, localStorageService: LocalStorageHelper, options?: SettingsControlsOptions) {
    const groups = localStorageService.getGroupData;
    const selectStyle = getConfiguredSelectStyle($root, options);
    const $existingControl = $root.find("#sd-group-id");

    if (groups.length > 0) replaceCatalogControl($existingControl,buildGroupSelectHtml(groups,selectStyle));
    else if ($existingControl.is('select')) replaceCatalogControl($existingControl,`<input type="number" min="0" id="sd-group-id" size="6" style="${options?.selectStyle ?? ($root.is('[data-sd-native-settings]') ? '' : 'width:68px')}">`);

    const $groupControl = $root.find("#sd-group-id");
    const groupValue = localStorageService.getSdGroupId === "" ? "0" : localStorageService.getSdGroupId;
    $groupControl.val(groupValue);
    setControlColor($groupControl, groupValue !== "0");
}

function syncTemplateControl($root: JQuery<HTMLElement>, localStorageService: LocalStorageHelper, options?: SettingsControlsOptions) {
    const templates = localStorageService.getTemplateData;
    const selectStyle = getConfiguredSelectStyle($root, options);
    const $existingControl = $root.find("#sd-template-id");

    if (templates.length > 0) replaceCatalogControl($existingControl,buildTemplateSelectHtml(templates,selectStyle));
    else if ($existingControl.is('select')) replaceCatalogControl($existingControl,`<input type="number" min="0" id="sd-template-id" size="6" style="${options?.selectStyle ?? ($root.is('[data-sd-native-settings]') ? '' : 'width:68px')}">`);

    const $templateControl = $root.find("#sd-template-id");
    const templateValue = localStorageService.getSelectedTemplate === "" ? "0" : localStorageService.getSelectedTemplate;
    $templateControl.val(templateValue);
    setControlColor($templateControl, templateValue !== "0");
}

function replaceCatalogControl($existing:JQuery<HTMLElement>,html:string):void {
    const focused=document.activeElement===$existing[0];
    const $replacement=$(html);
    for (const className of ['sd-setup-target','sd-tour-target']) if ($existing.hasClass(className)) $replacement.addClass(className);
    $existing.replaceWith($replacement);
    if (focused) $replacement[0]?.focus({preventScroll:true});
}

function bindSettingsEvents(
    $root: JQuery<HTMLElement>,
    localStorageService: LocalStorageHelper,
    log: SettingsControlsLogger,
    options?: SettingsControlsOptions,
) {
    const onChange=options?.onSettingsChange;
    const changed=()=>{document.dispatchEvent(new Event('sd-settings-changed'));onChange?.();};
    options={...options,onSettingsChange:changed};
    $root.off(".sdSettingsControls");

    $root.on("click.sdSettingsControls change.sdSettingsControls", "#prevent-duplicate-destination", function (event) {
        const checkbox=$(this).is(':checkbox');
        if (checkbox !== (event.type==='change')) return;
        const nextDuplicateSendingEnabled = checkbox ? $(this).prop('checked') : $(this).val() !== "An";
        syncDuplicateToggle($(this), nextDuplicateSendingEnabled);
        localStorageService.setPreventDuplicateDestination = !nextDuplicateSendingEnabled;
        log.info("Updated setting", {
            setting: "preventDuplicateDestination",
            preventDuplicateDestination: !nextDuplicateSendingEnabled,
            duplicateSendingEnabled: nextDuplicateSendingEnabled
        });
        options?.onSettingsChange?.();
    });

    $root.on("click.sdSettingsControls change.sdSettingsControls", "#automate-massen-ut", function (event) {
        const checkbox=$(this).is(':checkbox');
        if (checkbox !== (event.type==='change')) return;
        const nextValue = checkbox ? $(this).prop('checked') : $(this).val() !== "An";
        if (!checkbox) $(this).val(nextValue ? "An" : "Aus");
        setControlColor($(this), nextValue);
        localStorageService.setAutomateMassenUt = nextValue;
        log.info("Updated setting", {setting: "automateMassenUt", value: nextValue});
        options?.onSettingsChange?.();
    });

    $root.on("change.sdSettingsControls", "#sd-group-id", function () {
        const value = String($(this).val() ?? "").trim();
        if (value !== "" && value !== "0") {
            localStorageService.setSdGroupId = value;
            setControlColor($(this), true);
            log.info("Updated setting", {setting: "sdGroupId", value});
            options?.onSettingsChange?.();
            return;
        }
        localStorageService.setSdGroupId = "0";
        $(this).val("0");
        setControlColor($(this), false);
        log.info("Updated setting", {setting: "sdGroupId", value: "0"});
        options?.onSettingsChange?.();
    });

    $root.on("change.sdSettingsControls", "#sd-template-id", function () {
        const value = String($(this).val() ?? "").trim();
        if (value !== "" && value !== "0") {
            localStorageService.setSelectedTemplate = value;
            setControlColor($(this), true);
            log.info("Updated setting", {setting: "selectedTemplate", value});
            options?.onSettingsChange?.();
            return;
        }
        localStorageService.setSelectedTemplate = "0";
        $(this).val("0");
        setControlColor($(this), false);
        log.info("Updated setting", {setting: "selectedTemplate", value: "0"});
        options?.onSettingsChange?.();
    });

    $root.on("change.sdSettingsControls", "#sd-sort-by", function () {
        const value = String($(this).val() ?? "").trim();
        if (value !== "" && value !== "default") {
            localStorageService.setSortBy = value;
            setControlColor($(this), true);
            log.info("Updated setting", {setting: "sortBy", value});
            options?.onSettingsChange?.();
            return;
        }
        localStorageService.setSortBy = "default";
        $(this).val("default");
        setControlColor($(this), false);
        log.info("Updated setting", {setting: "sortBy", value: "default"});
        options?.onSettingsChange?.();
    });
}

export function initializeSdSettingsControls(
    $root: JQuery<HTMLElement>,
    localStorageService: LocalStorageHelper,
    log: SettingsControlsLogger,
    options?: SettingsControlsOptions,
) {
    syncToggleButtons($root, localStorageService);
    syncSortByControl($root, localStorageService);
    syncGroupControl($root, localStorageService, options);
    syncTemplateControl($root, localStorageService, options);
    bindSettingsEvents($root, localStorageService, log, options);
    initializeSettingsHelp($root,localStorageService);
}
