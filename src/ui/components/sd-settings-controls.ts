import {groupData, templateData} from "../../types/types";
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import {Log} from "../../helpers/logging-helper";

const ACTIVE_BG = "#0e7a0e";
const INACTIVE_BG = "#8d0100";
const DEFAULT_SELECT_STYLE = "width:150px; background-color: #8d0100; color: #ffffff; border: none; padding: 5px 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);";

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
    $control.css("background", isActive ? ACTIVE_BG : INACTIVE_BG);
}

function isDuplicateSendingEnabled(localStorageService: LocalStorageHelper): boolean {
    return !localStorageService.getPreventDuplicateDestination;
}

function syncDuplicateToggle($control: JQuery<HTMLElement>, duplicateSendingEnabled: boolean) {
    $control.val(duplicateSendingEnabled ? "An" : "Aus");
    setControlColor($control, duplicateSendingEnabled);
}

function buildGroupSelectHtml(groups: groupData[], style: string): string {
    let dropdown = `<select id="sd-group-id" style="${style}">`;
    dropdown += '<option value="0">nicht gesetzt</option>';
    groups.forEach((group) => {
        dropdown += `<option value="${group.id}">${group.name}</option>`;
    });
    dropdown += "</select>";
    return dropdown;
}

function buildTemplateSelectHtml(templates: templateData[], style: string): string {
    let dropdown = `<select id="sd-template-id" style="${style}">`;
    dropdown += '<option value="0">nicht gesetzt</option>';
    templates.forEach((template) => {
        dropdown += `<option value="${template.id}">${template.name}</option>`;
    });
    dropdown += "</select>";
    return dropdown;
}

function getConfiguredSelectStyle($root: JQuery<HTMLElement>, options?: SettingsControlsOptions): string {
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
    $automateToggle.val(automateEnabled ? "An" : "Aus");
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

    if (groups.length > 0 && !$existingControl.is("select")) {
        $existingControl.replaceWith(buildGroupSelectHtml(groups, selectStyle));
    } else if (groups.length > 0 && $existingControl.is("select")) {
        $existingControl.replaceWith(buildGroupSelectHtml(groups, selectStyle));
    }

    const $groupControl = $root.find("#sd-group-id");
    const groupValue = localStorageService.getSdGroupId === "" ? "0" : localStorageService.getSdGroupId;
    $groupControl.val(groupValue);
    setControlColor($groupControl, groupValue !== "0");
}

function syncTemplateControl($root: JQuery<HTMLElement>, localStorageService: LocalStorageHelper, options?: SettingsControlsOptions) {
    const templates = localStorageService.getTemplateData;
    const selectStyle = getConfiguredSelectStyle($root, options);
    const $existingControl = $root.find("#sd-template-id");

    if (templates.length > 0 && !$existingControl.is("select")) {
        $existingControl.replaceWith(buildTemplateSelectHtml(templates, selectStyle));
    } else if (templates.length > 0 && $existingControl.is("select")) {
        $existingControl.replaceWith(buildTemplateSelectHtml(templates, selectStyle));
    }

    const $templateControl = $root.find("#sd-template-id");
    const templateValue = localStorageService.getSelectedTemplate === "" ? "0" : localStorageService.getSelectedTemplate;
    $templateControl.val(templateValue);
    setControlColor($templateControl, templateValue !== "0");
}

function bindSettingsEvents(
    $root: JQuery<HTMLElement>,
    localStorageService: LocalStorageHelper,
    log: SettingsControlsLogger,
    options?: SettingsControlsOptions,
) {
    $root.off(".sdSettingsControls");

    $root.on("click.sdSettingsControls", "#prevent-duplicate-destination", function () {
        const nextDuplicateSendingEnabled = $(this).val() !== "An";
        syncDuplicateToggle($(this), nextDuplicateSendingEnabled);
        localStorageService.setPreventDuplicateDestination = !nextDuplicateSendingEnabled;
        log.info("Updated setting", {
            setting: "preventDuplicateDestination",
            preventDuplicateDestination: !nextDuplicateSendingEnabled,
            duplicateSendingEnabled: nextDuplicateSendingEnabled
        });
        options?.onSettingsChange?.();
    });

    $root.on("click.sdSettingsControls", "#automate-massen-ut", function () {
        const nextValue = $(this).val() !== "An";
        $(this).val(nextValue ? "An" : "Aus");
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
}
