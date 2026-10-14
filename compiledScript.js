// ==UserScript==
// @name         Standdeff Tabelle
// @namespace    standdeff-organizer
// @version      2.0.0-rc.2
// @description  SD-Tabellen, Bunkeranfragen und Massen-Unterstützung organisieren
// @author       TheHebel97, Fine, Regenmantel
// @license      MIT
// @homepageURL  https://github.com/TheHebel97/standdeff-organizer
// @match        https://*.die-staemme.de/game.php?*screen=forum*
// @match        https://*.die-staemme.de/game.php?*screen=ally*
// @match        https://*.die-staemme.de/game.php?*screen=settings*
// @match        https://*.die-staemme.de/game.php?*screen=overview_villages*
// @match        https://*.die-staemme.de/game.php?*screen=place*
// @grant        none
// @run-at       document-end
// @noframes
// ==/UserScript==

/*
MIT License

Copyright (c) 2026 TheHebel97

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Original authors credited by the project: Fine, Regenmantel.
*/

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 13:
/***/ (function(__unused_webpack_module, exports) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.describeBunkerPreset = exports.buildBunkerPreset = exports.calculateBunkerSplitPower = exports.normalizeUnitNumberMap = exports.DEFAULT_BUNKER_SPLIT_CONFIG = exports.DEFAULT_BUNKER_UNIT_POWERS = exports.BUNKER_IMPORT_UNIT_ORDER = void 0;
exports.BUNKER_IMPORT_UNIT_ORDER = [
    "spear",
    "sword",
    "archer",
    "axe",
    "spy",
    "light",
    "marcher",
    "heavy",
    "ram",
    "catapult",
    "knight",
    "snob"
];
exports.DEFAULT_BUNKER_UNIT_POWERS = {
    spear: 1,
    sword: 1.2,
    archer: 1.3,
    axe: 0.05,
    spy: 0.01,
    light: 1.2,
    marcher: 1,
    heavy: 4.8,
    ram: 0.09,
    catapult: 1,
    knight: 5,
    snob: 1
};
exports.DEFAULT_BUNKER_SPLIT_CONFIG = {
    spear: 200,
    sword: 200,
    archer: 200,
    axe: 0,
    spy: 0,
    light: 0,
    marcher: 0,
    heavy: 0,
    ram: 0,
    catapult: 0,
    knight: 0,
    snob: 0
};
function normalizeUnitNumberMap(value, defaults) {
    var normalized = __assign({}, defaults);
    var source = value !== null && value !== void 0 ? value : {};
    exports.BUNKER_IMPORT_UNIT_ORDER.forEach(function (unit) {
        var rawValue = source[unit];
        var numericValue = typeof rawValue === "number" ? rawValue : Number(rawValue);
        if (!isNaN(numericValue) && isFinite(numericValue) && numericValue >= 0) {
            normalized[unit] = numericValue;
        }
    });
    return normalized;
}
exports.normalizeUnitNumberMap = normalizeUnitNumberMap;
function calculateBunkerSplitPower(splitConfig, unitPowers, units) {
    return units.reduce(function (sum, unit) {
        var _a, _b;
        var splitAmount = Number((_a = splitConfig[unit]) !== null && _a !== void 0 ? _a : 0);
        var unitPower = Number((_b = unitPowers[unit]) !== null && _b !== void 0 ? _b : 0);
        if (isNaN(splitAmount) || isNaN(unitPower) || splitAmount <= 0 || unitPower <= 0) {
            return sum;
        }
        return sum + (splitAmount * unitPower);
    }, 0);
}
exports.calculateBunkerSplitPower = calculateBunkerSplitPower;
function buildBunkerPreset(amount, trial) {
    var config = {};
    exports.BUNKER_IMPORT_UNIT_ORDER.forEach(function (unit) { return config[unit] = 0; });
    config.spear = amount;
    config.sword = amount;
    config.archer = trial ? amount : 0;
    return config;
}
exports.buildBunkerPreset = buildBunkerPreset;
function describeBunkerPreset(config, hasArchers) {
    var e_1, _a, e_2, _b;
    try {
        for (var _c = __values([100, 200]), _d = _c.next(); !_d.done; _d = _c.next()) {
            var amount = _d.value;
            var _loop_1 = function (trial) {
                var preset = buildBunkerPreset(amount, trial);
                if (exports.BUNKER_IMPORT_UNIT_ORDER.every(function (unit) { return (!hasArchers && unit === 'archer') || config[unit] === preset[unit]; })) {
                    return { value: "".concat(amount, " ").concat(trial ? 'Trial' : 'Dual') };
                }
            };
            try {
                for (var _e = (e_2 = void 0, __values(hasArchers ? [false, true] : [false])), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var trial = _f.value;
                    var state_1 = _loop_1(trial);
                    if (typeof state_1 === "object")
                        return state_1.value;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return 'Eigene Paketgröße';
}
exports.describeBunkerPreset = describeBunkerPreset;


/***/ }),

/***/ 301:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.formatGermanDate = exports.formatLocalDateInput = exports.normalizeDateEpoch = void 0;
function pad(value) { return String(value).padStart(2, "0"); }
function localEpoch(year, month, day, hour, minute) {
    var date = new Date(year, month - 1, day, hour, minute);
    if (year < 1970 || year > 3000 || date.getFullYear() !== year || date.getMonth() !== month - 1 ||
        date.getDate() !== day || date.getHours() !== hour || date.getMinutes() !== minute)
        return 0;
    return date.getTime() / 1000;
}
/** Internal inquiry timestamps use seconds; table cells use German local dates. */
function normalizeDateEpoch(value) {
    if (value === undefined || value === null || value === "" || value === 0)
        return 0;
    var raw = String(value).trim();
    var german = /^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{1,2}):(\d{2})$/.exec(raw);
    if (german)
        return localEpoch(+german[3], +german[2], +german[1], +german[4], +german[5]);
    var iso = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(raw);
    if (iso)
        return localEpoch(+iso[1], +iso[2], +iso[3], +iso[4], +iso[5]);
    if (/^\d{8}$/.test(raw))
        return localEpoch(+raw.slice(0, 4), +raw.slice(4, 6), +raw.slice(6, 8), 0, 0);
    if (/^\d{4}$/.test(raw))
        return localEpoch(+raw, 1, 1, 0, 0);
    var numeric = Number(raw);
    if (!Number.isFinite(numeric) || numeric <= 0)
        return 0;
    var seconds = numeric > 1e12 ? numeric / 1000 : numeric;
    var date = new Date(seconds * 1000);
    return Number.isFinite(date.getTime()) && date.getFullYear() >= 1970 && date.getFullYear() <= 3000 ? seconds : 0;
}
exports.normalizeDateEpoch = normalizeDateEpoch;
function formatLocalDateInput(value) {
    var epoch = normalizeDateEpoch(value);
    if (!epoch)
        return "";
    var date = new Date(epoch * 1000);
    return "".concat(date.getFullYear(), "-").concat(pad(date.getMonth() + 1), "-").concat(pad(date.getDate()), "T").concat(pad(date.getHours()), ":").concat(pad(date.getMinutes()));
}
exports.formatLocalDateInput = formatLocalDateInput;
function formatGermanDate(value) {
    var input = formatLocalDateInput(value);
    if (!input)
        return "";
    return "".concat(input.slice(8, 10), ".").concat(input.slice(5, 7), ".").concat(input.slice(0, 4), " ").concat(input.slice(11));
}
exports.formatGermanDate = formatGermanDate;


/***/ }),

/***/ 444:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.refreshGameCatalogs = exports.initializeGameCatalog = exports.rememberCatalogCreation = exports.updateGameCatalog = exports.readGameTemplates = exports.readGameGroups = exports.SETUP_TOUR_KEY = exports.isCatalogSelectionValid = exports.getCatalogCheck = void 0;
var local_storage_helper_1 = __webpack_require__(326);
var game_url_helper_1 = __webpack_require__(579);
var catalogChecks = { groups: { state: 'idle', ids: [] }, templates: { state: 'idle', ids: [] } };
function getCatalogCheck(kind) { return __assign(__assign({}, catalogChecks[kind]), { ids: __spreadArray([], __read(catalogChecks[kind].ids), false) }); }
exports.getCatalogCheck = getCatalogCheck;
function isCatalogSelectionValid(kind, id) {
    return catalogChecks[kind].state === 'ready' && catalogChecks[kind].ids.includes(id);
}
exports.isCatalogSelectionValid = isCatalogSelectionValid;
function checkCatalog(kind, state, ids) {
    if (ids === void 0) { ids = []; }
    catalogChecks[kind] = { state: state, ids: ids };
    document.dispatchEvent(new CustomEvent('sd-catalog-validated', { detail: { kind: kind } }));
}
var CAPTURE_KEY = 'standdeff-organizer:catalog-creation';
exports.SETUP_TOUR_KEY = 'setup:2';
var validId = function (value) { return /^\d+$/.test(String(value)) && Number(value) > 0 ? String(value) : null; };
var unique = function (entries) { return __spreadArray([], __read(new Map(entries.map(function (entry) { return [entry.id, entry]; })).values()), false); };
function readGameGroups(root) {
    var result = [];
    root.querySelectorAll('.group-menu-item,[data-group-id],select[name=group] option,select[name=group_id] option').forEach(function (el) {
        var _a, _b;
        var id = validId((_a = el.getAttribute('data-group-id')) !== null && _a !== void 0 ? _a : el.getAttribute('value'));
        if (!id && el.getAttribute('href'))
            id = validId(new URL(el.getAttribute('href'), window.location.href).searchParams.get('group'));
        var name = ((_b = el.textContent) !== null && _b !== void 0 ? _b : '').trim().replace(/^\[([\s\S]*)\]$/, '$1').trim();
        if (id && name)
            result.push({ id: id, name: name });
    });
    return unique(result);
}
exports.readGameGroups = readGameGroups;
function templateEntries(raw) {
    if (!raw || typeof raw !== 'object')
        return [];
    return unique(Object.entries(raw).flatMap(function (_a) {
        var _b;
        var _c = __read(_a, 2), key = _c[0], value = _c[1];
        if (!value || typeof value !== 'object')
            return [];
        var item = value;
        var id = validId((_b = item.id) !== null && _b !== void 0 ? _b : (Array.isArray(raw) ? null : key));
        return id && typeof item.name === 'string' ? [{ id: id, name: item.name }] : [];
    }));
}
// Read the JSON emitted by the game without executing any fetched script.
function currentTemplatesJson(text) {
    var start = /TroopTemplates\.current\s*=\s*/.exec(text);
    if (!start)
        return undefined;
    var from = start.index + start[0].length;
    var depth = 0, quoted = false, escaped = false;
    for (var i = from; i < text.length; i++) {
        var char = text[i];
        if (quoted) {
            if (escaped)
                escaped = false;
            else if (char === '\\')
                escaped = true;
            else if (char === '"')
                quoted = false;
        }
        else if (char === '"')
            quoted = true;
        else if (char === '[' || char === '{')
            depth++;
        else if (char === ']' || char === '}') {
            depth--;
            if (depth === 0) {
                try {
                    return JSON.parse(text.slice(from, i + 1));
                }
                catch (_a) {
                    return undefined;
                }
            }
        }
    }
    return undefined;
}
function readGameTemplates(root) {
    var _a;
    var entries = [], available = false;
    root.querySelectorAll('script:not([src])').forEach(function (script) {
        var _a;
        var raw = currentTemplatesJson((_a = script.textContent) !== null && _a !== void 0 ? _a : '');
        if (raw !== undefined) {
            entries = templateEntries(raw);
            available = true;
        }
    });
    if (root === document && ((_a = window.TroopTemplates) === null || _a === void 0 ? void 0 : _a.current)) {
        entries = templateEntries(window.TroopTemplates.current);
        available = true;
    }
    root.querySelectorAll('select[name=template] option').forEach(function (option) {
        var _a;
        try {
            var raw = JSON.parse((_a = option.getAttribute('value')) !== null && _a !== void 0 ? _a : '');
            entries.push.apply(entries, __spreadArray([], __read(templateEntries([raw])), false));
            available = true;
        }
        catch ( /* The empty placeholder is not a template. */_b) { /* The empty placeholder is not a template. */ }
    });
    return { entries: unique(entries), available: available };
}
exports.readGameTemplates = readGameTemplates;
function readCapture() {
    var _a;
    try {
        var value = JSON.parse((_a = sessionStorage.getItem(CAPTURE_KEY)) !== null && _a !== void 0 ? _a : 'null');
        return value && ['groups', 'templates'].includes(value.kind) && Array.isArray(value.ids) && value.ids.every(function (id) { return typeof id === 'string'; }) && typeof value.name === 'string' && typeof value.useForSd === 'boolean' && Number.isFinite(value.createdAt) && Date.now() - value.createdAt >= 0 && Date.now() - value.createdAt < 30 * 60 * 1000 ? value : null;
    }
    catch (_b) {
        return null;
    }
}
function updateGameCatalog(kind, entries, complete) {
    if (complete === void 0) { complete = false; }
    var storage = local_storage_helper_1.LocalStorageHelper.getInstance();
    var existing = kind === 'groups' ? storage.getGroupData : storage.getTemplateData;
    var next = unique(complete ? entries : __spreadArray(__spreadArray([], __read(existing), false), __read(entries), false));
    var capture = readCapture();
    var changed = JSON.stringify(existing) !== JSON.stringify(next);
    if (changed) {
        if (kind === 'groups')
            storage.setGroupData = next;
        else
            storage.setTemplateData = next;
    }
    var selected = kind === 'groups' ? storage.getSdGroupId : storage.getSelectedTemplate;
    if (complete && validId(selected) && !next.some(function (entry) { return entry.id === selected; })) {
        if (kind === 'groups')
            storage.setSdGroupId = '0';
        else
            storage.setSelectedTemplate = '0';
        changed = true;
    }
    if ((capture === null || capture === void 0 ? void 0 : capture.kind) === kind) {
        var added = next.filter(function (entry) { return !capture.ids.includes(entry.id) && entry.name.trim() === capture.name.trim(); });
        if (added.length === 1) {
            if (capture.useForSd) {
                if (kind === 'groups')
                    storage.setSdGroupId = added[0].id;
                else
                    storage.setSelectedTemplate = added[0].id;
                changed = true;
            }
            sessionStorage.removeItem(CAPTURE_KEY);
        }
    }
    if (changed)
        document.dispatchEvent(new CustomEvent('sd-catalog-updated', { detail: { kind: kind } }));
    if (complete)
        checkCatalog(kind, 'ready', next.map(function (entry) { return entry.id; }));
}
exports.updateGameCatalog = updateGameCatalog;
function rememberCatalogCreation(kind, name, ids) {
    var _a;
    var storage = local_storage_helper_1.LocalStorageHelper.getInstance();
    var setup = (_a = storage.getOnboarding) === null || _a === void 0 ? void 0 : _a.tours[exports.SETUP_TOUR_KEY];
    var inSetup = setup && !setup.paused && !setup.complete && setup.step === (kind === 'groups' ? 0 : 1);
    var empty = kind === 'groups' ? !validId(storage.getSdGroupId) : !validId(storage.getSelectedTemplate);
    // Arbitrary later Off/Fake templates must not replace an established SD choice.
    var useForSd = Boolean(inSetup || (empty && /(^|\W)sd(\W|$)|standdeff/i.test(name)));
    try {
        sessionStorage.setItem(CAPTURE_KEY, JSON.stringify({ kind: kind, name: name, ids: ids, useForSd: useForSd, createdAt: Date.now() }));
    }
    catch ( /* Discovery still works without a capture. */_b) { /* Discovery still works without a capture. */ }
}
exports.rememberCatalogCreation = rememberCatalogCreation;
var pageObserver = null;
function initializeGameCatalog(context) {
    var _a;
    catalogChecks = { groups: { state: 'idle', ids: [] }, templates: { state: 'idle', ids: [] } };
    pageObserver === null || pageObserver === void 0 ? void 0 : pageObserver.disconnect();
    $(document).off('.sdCatalog');
    var groupsPage = context.screen === 'overview_villages' && context.mode === 'groups';
    var templatesPage = context.screen === 'place' && context.mode === 'templates';
    var sync = function () {
        var groups = readGameGroups(document);
        var complete = groupsPage && Boolean(document.getElementById('add_new_group_name'));
        if (groups.length || complete)
            updateGameCatalog('groups', groups, complete);
        if (templatesPage) {
            var templates = readGameTemplates(document);
            if (templates.available)
                updateGameCatalog('templates', templates.entries, true);
        }
    };
    sync();
    if (!groupsPage && !templatesPage)
        return;
    pageObserver = new MutationObserver(sync);
    pageObserver.observe((_a = document.getElementById('content_value')) !== null && _a !== void 0 ? _a : document.body, { childList: true, subtree: true, characterData: true });
    $(document).on('submit.sdCatalog', 'form', function () {
        var _a, _b;
        if (groupsPage) {
            var input = this.querySelector('#add_new_group_name,#group_name');
            if (input === null || input === void 0 ? void 0 : input.value.trim())
                rememberCatalogCreation('groups', input.value.trim(), readGameGroups(document).map(function (entry) { return entry.id; }));
        }
        else {
            var id = (_a = this.querySelector('#template_id')) === null || _a === void 0 ? void 0 : _a.value;
            var name_1 = (_b = this.querySelector('#template_name')) === null || _b === void 0 ? void 0 : _b.value.trim();
            if (!validId(id) && name_1)
                rememberCatalogCreation('templates', name_1, readGameTemplates(document).entries.map(function (entry) { return entry.id; }));
        }
    });
}
exports.initializeGameCatalog = initializeGameCatalog;
var refreshInFlight = null;
function refreshGameCatalogs() {
    var _this = this;
    if (refreshInFlight)
        return refreshInFlight;
    var pages = [
        { kind: 'groups', url: (0, game_url_helper_1.buildGameUrl)('overview_villages', { mode: 'groups', type: 'static' }) },
        { kind: 'templates', url: (0, game_url_helper_1.buildGameUrl)('place', { mode: 'templates' }) }
    ];
    refreshInFlight = Promise.allSettled(pages.map(function (page) { return __awaiter(_this, void 0, void 0, function () {
        var html, root, groups, complete, templates, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    checkCatalog(page.kind, 'loading');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, $.get(page.url)];
                case 2:
                    html = _b.sent();
                    if (typeof html !== 'string') {
                        checkCatalog(page.kind, 'error');
                        return [2 /*return*/];
                    }
                    root = new DOMParser().parseFromString(html, 'text/html');
                    if (page.kind === 'groups') {
                        groups = readGameGroups(root);
                        complete = Boolean(root.getElementById('add_new_group_name'));
                        if (complete)
                            updateGameCatalog('groups', groups, true);
                        else {
                            if (groups.length)
                                updateGameCatalog('groups', groups);
                            checkCatalog('groups', 'error');
                        }
                    }
                    else {
                        templates = readGameTemplates(root);
                        if (templates.available)
                            updateGameCatalog('templates', templates.entries, true);
                        else
                            checkCatalog('templates', 'error');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    checkCatalog(page.kind, 'error');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); })).then(function () { return undefined; }).finally(function () { refreshInFlight = null; });
    return refreshInFlight;
}
exports.refreshGameCatalogs = refreshGameCatalogs;


/***/ }),

/***/ 579:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.buildForumThreadUrl = exports.buildMassUtCallUrl = exports.buildGameUrl = void 0;
var logging_helper_1 = __webpack_require__(56);
var log = logging_helper_1.Log.scope("game-url");
function getCurrentSearchParams() {
    return new URLSearchParams(window.location.search);
}
function getCurrentVillageId() {
    var _a;
    var currentVillageId = getCurrentSearchParams().get("village");
    if (currentVillageId) {
        return currentVillageId;
    }
    if (typeof game_data !== "undefined" && ((_a = game_data.village) === null || _a === void 0 ? void 0 : _a.id) !== undefined) {
        return String(game_data.village.id);
    }
    return "0";
}
function setUrlParam(url, key, value) {
    if (value === undefined || value === null || value === "") {
        url.searchParams.delete(key);
        return;
    }
    url.searchParams.set(key, String(value));
}
function applySitterParam(url) {
    var sitterParam = getCurrentSearchParams().get("t");
    if (sitterParam) {
        url.searchParams.set("t", sitterParam);
    }
}
function resolveBaseGameUrl() {
    if (typeof game_data !== "undefined" && game_data.link_base_pure) {
        var url = new URL(game_data.link_base_pure, window.location.origin);
        log.trace("Using game_data.link_base_pure for URL generation", {
            linkBasePure: game_data.link_base_pure
        });
        return url;
    }
    var fallbackUrl = new URL(window.location.pathname, window.location.origin);
    fallbackUrl.searchParams.set("village", getCurrentVillageId());
    fallbackUrl.searchParams.set("screen", "");
    log.warn("Falling back to window.location for URL generation", {
        href: window.location.href
    });
    return fallbackUrl;
}
function buildGameUrl(screen, params, villageId) {
    if (params === void 0) { params = {}; }
    var url = resolveBaseGameUrl();
    setUrlParam(url, "village", villageId !== null && villageId !== void 0 ? villageId : getCurrentVillageId());
    setUrlParam(url, "screen", screen);
    applySitterParam(url);
    Object.entries(params).forEach(function (_a) {
        var _b = __read(_a, 2), key = _b[0], value = _b[1];
        setUrlParam(url, key, value);
    });
    return url.toString();
}
exports.buildGameUrl = buildGameUrl;
function buildMassUtCallUrl(targetVillageId, villageId) {
    return buildGameUrl("place", {
        mode: "call",
        target: targetVillageId
    }, villageId);
}
exports.buildMassUtCallUrl = buildMassUtCallUrl;
function buildForumThreadUrl(forumId, threadId, villageId) {
    return buildGameUrl("forum", {
        screenmode: "view_thread",
        forum_id: forumId,
        thread_id: threadId
    }, villageId);
}
exports.buildForumThreadUrl = buildForumThreadUrl;


/***/ }),

/***/ 424:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseGermanDate = exports.convertDateToEpoch = exports.convertEpochToDate = exports.addThreadIdToLocalStorage = void 0;
var date_helper_1 = __webpack_require__(301);
var local_storage_helper_1 = __webpack_require__(326);
var logging_helper_1 = __webpack_require__(56);
var thread_guards_1 = __webpack_require__(727);
var log = logging_helper_1.Log.scope("helper-functions");
function addThreadIdToLocalStorage(currentThreadId, postId, threadName, forumName, forumId) {
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    var threads = localStorageService.getAllThreads;
    if (currentThreadId !== null && postId !== null && threadName !== null && forumName !== null && forumId !== null) {
        var existingThread = (0, thread_guards_1.hasValidThreadMetadata)(threads[currentThreadId]);
        if (!existingThread) {
            var threadData = {
                threadName: threadName,
                forumName: forumName,
                forumId: forumId,
                sdPostId: postId,
                bunkerInquiryCache: [],
                stateOfSdTable: new Map(),
                packagesSent: new Map(),
                updatedPostIds: []
            };
            try {
                localStorageService.addThread(currentThreadId, threadData);
            }
            catch (error) {
                log.error("Could not persist SD thread", error);
                return false;
            }
            log.info("Registered SD thread in localStorage", {
                currentThreadId: currentThreadId,
                postId: postId,
                threadName: threadName,
                forumName: forumName,
                forumId: forumId
            });
            return true;
        }
        else {
            return true;
        }
    }
    else {
        if (currentThreadId === null) {
            log.error("current thread id is null");
        }
        if (postId === null) {
            log.error("post id is null");
        }
        if (threadName === null) {
            log.error("thread name is null");
        }
        if (forumName === null) {
            log.error("forum name is null");
        }
        if (forumId === null)
            log.error("forum id is missing");
        return false;
    }
}
exports.addThreadIdToLocalStorage = addThreadIdToLocalStorage;
var date_helper_2 = __webpack_require__(301);
Object.defineProperty(exports, "convertEpochToDate", ({ enumerable: true, get: function () { return date_helper_2.formatLocalDateInput; } }));
Object.defineProperty(exports, "convertDateToEpoch", ({ enumerable: true, get: function () { return date_helper_2.normalizeDateEpoch; } }));
function parseGermanDate(dateStr) {
    return (0, date_helper_1.normalizeDateEpoch)(dateStr) * 1000;
}
exports.parseGermanDate = parseGermanDate;


/***/ }),

/***/ 326:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalStorageHelper = void 0;
var logging_helper_1 = __webpack_require__(56);
var local_storage_repository_1 = __webpack_require__(270);
var local_storage_serializer_1 = __webpack_require__(974);
var pending_operation_1 = __webpack_require__(209);
var bunker_import_settings_1 = __webpack_require__(13);
var LocalStorageHelper = /** @class */ (function () {
    function LocalStorageHelper() {
        this.log = logging_helper_1.Log.scope("storage");
        this.repository = new local_storage_repository_1.StandDeffStorageRepository();
        var initData = this.repository.load();
        if (initData !== null && this.isStringValidJson(initData)) {
            this._localStorageData = this.normalizeLocalStorageData(JSON.parse(initData));
            this.log.info("Loaded existing localStorage data", this.summarizeLocalStorageData(this._localStorageData));
            return;
        }
        this._localStorageData = this.normalizeLocalStorageData({
            generalSettings: {},
            threads: {}
        });
        this.log.info("Initialized localStorage with default values");
        this.storeDataInLocalStorage(this._localStorageData, "constructor:init-default");
    }
    LocalStorageHelper.prototype.normalizeGeneralSettings = function (raw) {
        var _a, _b, _c;
        var settings = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
        var bool = function (value, fallback) { return typeof value === 'boolean' ? value : fallback; };
        var text = function (value, fallback) {
            if (fallback === void 0) { fallback = ''; }
            return typeof value === 'string' ? value : fallback;
        };
        var list = function (value) { return Array.isArray(value) ? value.filter(function (row) { return row && typeof row.id === 'string' && typeof row.name === 'string'; }) : []; };
        var position = function (value) { return value && Number.isFinite(value.left) && Number.isFinite(value.top) ? { left: value.left, top: value.top } : null; };
        return {
            organizerDockPositions: Object.fromEntries(Object.entries((_a = settings.organizerDockPositions) !== null && _a !== void 0 ? _a : {}).filter(function (_a) {
                var _b = __read(_a, 2), value = _b[1];
                return value && (value.side === 'left' || value.side === 'right') && Number.isFinite(value.top);
            }).map(function (_a) {
                var _b = __read(_a, 2), id = _b[0], value = _b[1];
                return [id, { side: value.side, top: Math.max(48, value.top) }];
            })),
            newThread: bool(settings.newThread, false), firstStartPopup: bool(settings.firstStartPopup, true),
            automateMassenUt: bool(settings.automateMassenUt, false), preventDuplicateDestination: bool(settings.preventDuplicateDestination, true),
            sdGroupId: text(settings.sdGroupId, '0'), sortBy: text(settings.sortBy), selectedTemplate: text(settings.selectedTemplate),
            swordLfz: Number.isFinite(settings.swordLfz) && settings.swordLfz > 0 ? settings.swordLfz : 22,
            forumQuickSettingsPosition: position(settings.forumQuickSettingsPosition), bunkerImportPanelPosition: position(settings.bunkerImportPanelPosition),
            bunkerImportTargetThreadId: text(settings.bunkerImportTargetThreadId),
            bunkerUnitPowers: (0, bunker_import_settings_1.normalizeUnitNumberMap)(settings.bunkerUnitPowers, bunker_import_settings_1.DEFAULT_BUNKER_UNIT_POWERS),
            bunkerSplitConfig: (0, bunker_import_settings_1.normalizeUnitNumberMap)(settings.bunkerSplitConfig, bunker_import_settings_1.DEFAULT_BUNKER_SPLIT_CONFIG),
            templateData: list(settings.templateData), groupData: list(settings.groupData),
            onboarding: { version: Number.isSafeInteger((_b = settings.onboarding) === null || _b === void 0 ? void 0 : _b.version) ? settings.onboarding.version : 1,
                tours: Object.fromEntries(Object.entries(((_c = settings.onboarding) === null || _c === void 0 ? void 0 : _c.tours) && typeof settings.onboarding.tours === 'object' ? settings.onboarding.tours : {}).filter(function (_a) {
                    var _b = __read(_a, 2), entry = _b[1];
                    return entry && Number.isSafeInteger(entry.step) && entry.step >= 0;
                }).map(function (_a) {
                    var _b = __read(_a, 2), key = _b[0], entry = _b[1];
                    return [key, { step: entry.step, paused: entry.paused === true, complete: entry.complete === true }];
                })) }
        };
    };
    LocalStorageHelper.prototype.normalizeLocalStorageData = function (data) {
        return {
            generalSettings: this.normalizeGeneralSettings(data.generalSettings),
            schemaVersion: 2,
            threads: Object.fromEntries(Object.entries(data.threads && typeof data.threads === 'object' && !Array.isArray(data.threads) ? data.threads : {})
                .filter(function (_a) {
                var _b = __read(_a, 1), id = _b[0];
                return /^\d+$/.test(id);
            })
                .map(function (_a) {
                var _b = __read(_a, 2), id = _b[0], thread = _b[1];
                return [id, (0, local_storage_serializer_1.normalizeStoredThread)(thread)];
            }))
        };
    };
    LocalStorageHelper.prototype.isStringValidJson = function (str) {
        try {
            JSON.parse(str);
        }
        catch (error) {
            this.log.error("Error parsing string to JSON", error);
            return false;
        }
        return true;
    };
    LocalStorageHelper.prototype.summarizeThreadData = function (threadId, value) {
        var sdRowCount = value.stateOfSdTable instanceof Map
            ? value.stateOfSdTable.size
            : value.stateOfSdTable.length;
        var packagesCount = value.packagesSent instanceof Map
            ? value.packagesSent.size
            : value.packagesSent.length;
        return {
            threadId: threadId,
            threadName: value.threadName,
            forumName: value.forumName,
            forumId: value.forumId,
            sdPostId: value.sdPostId,
            bunkerInquiryCount: value.bunkerInquiryCache.length,
            sdRowCount: sdRowCount,
            packagesCount: packagesCount,
            updatedPostIdsCount: value.updatedPostIds.length
        };
    };
    LocalStorageHelper.prototype.summarizeLocalStorageData = function (data) {
        var _a, _b;
        var threadIds = Object.keys(data.threads);
        return {
            threadCount: threadIds.length,
            threadIds: threadIds,
            generalSettings: {
                newThread: data.generalSettings.newThread,
                firstStartPopup: data.generalSettings.firstStartPopup,
                automateMassenUt: data.generalSettings.automateMassenUt,
                preventDuplicateDestination: data.generalSettings.preventDuplicateDestination,
                sdGroupId: data.generalSettings.sdGroupId,
                selectedTemplate: data.generalSettings.selectedTemplate,
                sortBy: data.generalSettings.sortBy,
                swordLfz: data.generalSettings.swordLfz,
                forumQuickSettingsPosition: (_a = data.generalSettings.forumQuickSettingsPosition) !== null && _a !== void 0 ? _a : null,
                bunkerImportPanelPosition: (_b = data.generalSettings.bunkerImportPanelPosition) !== null && _b !== void 0 ? _b : null,
                bunkerImportTargetThreadId: data.generalSettings.bunkerImportTargetThreadId,
                groupCount: data.generalSettings.groupData.length,
                templateCount: data.generalSettings.templateData.length
            }
        };
    };
    LocalStorageHelper.prototype.getStoredThread = function (id) {
        return this._localStorageData.threads[id];
    };
    LocalStorageHelper.prototype.storeDataInLocalStorage = function (data, reason) {
        this.log.debug("Persisting localStorage data", {
            reason: reason,
            summary: this.summarizeLocalStorageData(data)
        });
        try {
            this.repository.save(data);
        }
        catch (error) {
            this.log.error("Error storing data in LocalStorage", error);
            document.dispatchEvent(new CustomEvent('sd-storage-error'));
            this.updateFromLocalStorage("failed-write:rollback");
            throw error;
        }
    };
    LocalStorageHelper.prototype.updateFromLocalStorage = function (reason) {
        var data = this.repository.load();
        if (data === null) {
            this.log.warn("No data found in LocalStorage", { storageKey: this.repository.storageKey, reason: reason });
            return;
        }
        if (this.isStringValidJson(data)) {
            this._localStorageData = this.normalizeLocalStorageData(JSON.parse(data));
            this.log.trace("Refreshed localStorage cache", {
                reason: reason,
                summary: this.summarizeLocalStorageData(this._localStorageData)
            });
        }
    };
    LocalStorageHelper.getInstance = function () {
        if (!LocalStorageHelper.instance) {
            LocalStorageHelper.instance = new LocalStorageHelper();
        }
        return LocalStorageHelper.instance;
    };
    LocalStorageHelper.prototype.confirmOperation = function (operation) {
        try {
            this.repository.confirmOperation(operation);
        }
        catch (error) {
            document.dispatchEvent(new CustomEvent('sd-storage-error'));
            throw error;
        }
        (0, pending_operation_1.discardPendingOperation)(operation.id);
        this.updateFromLocalStorage('confirmed-operation');
    };
    Object.defineProperty(LocalStorageHelper.prototype, "getOnboarding", {
        get: function () {
            this.updateFromLocalStorage('getOnboarding');
            return this._localStorageData.generalSettings.onboarding;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "getOrganizerDockPositions", {
        get: function () {
            var _a;
            this.updateFromLocalStorage('getOrganizerDockPositions');
            return (_a = this._localStorageData.generalSettings.organizerDockPositions) !== null && _a !== void 0 ? _a : {};
        },
        enumerable: false,
        configurable: true
    });
    LocalStorageHelper.prototype.setOrganizerDockPosition = function (id, value) {
        var _a;
        this.updateFromLocalStorage('before-dock-write');
        this._localStorageData.generalSettings.organizerDockPositions = __assign(__assign({}, this._localStorageData.generalSettings.organizerDockPositions), (_a = {}, _a[id] = value, _a));
        this.storeDataInLocalStorage(this._localStorageData, 'organizerDockPositions');
    };
    Object.defineProperty(LocalStorageHelper.prototype, "setOnboarding", {
        set: function (value) {
            this.updateFromLocalStorage('before-onboarding-write');
            this._localStorageData.generalSettings.onboarding = value;
            this.storeDataInLocalStorage(this._localStorageData, 'onboarding');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "getNewThread", {
        get: function () {
            this.updateFromLocalStorage("getNewThread");
            return this._localStorageData.generalSettings.newThread;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "setNewThread", {
        set: function (value) {
            this.updateFromLocalStorage("before-setting-write");
            this._localStorageData.generalSettings.newThread = value;
            this.storeDataInLocalStorage(this._localStorageData, "setNewThread");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "getFirstStartPopup", {
        get: function () {
            this.updateFromLocalStorage("getFirstStartPopup");
            return this._localStorageData.generalSettings.firstStartPopup;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "setFirstStartPopup", {
        set: function (value) {
            this.updateFromLocalStorage("before-setting-write");
            this._localStorageData.generalSettings.firstStartPopup = value;
            this.storeDataInLocalStorage(this._localStorageData, "setFirstStartPopup");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "getSortBy", {
        get: function () {
            this.updateFromLocalStorage("getSortBy");
            return this._localStorageData.generalSettings.sortBy;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "setSortBy", {
        set: function (value) {
            this.updateFromLocalStorage("before-setting-write");
            this._localStorageData.generalSettings.sortBy = value;
            this.storeDataInLocalStorage(this._localStorageData, "setSortBy");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "getAutomateMassenUt", {
        get: function () {
            this.updateFromLocalStorage("getAutomateMassenUt");
            return this._localStorageData.generalSettings.automateMassenUt;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "setAutomateMassenUt", {
        set: function (value) {
            this.updateFromLocalStorage("before-setting-write");
            this._localStorageData.generalSettings.automateMassenUt = value;
            this.storeDataInLocalStorage(this._localStorageData, "setAutomateMassenUt");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "getPreventDuplicateDestination", {
        get: function () {
            this.updateFromLocalStorage("getPreventDuplicateDestination");
            return this._localStorageData.generalSettings.preventDuplicateDestination;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "setPreventDuplicateDestination", {
        set: function (value) {
            this.updateFromLocalStorage("before-setting-write");
            this._localStorageData.generalSettings.preventDuplicateDestination = value;
            this.storeDataInLocalStorage(this._localStorageData, "setPreventDuplicateDestination");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "getSdGroupId", {
        get: function () {
            this.updateFromLocalStorage("getSdGroupId");
            return this._localStorageData.generalSettings.sdGroupId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "setSdGroupId", {
        set: function (value) {
            this.updateFromLocalStorage("before-setting-write");
            this._localStorageData.generalSettings.sdGroupId = value;
            this.storeDataInLocalStorage(this._localStorageData, "setSdGroupId");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "getGroupData", {
        get: function () {
            this.updateFromLocalStorage("getGroupData");
            return this._localStorageData.generalSettings.groupData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "setGroupData", {
        set: function (value) {
            this.updateFromLocalStorage("before-setting-write");
            this._localStorageData.generalSettings.groupData = value;
            this.storeDataInLocalStorage(this._localStorageData, "setGroupData");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "getSwordLfz", {
        get: function () {
            this.updateFromLocalStorage("getSwordLfz");
            return this._localStorageData.generalSettings.swordLfz;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "setSwordLfz", {
        set: function (value) {
            this.updateFromLocalStorage("before-setting-write");
            this._localStorageData.generalSettings.swordLfz = value;
            this.storeDataInLocalStorage(this._localStorageData, "setSwordLfz");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "getTemplateData", {
        get: function () {
            this.updateFromLocalStorage("getTemplateData");
            return this._localStorageData.generalSettings.templateData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "setTemplateData", {
        set: function (value) {
            this.updateFromLocalStorage("before-setting-write");
            this._localStorageData.generalSettings.templateData = value;
            this.storeDataInLocalStorage(this._localStorageData, "setTemplateData");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "getForumQuickSettingsPosition", {
        get: function () {
            var _a;
            this.updateFromLocalStorage("getForumQuickSettingsPosition");
            return (_a = this._localStorageData.generalSettings.forumQuickSettingsPosition) !== null && _a !== void 0 ? _a : null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "setForumQuickSettingsPosition", {
        set: function (value) {
            this.updateFromLocalStorage("before-setting-write");
            this._localStorageData.generalSettings.forumQuickSettingsPosition = value;
            this.storeDataInLocalStorage(this._localStorageData, "setForumQuickSettingsPosition");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "getSelectedTemplate", {
        get: function () {
            this.updateFromLocalStorage("getSelectedTemplate");
            return this._localStorageData.generalSettings.selectedTemplate;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "setSelectedTemplate", {
        set: function (value) {
            this.updateFromLocalStorage("before-setting-write");
            this._localStorageData.generalSettings.selectedTemplate = value;
            this.storeDataInLocalStorage(this._localStorageData, "setSelectedTemplate");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "getBunkerImportPanelPosition", {
        get: function () {
            var _a;
            this.updateFromLocalStorage("getBunkerImportPanelPosition");
            return (_a = this._localStorageData.generalSettings.bunkerImportPanelPosition) !== null && _a !== void 0 ? _a : null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "setBunkerImportPanelPosition", {
        set: function (value) {
            this.updateFromLocalStorage("before-setting-write");
            this._localStorageData.generalSettings.bunkerImportPanelPosition = value;
            this.storeDataInLocalStorage(this._localStorageData, "setBunkerImportPanelPosition");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "getBunkerImportTargetThreadId", {
        get: function () {
            this.updateFromLocalStorage("getBunkerImportTargetThreadId");
            return this._localStorageData.generalSettings.bunkerImportTargetThreadId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "setBunkerImportTargetThreadId", {
        set: function (value) {
            this.updateFromLocalStorage("before-setting-write");
            this._localStorageData.generalSettings.bunkerImportTargetThreadId = value;
            this.storeDataInLocalStorage(this._localStorageData, "setBunkerImportTargetThreadId");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "getBunkerUnitPowers", {
        get: function () {
            this.updateFromLocalStorage("getBunkerUnitPowers");
            return (0, bunker_import_settings_1.normalizeUnitNumberMap)(this._localStorageData.generalSettings.bunkerUnitPowers, bunker_import_settings_1.DEFAULT_BUNKER_UNIT_POWERS);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "setBunkerUnitPowers", {
        set: function (value) {
            this.updateFromLocalStorage("before-setting-write");
            this._localStorageData.generalSettings.bunkerUnitPowers = (0, bunker_import_settings_1.normalizeUnitNumberMap)(value, bunker_import_settings_1.DEFAULT_BUNKER_UNIT_POWERS);
            this.storeDataInLocalStorage(this._localStorageData, "setBunkerUnitPowers");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "getBunkerSplitConfig", {
        get: function () {
            this.updateFromLocalStorage("getBunkerSplitConfig");
            return (0, bunker_import_settings_1.normalizeUnitNumberMap)(this._localStorageData.generalSettings.bunkerSplitConfig, bunker_import_settings_1.DEFAULT_BUNKER_SPLIT_CONFIG);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalStorageHelper.prototype, "setBunkerSplitConfig", {
        set: function (value) {
            this.updateFromLocalStorage("before-setting-write");
            this._localStorageData.generalSettings.bunkerSplitConfig = (0, bunker_import_settings_1.normalizeUnitNumberMap)(value, bunker_import_settings_1.DEFAULT_BUNKER_SPLIT_CONFIG);
            this.storeDataInLocalStorage(this._localStorageData, "setBunkerSplitConfig");
        },
        enumerable: false,
        configurable: true
    });
    LocalStorageHelper.prototype.getThreadData = function (id) {
        this.updateFromLocalStorage("getThreadData:".concat(id));
        var storedThreadData = this.getStoredThread(id);
        if (!storedThreadData) {
            this.log.warn("Requested thread data for unknown thread", { threadId: id });
            return undefined;
        }
        var threadData = (0, local_storage_serializer_1.deserializeThreadData)(storedThreadData);
        this.log.trace("Loaded thread data", this.summarizeThreadData(id, threadData));
        return threadData;
    };
    LocalStorageHelper.prototype.setThreadData = function (id, value) {
        this.updateFromLocalStorage("before-thread-write");
        this._localStorageData.threads[id] = (0, local_storage_serializer_1.serializeThreadData)(value);
        this.log.info("Updating thread data", this.summarizeThreadData(id, value));
        this.storeDataInLocalStorage(this._localStorageData, "setThreadData:".concat(id));
    };
    Object.defineProperty(LocalStorageHelper.prototype, "getAllThreads", {
        get: function () {
            this.updateFromLocalStorage("getAllThreads");
            var threads = {};
            for (var id in this._localStorageData.threads) {
                var storedThreadData = this._localStorageData.threads[id];
                if (storedThreadData) {
                    threads[id] = (0, local_storage_serializer_1.deserializeThreadData)(storedThreadData);
                }
            }
            this.log.trace("Loaded all threads", {
                threadCount: Object.keys(threads).length,
                threadIds: Object.keys(threads)
            });
            return threads;
        },
        enumerable: false,
        configurable: true
    });
    LocalStorageHelper.prototype.addThread = function (id, value) {
        this.updateFromLocalStorage("before-thread-write");
        var existing = this._localStorageData.threads[id];
        this._localStorageData.threads[id] = existing ? __assign(__assign({}, existing), { threadName: value.threadName, forumName: value.forumName, forumId: value.forumId, sdPostId: value.sdPostId }) : (0, local_storage_serializer_1.serializeThreadData)(value);
        this.log.info("Adding thread to localStorage", this.summarizeThreadData(id, value));
        this.storeDataInLocalStorage(this._localStorageData, "addThread:".concat(id));
    };
    LocalStorageHelper.prototype.deleteThread = function (id) {
        this.updateFromLocalStorage("before-thread-write");
        if (!this._localStorageData.threads[id]) {
            this.log.warn("Tried to delete unknown thread", { threadId: id });
            return;
        }
        delete this._localStorageData.threads[id];
        if (this._localStorageData.generalSettings.bunkerImportTargetThreadId === id) {
            this._localStorageData.generalSettings.bunkerImportTargetThreadId = "";
        }
        this.log.info("Deleted thread from localStorage", { threadId: id });
        this.storeDataInLocalStorage(this._localStorageData, "deleteThread:".concat(id));
    };
    LocalStorageHelper.prototype.getSdInquiry = function (id) {
        this.updateFromLocalStorage("getSdInquiry:".concat(id));
        var threadData = this.getStoredThread(id);
        if (!threadData) {
            this.log.warn("Requested bunker inquiries for unknown thread", { threadId: id });
            return [];
        }
        return threadData.bunkerInquiryCache;
    };
    LocalStorageHelper.prototype.setSdInquiry = function (id, value) {
        this.updateFromLocalStorage("before-thread-write");
        var threadData = this.getStoredThread(id);
        if (!threadData) {
            this.log.warn("Tried to update bunker inquiries for unknown thread", { threadId: id });
            return;
        }
        threadData.bunkerInquiryCache = value;
        this.log.info("Updated bunker inquiries", {
            threadId: id,
            bunkerInquiryCount: value.length
        });
        this.storeDataInLocalStorage(this._localStorageData, "setSdInquiry:".concat(id));
    };
    LocalStorageHelper.prototype.getSdPostId = function (id) {
        this.updateFromLocalStorage("getSdPostId:".concat(id));
        var threadData = this.getStoredThread(id);
        if (!threadData) {
            this.log.warn("Requested sdPostId for unknown thread", { threadId: id });
            return "";
        }
        return threadData.sdPostId;
    };
    LocalStorageHelper.prototype.setSdTableState = function (id, value) {
        var e_1, _a;
        var _b;
        this.updateFromLocalStorage("before-thread-write");
        var threadData = this.getStoredThread(id);
        if (!threadData) {
            this.log.warn("Tried to update SD table state for unknown thread", { threadId: id });
            return;
        }
        var previous = new Map(threadData.stateOfSdTable);
        var packages = new Map(threadData.packagesSent);
        var remapped = new Map();
        try {
            for (var previous_1 = __values(previous), previous_1_1 = previous_1.next(); !previous_1_1.done; previous_1_1 = previous_1.next()) {
                var _c = __read(previous_1_1.value, 2), village = _c[0], oldRow = _c[1];
                var sent = packages.get(oldRow.sdId);
                var newRow = value.get(village);
                if (sent !== undefined && newRow)
                    remapped.set(newRow.sdId, sent);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (previous_1_1 && !previous_1_1.done && (_a = previous_1.return)) _a.call(previous_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Orphaned/ambiguous legacy IDs are quarantined instead of assigned to another village.
        var knownIds = new Set(Array.from(previous.values(), function (row) { return row.sdId; }));
        var unresolved = threadData.packagesSent.filter(function (_a) {
            var _b = __read(_a, 1), id = _b[0];
            return !knownIds.has(id);
        });
        if (unresolved.length)
            threadData.unresolvedPackages = __spreadArray(__spreadArray([], __read(((_b = threadData.unresolvedPackages) !== null && _b !== void 0 ? _b : [])), false), __read(unresolved), false);
        threadData.packagesSent = Array.from(remapped);
        threadData.stateOfSdTable = Array.from(value.entries());
        this.log.info("Updated SD table state", {
            threadId: id,
            rowCount: value.size
        });
        this.storeDataInLocalStorage(this._localStorageData, "setSdTableState:".concat(id));
    };
    LocalStorageHelper.prototype.getSdTableState = function (id) {
        this.updateFromLocalStorage("getSdTableState:".concat(id));
        var threadData = this.getStoredThread(id);
        if (!threadData) {
            this.log.warn("Requested SD table state for unknown thread", { threadId: id });
            return new Map();
        }
        return new Map(threadData.stateOfSdTable);
    };
    LocalStorageHelper.prototype.setPackagesSent = function (id, value) {
        this.updateFromLocalStorage("before-thread-write");
        var threadData = this.getStoredThread(id);
        if (!threadData) {
            this.log.warn("Tried to update sent packages for unknown thread", { threadId: id });
            return;
        }
        threadData.packagesSent = Array.from(value.entries());
        this.log.info("Updated sent packages", {
            threadId: id,
            packageCount: value.size
        });
        this.storeDataInLocalStorage(this._localStorageData, "setPackagesSent:".concat(id));
    };
    LocalStorageHelper.prototype.resetPackagesSent = function (id) {
        this.updateFromLocalStorage("before-thread-write");
        var threadData = this.getStoredThread(id);
        if (!threadData) {
            this.log.warn("Tried to reset sent packages for unknown thread", { threadId: id });
            return;
        }
        threadData.packagesSent = [];
        this.log.info("Reset sent packages", {
            threadId: id,
            packageCount: 0
        });
        this.storeDataInLocalStorage(this._localStorageData, "resetPackagesSent:".concat(id));
    };
    LocalStorageHelper.prototype.getPackagesSent = function (id) {
        this.updateFromLocalStorage("getPackagesSent:".concat(id));
        var threadData = this.getStoredThread(id);
        if (!threadData) {
            this.log.warn("Requested sent packages for unknown thread", { threadId: id });
            return new Map();
        }
        return new Map(threadData.packagesSent);
    };
    return LocalStorageHelper;
}());
exports.LocalStorageHelper = LocalStorageHelper;


/***/ }),

/***/ 270:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StandDeffStorageRepository = void 0;
var pending_operation_1 = __webpack_require__(209);
var STORAGE_KEY = 'standdeff-organizer';
var CHANGE_PREFIX = "".concat(STORAGE_KEY, ":change:");
var clone = function (value) { return JSON.parse(JSON.stringify(value)); };
var object = function (value) { return !!value && typeof value === 'object' && !Array.isArray(value); };
// Each change owns a unique key. Independent tab writes cannot overwrite one another.
// Concurrent changes of the SAME field use revision + unique ID order (last writer wins).
var StandDeffStorageRepository = /** @class */ (function () {
    function StandDeffStorageRepository() {
        this.storageKey = STORAGE_KEY;
        this.baseline = null;
        this.revision = 0;
        this.signature = '';
        this.loadedKeys = [];
    }
    StandDeffStorageRepository.prototype.load = function () {
        var e_1, _a, e_2, _b;
        var _c, _d;
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) {
            this.baseline = null;
            return null;
        }
        var keys = [];
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.startsWith(CHANGE_PREFIX))
                keys.push(key);
        }
        var signature = raw + keys.sort().join(',');
        if (this.baseline && signature === this.signature)
            return JSON.stringify(this.baseline);
        var data;
        try {
            data = JSON.parse(raw);
            if (!object(data))
                throw new Error('Storage root is not an object');
        }
        catch (_e) {
            // Keep corrupt source for recovery before initializing defaults.
            localStorage.setItem("".concat(STORAGE_KEY, ":backup:").concat(Date.now()), raw);
            sessionStorage.setItem('sd-storage-recovered', '1');
            this.baseline = null;
            return null;
        }
        if (Number((_c = data.schemaVersion) !== null && _c !== void 0 ? _c : 1) > 2)
            throw new Error('SD Organizer: neuere Speicherversion; bitte Skript aktualisieren.');
        var changes = [];
        for (var index = 0; index < localStorage.length; index++) {
            var key = localStorage.key(index);
            if (!key.startsWith(CHANGE_PREFIX))
                continue;
            try {
                var change = JSON.parse(localStorage.getItem(key));
                if (!Number.isSafeInteger(change.revision) || !Array.isArray(change.patches))
                    continue;
                changes.push([key, change]);
            }
            catch ( /* Ignore incomplete journal entries; never overwrite them. */_f) { /* Ignore incomplete journal entries; never overwrite them. */ }
        }
        changes.sort(function (a, b) { return a[1].revision - b[1].revision || a[0].localeCompare(b[0]); });
        this.loadedKeys = changes.map(function (_a) {
            var _b = __read(_a, 1), key = _b[0];
            return key;
        });
        this.revision = Number(data.journalRevision) || 0;
        var applied = new Set(Array.isArray(data.appliedChanges) ? data.appliedChanges : []);
        var confirmed = new Set(Array.isArray(data.confirmedOperations) ? data.confirmedOperations : []);
        try {
            for (var changes_1 = __values(changes), changes_1_1 = changes_1.next(); !changes_1_1.done; changes_1_1 = changes_1.next()) {
                var _g = __read(changes_1_1.value, 2), changeKey = _g[0], change = _g[1];
                this.revision = Math.max(this.revision, change.revision);
                if (applied.has(changeKey))
                    continue;
                if (change.operation && !confirmed.has(change.operation.id)) {
                    (0, pending_operation_1.applyConfirmedOperation)(data, change.operation);
                    confirmed.add(change.operation.id);
                }
                var _loop_1 = function (patch) {
                    if (!patch || !Array.isArray(patch.path) || !patch.path.length || patch.path.some(function (key) { return typeof key !== 'string' || ['__proto__', 'constructor', 'prototype'].includes(key); }))
                        return "continue";
                    if (!patch.remove && !Object.prototype.hasOwnProperty.call(patch, 'value'))
                        return "continue";
                    var target = data;
                    patch.path.slice(0, -1).forEach(function (key) { if (!object(target[key]))
                        target[key] = {}; target = target[key]; });
                    var key = patch.path[patch.path.length - 1];
                    if (key === 'bunkerInquiryCache' && patch.inquiryCoords) {
                        var rows = Array.isArray(target[key]) ? target[key] : [];
                        var index = rows.findIndex(function (row) { return row.coords === patch.inquiryCoords; });
                        if (patch.inquiryField) {
                            if (index >= 0 && !['__proto__', 'constructor', 'prototype'].includes(patch.inquiryField))
                                rows[index][patch.inquiryField] = clone(patch.value);
                        }
                        else if (patch.remove) {
                            if (index >= 0)
                                rows.splice(index, 1);
                        }
                        else if (index >= 0)
                            rows[index] = clone(patch.value);
                        else
                            rows.push(clone(patch.value));
                        target[key] = rows;
                        return "continue";
                    }
                    if (key === 'stateOfSdTable' && Array.isArray(patch.value)) {
                        var oldRows = new Map(Array.isArray(target.stateOfSdTable) ? target.stateOfSdTable : []);
                        var nextRows_1 = new Map(patch.value);
                        var sent_1 = new Map(Array.isArray(target.packagesSent) ? target.packagesSent : []);
                        var nextSent_1 = new Map();
                        oldRows.forEach(function (row, village) { var next = nextRows_1.get(village); var amount = sent_1.get(String(row.sdId)); if (next && amount !== undefined)
                            nextSent_1.set(String(next.sdId), amount); });
                        var oldIds_1 = new Set(Array.from(oldRows.values(), function (row) { return String(row.sdId); }));
                        var unresolved = Array.from(sent_1).filter(function (_a) {
                            var _b = __read(_a, 1), id = _b[0];
                            return !oldIds_1.has(id);
                        });
                        target.unresolvedPackages = __spreadArray(__spreadArray([], __read(((_d = target.unresolvedPackages) !== null && _d !== void 0 ? _d : [])), false), __read(unresolved), false);
                        target.packagesSent = Array.from(nextSent_1);
                    }
                    if (patch.remove)
                        delete target[key];
                    else
                        target[key] = clone(patch.value);
                };
                try {
                    for (var _h = (e_2 = void 0, __values(change.patches)), _j = _h.next(); !_j.done; _j = _h.next()) {
                        var patch = _j.value;
                        _loop_1(patch);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (changes_1_1 && !changes_1_1.done && (_a = changes_1.return)) _a.call(changes_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        data.confirmedOperations = Array.from(confirmed);
        this.baseline = clone(data);
        this.signature = signature;
        return JSON.stringify(data);
    };
    StandDeffStorageRepository.prototype.save = function (data) {
        var _this = this;
        var _a;
        if (this.baseline === null) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        else {
            var patches_1 = [];
            var diff_1 = function (old, next, path) {
                if (JSON.stringify(old) === JSON.stringify(next))
                    return;
                if (path[path.length - 1] === 'bunkerInquiryCache' && Array.isArray(old) && Array.isArray(next)) {
                    var before_1 = new Map(old.map(function (row) { return [row.coords, row]; }));
                    var after_1 = new Map(next.map(function (row) { return [row.coords, row]; }));
                    new Set(__spreadArray(__spreadArray([], __read(before_1.keys()), false), __read(after_1.keys()), false)).forEach(function (coords) {
                        var first = before_1.get(coords), second = after_1.get(coords);
                        if (JSON.stringify(first) === JSON.stringify(second))
                            return;
                        if (first && second) {
                            new Set(__spreadArray(__spreadArray([], __read(Object.keys(first)), false), __read(Object.keys(second)), false)).forEach(function (field) {
                                var _a;
                                if (JSON.stringify(first[field]) !== JSON.stringify(second[field]))
                                    patches_1.push({ path: path, inquiryCoords: coords, inquiryField: field, value: (_a = second[field]) !== null && _a !== void 0 ? _a : null });
                            });
                        }
                        else
                            patches_1.push(second === undefined ? { path: path, inquiryCoords: coords, remove: true } : { path: path, inquiryCoords: coords, value: second });
                    });
                    return;
                }
                if (object(old) && object(next)) {
                    new Set(__spreadArray(__spreadArray([], __read(Object.keys(old)), false), __read(Object.keys(next)), false)).forEach(function (key) { return diff_1(old[key], next[key], __spreadArray(__spreadArray([], __read(path), false), [key], false)); });
                }
                else
                    patches_1.push(next === undefined ? { path: path, remove: true } : { path: path, value: next });
            };
            ['schemaVersion', 'generalSettings', 'threads'].forEach(function (key) { return diff_1(_this.baseline[key], data[key], [key]); });
            // A table migration remaps the LIVE package state when replayed, never a stale snapshot.
            var changedTables = new Set(patches_1.filter(function (p) { return p.path[2] === 'stateOfSdTable'; }).map(function (p) { return p.path[1]; }));
            for (var i = patches_1.length - 1; i >= 0; i--) {
                if (changedTables.has(patches_1[i].path[1]) && ['packagesSent', 'unresolvedPackages'].includes(patches_1[i].path[2]))
                    patches_1.splice(i, 1);
            }
            if (!patches_1.length)
                return;
            var id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : "".concat(Date.now(), "-").concat(Math.random().toString(36).slice(2));
            localStorage.setItem("".concat(CHANGE_PREFIX).concat(id), JSON.stringify({ revision: this.revision + 1, patches: patches_1 }));
        }
        this.baseline = clone(data);
        this.revision++;
        this.signature = '';
        if (typeof ((_a = navigator.locks) === null || _a === void 0 ? void 0 : _a.request) === 'function') {
            var count = Object.keys(localStorage).filter(function (key) { return key.startsWith(CHANGE_PREFIX); }).length;
            if (count >= 100)
                void this.compact().catch(function (error) { return console.error('[SD Organizer] Journal bleibt erhalten:', error); });
        }
    };
    StandDeffStorageRepository.prototype.confirmOperation = function (operation) {
        var _a, _b;
        if (!localStorage.getItem(STORAGE_KEY))
            throw new Error('SD Organizer Speicher fehlt.');
        this.load();
        if ((_b = (_a = this.baseline) === null || _a === void 0 ? void 0 : _a.confirmedOperations) === null || _b === void 0 ? void 0 : _b.includes(operation.id))
            return;
        var key = "".concat(CHANGE_PREFIX, "operation-").concat(operation.id);
        if (localStorage.getItem(key))
            return;
        localStorage.setItem(key, JSON.stringify({ revision: this.revision + 1, patches: [], operation: operation }));
    };
    StandDeffStorageRepository.prototype.compact = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                if (typeof ((_a = navigator.locks) === null || _a === void 0 ? void 0 : _a.request) !== 'function')
                    return [2 /*return*/, false];
                return [2 /*return*/, navigator.locks.request('sd-organizer-journal-compaction', function () {
                        var _a;
                        var data = JSON.parse((_a = _this.load()) !== null && _a !== void 0 ? _a : 'null');
                        if (!data)
                            return false;
                        var keys = _this.loadedKeys.slice();
                        data.appliedChanges = keys;
                        data.journalRevision = _this.revision;
                        // Write the complete snapshot FIRST. New changes have unique keys and remain replayable.
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                        keys.forEach(function (key) { return localStorage.removeItem(key); });
                        _this.signature = '';
                        return true;
                    })];
            });
        });
    };
    StandDeffStorageRepository.prototype.clear = function () {
        var keys = [];
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key === STORAGE_KEY || key.startsWith(CHANGE_PREFIX))
                keys.push(key);
        }
        keys.forEach(function (key) { return localStorage.removeItem(key); });
        this.baseline = null;
    };
    return StandDeffStorageRepository;
}());
exports.StandDeffStorageRepository = StandDeffStorageRepository;


/***/ }),

/***/ 974:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deserializeThreadData = exports.serializeThreadData = exports.normalizeStoredThread = void 0;
var date_helper_1 = __webpack_require__(301);
function normalizeStoredThread(raw) {
    var value = raw && typeof raw === 'object' ? raw : {};
    var pairs = function (source) { return Array.isArray(source) ? source.filter(function (entry) { return Array.isArray(entry) && entry.length === 2; }) : []; };
    var text = function (source) { return typeof source === 'string' ? source : ''; };
    return {
        threadName: text(value.threadName), forumName: text(value.forumName), forumId: text(value.forumId), sdPostId: text(value.sdPostId),
        bunkerInquiryCache: (Array.isArray(value.bunkerInquiryCache) ? value.bunkerInquiryCache : []).filter(function (row) { return row && /^\d{3}\|\d{3}$/.test(row.coords); }).map(function (row) { return ({
            coords: row.coords, amount: Number.isSafeInteger(row.amount) && row.amount > 0 ? row.amount : 0,
            playerName: text(row.playerName), comment: text(row.comment), dateFrom: (0, date_helper_1.normalizeDateEpoch)(row.dateFrom), dateUntil: (0, date_helper_1.normalizeDateEpoch)(row.dateUntil)
        }); }),
        stateOfSdTable: pairs(value.stateOfSdTable).filter(function (_a) {
            var _b = __read(_a, 2), id = _b[0], row = _b[1];
            return Number.isSafeInteger(id) && id > 0 && row && /^\d+$/.test(String(row.sdId)) && Number.isFinite(row.leftAmount) && Number.isFinite(row.startAmount);
        }),
        packagesSent: pairs(value.packagesSent).filter(function (_a) {
            var _b = __read(_a, 2), id = _b[0], amount = _b[1];
            return /^\d+$/.test(String(id)) && (/^done$/i.test(String(amount)) || /^\d+$/.test(String(amount)));
        }).map(function (_a) {
            var _b = __read(_a, 2), id = _b[0], amount = _b[1];
            return [String(id), String(amount).toLowerCase()];
        }),
        updatedPostIds: Array.isArray(value.updatedPostIds) ? value.updatedPostIds.filter(function (id) { return typeof id === 'string'; }) : [],
        unresolvedPackages: pairs(value.unresolvedPackages)
    };
}
exports.normalizeStoredThread = normalizeStoredThread;
function serializeThreadData(value) {
    var _a;
    return {
        threadName: value.threadName,
        forumName: value.forumName,
        forumId: value.forumId,
        sdPostId: value.sdPostId,
        bunkerInquiryCache: value.bunkerInquiryCache,
        stateOfSdTable: Array.from(value.stateOfSdTable.entries()),
        packagesSent: Array.from(value.packagesSent.entries()),
        updatedPostIds: value.updatedPostIds,
        unresolvedPackages: (_a = value.unresolvedPackages) !== null && _a !== void 0 ? _a : []
    };
}
exports.serializeThreadData = serializeThreadData;
function deserializeThreadData(value) {
    var _a;
    value = normalizeStoredThread(value);
    return {
        threadName: value.threadName,
        forumName: value.forumName,
        forumId: value.forumId,
        sdPostId: value.sdPostId,
        bunkerInquiryCache: value.bunkerInquiryCache,
        stateOfSdTable: new Map(value.stateOfSdTable),
        packagesSent: new Map(value.packagesSent),
        updatedPostIds: value.updatedPostIds,
        unresolvedPackages: (_a = value.unresolvedPackages) !== null && _a !== void 0 ? _a : []
    };
}
exports.deserializeThreadData = deserializeThreadData;


/***/ }),

/***/ 56:
/***/ (function(__unused_webpack_module, exports) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Log = void 0;
var LOGGER_NAME = "StandDeff";
var LOG_STORAGE_KEY = "standdeff-organizer-log-level";
var DEFAULT_LOG_LEVEL = "debug";
var LOG_LEVEL_ORDER = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    silent: 60
};
var CONSOLE_METHOD_BY_LEVEL = {
    trace: "log",
    debug: "log",
    info: "info",
    warn: "warn",
    error: "error"
};
function parseLogLevel(rawLevel) {
    if (typeof rawLevel !== "string") {
        return null;
    }
    var normalizedLevel = rawLevel.trim().toLowerCase();
    if (normalizedLevel in LOG_LEVEL_ORDER) {
        return normalizedLevel;
    }
    return null;
}
function safeGetStoredLogLevel() {
    try {
        return parseLogLevel(localStorage.getItem(LOG_STORAGE_KEY));
    }
    catch (error) {
        console.warn("[".concat(LOGGER_NAME, "] Failed to read stored log level"), error);
        return null;
    }
}
function safeSetStoredLogLevel(level) {
    try {
        if (level === DEFAULT_LOG_LEVEL) {
            localStorage.removeItem(LOG_STORAGE_KEY);
            return;
        }
        localStorage.setItem(LOG_STORAGE_KEY, level);
    }
    catch (error) {
        console.warn("[".concat(LOGGER_NAME, "] Failed to persist log level"), error);
    }
}
function resolveLogLevel() {
    var _a;
    var urlParams = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
    var urlLogLevel = parseLogLevel(urlParams.get("sdLogLevel"));
    if (urlLogLevel !== null) {
        return urlLogLevel;
    }
    var debugFlag = urlParams.get("sdDebug");
    if (debugFlag === "trace") {
        return "trace";
    }
    if (debugFlag === "1" || debugFlag === "true") {
        return "debug";
    }
    if (typeof window !== "undefined") {
        var windowLogLevel = parseLogLevel(window.STANDDEFF_LOG_LEVEL);
        if (windowLogLevel !== null) {
            return windowLogLevel;
        }
    }
    return (_a = safeGetStoredLogLevel()) !== null && _a !== void 0 ? _a : DEFAULT_LOG_LEVEL;
}
var BrowserLogger = /** @class */ (function () {
    function BrowserLogger(scopeParts) {
        if (scopeParts === void 0) { scopeParts = []; }
        this.scopeParts = scopeParts;
    }
    BrowserLogger.prototype.scope = function (scopeName) {
        return new BrowserLogger(__spreadArray(__spreadArray([], __read(this.scopeParts), false), [scopeName], false));
    };
    BrowserLogger.prototype.trace = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.write("trace", args);
    };
    BrowserLogger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.write("debug", args);
    };
    BrowserLogger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.write("info", args);
    };
    BrowserLogger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.write("warn", args);
    };
    BrowserLogger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.write("error", args);
    };
    BrowserLogger.prototype.state = function (label, data) {
        if (!this.shouldLog("debug")) {
            return;
        }
        console.groupCollapsed("".concat(this.buildPrefix("debug"), " ").concat(label));
        console.dir(data);
        console.groupEnd();
    };
    BrowserLogger.prototype.group = function (label) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this.shouldLog("debug")) {
            return;
        }
        if (args.length > 0) {
            console.group.apply(console, __spreadArray(["".concat(this.buildPrefix("debug"), " ").concat(label)], __read(args), false));
            return;
        }
        console.group("".concat(this.buildPrefix("debug"), " ").concat(label));
    };
    BrowserLogger.prototype.groupCollapsed = function (label) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this.shouldLog("debug")) {
            return;
        }
        if (args.length > 0) {
            console.groupCollapsed.apply(console, __spreadArray(["".concat(this.buildPrefix("debug"), " ").concat(label)], __read(args), false));
            return;
        }
        console.groupCollapsed("".concat(this.buildPrefix("debug"), " ").concat(label));
    };
    BrowserLogger.prototype.groupEnd = function () {
        if (!this.shouldLog("debug")) {
            return;
        }
        console.groupEnd();
    };
    BrowserLogger.prototype.time = function (label) {
        if (!this.shouldLog("debug")) {
            return;
        }
        console.time("".concat(this.buildPrefix("debug"), " ").concat(label));
    };
    BrowserLogger.prototype.timeEnd = function (label) {
        if (!this.shouldLog("debug")) {
            return;
        }
        console.timeEnd("".concat(this.buildPrefix("debug"), " ").concat(label));
    };
    BrowserLogger.prototype.getLevel = function () {
        return resolveLogLevel();
    };
    BrowserLogger.prototype.setLevel = function (level) {
        safeSetStoredLogLevel(level);
        var prefix = this.buildPrefix("info");
        console.info("".concat(prefix, " Log level updated"), { level: level });
    };
    BrowserLogger.prototype.write = function (level, args) {
        if (!this.shouldLog(level)) {
            return;
        }
        var prefix = this.buildPrefix(level);
        var consoleMethod = CONSOLE_METHOD_BY_LEVEL[level];
        if (args.length === 0) {
            console[consoleMethod](prefix);
            return;
        }
        var _a = __read(args), firstArg = _a[0], remainingArgs = _a.slice(1);
        if (typeof firstArg === "string") {
            console[consoleMethod].apply(console, __spreadArray(["".concat(prefix, " ").concat(firstArg)], __read(remainingArgs), false));
            return;
        }
        console[consoleMethod].apply(console, __spreadArray([prefix, firstArg], __read(remainingArgs), false));
    };
    BrowserLogger.prototype.shouldLog = function (level) {
        var activeLogLevel = this.getLevel();
        if (activeLogLevel === "silent") {
            return false;
        }
        return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[activeLogLevel];
    };
    BrowserLogger.prototype.buildPrefix = function (level) {
        var timestamp = new Date().toISOString();
        var scopeLabel = this.scopeParts.length > 0 ? this.scopeParts.join(":") : "root";
        return "[".concat(LOGGER_NAME, "][").concat(timestamp, "][").concat(level.toUpperCase(), "][").concat(scopeLabel, "]");
    };
    return BrowserLogger;
}());
exports.Log = new BrowserLogger();
if (typeof window !== "undefined") {
    window.STANDDEFF_LOGGER = exports.Log;
}


/***/ }),

/***/ 215:
/***/ (function(__unused_webpack_module, exports) {


var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hasEnoughTemplateTroops = exports.setCheckboxState = void 0;
function setCheckboxState($checkbox, checked) {
    if ($checkbox.prop('checked') !== checked)
        $checkbox.trigger('click');
    if ($checkbox.prop('checked') !== checked)
        $checkbox.prop('checked', checked).trigger('change');
}
exports.setCheckboxState = setCheckboxState;
function hasEnoughTemplateTroops($row, rawTemplate) {
    var e_1, _a;
    var _b, _c;
    if (!rawTemplate)
        return true; // The player may fill troops manually in the game.
    var template;
    try {
        template = JSON.parse(rawTemplate);
    }
    catch (_d) {
        return false;
    }
    if (!template || typeof template !== 'object')
        return false;
    var units = game_data.units;
    var hasRequired = false;
    try {
        for (var units_1 = __values(units), units_1_1 = units_1.next(); !units_1_1.done; units_1_1 = units_1.next()) {
            var unit = units_1_1.value;
            var required = Number((_b = template[unit]) !== null && _b !== void 0 ? _b : 0);
            if (!Number.isSafeInteger(required) || required < 0)
                return false;
            if (required === 0)
                continue;
            hasRequired = true;
            var available = Number((_c = $row.find("td[data-unit='".concat(unit, "']")).attr('data-count')) !== null && _c !== void 0 ? _c : 0);
            if (!Number.isFinite(available) || available < required)
                return false;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (units_1_1 && !units_1_1.done && (_a = units_1.return)) _a.call(units_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (hasRequired)
        return true;
    return (Array.isArray(template.use_all) ? template.use_all : []).some(function (unit) {
        var _a;
        return units.includes(unit)
            && Number((_a = $row.find("td[data-unit='".concat(unit, "']")).attr('data-count')) !== null && _a !== void 0 ? _a : 0) > 0;
    });
}
exports.hasEnoughTemplateTroops = hasEnoughTemplateTroops;


/***/ }),

/***/ 209:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.applyConfirmedOperation = exports.discardPendingOperation = exports.readPendingOperations = exports.createPendingOperation = void 0;
var date_helper_1 = __webpack_require__(301);
var inquiryFingerprint = function (row) { var _a, _b; return JSON.stringify([row.coords, row.amount, (_a = row.playerName) !== null && _a !== void 0 ? _a : '', (_b = row.comment) !== null && _b !== void 0 ? _b : '', (0, date_helper_1.normalizeDateEpoch)(row.dateFrom), (0, date_helper_1.normalizeDateEpoch)(row.dateUntil)]); };
var PREFIX = 'standdeff-organizer:pending:';
function createPendingOperation(value) {
    var operation = __assign(__assign({}, value), { id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : "".concat(Date.now(), "-").concat(Math.random().toString(36).slice(2)), created: Date.now() });
    localStorage.setItem(PREFIX + operation.id, JSON.stringify(operation));
    return operation;
}
exports.createPendingOperation = createPendingOperation;
function readPendingOperations() {
    var operations = [];
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (!key.startsWith(PREFIX))
            continue;
        try {
            var operation = JSON.parse(localStorage.getItem(key));
            if (operation.id && /^\d+$/.test(operation.threadId) && ['send', 'forum'].includes(operation.kind))
                operations.push(operation);
        }
        catch (_a) { }
    }
    return operations.sort(function (a, b) { return a.created - b.created; });
}
exports.readPendingOperations = readPendingOperations;
function discardPendingOperation(id) { localStorage.removeItem(PREFIX + id); }
exports.discardPendingOperation = discardPendingOperation;
// Applied while replaying the journal, so concurrent sends add instead of replacing snapshots.
function applyConfirmedOperation(data, operation) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var thread = (_a = data.threads) === null || _a === void 0 ? void 0 : _a[operation.threadId];
    if (!thread)
        return;
    var packages = new Map((_b = thread.packagesSent) !== null && _b !== void 0 ? _b : []);
    if (operation.kind === 'send') {
        var row = (_c = (Array.isArray(thread.stateOfSdTable) ? thread.stateOfSdTable : []).find(function (_a) {
            var _b = __read(_a, 1), id = _b[0];
            return id === operation.villageId;
        })) === null || _c === void 0 ? void 0 : _c[1];
        if (!row || (operation.requestId && String(row.sdId) !== operation.requestId)) {
            thread.unresolvedPackages = __spreadArray(__spreadArray([], __read(((_d = thread.unresolvedPackages) !== null && _d !== void 0 ? _d : [])), false), [["Dorf ".concat(operation.villageId, ", Anfrage ").concat((_e = operation.requestId) !== null && _e !== void 0 ? _e : '?'), String(operation.amount)]], false);
            return;
        }
        var current = packages.get(String(row.sdId));
        if (current !== 'done') {
            var total = (Number(current) || 0) + ((_f = operation.amount) !== null && _f !== void 0 ? _f : 0);
            packages.set(String(row.sdId), total >= ((_g = operation.leftAmount) !== null && _g !== void 0 ? _g : row.leftAmount) ? 'done' : String(total));
        }
    }
    else {
        var reported = new Map((_h = operation.packages) !== null && _h !== void 0 ? _h : []);
        reported.forEach(function (amount, id) {
            var current = packages.get(id);
            if (current === amount)
                packages.delete(id);
            else if (current !== 'done' && amount !== 'done') {
                var remaining = (Number(current) || 0) - Number(amount);
                if (remaining > 0)
                    packages.set(id, String(remaining));
            }
        });
        var sentDrafts_1 = new Set(((_j = operation.inquiries) !== null && _j !== void 0 ? _j : []).map(inquiryFingerprint));
        thread.bunkerInquiryCache = ((_k = thread.bunkerInquiryCache) !== null && _k !== void 0 ? _k : []).filter(function (row) { return !sentDrafts_1.has(inquiryFingerprint(row)); });
    }
    thread.packagesSent = Array.from(packages);
}
exports.applyConfirmedOperation = applyConfirmedOperation;


/***/ }),

/***/ 757:
/***/ (function(__unused_webpack_module, exports) {


var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.resolveScriptContext = exports.resolveForumId = void 0;
function resolveForumId(urlParams) {
    var e_1, _a;
    var fromUrl = urlParams.get("forum_id");
    if (fromUrl && /^\d+$/.test(fromUrl))
        return fromUrl;
    var selectedLinks = document.querySelectorAll(".forum-container .selected a[href], .forum-container a.selected[href]");
    try {
        for (var selectedLinks_1 = __values(selectedLinks), selectedLinks_1_1 = selectedLinks_1.next(); !selectedLinks_1_1.done; selectedLinks_1_1 = selectedLinks_1.next()) {
            var link = selectedLinks_1_1.value;
            var id = new URL(link.href, window.location.href).searchParams.get("forum_id");
            if (id && /^\d+$/.test(id))
                return id;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (selectedLinks_1_1 && !selectedLinks_1_1.done && (_a = selectedLinks_1.return)) _a.call(selectedLinks_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return null;
}
exports.resolveForumId = resolveForumId;
function urlParamsToObject(urlParams) {
    var result = {};
    urlParams.forEach(function (value, key) {
        result[key] = value;
    });
    return result;
}
function resolveScriptContext() {
    var _a, _b;
    var urlParams = new URLSearchParams(window.location.search);
    var screen = urlParams.get("screen") || "";
    var mode = (_b = (_a = urlParams.get("mode")) !== null && _a !== void 0 ? _a : urlParams.get("screenmode")) !== null && _b !== void 0 ? _b : "";
    var type = urlParams.get("type") || "";
    var modeSource = urlParams.get("mode") !== null
        ? "mode"
        : urlParams.get("screenmode") !== null
            ? "screenmode"
            : "none";
    var context = "unknown";
    if (screen === "place" && mode === "call") {
        context = "place";
    }
    else if (screen === "overview_villages" && mode === "units" && type === "away_detail") {
        context = "overview-away_detail";
    }
    else if (screen === "forum") {
        if (mode === "new_thread") {
            context = "forum-new_thread";
        }
        else if (urlParams.get("screenmode") === "view_thread" || mode === "view_thread") {
            context = "forum-view_thread";
        }
        else {
            context = "forum-unknown";
        }
    }
    else if (screen === "settings") {
        context = "settings";
    }
    return {
        context: context,
        screen: screen,
        mode: mode,
        modeSource: modeSource,
        href: window.location.href,
        query: urlParamsToObject(urlParams),
        villageId: urlParams.get("village"),
        forumId: resolveForumId(urlParams),
        threadId: urlParams.get("thread_id"),
        targetVillageId: urlParams.get("target")
    };
}
exports.resolveScriptContext = resolveScriptContext;


/***/ }),

/***/ 915:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.appendQueryToMassUtLinks = exports.applySentPackageMarkers = exports.applyLeftAmountUpdates = exports.readSdTableRenderRows = exports.readSdTableRowSources = exports.readForumPostSources = exports.readVillageAnchorSources = void 0;
var logging_helper_1 = __webpack_require__(56);
var log = logging_helper_1.Log.scope("table-dom");
function getSdTablePost(sdPostId) {
    return $("a[name='" + sdPostId + "']").parent();
}
function getSdTableBody(sdPostId) {
    return getSdTablePost(sdPostId).find(".text .bbcodetable").first().children("tbody");
}
function readVillageAnchorSources() {
    var sources = [];
    $(".village_anchor").each(function (index, element) {
        var _a;
        var coordsMatch = /(\d{3}\|\d{3})\)\sK/;
        var possibleCoords = $(element).text().trim().split("(");
        var coords = (_a = possibleCoords[possibleCoords.length - 1].match(coordsMatch)) === null || _a === void 0 ? void 0 : _a[1];
        var villageId = $(element).attr("data-id");
        if (coords && villageId) {
            sources.push({
                coords: coords,
                villageId: parseInt(villageId, 10)
            });
            return;
        }
        log.error("coords or village id is undefined");
    });
    return sources;
}
exports.readVillageAnchorSources = readVillageAnchorSources;
function readForumPostSources(sdPostId) {
    var sources = [];
    $(".post").each(function (index, element) {
        var postId = $(element).children('a[name]').map(function (_, a) { return String(a.getAttribute('name')); }).get().find(function (id) { return /^\d+$/.test(id); });
        if (!postId || postId === sdPostId) {
            return;
        }
        sources.push({
            postId: postId,
            lines: $(element).find(".text").text().split("\n")
        });
    });
    return sources;
}
exports.readForumPostSources = readForumPostSources;
function readSdTableRowSources(tableBodyElem) {
    var sources = [];
    tableBodyElem.find("tr").each(function (index, row) {
        if (index === 0) {
            return;
        }
        var cells = $(row).find("td");
        sources.push({
            sdId: cells.eq(0).text().trim(),
            coordsText: cells.eq(1).text().trim(),
            startAmountText: cells.eq(2).text().trim(),
            leftAmountText: cells.eq(3).text().trim(),
            playerNameText: cells.eq(4).text().trim(),
            commentText: cells.eq(5).text().trim(),
            dateFromText: cells.eq(6).text().trim(),
            dateUntilText: cells.eq(7).text().trim(),
            villageHref: cells.eq(8).find("a").attr("href") || ""
        });
    });
    return sources;
}
exports.readSdTableRowSources = readSdTableRowSources;
function readSdTableRenderRows(sdPostId) {
    var rows = [];
    getSdTableBody(sdPostId).find("tr").each(function (index, row) {
        if (index === 0) {
            return;
        }
        var cells = $(row).find("td");
        rows.push({
            sdId: cells.eq(0).text().trim(),
            leftAmountText: cells.eq(3).text().trim(),
            rowElement: row
        });
    });
    return rows;
}
exports.readSdTableRenderRows = readSdTableRenderRows;
function applyLeftAmountUpdates(sdPostId, updates) {
    var rows = readSdTableRenderRows(sdPostId);
    rows.forEach(function (row) {
        var nextValue = updates.get(row.sdId);
        if (nextValue === undefined) {
            return;
        }
        $(row.rowElement).find("td").eq(3).text(nextValue);
    });
}
exports.applyLeftAmountUpdates = applyLeftAmountUpdates;
function applySentPackageMarkers(sdPostId, markers) {
    var rows = readSdTableRenderRows(sdPostId);
    rows.forEach(function (row) {
        var markerText = markers.get(row.sdId);
        var amountCell = $(row.rowElement).find("td").eq(3);
        var markerElement = amountCell.find(".sent-info");
        if (!markerText) {
            markerElement.remove();
            return;
        }
        if (markerElement.length > 0) {
            markerElement.text(markerText);
            return;
        }
        amountCell.append(' ').append($('<span class="sent-info" style="color:#72501e;font-weight:bold">').text(markerText));
    });
}
exports.applySentPackageMarkers = applySentPackageMarkers;
function appendQueryToMassUtLinks(additionalQuery, sdPostId) {
    var normalizedQuery = additionalQuery.startsWith("&") ? additionalQuery.slice(1) : additionalQuery;
    var additionalParams = new URLSearchParams(normalizedQuery);
    var managedKeys = ["dir", "sdTableId", "group", "order"];
    var updatedLinkCount = 0;
    var $table = sdPostId ? getSdTablePost(sdPostId).find('.text .bbcodetable').first() : $();
    $table.find('a[href*="screen=place"]').each(function () {
        var oldHref = $(this).attr("href");
        if (!oldHref) {
            return;
        }
        var $cells = $(this).closest("tr").find("td");
        var hasDateConstraint = $cells.eq(6).text().trim() !== "" || $cells.eq(7).text().trim() !== "";
        var nextUrl = new URL(oldHref, window.location.origin);
        managedKeys.forEach(function (key) { return nextUrl.searchParams.delete(key); });
        additionalParams.forEach(function (value, key) {
            nextUrl.searchParams.set(key, value);
        });
        if (hasDateConstraint) {
            nextUrl.searchParams.set("order", "distance");
            nextUrl.searchParams.set("dir", "1");
        }
        $(this).attr("href", nextUrl.toString());
        updatedLinkCount++;
    });
    return updatedLinkCount;
}
exports.appendQueryToMassUtLinks = appendQueryToMassUtLinks;


/***/ }),

/***/ 219:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseSdStateToTableString = exports.calculateSdTableState = exports.parseEditSdTableData = exports.convertRequestArrayToMessageString = exports.convertMessageRequestStringToRequestArray = exports.buildMassUtQuerySuffix = exports.calculateTotalRequiredPackages = exports.calculateSentPackageMarkers = exports.calculateDisplayedLeftAmounts = exports.aggregatePackageUpdates = exports.parsePostCacheIds = exports.parseSdTableRows = exports.parseForumPostUpdates = exports.buildCoordVillageIdMap = exports.normalizeDateCell = exports.calculatePackagesToSend = exports.isDoneValue = void 0;
var date_helper_1 = __webpack_require__(301);
var logging_helper_1 = __webpack_require__(56);
var log = logging_helper_1.Log.scope("table-domain");
var NEW_INQUIRY_FORUM_REGEX = /(\d{3}\|\d{3})\)\sK\d+\s+(\d+)(?:\s+(.*))?/;
var NEW_INQUIRY_SHORTCUT_REGEX = /^(\d{3}\|\d{3})\s+(\d+)(?:\s+(.*))?$/;
var NEW_INQUIRY_OPTIONAL_DATA_REGEX = /^["“”„](.*?)["“”„](.*?)["“”„](.*?)["“”„](.*?)$/;
var PACKAGES_SENT_REGEX = /^\s*(?:id)?(\d+)\s+(\d+|done)(?:\s*Pakete)?\s*$/i;
var VILLAGE_ID_PATTERN = /target=(\d+)/;
function isDoneValue(value) {
    return String(value !== null && value !== void 0 ? value : "").toLowerCase() === "done";
}
exports.isDoneValue = isDoneValue;
function calculatePackagesToSend(leftAmount, sent, preventDuplicate) {
    if (!Number.isFinite(leftAmount) || leftAmount <= 0)
        return 0;
    if (isDoneValue(sent))
        return preventDuplicate ? 0 : leftAmount;
    var alreadySent = Math.max(0, Number(sent) || 0);
    return preventDuplicate && alreadySent > 0 ? 0 : Math.max(0, leftAmount - alreadySent);
}
exports.calculatePackagesToSend = calculatePackagesToSend;
function parseTwCoordsText(coordsText) {
    var coordsPattern = /\d{3}\|\d{3}/g;
    var found = coordsText.match(coordsPattern);
    return found ? found[found.length - 1] : "";
}
function parseVillageIdFromHref(href) {
    var found = href.match(VILLAGE_ID_PATTERN);
    return found ? parseInt(found[1], 10) : 0;
}
function normalizeDateCell(value) {
    return (0, date_helper_1.formatGermanDate)(value);
}
exports.normalizeDateCell = normalizeDateCell;
function buildCoordVillageIdMap(villageAnchors) {
    var coordVillageIdMap = new Map();
    villageAnchors.forEach(function (anchor) {
        coordVillageIdMap.set(anchor.coords, anchor.villageId);
    });
    return coordVillageIdMap;
}
exports.buildCoordVillageIdMap = buildCoordVillageIdMap;
function parseNewInquiryLine(line) {
    var _a, _b, _c;
    var trimmedLine = line.trim();
    var baseMatch = (_a = trimmedLine.match(NEW_INQUIRY_FORUM_REGEX)) !== null && _a !== void 0 ? _a : trimmedLine.match(NEW_INQUIRY_SHORTCUT_REGEX);
    if (!baseMatch || !Number.isSafeInteger(Number(baseMatch[2])) || Number(baseMatch[2]) <= 0) {
        return null;
    }
    var optionalDataRaw = (_c = (_b = baseMatch[3]) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "";
    if (optionalDataRaw === "") {
        return {
            coords: baseMatch[1],
            amount: parseInt(baseMatch[2], 10),
            playerName: undefined,
            comment: undefined,
            dateFrom: undefined,
            dateUntil: undefined
        };
    }
    var optionalDataMatch = optionalDataRaw.match(NEW_INQUIRY_OPTIONAL_DATA_REGEX);
    if (!optionalDataMatch || (optionalDataMatch[3] && !(0, date_helper_1.normalizeDateEpoch)(optionalDataMatch[3])) || (optionalDataMatch[4] && !(0, date_helper_1.normalizeDateEpoch)(optionalDataMatch[4]))) {
        return null;
    }
    return {
        coords: baseMatch[1],
        amount: parseInt(baseMatch[2], 10),
        playerName: optionalDataMatch[1] || undefined,
        comment: optionalDataMatch[2] || undefined,
        dateFrom: (0, date_helper_1.normalizeDateEpoch)(optionalDataMatch[3]) || undefined,
        dateUntil: (0, date_helper_1.normalizeDateEpoch)(optionalDataMatch[4]) || undefined
    };
}
function parseForumPostUpdates(posts, coordVillageIdMap, onWarning) {
    var parsedUpdateData = new Map();
    posts.forEach(function (post) {
        var packagesSent = new Map();
        var inquiries = new Map();
        var finished = false;
        var rejected = false;
        post.lines.forEach(function (line) {
            if (finished || line === "______________________________") {
                finished = true;
                return;
            }
            var parsedInquiry = parseNewInquiryLine(line);
            var packagesMatch = line.match(PACKAGES_SENT_REGEX);
            if (parsedInquiry) {
                if (!coordVillageIdMap.has(parsedInquiry.coords)) {
                    rejected = true;
                    onWarning === null || onWarning === void 0 ? void 0 : onWarning("Beitrag ".concat(post.postId, ": Dorf ").concat(parsedInquiry.coords, " konnte nicht aufgel\u00F6st werden. Bitte Dorf-BBCode verwenden; der Beitrag bleibt f\u00FCr das n\u00E4chste Update offen."));
                    log.error("coords not found in village map; inquiry not applied", { coords: parsedInquiry.coords });
                    return;
                }
                var villageId = coordVillageIdMap.get(parsedInquiry.coords) || 0;
                inquiries.set(villageId, parsedInquiry);
                return;
            }
            if (!packagesMatch) {
                return;
            }
            var sdId = packagesMatch[1];
            var packageValue = packagesMatch[2];
            if (!isDoneValue(packageValue) && !Number.isSafeInteger(Number(packageValue)))
                return;
            if (packagesSent.has(sdId)) {
                var previousValue = packagesSent.get(sdId);
                if (isDoneValue(previousValue)) {
                    return;
                }
                if (isDoneValue(packageValue)) {
                    packagesSent.set(sdId, "done");
                    return;
                }
                var nextValue = (parseInt(previousValue || "0", 10) || 0) + (parseInt(packageValue, 10) || 0);
                packagesSent.set(sdId, String(nextValue));
                return;
            }
            packagesSent.set(sdId, isDoneValue(packageValue) ? "done" : packageValue);
        });
        if (!rejected)
            parsedUpdateData.set(post.postId, { inquiries: inquiries, packages: packagesSent });
    });
    return parsedUpdateData;
}
exports.parseForumPostUpdates = parseForumPostUpdates;
function parseSdTableRows(rows) {
    var parsedState = new Map();
    rows.forEach(function (row) {
        var villageId = parseVillageIdFromHref(row.villageHref);
        if (!villageId || !/^\d+$/.test(row.sdId.trim()))
            return;
        parsedState.set(villageId, {
            coords: parseTwCoordsText(row.coordsText),
            sdId: row.sdId,
            startAmount: parseInt(row.startAmountText, 10),
            leftAmount: parseInt(row.leftAmountText, 10),
            playerName: row.playerNameText,
            comment: row.commentText,
            dateFrom: normalizeDateCell(row.dateFromText),
            dateUntil: normalizeDateCell(row.dateUntilText)
        });
    });
    return parsedState;
}
exports.parseSdTableRows = parseSdTableRows;
function parsePostCacheIds(postCacheText) {
    return Array.from(new Set(postCacheText.split(",").map(function (id) { return id.trim(); }).filter(function (id) { return /^\d+$/.test(id); })));
}
exports.parsePostCacheIds = parsePostCacheIds;
function aggregatePackageUpdates(updateData) {
    var aggregatedPackages = new Map();
    updateData.forEach(function (value) {
        value.packages.forEach(function (amount, id) {
            if (aggregatedPackages.has(id)) {
                var existingAmount = aggregatedPackages.get(id);
                if (isDoneValue(existingAmount)) {
                    return;
                }
                if (isDoneValue(amount)) {
                    aggregatedPackages.set(id, "done");
                    return;
                }
                var existingNum = parseInt(existingAmount || "0", 10);
                var amountNum = parseInt(amount, 10);
                aggregatedPackages.set(id, String((isNaN(existingNum) ? 0 : existingNum) + (isNaN(amountNum) ? 0 : amountNum)));
                return;
            }
            aggregatedPackages.set(id, isDoneValue(amount) ? "done" : String(isNaN(parseInt(amount, 10)) ? 0 : parseInt(amount, 10)));
        });
    });
    return aggregatedPackages;
}
exports.aggregatePackageUpdates = aggregatePackageUpdates;
function calculateDisplayedLeftAmounts(rows, packagesToUpdate) {
    var displayedLeftAmounts = new Map();
    rows.forEach(function (row) {
        if (!packagesToUpdate.has(row.sdId) || isDoneValue(row.leftAmountText)) {
            return;
        }
        var updateRaw = packagesToUpdate.get(row.sdId);
        if (isDoneValue(updateRaw)) {
            displayedLeftAmounts.set(row.sdId, "0");
            return;
        }
        var updateValue = parseInt(updateRaw || "0", 10);
        var oldValue = parseInt(row.leftAmountText, 10);
        var newValue = (isNaN(oldValue) ? 0 : oldValue) - (isNaN(updateValue) ? 0 : updateValue);
        displayedLeftAmounts.set(row.sdId, String(Math.max(0, newValue)));
    });
    return displayedLeftAmounts;
}
exports.calculateDisplayedLeftAmounts = calculateDisplayedLeftAmounts;
function calculateSentPackageMarkers(rows, sentPackages) {
    var sentPackageMarkers = new Map();
    rows.forEach(function (row) {
        var sentAmount = sentPackages.get(row.sdId);
        if (!sentAmount) {
            return;
        }
        sentPackageMarkers.set(row.sdId, isDoneValue(sentAmount) ? "(done)" : "(-".concat(sentAmount, ")"));
    });
    return sentPackageMarkers;
}
exports.calculateSentPackageMarkers = calculateSentPackageMarkers;
function calculateTotalRequiredPackages(sdTableState) {
    var totalRequiredPackages = 0;
    sdTableState.forEach(function (row) {
        totalRequiredPackages += isNaN(row.leftAmount) ? 0 : row.leftAmount;
    });
    return totalRequiredPackages;
}
exports.calculateTotalRequiredPackages = calculateTotalRequiredPackages;
function buildMassUtQuerySuffix(currentThreadId, automate, sdGroupId, orderBy) {
    var additionalQuery = "&dir=0&sdTableId=" + currentThreadId;
    if (!automate) {
        return additionalQuery;
    }
    if (sdGroupId !== "" && sdGroupId !== "0") {
        additionalQuery += "&group=" + sdGroupId;
    }
    if (orderBy !== "" && orderBy !== "default") {
        additionalQuery += "&order=" + orderBy;
    }
    return additionalQuery;
}
exports.buildMassUtQuerySuffix = buildMassUtQuerySuffix;
function convertMessageRequestStringToRequestArray(messageString) {
    var e_1, _a;
    var lines = messageString.split("\n");
    var requests = [];
    try {
        for (var lines_1 = __values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
            var line = lines_1_1.value;
            var parsedInquiry = parseNewInquiryLine(line);
            if (!parsedInquiry) {
                continue;
            }
            requests.push(parsedInquiry);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (lines_1_1 && !lines_1_1.done && (_a = lines_1.return)) _a.call(lines_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return requests;
}
exports.convertMessageRequestStringToRequestArray = convertMessageRequestStringToRequestArray;
function convertRequestArrayToMessageString(requests) {
    var e_2, _a;
    var lines = [];
    try {
        for (var requests_1 = __values(requests), requests_1_1 = requests_1.next(); !requests_1_1.done; requests_1_1 = requests_1.next()) {
            var request = requests_1_1.value;
            var dateFrom = (0, date_helper_1.formatGermanDate)(request.dateFrom);
            var dateUntil = (0, date_helper_1.formatGermanDate)(request.dateUntil);
            var line = "".concat(request.coords, " ").concat(request.amount, " \"").concat(request.playerName || '', "\"").concat(request.comment || '', "\"").concat(dateFrom, "\"").concat(dateUntil);
            lines.push(line);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (requests_1_1 && !requests_1_1.done && (_a = requests_1.return)) _a.call(requests_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return lines.join("\n");
}
exports.convertRequestArrayToMessageString = convertRequestArrayToMessageString;
function parseEditSdTableData(tableText, cacheText) {
    var sdTableState = new Map();
    tableText.split("[*]").forEach(function (line) {
        var _a;
        var cells = line.split("[|]");
        if (cells.length < 5 || cells.length > 9) {
            return;
        }
        while (cells.length < 9)
            cells.push("");
        cells[8] = ((_a = cells[8].match(VILLAGE_ID_PATTERN)) === null || _a === void 0 ? void 0 : _a[1]) || "";
        cells[4] = cells[4].replace(/\[player]/, "").replace(/\[\/player]/, "");
        var dateFrom = normalizeDateCell(cells[6] ? cells[6].trim() : "");
        var dateUntil = normalizeDateCell(cells[7] ? cells[7].trim() : "");
        sdTableState.set(parseInt(cells[8], 10), {
            coords: cells[1].trim(),
            sdId: cells[0].trim(),
            startAmount: parseInt(cells[2], 10),
            leftAmount: parseInt(cells[3], 10),
            playerName: cells[4],
            comment: cells[5],
            dateFrom: dateFrom,
            dateUntil: dateUntil
        });
    });
    var cache = cacheText.replace(/\[spoiler=postCache]/, "").replace(/\[\/spoiler]/, "").split(",");
    return [sdTableState, cache];
}
exports.parseEditSdTableData = parseEditSdTableData;
function calculateSdTableState(updateData, sdState) {
    var addUpSetting = true;
    var _a = __read(sdState, 2), previousTableState = _a[0], postCache = _a[1];
    var sdTableState = new Map(Array.from(previousTableState, function (_a) {
        var _b = __read(_a, 2), id = _b[0], row = _b[1];
        return [id, __assign({}, row)];
    }));
    var updateDataWithoutCache = new Map();
    var newPostCache = parsePostCacheIds(postCache.join(","));
    var nextId = Math.max.apply(Math, __spreadArray(__spreadArray([1], __read(Array.from(sdTableState.values(), function (row) { return Number(row.sdId) + 1; })), false), __read(postCache.filter(function (entry) { return entry.startsWith("sd-next-id="); }).map(function (entry) { return Number(entry.split("=")[1]) || 1; })), false));
    updateData.forEach(function (postData, postId) {
        if (!postCache.includes(postId)) {
            updateDataWithoutCache.set(postId, postData);
        }
        if (!newPostCache.includes(postId))
            newPostCache.push(postId);
    });
    var summarizedData = {
        inquiries: new Map(),
        packagesSent: new Map()
    };
    updateDataWithoutCache.forEach(function (postData) {
        postData.inquiries.forEach(function (inquiry, villageId) {
            if (summarizedData.inquiries.has(villageId)) {
                var existingInquiry = summarizedData.inquiries.get(villageId);
                if (existingInquiry && existingInquiry.amount < inquiry.amount) {
                    summarizedData.inquiries.set(villageId, inquiry);
                }
            }
            else {
                summarizedData.inquiries.set(villageId, inquiry);
            }
        });
        postData.packages.forEach(function (packageSent, sdId) {
            if (summarizedData.packagesSent.has(sdId)) {
                var existingPackage = summarizedData.packagesSent.get(sdId);
                if (!isDoneValue(existingPackage)) {
                    var newPackage = isDoneValue(packageSent)
                        ? "done"
                        : (parseInt(existingPackage || "0", 10) + parseInt(packageSent, 10)).toString();
                    summarizedData.packagesSent.set(sdId, newPackage);
                }
                else {
                    summarizedData.packagesSent.set(sdId, "done");
                }
            }
            else {
                summarizedData.packagesSent.set(sdId, packageSent);
            }
        });
    });
    summarizedData.inquiries.forEach(function (inquiry, villageId) {
        if (sdTableState.has(villageId)) {
            if (addUpSetting) {
                var existingRow = sdTableState.get(villageId);
                if (existingRow) {
                    var newLeftAmount = existingRow.leftAmount + inquiry.amount;
                    var newStartAmount = existingRow.startAmount + inquiry.amount;
                    sdTableState.set(villageId, __assign(__assign({}, existingRow), { startAmount: newStartAmount, leftAmount: newLeftAmount }));
                }
            }
        }
        else {
            sdTableState.set(villageId, {
                coords: inquiry.coords,
                sdId: String(nextId++),
                startAmount: inquiry.amount,
                leftAmount: inquiry.amount,
                playerName: inquiry.playerName || "",
                comment: inquiry.comment || "",
                dateFrom: normalizeDateCell(inquiry.dateFrom),
                dateUntil: normalizeDateCell(inquiry.dateUntil)
            });
        }
    });
    summarizedData.packagesSent.forEach(function (amount, sdId) {
        var matchingEntry = Array.from(sdTableState.entries()).find(function (_a) {
            var _b = __read(_a, 2), _ = _b[0], row = _b[1];
            return row.sdId === sdId;
        });
        if (matchingEntry) {
            var _a = __read(matchingEntry, 2), villageId = _a[0], row = _a[1];
            var requestedPackages = isDoneValue(amount)
                ? row.leftAmount
                : parseInt(amount, 10);
            var normalizedRequestedPackages = isNaN(requestedPackages) ? 0 : requestedPackages;
            var nextLeftAmount = Math.max(0, row.leftAmount - normalizedRequestedPackages);
            if (nextLeftAmount !== row.leftAmount - normalizedRequestedPackages) {
                log.warn("Clamped SD row leftAmount to zero during post update", {
                    villageId: villageId,
                    sdId: sdId,
                    previousLeftAmount: row.leftAmount,
                    requestedPackages: normalizedRequestedPackages
                });
            }
            row.leftAmount = nextLeftAmount;
            sdTableState.set(villageId, row);
        }
        else {
            log.error("no matching sdTableRowEntry found for package Id: ".concat(sdId, " -> I will ignore it :)"));
        }
    });
    sdTableState.forEach(function (row, villageId) {
        if (row.leftAmount <= 0)
            sdTableState.delete(villageId);
    });
    newPostCache.push("sd-next-id=".concat(nextId));
    return [sdTableState, newPostCache];
}
exports.calculateSdTableState = calculateSdTableState;
function parseSdStateToTableString(sdState, buildMassUtLink) {
    var _a = __read(sdState, 2), sdTableState = _a[0], cache = _a[1];
    var tableString = "";
    sdTableState.forEach(function (row, villageId) {
        tableString += "[*]".concat(row.sdId, "[|]").concat(" " + row.coords + " ", "[|]").concat(row.startAmount, "[|]").concat(row.leftAmount, "[|][player]").concat(row.playerName, "[/player][|]").concat(row.comment, "[|]").concat(normalizeDateCell(row.dateFrom), "[|]").concat(normalizeDateCell(row.dateUntil), "[|][url=").concat(buildMassUtLink(villageId), "]Massen UT-Link[/url][/*]\n");
    });
    var cacheString = "[spoiler=postCache]".concat(cache.join(","), "[/spoiler]");
    return [tableString, cacheString];
}
exports.parseSdStateToTableString = parseSdStateToTableString;


/***/ }),

/***/ 283:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.buildMassUtLinkForCurrentWorld = exports.trimYearFromDateStrings = exports.trimVillageNameText = exports.applySettingsToMassUtLink = exports.updateSentPackagesInSdTable = exports.displayUpdatedSdTable = exports.parseTableHtmlElemToSdState = exports.parseSdPosts = void 0;
var local_storage_helper_1 = __webpack_require__(326);
var logging_helper_1 = __webpack_require__(56);
var game_url_helper_1 = __webpack_require__(579);
var table_domain_1 = __webpack_require__(219);
var table_dom_1 = __webpack_require__(915);
var log = logging_helper_1.Log.scope("table-helper");
function summarizeUpdateDataMap(data) {
    var postCount = 0;
    var inquiryCount = 0;
    var packageCount = 0;
    data.forEach(function (post) {
        postCount++;
        inquiryCount += post.inquiries.size;
        packageCount += post.packages.size;
    });
    return {
        postCount: postCount,
        inquiryCount: inquiryCount,
        packageCount: packageCount
    };
}
function summarizePackagesMap(packagesToSummarize) {
    return {
        packageCount: packagesToSummarize.size,
        entries: Array.from(packagesToSummarize.entries()).slice(0, 10)
    };
}
function parseSdPosts(currentThreadId) {
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    var sdPostId = localStorageService.getSdPostId(currentThreadId);
    var villageAnchors = (0, table_dom_1.readVillageAnchorSources)();
    var forumPosts = (0, table_dom_1.readForumPostSources)(sdPostId);
    log.info("Parsing SD posts from thread view", {
        currentThreadId: currentThreadId,
        sdPostId: sdPostId,
        villageAnchorCount: villageAnchors.length,
        postCount: forumPosts.length
    });
    $('#sd-parser-warnings').remove();
    var warnings = [];
    var parsedUpdateData = (0, table_domain_1.parseForumPostUpdates)(forumPosts, (0, table_domain_1.buildCoordVillageIdMap)(villageAnchors), function (message) { return warnings.push(message); });
    if (warnings.length)
        $('<div id="sd-parser-warnings" role="alert" style="padding:8px;border:1px solid #8d0100">').text(warnings.join(' ')).prependTo('#content_value');
    log.state("Finished parsing SD posts", {
        coordVillageMappingCount: villageAnchors.length,
        summary: summarizeUpdateDataMap(parsedUpdateData)
    });
    return parsedUpdateData;
}
exports.parseSdPosts = parseSdPosts;
function parseTableHtmlElemToSdState(tableBodyElem) {
    return (0, table_domain_1.parseSdTableRows)((0, table_dom_1.readSdTableRowSources)(tableBodyElem));
}
exports.parseTableHtmlElemToSdState = parseTableHtmlElemToSdState;
function displayUpdatedSdTable(currentThreadId, packagesToUpdate) {
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    var sdPostId = localStorageService.getSdPostId(currentThreadId);
    var renderRows = (0, table_dom_1.readSdTableRenderRows)(sdPostId);
    var nextLeftAmounts = (0, table_domain_1.calculateDisplayedLeftAmounts)(renderRows, packagesToUpdate);
    log.state("Applying package deltas to SD table DOM", {
        currentThreadId: currentThreadId,
        sdPostId: sdPostId,
        packages: summarizePackagesMap(packagesToUpdate),
        renderedUpdates: summarizePackagesMap(nextLeftAmounts)
    });
    (0, table_dom_1.applyLeftAmountUpdates)(sdPostId, nextLeftAmounts);
}
exports.displayUpdatedSdTable = displayUpdatedSdTable;
function updateSentPackagesInSdTable(currentThreadId) {
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    var sdPostId = localStorageService.getSdPostId(currentThreadId);
    var sentPackages = localStorageService.getPackagesSent(currentThreadId);
    var renderRows = (0, table_dom_1.readSdTableRenderRows)(sdPostId);
    var sentMarkers = (0, table_domain_1.calculateSentPackageMarkers)(renderRows, sentPackages);
    log.state("Syncing sent packages marker into SD table DOM", {
        currentThreadId: currentThreadId,
        sdPostId: sdPostId,
        packages: summarizePackagesMap(sentPackages),
        markerCount: sentMarkers.size
    });
    (0, table_dom_1.applySentPackageMarkers)(sdPostId, sentMarkers);
}
exports.updateSentPackagesInSdTable = updateSentPackagesInSdTable;
function applySettingsToMassUtLink(currentThreadId) {
    log.info("Applying settings to mass-ut links");
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    var automate = localStorageService.getAutomateMassenUt;
    var sdGroupId = localStorageService.getSdGroupId;
    var orderBy = localStorageService.getSortBy;
    var additionalLinkText = (0, table_domain_1.buildMassUtQuerySuffix)(currentThreadId, automate, sdGroupId, orderBy);
    var updatedLinkCount = (0, table_dom_1.appendQueryToMassUtLinks)(additionalLinkText, localStorageService.getSdPostId(currentThreadId));
    log.info("Mass-ut links updated", {
        currentThreadId: currentThreadId,
        automate: automate,
        sdGroupId: sdGroupId,
        orderBy: orderBy,
        updatedLinkCount: updatedLinkCount
    });
}
exports.applySettingsToMassUtLink = applySettingsToMassUtLink;
function trimVillageNameText(sdPostId) {
    log.info("Trimming village names in SD table");
    $("a[name=" + sdPostId + "]").parent().find(".text .bbcodetable").first().find(".village_anchor>a").each(function (index, element) {
        var coordsPattern = /(\d{3}\|\d{3})/;
        var match = $(element).text().match(coordsPattern);
        if (match) {
            $(element).text(match[1]);
        }
    });
}
exports.trimVillageNameText = trimVillageNameText;
function trimYearFromDateStrings() {
    log.info("Trimming year from date strings in SD table");
    $(".bbcodetable>tbody").children().each(function (index, element) {
        if (index === 0)
            return;
        var $cells = $(element).find("td");
        var $dateFrom = $cells.eq(6);
        var $dateUntil = $cells.eq(7);
        function stripYear($cell) {
            if (!$cell || $cell.length === 0)
                return;
            var text = $cell.text().trim();
            if (!text)
                return;
            var m = text.match(/^(\d{2}\.\d{2})\.(\d{4})(?:\s+(\d{1,2}:\d{2}))?.*$/);
            if (m) {
                var dayMonth = m[1];
                var time = m[3] ? m[3] : "00:00";
                $cell.text("".concat(dayMonth, " ").concat(time));
            }
        }
        stripYear($dateFrom);
        stripYear($dateUntil);
    });
}
exports.trimYearFromDateStrings = trimYearFromDateStrings;
function buildMassUtLinkForCurrentWorld(villageId) {
    return (0, game_url_helper_1.buildMassUtCallUrl)(villageId);
}
exports.buildMassUtLinkForCurrentWorld = buildMassUtLinkForCurrentWorld;


/***/ }),

/***/ 727:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isAnswerMode = exports.isEditingSdPost = exports.hasValidThreadMetadata = exports.isKnownSdThread = exports.getForumIdFromContext = exports.getThreadIdFromContext = void 0;
function getThreadIdFromContext(pageContext) {
    var _a;
    return (_a = pageContext.threadId) !== null && _a !== void 0 ? _a : "";
}
exports.getThreadIdFromContext = getThreadIdFromContext;
function getForumIdFromContext(pageContext) {
    return pageContext.forumId;
}
exports.getForumIdFromContext = getForumIdFromContext;
function isKnownSdThread(threads, pageContext) {
    var threadId = getThreadIdFromContext(pageContext);
    return threadId !== "" && hasValidThreadMetadata(threads[threadId]);
}
exports.isKnownSdThread = isKnownSdThread;
function hasValidThreadMetadata(thread) {
    return !!thread && /^[1-9]\d*$/.test(thread.sdPostId) && /^[1-9]\d*$/.test(thread.forumId);
}
exports.hasValidThreadMetadata = hasValidThreadMetadata;
function isEditingSdPost(pageContext, threads) {
    var _a, _b;
    var threadId = getThreadIdFromContext(pageContext);
    var editPostId = (_a = pageContext.query.edit_post_id) !== null && _a !== void 0 ? _a : "";
    return threadId !== "" && editPostId !== "" && ((_b = threads[threadId]) === null || _b === void 0 ? void 0 : _b.sdPostId) === editPostId;
}
exports.isEditingSdPost = isEditingSdPost;
function isAnswerMode(pageContext) {
    return Object.prototype.hasOwnProperty.call(pageContext.query, "answer");
}
exports.isAnswerMode = isAnswerMode;


/***/ }),

/***/ 452:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerSdThread = exports.readSdPostId = void 0;
var helper_functions_1 = __webpack_require__(424);
function readSdPostId() {
    var postId = null;
    $(".post").each(function (_, post) {
        var _a;
        var $post = $(post);
        var isSdPost = $post.find(".text b").toArray().some(function (element) {
            return $(element).text().trim().startsWith("SD Tabelle Paketsystem");
        });
        if (!isSdPost || !$post.find(".text .bbcodetable").length)
            return;
        var anchor = $post.children("a[name]").toArray().find(function (element) { var _a; return /^\d+$/.test((_a = $(element).attr("name")) !== null && _a !== void 0 ? _a : ""); });
        if (anchor)
            postId = (_a = $(anchor).attr("name")) !== null && _a !== void 0 ? _a : null;
        return postId === null ? undefined : false;
    });
    return postId;
}
exports.readSdPostId = readSdPostId;
function registerSdThread(threadId, forumId) {
    var postId = readSdPostId();
    var title = $(".clearfix > table").first().find("h2").text().trim();
    var forumName = $(".forum-container .selected").text().trim();
    var success = !!threadId && !!postId && !!forumId && (0, helper_functions_1.addThreadIdToLocalStorage)(threadId, postId, title, forumName, forumId);
    $(".sd-registration-error").remove();
    if (!success) {
        var message = !postId ? "Keine SD-Tabelle auf dieser Seite gefunden. Bitte den Beitrag mit der SD-Tabelle öffnen."
            : !forumId ? "Das zugehörige Forum wurde nicht erkannt. Bitte den Thread über das Forum öffnen."
                : "Die SD-Tabelle konnte nicht gespeichert werden. Bitte den Browser-Speicher prüfen und erneut versuchen.";
        var $target = $("#sd-thread-registration").length
            ? $("#sd-thread-registration") : $("#content_value").length ? $("#content_value") : $("body");
        $("<p class='sd-registration-error' role='alert'></p>").text(message).appendTo($target);
    }
    return !!success;
}
exports.registerSdThread = registerSdThread;


/***/ }),

/***/ 246:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.distanceXY = exports.villageBBCodeToCoordinates = exports.isUserForumMod = void 0;
var logging_helper_1 = __webpack_require__(56);
var log = logging_helper_1.Log.scope("tw-helper");
function isUserForumMod() {
    //only works inside the forum
    if (game_data.screen === "forum") {
        return $('#ally_content a[href]').toArray().some(function (element) {
            var _a;
            var url = new URL((_a = element.getAttribute('href')) !== null && _a !== void 0 ? _a : '', window.location.origin);
            return url.searchParams.get('screen') === 'forum' && url.searchParams.get('screenmode') === 'admin';
        });
    }
    else {
        log.error("you can only authenticate as a forum mod in the forum screen");
        return false;
    }
}
exports.isUserForumMod = isUserForumMod;
function villageBBCodeToCoordinates(bbcode) {
    var coordRegex = /\b\d{3}\|\d{3}\b/g;
    var match = bbcode.match(coordRegex);
    if (match) {
        return match[match.length - 1];
    }
    else {
        log.error("Invalid village BBCode format", { bbcode: bbcode });
        return "";
    }
}
exports.villageBBCodeToCoordinates = villageBBCodeToCoordinates;
function distanceXY(a, b) {
    var _a = __read(a.split("|").map(Number), 2), x1 = _a[0], y1 = _a[1];
    var _b = __read(b.split("|").map(Number), 2), x2 = _b[0], y2 = _b[1];
    return Math.hypot(x2 - x1, y2 - y1);
}
exports.distanceXY = distanceXY;


/***/ }),

/***/ 107:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.displayAwayDetail = void 0;
var organizer_dock_1 = __webpack_require__(617);
var organizer_style_1 = __webpack_require__(409);
var bunker_import_settings_1 = __webpack_require__(13);
var local_storage_helper_1 = __webpack_require__(326);
var logging_helper_1 = __webpack_require__(56);
var bunker_import_settings_2 = __webpack_require__(13);
var PANEL_ID = "sd-bunker-import-panel";
var PANEL_HANDLE_CLASS = "sd-bunker-import-panel-handle";
var BUTTON_ID = "sd-import-bunker-requests";
var PREVIEW_ROW_SELECTOR = "[data-bunker-import-preview-row]";
var log = logging_helper_1.Log.scope("away-detail");
var importSelectionByCoords = {};
function isImportRequestSelected(coords) {
    var _a;
    return (_a = importSelectionByCoords[coords]) !== null && _a !== void 0 ? _a : true;
}
function setImportRequestSelection(coords, isSelected) {
    importSelectionByCoords[coords] = isSelected;
}
function getAvailableUnits() {
    return bunker_import_settings_2.BUNKER_IMPORT_UNIT_ORDER.filter(function (unit) { return game_data.units.includes(unit); });
}
function buildUnitSettingsRows(units, splitConfig, unitPowers) {
    return units.map(function (unit) {
        var _a, _b;
        return "\n      <tr>\n        <td style=\"padding: 4px 6px; font-weight: bold;\"><img src=\"/graphic/unit/unit_".concat(unit, ".png\" alt=\"").concat(unit, "\" title=\"").concat(unit, "\"></td>\n        <td style=\"padding: 4px 6px;\">\n          <input type=\"number\" min=\"0\" step=\"1\" data-unit=\"").concat(unit, "\" data-config=\"split\" value=\"").concat((_a = splitConfig[unit]) !== null && _a !== void 0 ? _a : 0, "\"\n                 style=\"width: 90px; background-color: #e6dcc1; border: 1px solid #7d510f; box-sizing: border-box;\">\n        </td>\n        <td style=\"padding: 4px 6px;\">\n          <input type=\"number\" min=\"0\" step=\"0.01\" data-unit=\"").concat(unit, "\" data-config=\"power\" value=\"").concat((_b = unitPowers[unit]) !== null && _b !== void 0 ? _b : 0, "\"\n                 style=\"width: 90px; background-color: #e6dcc1; border: 1px solid #7d510f; box-sizing: border-box;\">\n        </td>\n      </tr>\n    ");
    }).join("");
}
function buildThreadOptionsHtml(threads) {
    var html = '<option value="">Bitte waehlen</option>';
    Object.entries(threads).forEach(function (_a) {
        var _b = __read(_a, 2), threadId = _b[0], threadData = _b[1];
        html += "<option value=\"".concat((0, organizer_style_1.escapeHtml)(threadId), "\">").concat((0, organizer_style_1.escapeHtml)(threadData.forumName), " - ").concat((0, organizer_style_1.escapeHtml)(threadData.threadName), "</option>");
    });
    return html;
}
function resolveSelectedThreadId(localStorageService, threads) {
    var threadIds = Object.keys(threads);
    if (threadIds.length === 0) {
        return "";
    }
    var storedThreadId = localStorageService.getBunkerImportTargetThreadId;
    if (storedThreadId !== "" && threads[storedThreadId] !== undefined) {
        return storedThreadId;
    }
    return threadIds[0];
}
function buildImportPreviewSectionHtml() {
    return "\n    <div style=\"margin-top: 12px;\">\n      <div style=\"display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px;\">\n        <div style=\"font-weight: bold;\">Import-Vorschau</div>\n        <div style=\"display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end;\">\n          <input class=\"btn\" type=\"button\" value=\"Alle\" data-bunker-import-select=\"all\">\n          <input class=\"btn\" type=\"button\" value=\"Keine\" data-bunker-import-select=\"none\">\n          <input class=\"btn\" type=\"button\" value=\"Unter 5 entfernen\" title=\"Entfernt auch vorhandene Anfrage-Entw\u00FCrfe derselben Koordinaten im gew\u00E4hlten Ziel-Thread\" data-bunker-import-select=\"below-five\">\n        </div>\n      </div>\n      <div id=\"sd-bunker-import-preview-summary\" style=\"font-size: 12px; color: #4d2f00; margin-bottom: 6px;\"></div>\n      <div id=\"sd-bunker-import-preview\" style=\"max-height: 220px; overflow-y: auto; border: 1px solid #c4a36b; background-color: #f8edd0; padding: 6px;\"></div>\n    </div>";
}
function ensurePanel(localStorageService, threads) {
    (0, organizer_style_1.ensureOrganizerStyles)();
    var $panel = $("#".concat(PANEL_ID));
    if ($panel.length > 0) {
        return $panel;
    }
    var availableUnits = getAvailableUnits();
    var splitConfig = localStorageService.getBunkerSplitConfig;
    var unitPowers = localStorageService.getBunkerUnitPowers;
    var selectedThreadId = resolveSelectedThreadId(localStorageService, threads);
    var panelHtml = "<div id=\"".concat(PANEL_ID, "\" class=\"sd-organizer\" style=\"position: fixed; top: 140px; right: 12px; width: 360px; z-index: 9999;\">\n  <div class=\"").concat(PANEL_HANDLE_CLASS, " sd-organizer-handle\" style=\"cursor: move; user-select: none; padding: 8px 10px;  font-weight: bold; border-top-left-radius: 4px; border-top-right-radius: 4px;\">\n    SD Organizer\n  </div>\n  <div style=\"padding: 10px;\">\n    <div style=\"font-weight:bold\">Paketgr\u00F6\u00DFe f\u00FCr den Bunkerimport</div>\n    <div class=\"sd-preset-buttons\">").concat([100, 200].map(function (amount) { return "<input class=\"btn\" type=\"button\" data-preset=\"dual\" data-amount=\"".concat(amount, "\" value=\"").concat(amount, " Dual\">"); }).join(''), "\n    ").concat(game_data.units.includes('archer') ? [100, 200].map(function (amount) { return "<input class=\"btn\" type=\"button\" data-preset=\"trial\" data-amount=\"".concat(amount, "\" value=\"").concat(amount, " Trial\">"); }).join('') : '', "</div>\n    <div id=\"sd-bunker-active-preset\"></div>\n    <p>Berechnet die aktuell sichtbaren Truppen dieser Seite. Filter und weitere Seiten werden nicht automatisch eingelesen.</p>\n    <div style=\"margin-bottom: 10px;\">\n      <div style=\"font-weight: bold; margin-bottom: 4px;\">Ziel-Thread</div>\n      <select id=\"sd-bunker-import-thread-id\" style=\"width:100%; background-color: #e6dcc1; border: 1px solid #7d510f; padding: 5px 8px; box-sizing: border-box;\">\n        ").concat(buildThreadOptionsHtml(threads), "\n      </select>\n      <div id=\"sd-bunker-import-thread-hint\" style=\"font-size: 12px; color: #4d2f00; margin-top: 5px;\"></div>\n    </div>\n    <details><summary>Eigene Paketgr\u00F6\u00DFe</summary>\n      <table style=\"width:100%\"><tbody>").concat(buildUnitSettingsRows(availableUnits, splitConfig, unitPowers).replace(/<td style="padding: 4px 6px;">\s*<input type="number" min="0" step="0.01"[\s\S]*?<\/td>/g, ''), "</tbody></table>\n    </details>\n    <details><summary>Erweiterte Berechnung: Power</summary>\n      <table style=\"width:100%\"><tbody>").concat(buildUnitSettingsRows(availableUnits, splitConfig, unitPowers).replace(/<td style="padding: 4px 6px;">\s*<input type="number" min="0" step="1"[\s\S]*?<\/td>/g, ''), "</tbody></table>\n    </details>\n    <div id=\"sd-bunker-import-split-power\" style=\"font-size: 12px; color: #4d2f00; font-weight: bold;\"></div>\n    ").concat(buildImportPreviewSectionHtml(), "\n  </div>\n</div>");
    $("body").append(panelHtml);
    $panel = $("#".concat(PANEL_ID));
    (0, organizer_dock_1.dockOrganizerPanel)($panel[0], { legacyPosition: localStorageService.getBunkerImportPanelPosition });
    $panel.find("#sd-bunker-import-thread-id").val(selectedThreadId);
    localStorageService.setBunkerImportTargetThreadId = selectedThreadId;
    return $panel;
}
function parseNumericInput(rawValue, fallbackValue) {
    var normalizedValue = Number(String(rawValue !== null && rawValue !== void 0 ? rawValue : "").replace(",", "."));
    if (isNaN(normalizedValue) || !isFinite(normalizedValue) || normalizedValue < 0) {
        return fallbackValue;
    }
    return normalizedValue;
}
function syncSplitPower($panel, localStorageService) {
    var splitPower = (0, bunker_import_settings_2.calculateBunkerSplitPower)(localStorageService.getBunkerSplitConfig, localStorageService.getBunkerUnitPowers, getAvailableUnits());
    var active = (0, bunker_import_settings_1.describeBunkerPreset)(localStorageService.getBunkerSplitConfig, game_data.units.includes('archer'));
    $panel.find('#sd-bunker-active-preset').text("Aktuell: ".concat(active));
    $panel.find('[data-preset]').each(function () {
        $(this).attr('aria-pressed', String("".concat($(this).data('amount'), " ").concat(String($(this).data('preset')).replace(/^./, function (c) { return c.toUpperCase(); })) === active));
    });
    $panel.find("#sd-bunker-import-split-power").text("Power pro Split: ".concat(splitPower.toFixed(2)));
}
function syncThreadHint($panel, threads) {
    var _a;
    var selectedThreadId = String((_a = $panel.find("#sd-bunker-import-thread-id").val()) !== null && _a !== void 0 ? _a : "");
    var $hint = $panel.find("#sd-bunker-import-thread-hint");
    if (selectedThreadId === "" || threads[selectedThreadId] === undefined) {
        $hint.text("Kein bekannter SD-Thread ausgewaehlt.");
        return;
    }
    var targetThread = threads[selectedThreadId];
    $hint.text("Speichert einen Anfrage-Entwurf f\u00FCr: ".concat(targetThread.threadName));
}
function calculateImportedRequests(localStorageService) {
    var unitPowers = localStorageService.getBunkerUnitPowers;
    var splitConfig = localStorageService.getBunkerSplitConfig;
    var splitPower = (0, bunker_import_settings_2.calculateBunkerSplitPower)(splitConfig, unitPowers, getAvailableUnits());
    if (splitPower <= 0) {
        return {
            splitPower: splitPower,
            importedRequests: []
        };
    }
    var villagePowerMap = getVillagePowerMap(unitPowers);
    return {
        splitPower: splitPower,
        importedRequests: buildImportedRequests(villagePowerMap, splitPower)
    };
}
function buildImportPreviewRows(importedRequests, existingRequests) {
    var existingRequestsByCoords = new Map(existingRequests.map(function (request) { return [request.coords, request]; }));
    return importedRequests.map(function (request) {
        var existingRequest = existingRequestsByCoords.get(request.coords);
        var isSelected = isImportRequestSelected(request.coords);
        var statusText = existingRequest
            ? "Ersetzt ".concat(existingRequest.amount, " -> ").concat(request.amount)
            : "Neu ".concat(request.amount);
        return "\n        <tr data-bunker-import-preview-row data-coords=\"".concat(request.coords, "\" data-amount=\"").concat(request.amount, "\" data-is-replacement=\"").concat(existingRequest ? "1" : "0", "\">\n          <td style=\"padding: 4px 6px; vertical-align: top;\">\n            <input type=\"checkbox\" class=\"sd-bunker-import-preview-checkbox\" data-coords=\"").concat(request.coords, "\" ").concat(isSelected ? "checked" : "", ">\n          </td>\n          <td style=\"padding: 4px 6px; vertical-align: top;\">\n            <div style=\"font-weight: bold;\">").concat(request.coords, "</div>\n            <div style=\"font-size: 11px; color: #4d2f00;\">").concat(statusText, "</div>\n          </td>\n        </tr>");
    }).join("");
}
function syncImportPreviewSummary($panel) {
    var $rows = $panel.find(PREVIEW_ROW_SELECTOR);
    var totalCount = $rows.length;
    var selectedCount = 0;
    var selectedNewCount = 0;
    var selectedReplacementCount = 0;
    $rows.each(function () {
        var $row = $(this);
        var isSelected = $row.find(".sd-bunker-import-preview-checkbox").is(":checked");
        if (!isSelected) {
            return;
        }
        selectedCount += 1;
        if (String($row.data("isReplacement")) === "1") {
            selectedReplacementCount += 1;
            return;
        }
        selectedNewCount += 1;
    });
    $panel.find("#sd-bunker-import-preview-summary").text("".concat(totalCount, " Anfragen gefunden, ").concat(selectedCount, " markiert. Markiert: ").concat(selectedNewCount, " neu, ").concat(selectedReplacementCount, " ersetzen."));
}
function renderImportPreview($panel, localStorageService, threads) {
    var _a;
    var calculation = calculateImportedRequests(localStorageService);
    var selectedThreadId = String((_a = $panel.find("#sd-bunker-import-thread-id").val()) !== null && _a !== void 0 ? _a : localStorageService.getBunkerImportTargetThreadId);
    var hasKnownThread = selectedThreadId !== "" && threads[selectedThreadId] !== undefined;
    var $preview = $panel.find("#sd-bunker-import-preview");
    var $summary = $panel.find("#sd-bunker-import-preview-summary");
    if (calculation.splitPower <= 0) {
        $summary.text("Die Split-Berechnung ergibt 0. Bitte Split oder Power anpassen.");
        $preview.html("");
        return;
    }
    if (calculation.importedRequests.length === 0) {
        $summary.text("Keine gueltigen Bunkeranfragen auf der Seite gefunden.");
        $preview.html("");
        return;
    }
    if (!hasKnownThread) {
        $summary.text("".concat(calculation.importedRequests.length, " Anfragen gefunden. Bitte zuerst einen bekannten SD-Thread waehlen."));
        $preview.html("\n        <table style=\"width: 100%; border-collapse: collapse; font-size: 12px;\">\n          <tbody>\n            ".concat(buildImportPreviewRows(calculation.importedRequests, []), "\n          </tbody>\n        </table>"));
        return;
    }
    var existingRequests = localStorageService.getSdInquiry(selectedThreadId);
    $preview.html("\n    <table style=\"width: 100%; border-collapse: collapse; font-size: 12px;\">\n      <tbody>\n        ".concat(buildImportPreviewRows(calculation.importedRequests, existingRequests), "\n      </tbody>\n    </table>"));
    syncImportPreviewSummary($panel);
}
function syncImportButtonState(localStorageService, threads) {
    var _a;
    var $panel = $("#".concat(PANEL_ID));
    var selectedThreadId = String((_a = $panel.find("#sd-bunker-import-thread-id").val()) !== null && _a !== void 0 ? _a : localStorageService.getBunkerImportTargetThreadId);
    var hasKnownThread = selectedThreadId !== "" && threads[selectedThreadId] !== undefined;
    var selectedCount = $panel.find(".sd-bunker-import-preview-checkbox:checked").length;
    var hasPreviewRows = $panel.find(PREVIEW_ROW_SELECTOR).length > 0;
    $("#".concat(BUTTON_ID))
        .prop("disabled", !(hasKnownThread && hasPreviewRows && selectedCount > 0))
        .val(selectedCount > 0 ? "Markierte Bunker uebernehmen (".concat(selectedCount, ")") : "Markierte Bunker uebernehmen");
}
function removePreviewRowsBelowAmount($panel, minimumAmount) {
    var removedCoords = [];
    $panel.find(PREVIEW_ROW_SELECTOR).each(function () {
        var _a, _b;
        var $row = $(this);
        var amount = Number((_a = $row.data("amount")) !== null && _a !== void 0 ? _a : 0);
        if (!isFinite(amount) || amount >= minimumAmount) {
            return;
        }
        var coords = String((_b = $row.data("coords")) !== null && _b !== void 0 ? _b : "");
        setImportRequestSelection(coords, false);
        $row.remove();
        removedCoords.push(coords);
    });
    syncImportPreviewSummary($panel);
    return removedCoords;
}
function removeStoredRequestsByCoords(localStorageService, targetThreadId, coordsToRemove) {
    if (targetThreadId === "" || coordsToRemove.length === 0) {
        return 0;
    }
    var coordsToRemoveSet = new Set(coordsToRemove);
    var existingRequests = localStorageService.getSdInquiry(targetThreadId);
    var filteredRequests = existingRequests.filter(function (request) { return !coordsToRemoveSet.has(request.coords); });
    var removedCount = existingRequests.length - filteredRequests.length;
    if (removedCount > 0) {
        localStorageService.setSdInquiry(targetThreadId, filteredRequests);
    }
    return removedCount;
}
function bindPanelEvents($panel, localStorageService, threads) {
    $panel.off(".bunkerImportSettings");
    $panel.on('click.bunkerImportSettings', '[data-preset]', function () {
        var config = (0, bunker_import_settings_1.buildBunkerPreset)(Number($(this).data('amount')), String($(this).data('preset')) === 'trial');
        localStorageService.setBunkerSplitConfig = config;
        $panel.find('input[data-config=split]').each(function () { $(this).val(config[String($(this).data('unit'))]); });
        syncSplitPower($panel, localStorageService);
        renderImportPreview($panel, localStorageService, threads);
        syncImportButtonState(localStorageService, threads);
    });
    $panel.on("change.bunkerImportSettings", "#sd-bunker-import-thread-id", function () {
        var _a;
        var selectedThreadId = String((_a = $(this).val()) !== null && _a !== void 0 ? _a : "");
        localStorageService.setBunkerImportTargetThreadId = selectedThreadId;
        syncThreadHint($panel, threads);
        renderImportPreview($panel, localStorageService, threads);
        syncImportButtonState(localStorageService, threads);
    });
    $panel.on("change.bunkerImportSettings", "input[data-config='split']", function () {
        var _a, _b, _c;
        var unit = String($(this).data("unit"));
        var nextConfig = __assign({}, localStorageService.getBunkerSplitConfig);
        var amount = parseNumericInput(String((_a = $(this).val()) !== null && _a !== void 0 ? _a : ""), (_b = nextConfig[unit]) !== null && _b !== void 0 ? _b : 0);
        nextConfig[unit] = Number.isSafeInteger(amount) ? amount : ((_c = nextConfig[unit]) !== null && _c !== void 0 ? _c : 0);
        $(this).val(String(nextConfig[unit]));
        localStorageService.setBunkerSplitConfig = nextConfig;
        syncSplitPower($panel, localStorageService);
        renderImportPreview($panel, localStorageService, threads);
        syncImportButtonState(localStorageService, threads);
    });
    $panel.on("change.bunkerImportSettings", "input[data-config='power']", function () {
        var _a, _b;
        var unit = String($(this).data("unit"));
        var nextConfig = __assign({}, localStorageService.getBunkerUnitPowers);
        nextConfig[unit] = parseNumericInput(String((_a = $(this).val()) !== null && _a !== void 0 ? _a : ""), (_b = nextConfig[unit]) !== null && _b !== void 0 ? _b : 0);
        $(this).val(String(nextConfig[unit]));
        localStorageService.setBunkerUnitPowers = nextConfig;
        syncSplitPower($panel, localStorageService);
        renderImportPreview($panel, localStorageService, threads);
        syncImportButtonState(localStorageService, threads);
    });
    $panel.on("change.bunkerImportSettings", ".sd-bunker-import-preview-checkbox", function () {
        var _a;
        var coords = String((_a = $(this).data("coords")) !== null && _a !== void 0 ? _a : "");
        setImportRequestSelection(coords, $(this).is(":checked"));
        syncImportPreviewSummary($panel);
        syncImportButtonState(localStorageService, threads);
    });
    $panel.on("click.bunkerImportSettings", "[data-bunker-import-select]", function () {
        var _a, _b;
        var action = String((_a = $(this).data("bunkerImportSelect")) !== null && _a !== void 0 ? _a : "");
        if (action === "below-five") {
            var targetThreadId = String((_b = $panel.find("#sd-bunker-import-thread-id").val()) !== null && _b !== void 0 ? _b : localStorageService.getBunkerImportTargetThreadId);
            var removedCoords = removePreviewRowsBelowAmount($panel, 5);
            var removedCount = removedCoords.length;
            var removedStoredCount = removeStoredRequestsByCoords(localStorageService, targetThreadId, removedCoords);
            syncImportButtonState(localStorageService, threads);
            if (removedCount > 0) {
                UI.SuccessMessage("".concat(removedCount, " Bunkeranfragen unter 5 entfernt, ").concat(removedStoredCount, " im Ziel-Thread aktualisiert."), 3000);
                return;
            }
            UI.SuccessMessage("Keine Bunkeranfragen unter 5 gefunden.", 3000);
            return;
        }
        var nextSelectionState = action === "all";
        $panel.find(".sd-bunker-import-preview-checkbox").each(function () {
            var _a;
            var coords = String((_a = $(this).data("coords")) !== null && _a !== void 0 ? _a : "");
            $(this).prop("checked", nextSelectionState);
            setImportRequestSelection(coords, nextSelectionState);
        });
        syncImportPreviewSummary($panel);
        syncImportButtonState(localStorageService, threads);
    });
    syncThreadHint($panel, threads);
    syncSplitPower($panel, localStorageService);
    renderImportPreview($panel, localStorageService, threads);
    syncImportButtonState(localStorageService, threads);
}
function getCoordsFromVillageName(name) {
    var coordsMatch = name.match(/\d+\|\d+/);
    return coordsMatch ? coordsMatch[0] : "";
}
function parseDisplayedUnitCount(rawText) {
    var digitsOnly = rawText.replace(/[^\d]/g, "");
    if (digitsOnly === "") {
        return 0;
    }
    var parsed = parseInt(digitsOnly, 10);
    return isNaN(parsed) ? 0 : parsed;
}
function getVillagePowerMap(unitPowers) {
    var troopLocationAndPower = {};
    var unitsAwayTable = $("#units_table").find("tr[class^='row_']");
    $(unitsAwayTable).each(function (_, rowElement) {
        var coords = getCoordsFromVillageName($(rowElement).find("a").first().text());
        if (coords === "") {
            return;
        }
        if (troopLocationAndPower[coords] === undefined) {
            troopLocationAndPower[coords] = 0;
        }
        var unitCollection = $(rowElement).find("td.unit-item");
        var unitPowerSum = 0;
        unitCollection.each(function (index, cellElement) {
            var _a;
            var unit = game_data.units[index];
            if (!unit) {
                return;
            }
            var unitCount = parseDisplayedUnitCount($(cellElement).text());
            var configuredPower = Number((_a = unitPowers[unit]) !== null && _a !== void 0 ? _a : 0);
            if (!isNaN(configuredPower) && configuredPower > 0) {
                unitPowerSum += unitCount * configuredPower;
            }
        });
        troopLocationAndPower[coords] += unitPowerSum;
    });
    return troopLocationAndPower;
}
function buildImportedRequests(villagePowerMap, splitPower) {
    return Object.entries(villagePowerMap)
        .map(function (_a) {
        var _b = __read(_a, 2), coords = _b[0], totalPower = _b[1];
        return ({
            coords: coords,
            amount: Math.ceil(totalPower / splitPower),
            playerName: undefined,
            comment: undefined,
            dateFrom: undefined,
            dateUntil: undefined
        });
    })
        .filter(function (request) { return request.coords !== "" && request.amount > 0; });
}
function mergeImportedRequests(existingRequests, importedRequests) {
    var mergedRequests = __spreadArray([], __read(existingRequests), false);
    importedRequests.forEach(function (importedRequest) {
        var existingIndex = mergedRequests.findIndex(function (request) { return request.coords === importedRequest.coords; });
        if (existingIndex === -1) {
            mergedRequests.push(importedRequest);
            return;
        }
        mergedRequests[existingIndex] = __assign(__assign({}, mergedRequests[existingIndex]), { amount: importedRequest.amount });
    });
    return mergedRequests;
}
function bindImportButton(localStorageService, threads) {
    $("#".concat(BUTTON_ID)).off("click").on("click", function () {
        var targetThreadId = localStorageService.getBunkerImportTargetThreadId;
        if (targetThreadId === "" || threads[targetThreadId] === undefined) {
            UI.ErrorMessage("Bitte zuerst einen bekannten SD-Thread waehlen.", 4000);
            return;
        }
        var calculation = calculateImportedRequests(localStorageService);
        if (calculation.splitPower <= 0) {
            UI.ErrorMessage("Die Split-Berechnung ergibt 0. Bitte Split oder Power anpassen.", 5000);
            return;
        }
        if (calculation.importedRequests.length === 0) {
            UI.ErrorMessage("Keine gueltigen Bunkeranfragen auf der Seite gefunden.", 4000);
            return;
        }
        var selectedImportedRequests = calculation.importedRequests.filter(function (request) { return isImportRequestSelected(request.coords); });
        if (selectedImportedRequests.length === 0) {
            UI.ErrorMessage("Bitte mindestens eine Bunkeranfrage markieren.", 4000);
            return;
        }
        var existingRequests = localStorageService.getSdInquiry(targetThreadId);
        var mergedRequests = mergeImportedRequests(existingRequests, selectedImportedRequests);
        localStorageService.setSdInquiry(targetThreadId, mergedRequests);
        var $panel = $("#".concat(PANEL_ID));
        renderImportPreview($panel, localStorageService, threads);
        syncImportButtonState(localStorageService, threads);
        UI.SuccessMessage("".concat(selectedImportedRequests.length, " markierte Bunkeranfragen fuer \"").concat(threads[targetThreadId].threadName, "\" uebernommen."), 4000);
        log.info("Imported bunker requests from away-detail page", {
            targetThreadId: targetThreadId,
            importedCount: calculation.importedRequests.length,
            selectedImportedCount: selectedImportedRequests.length,
            totalStoredCount: mergedRequests.length
        });
    });
}
function displayAwayDetail(pageContext) {
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    var threads = localStorageService.getAllThreads;
    log.info("Initializing away-detail controller", {
        href: pageContext.href,
        knownThreadCount: Object.keys(threads).length
    });
    var buttonHtml = "<input class=\"btn\" type=\"button\" value=\"Markierte Bunker uebernehmen\" id=\"".concat(BUTTON_ID, "\" style=\"margin-bottom: 10px;\">");
    if ($("#".concat(BUTTON_ID)).length === 0) {
        // The primary action belongs to the organizer panel.
    }
    var $panel = ensurePanel(localStorageService, threads);
    if (!$panel.find("#".concat(BUTTON_ID)).length)
        $panel.children().last().append(buttonHtml);
    bindPanelEvents($panel, localStorageService, threads);
    bindImportButton(localStorageService, threads);
    syncImportButtonState(localStorageService, threads);
}
exports.displayAwayDetail = displayAwayDetail;


/***/ }),

/***/ 659:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.editSdPost = void 0;
var local_storage_helper_1 = __webpack_require__(326);
var table_domain_1 = __webpack_require__(219);
var logging_helper_1 = __webpack_require__(56);
var game_url_helper_1 = __webpack_require__(579);
var log = logging_helper_1.Log.scope("edit-sd-post");
function editSdPost(currentThreadId, updateData) {
    log.info("Initializing SD post edit mode", { currentThreadId: currentThreadId });
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    var sdPostId = localStorageService.getSdPostId(currentThreadId);
    var updateBtn = "<a class=\"updateSDTabelle\" style=\"cursor: pointer\">Update SD Tabelle</a>";
    $("a[name='" + sdPostId + "']").parent().find(".postheader_right").append(updateBtn);
    $(".updateSDTabelle").on("click", function () {
        updateSdTable(updateData);
    });
}
exports.editSdPost = editSdPost;
function updateSdTable(updateData) {
    var tablePattern = /\[table]([\s\S]*)\[\/table]/;
    var cachePattern = /\[spoiler=postCache]([\s\S]*?)\[\/spoiler]/;
    var rawSdPostText = String($("#message").val());
    var table = rawSdPostText.match(tablePattern);
    var cache = rawSdPostText.match(cachePattern);
    if (table === null || cache === null) {
        log.error("Table or Cache not found");
        return;
    }
    var currentSdState = (0, table_domain_1.parseEditSdTableData)(table[1], cache[0]);
    var newSdState = (0, table_domain_1.calculateSdTableState)(updateData, currentSdState);
    var _a = __read((0, table_domain_1.parseSdStateToTableString)(newSdState, game_url_helper_1.buildMassUtCallUrl), 2), tableText = _a[0], cacheText = _a[1];
    var updatedSdPostText = rawSdPostText.replace(tablePattern, "[table]\n    [**]ID[||]Dorfkoordinaten[||]Angefordert[||][color=#8d0100]Noch benoetigt[/color] [||]Spieler[||]Bemerkung[||]Ab[||]Bis[||][color=#001c83]Massen UT-Link[/color][/**]".concat(tableText, "[/table]"));
    updatedSdPostText = updatedSdPostText.replace(cachePattern, "".concat(cacheText));
    log.info("Updated SD post text in textarea", {
        newLength: updatedSdPostText.length
    });
    $("#message").val(updatedSdPostText);
}


/***/ }),

/***/ 585:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addForumQuickSettings = void 0;
var organizer_style_1 = __webpack_require__(409);
var local_storage_helper_1 = __webpack_require__(326);
var logging_helper_1 = __webpack_require__(56);
var table_helper_1 = __webpack_require__(283);
var organizer_dock_1 = __webpack_require__(617);
var sd_settings_controls_1 = __webpack_require__(486);
var game_catalog_1 = __webpack_require__(444);
var PANEL_ID = "sd-forum-quick-settings";
var RESET_NAMESPACE = ".forumQuickReset";
var log = logging_helper_1.Log.scope("forum-quick-settings");
function addForumQuickSettings(currentThreadId) {
    (0, organizer_style_1.ensureOrganizerStyles)();
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    var $panel = $("#".concat(PANEL_ID));
    if ($panel.length === 0) {
        var panelHtml = "<div id=\"".concat(PANEL_ID, "\" class=\"sd-organizer\" style=\"position: fixed; top: 140px; right: 12px; width: 245px; z-index: 9999;\">\n  <div class=\"sd-forum-quick-settings-handle sd-organizer-handle\" style=\"cursor: move; user-select: none; padding: 8px 10px;  font-weight: bold; border-top-left-radius: 4px; border-top-right-radius: 4px;\">\n    SD Organizer\n  </div>\n  <div class=\"sd-organizer-body\" style=\"padding: 10px;\">\n    <div style=\"margin-bottom: 10px;\">\n      <div style=\"font-weight: bold; margin-bottom: 4px;\">Massen-UT automatisch vorbereiten</div>\n      <input class=\"btn btn-confirm-no\" type=\"button\" value=\"Aus\" id=\"automate-massen-ut\" style=\"width:100%; background-color: #8d0100; color: #ffffff\">\n    </div>\n    <div style=\"margin-bottom: 10px;\">\n      <div style=\"font-weight: bold; margin-bottom: 4px;\">Doppeltes Schicken</div>\n      <input class=\"btn btn-confirm-no\" type=\"button\" value=\"Aus\" id=\"prevent-duplicate-destination\" style=\"width:100%; background-color: #8d0100; color: #ffffff\">\n    </div>\n    <div style=\"margin-bottom: 10px;\">\n      <div style=\"font-weight: bold; margin-bottom: 4px;\">sortieren nach</div>\n      <select id=\"sd-sort-by\" style=\"width:100%; background-color: #fff8e8; color: #3b2713; border: 1px solid #b59766; padding: 5px 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\"></select>\n    </div>\n    <div style=\"margin-bottom: 10px;\">\n      <div style=\"font-weight: bold; margin-bottom: 4px;\">SD Gruppe</div>\n      <input type=\"number\" value=\"0\" id=\"sd-group-id\" style=\"width:100%; background-color: #fff8e8; color: #3b2713; border: 1px solid #b59766; padding: 5px 10px; border-radius: 4px; box-sizing: border-box;\">\n    </div>\n    <div>\n      <div style=\"font-weight: bold; margin-bottom: 4px;\">SD Vorlage</div>\n      <input type=\"number\" value=\"0\" id=\"sd-template-id\" style=\"width:100%; background-color: #fff8e8; color: #3b2713; border: 1px solid #b59766; padding: 5px 10px; border-radius: 4px; box-sizing: border-box;\">\n    </div>\n    <div style=\"margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(125, 81, 15, 0.35);\">\n      <div class=\"sd-forum-quick-settings-reset-status\" style=\"font-size: 12px; margin-bottom: 6px; color: #4d2f00; font-weight: bold;\"></div>\n      <input class=\"btn\" type=\"button\" value=\"Zur&#252;cksetzen\" id=\"reset-thread-packages\" style=\"width:100%;\">\n    </div>\n  </div>\n</div>");
        $("body").append(panelHtml);
        $panel = $("#".concat(PANEL_ID));
        initializeForumQuickSettingsControls($panel, localStorageService, currentThreadId);
        (0, organizer_dock_1.dockOrganizerPanel)($panel[0], { legacyPosition: localStorageService.getForumQuickSettingsPosition });
        log.info("Injected forum quick settings panel");
    }
    syncResetButtonState($panel, localStorageService, currentThreadId);
    bindResetButton($panel, localStorageService, currentThreadId);
    if (currentThreadId) {
        $(document).off('sd-catalog-updated.sdForumSettings').on('sd-catalog-updated.sdForumSettings', function () {
            initializeForumQuickSettingsControls($panel, localStorageService, currentThreadId);
            (0, table_helper_1.applySettingsToMassUtLink)(currentThreadId);
        });
        void (0, game_catalog_1.refreshGameCatalogs)();
    }
}
exports.addForumQuickSettings = addForumQuickSettings;
function syncResetButtonState($panel, localStorageService, currentThreadId) {
    var $resetButton = $panel.find("#reset-thread-packages");
    var $statusText = $panel.find(".sd-forum-quick-settings-reset-status");
    var $caption = $statusText.find('.sd-reset-caption');
    if (!$caption.length)
        $caption = $('<span class="sd-reset-caption">').prependTo($statusText);
    $caption.text("Geschickte Pakete");
    if (!currentThreadId) {
        $resetButton.prop("disabled", true).css("opacity", "0.5").data("thread-id", "");
        return;
    }
    $resetButton.prop("disabled", false).css("opacity", "1").data("thread-id", currentThreadId);
}
function bindResetButton($panel, localStorageService, currentThreadId) {
    $panel.off("click".concat(RESET_NAMESPACE), "#reset-thread-packages");
    $panel.on("click".concat(RESET_NAMESPACE), "#reset-thread-packages", function () {
        var _a;
        var threadId = currentThreadId !== null && currentThreadId !== void 0 ? currentThreadId : String((_a = $(this).data("thread-id")) !== null && _a !== void 0 ? _a : "");
        if (threadId === "") {
            return;
        }
        localStorageService.resetPackagesSent(threadId);
        (0, table_helper_1.updateSentPackagesInSdTable)(threadId);
        syncResetButtonState($panel, localStorageService, threadId);
        log.info("Reset sent packages from forum quick settings", { threadId: threadId });
    });
}
function initializeForumQuickSettingsControls($panel, localStorageService, currentThreadId) {
    (0, sd_settings_controls_1.initializeSdSettingsControls)($panel, localStorageService, log, {
        selectStyle: "width:100%; background-color: #fff8e8; color: #3b2713; border: 1px solid #b59766; padding: 5px 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); box-sizing: border-box;",
        onSettingsChange: currentThreadId ? function () { return (0, table_helper_1.applySettingsToMassUtLink)(currentThreadId); } : undefined
    });
}


/***/ }),

/***/ 280:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addHoverHelp = exports.closeHoverHelp = void 0;
var organizer_style_1 = __webpack_require__(409);
var sequence = 0;
var active;
function closeHoverHelp() {
    active === null || active === void 0 ? void 0 : active.removeAttribute('aria-describedby');
    active = undefined;
    $('#sd-hover-help').remove();
}
exports.closeHoverHelp = closeHoverHelp;
/** A shared viewport-bound tooltip, also available by keyboard focus. */
function addHoverHelp($host, title, text, id) {
    (0, organizer_style_1.ensureOrganizerStyles)();
    var tooltipId = 'sd-hover-help';
    var $button = $('<button type="button" class="sd-help-icon">?</button>')
        .attr({ id: id !== null && id !== void 0 ? id : "sd-help-".concat(++sequence), title: '', 'aria-label': "Hilfe: ".concat(title) }).appendTo($host);
    var show = function () {
        var e_1, _a;
        closeHoverHelp();
        active = $button[0];
        $button.attr('aria-describedby', tooltipId);
        var $tip = $('<div id="sd-hover-help" class="sd-hover-help" role="tooltip">')
            .append($('<strong>').text(title)).appendTo('body');
        if (typeof text === 'string')
            $tip.append($('<p>').text(text));
        else {
            $tip.addClass('sd-hover-help-all');
            var $sections = $('<div class="sd-help-sections">').appendTo($tip);
            try {
                for (var text_1 = __values(text), text_1_1 = text_1.next(); !text_1_1.done; text_1_1 = text_1.next()) {
                    var section = text_1_1.value;
                    $sections.append($('<section>').append($('<strong>').text(section.title), $('<p>').text(section.text)));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (text_1_1 && !text_1_1.done && (_a = text_1.return)) _a.call(text_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        var anchor = $button[0].getBoundingClientRect();
        var rect = $tip[0].getBoundingClientRect();
        var left = Math.max(8, Math.min(anchor.right - rect.width, window.innerWidth - rect.width - 8));
        var top = anchor.bottom + 8 + rect.height <= window.innerHeight - 8 ? anchor.bottom + 8 : Math.max(8, anchor.top - rect.height - 8);
        var panel = $button.closest('.sd-dock')[0];
        if (panel) {
            var dock = panel.getBoundingClientRect();
            var beside = panel.classList.contains('sd-dock-right') ? dock.left - rect.width - 8 : dock.right + 8;
            if (beside >= 8 && beside + rect.width <= window.innerWidth - 8) {
                left = beside;
                top = Math.max(8, Math.min(anchor.top, window.innerHeight - rect.height - 8));
            }
        }
        $tip.css({ left: left, top: top });
    };
    $button.on('mouseenter focus', show).on('mouseleave blur', closeHoverHelp)
        .on('click', function (event) { return event.preventDefault(); });
    $(document).off('keydown.sdHoverHelp').on('keydown.sdHoverHelp', function (event) { if (event.key === 'Escape')
        closeHoverHelp(); });
    $(window).off('resize.sdHoverHelp scroll.sdHoverHelp').on('resize.sdHoverHelp scroll.sdHoverHelp', closeHoverHelp);
    return $button;
}
exports.addHoverHelp = addHoverHelp;


/***/ }),

/***/ 271:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeOnboarding = exports.getOnboardingSteps = void 0;
var tw_helper_1 = __webpack_require__(246);
var organizer_style_1 = __webpack_require__(409);
var setup_onboarding_1 = __webpack_require__(903);
var hover_help_1 = __webpack_require__(280);
var settings_help_1 = __webpack_require__(179);
function getOnboardingSteps(context, mod) {
    if (context.context === 'forum-new_thread' && mod)
        return [
            { target: '.sd-package-row', title: 'Pakete definieren', text: 'Eine Menge in Speer, Schwert oder Bogen skaliert diese Paketzeile. Späher sind 5 %. Ein Klick leert ein befülltes Feld. Weitere Pakete sind unabhängig.' },
            { target: '#setupTable', title: 'SD-Tabelle vorbereiten', text: '„SD Tabelle generieren“ füllt den Forenbeitrag aus und schlägt bei leerem Titel „SD Tabelle“ vor. Ein Klick ins Titelfeld entfernt diesen Vorschlag; eigene Titel bleiben erhalten. Prüfe Titel und Text und sende den Thread im Spiel ab.' },
            { target: 'input[name=subject]', title: 'Thread erstellen und zuordnen', text: 'Nach erfolgreichem Erstellen erkennt der Organizer deinen SD-Thread und speichert die Zuordnung. Bestehende Tabellen ordnest du im jeweiligen Thread über „Als SD-Tabelle festlegen“ im SD Organizer zu.' }
        ];
    if (context.context === 'overview-away_detail')
        return [
            { target: '.sd-preset-buttons', title: 'Paketgröße wählen', text: '100 oder 200 Dual enthält Speer und Schwert. Auf Bogenwelten enthält Trial zusätzlich Bogen. Eigene Paketgrößen und Power sind separat einklappbar.' },
            { target: '#sd-bunker-import-thread-id', title: 'Ziel-Thread wählen', text: 'Der Ziel-Thread muss vorher als SD-Tabelle gespeichert sein. Berechnet werden nur die hier sichtbaren Truppen; prüfe Filter und weitere Seiten.' },
            { target: '#sd-bunker-import-preview', title: 'Vorschau prüfen', text: 'Markiere die gewünschten Koordinaten. „Unter 5 entfernen“ entfernt auch vorhandene Anfrage-Entwürfe derselben Koordinaten im Ziel-Thread.' },
            { target: '#sd-import-bunker-requests', title: 'Entwurf übernehmen', text: 'Übernehmen speichert einen Anfrage-Entwurf. Öffne anschließend den Ziel-Thread, klicke „Bunker anfragen“, ergänze Angaben und fülle den Beitrag ein. Erst Senden im Spiel veröffentlicht die Anfrage.' }
        ];
    if (context.context === 'place')
        return [
            { target: 'select[name=template]', title: 'Gruppe und Vorlage einrichten', text: 'Gruppen und Vorlagen werden direkt auf ihren Spielseiten erkannt und in den Einstellungen aktualisiert. Wähle dort deine SD-Gruppe und SD-Vorlage und aktiviere „Massen-UT automatisch vorbereiten“.' },
            { target: '.troop-request-selector', title: 'Auswahl prüfen', text: 'Öffne die Massen-UT über den Link der gewünschten SD-Anfrage. Prüfe Vorlage, verfügbare Truppen und Zeitfenster. Der Doppelversandschutz berücksichtigt bereits bearbeitete Anfragen.' },
            { target: '.evt-button-fill', title: 'Übernehmen und senden', text: '„Übernehmen“ füllt die Spielauswahl. Prüfe die tatsächlich einzutragenden Einheiten und sende anschließend selbst. Bei unklarer Rückmeldung bleibt ein offener Versand sichtbar; bestätige nur die wirklich verschickten Pakete.' },
            { target: '#sd-repeat-send-button', title: 'Bearbeitung melden', text: 'Nach erfolgreichem Versand zurück zur SD-Tabelle: „Antworten“ → „Bearbeitung eintragen“ → Beitrag prüfen → Senden. Die Meldung aktualisiert den Bedarf für alle Nutzer.' }
        ];
    if (context.context === 'forum-view_thread')
        return __spreadArray([
            { target: '#sd-register-thread', title: 'SD-Tabelle festlegen', text: 'Öffne den Beitrag mit der SD-Tabelle und klicke im SD Organizer auf „Als SD-Tabelle festlegen“. Danach sind die Tabellen- und Versandfunktionen für diesen Thread verfügbar. „SD-Tabelle festgelegt“ zeigt eine bereits gespeicherte Zuordnung. Neu erstellte SD-Threads werden automatisch zugeordnet.' },
            { target: '#requestBunker', title: 'Bunker anfragen', text: 'Öffne „Antworten“, dann „Bunker anfragen“. Füge Koordinaten und Paketmengen ein. Spieler, Bemerkung und Zeitfenster sind optional. „Bunker anfragen“ füllt den Beitrag; erst Senden veröffentlicht ihn.' },
            { target: '#sd-forum-quick-settings', title: 'Massen-UT vorbereiten', text: 'Wähle hier Gruppe und Vorlage und aktiviere die Vorbereitung. Die Listen werden direkt aus der Gruppenverwaltung und den Truppen-Vorlagen aktualisiert. Folge dann dem Link der gewünschten Anfrage in der Tabelle.' },
            { target: '#addBearbeitung', title: 'Versand eintragen', text: '„Bearbeitung eintragen“ füllt deine gespeicherten Versandmeldungen ein. Prüfe und sende den Beitrag. Entwürfe werden erst bei bestätigtem Erfolg entfernt.' }
        ], __read((mod ? [{ target: '.bbcodetable', title: 'SD-Tabelle pflegen', text: 'Als Foren-Mod kannst du den SD-Post bearbeiten und neue Anfragen und Versandmeldungen in die Tabelle übernehmen. Prüfe die berechnete Tabelle vor dem Speichern; Post-Cache und stabile IDs erhalten die Zuordnung.' }] : [])), false);
    return [{ target: '#sd-settings-root', title: 'SD Organizer einrichten', text: 'Ordne einen Foren-Thread als SD-Tabelle zu. Wähle hier deine SD-Gruppe und SD-Vorlage aus den direkt aktualisierten Listen. Die geführte Einrichtung startest du im Forum neben „Neuer Thread“ und „Neue Umfrage“.' }];
}
exports.getOnboardingSteps = getOnboardingSteps;
function initializeOnboarding(context) {
    (0, setup_onboarding_1.initializeSetupOnboarding)(context);
    if (!['place', 'overview-away_detail', 'forum-view_thread', 'forum-new_thread', 'settings'].includes(context.context))
        return;
    (0, organizer_style_1.ensureOrganizerStyles)();
    (0, hover_help_1.closeHoverHelp)();
    $('#sd-onboarding-launcher,#sd-onboarding-card,.sd-context-help-host,.sd-context-help').remove();
    $('.sd-tour-target').removeClass('sd-tour-target');
    var mod = context.screen === 'forum' && (0, tw_helper_1.isUserForumMod)();
    var steps = getOnboardingSteps(context, mod);
    var $root = $('#sd-forum-quick-settings .sd-organizer-body,#sd-bunker-import-panel > div:last,#sd-settings-root').first();
    var $header = $root.is('table') ? $root.find('th').first() : $root.closest('.sd-organizer').find('.sd-organizer-handle').first();
    var $host = $header.length ? $header : $('#content_value h2,#content_value h3').first();
    if ($header.length && !$root.is('table'))
        $header.addClass('sd-help-header');
    var introduction = context.context === 'settings'
        ? 'Änderungen werden sofort gespeichert. Grüne Zeilen mit Häkchen zeigen gültige Werte oder aktive Schutzfunktionen. Die geführte Einrichtung startest du im Forum neben „Neuer Thread“ und „Neue Umfrage“.'
        : 'Die geführte Einrichtung startest du im Forum neben „Neuer Thread“ und „Neue Umfrage“.';
    var sections = __spreadArray([{ title: 'Einrichtung und Einstellungen', text: introduction }], __read((0, settings_help_1.getSettingsHelp)($root)), false);
    if (context.context !== 'settings')
        sections.push.apply(sections, __spreadArray([], __read(steps.filter(function (step) { return step.target !== '#sd-forum-quick-settings'; })), false));
    (0, hover_help_1.addHoverHelp)($host, 'SD Organizer – Hilfe', sections, 'sd-onboarding-launcher');
}
exports.initializeOnboarding = initializeOnboarding;


/***/ }),

/***/ 625:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addSdOptions = void 0;
var thread_registration_1 = __webpack_require__(452);
function addSdOptions(currentThreadId, forumId, onRegistered, registered) {
    if (registered === void 0) { registered = false; }
    var $controls = $("#sd-thread-registration");
    if (!$controls.length) {
        $controls = $('<div id="sd-thread-registration" style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #b59766">');
        $('<input type="button" class="btn" id="sd-register-thread" aria-describedby="sd-thread-registration-status" style="width:100%">').appendTo($controls);
        $('<div id="sd-thread-registration-status" role="status" style="margin-top:6px;font-size:12px">').appendTo($controls);
        $('#sd-forum-quick-settings .sd-organizer-body').prepend($controls);
    }
    var update = function (saved) {
        $controls.find('#sd-register-thread').prop('disabled', saved).val(saved ? 'SD-Tabelle festgelegt' : 'Als SD-Tabelle festlegen');
        $controls.find('#sd-thread-registration-status').text(saved ? 'Dieser Thread ist als SD-Tabelle zugeordnet.' : 'Öffne den Tabellenbeitrag und lege diesen Thread als SD-Tabelle fest.');
    };
    update(registered);
    $controls.find('#sd-register-thread').off('click.sdThreadRegistration').on('click.sdThreadRegistration', function () {
        if ((0, thread_registration_1.registerSdThread)(currentThreadId, forumId)) {
            update(true);
            onRegistered === null || onRegistered === void 0 ? void 0 : onRegistered();
        }
    });
}
exports.addSdOptions = addSdOptions;


/***/ }),

/***/ 644:
/***/ (function(__unused_webpack_module, exports) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.arrangeDock = exports.dockHeightLimits = exports.balanceDockSides = exports.DOCK_GAP = exports.DOCK_MARGIN = void 0;
exports.DOCK_MARGIN = 0;
exports.DOCK_GAP = 8;
// Keep the incoming/dragged panel at its chosen edge and move as few other panels
// as possible. The small number of registered windows keeps this search bounded.
function balanceDockSides(items, availableHeight, preferredIndex) {
    if (preferredIndex === void 0) { preferredIndex = -1; }
    var capacity = Math.max(0, availableHeight);
    var score = function (sides) {
        var height = function (side) {
            var group = items.filter(function (_, i) { return sides[i] === side; });
            return group.reduce(function (sum, item) { return sum + item.height; }, 0) + Math.max(0, group.length - 1) * exports.DOCK_GAP;
        };
        var moves = 0;
        var movedHeight = 0;
        sides.forEach(function (side, i) { if (side !== items[i].side) {
            moves++;
            movedHeight += items[i].height;
        } });
        return [Math.max(0, height('left') - capacity) + Math.max(0, height('right') - capacity), moves, movedHeight];
    };
    var best = items.map(function (item) { return item.side; });
    var bestScore = score(best);
    if (!bestScore[0])
        return best;
    var candidate = [];
    var search = function (index) {
        if (index === items.length) {
            var candidateScore = score(candidate);
            var firstDifference = candidateScore.findIndex(function (value, i) { return value !== bestScore[i]; });
            if (firstDifference >= 0 && candidateScore[firstDifference] < bestScore[firstDifference]) {
                best = candidate.slice();
                bestScore = candidateScore;
            }
            return;
        }
        candidate[index] = items[index].side;
        search(index + 1);
        if (index !== preferredIndex) {
            candidate[index] = items[index].side === 'left' ? 'right' : 'left';
            search(index + 1);
        }
    };
    search(0);
    return best;
}
exports.balanceDockSides = balanceDockSides;
// Small panels keep their natural height; larger panels share only the remaining space.
function dockHeightLimits(heights, availableHeight) {
    var ordered = heights.map(function (height, index) { return ({ height: Math.max(0, height), index: index }); }).sort(function (a, b) { return a.height - b.height; });
    var limits = [];
    var remaining = Math.max(0, availableHeight);
    ordered.forEach(function (item, i) {
        var limit = Math.min(item.height, remaining / (ordered.length - i));
        limits[item.index] = limit;
        remaining -= limit;
    });
    return limits;
}
exports.dockHeightLimits = dockHeightLimits;
// Heights must fit below the fixed game header; the controller caps them before layout.
function arrangeDock(items, viewportHeight, topInset, bottomInset) {
    if (topInset === void 0) { topInset = 0; }
    if (bottomInset === void 0) { bottomInset = 0; }
    var ordered = items.map(function (item, index) { return (__assign(__assign({}, item), { index: index })); })
        .sort(function (a, b) { return a.top - b.top || a.index - b.index; });
    var tops = [];
    ordered.forEach(function (item, i) {
        tops[i] = Math.max(topInset, item.top, i ? tops[i - 1] + ordered[i - 1].height + exports.DOCK_GAP : topInset);
    });
    for (var i = ordered.length - 1; i >= 0; i--) {
        var bottom = i === ordered.length - 1 ? viewportHeight - bottomInset : tops[i + 1] - exports.DOCK_GAP;
        tops[i] = Math.min(tops[i], bottom - ordered[i].height);
    }
    var result = [];
    ordered.forEach(function (item, i) { result[item.index] = tops[i]; });
    return result;
}
exports.arrangeDock = arrangeDock;


/***/ }),

/***/ 617:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dockOrganizerPanel = exports.layoutOrganizerDocks = void 0;
var local_storage_helper_1 = __webpack_require__(326);
var organizer_dock_layout_1 = __webpack_require__(644);
var HEADER_HEIGHT = 48;
var panels = new Map();
var observingDocument = null;
function prune() {
    panels.forEach(function (panel, id) { if (!panel.element.isConnected) {
        panel.dispose();
        panels.delete(id);
    } });
}
function savePositions() {
    var storage = local_storage_helper_1.LocalStorageHelper.getInstance();
    var saved = storage.getOrganizerDockPositions;
    panels.forEach(function (panel) {
        var previous = saved[panel.element.id];
        if ((previous === null || previous === void 0 ? void 0 : previous.side) !== panel.position.side || (previous === null || previous === void 0 ? void 0 : previous.top) !== panel.position.top)
            storage.setOrganizerDockPosition(panel.element.id, __assign({}, panel.position));
    });
}
function layoutOrganizerDocks(preferred) {
    prune();
    var visible = __spreadArray([], __read(panels.values()), false).filter(function (p) { return !p.element.hidden; });
    if (!visible.length)
        return;
    var naturalHeight = function (p) { return Math.max(p.element.scrollHeight + p.element.offsetHeight - p.element.clientHeight, p.element.getBoundingClientRect().height); };
    var width = function (p) { return p.element.getBoundingClientRect().width; };
    var wide = window.innerWidth >= Math.max.apply(Math, __spreadArray([], __read(visible.map(width)), false)) * 2 + organizer_dock_layout_1.DOCK_GAP;
    var sideChanged = false;
    if (wide) {
        var sides_1 = (0, organizer_dock_layout_1.balanceDockSides)(visible.map(function (p) { return ({ side: p.position.side, height: naturalHeight(p) }); }), window.innerHeight - HEADER_HEIGHT - 8, visible.findIndex(function (p) { return p.element === preferred; }));
        visible.forEach(function (p, i) { if (p.position.side !== sides_1[i])
            sideChanged = true; p.position.side = sides_1[i]; });
    }
    var groups = wide ? ['left', 'right'].map(function (side) { return visible.filter(function (p) { return p.position.side === side; }); }) : [visible];
    groups.forEach(function (group) {
        var limits = (0, organizer_dock_layout_1.dockHeightLimits)(group.map(naturalHeight), window.innerHeight - HEADER_HEIGHT - 8 - organizer_dock_layout_1.DOCK_GAP * (group.length - 1));
        group.forEach(function (p, i) {
            p.element.style.maxHeight = "".concat(limits[i], "px");
            p.element.style.left = p.position.side === 'left' ? '0px' : 'auto';
            p.element.style.right = p.position.side === 'right' ? '0px' : 'auto';
            p.element.style.bottom = 'auto';
            p.element.classList.toggle('sd-dock-left', p.position.side === 'left');
            p.element.classList.toggle('sd-dock-right', p.position.side === 'right');
        });
        var tops = (0, organizer_dock_layout_1.arrangeDock)(group.map(function (p) { return ({ top: p.position.top, height: p.element.getBoundingClientRect().height }); }), window.innerHeight, HEADER_HEIGHT, 8);
        group.forEach(function (p, i) { p.position.top = tops[i]; p.element.style.top = "".concat(tops[i], "px"); });
    });
    if (sideChanged)
        savePositions();
}
exports.layoutOrganizerDocks = layoutOrganizerDocks;
function dockOrganizerPanel(element, options) {
    var _a, _b, _c, _d;
    if (options === void 0) { options = {}; }
    prune();
    var current = panels.get(element.id);
    if ((current === null || current === void 0 ? void 0 : current.element) === element) {
        layoutOrganizerDocks(element);
        return;
    }
    current === null || current === void 0 ? void 0 : current.dispose();
    panels.delete(element.id);
    var storage = local_storage_helper_1.LocalStorageHelper.getInstance();
    var saved = storage.getOrganizerDockPositions[element.id];
    var legacy = options.legacyPosition;
    var position = __assign({}, saved !== null && saved !== void 0 ? saved : { side: legacy ? (legacy.left < window.innerWidth / 2 ? 'left' : 'right') : (_a = options.side) !== null && _a !== void 0 ? _a : 'right', top: (_c = (_b = legacy === null || legacy === void 0 ? void 0 : legacy.top) !== null && _b !== void 0 ? _b : options.top) !== null && _c !== void 0 ? _c : 140 });
    element.classList.add('sd-dock');
    var handle = (_d = element.querySelector('.sd-organizer-handle')) !== null && _d !== void 0 ? _d : document.createElement('button');
    if (!handle.parentNode) {
        handle.setAttribute('type', 'button');
        handle.textContent = '⠿ Verschieben';
        element.prepend(handle);
    }
    handle.classList.add('sd-organizer-handle', 'sd-dock-handle');
    if (handle.tagName !== 'BUTTON')
        handle.setAttribute('role', 'button');
    handle.tabIndex = 0;
    handle.title = 'Am Rand ziehen · zur anderen Bildschirmseite wechseln · Pfeiltasten zum Verschieben';
    handle.setAttribute('aria-label', 'Fenster am Bildschirmrand verschieben');
    var drag = null;
    var save = savePositions;
    var down = function (event) {
        var _a;
        var control = event.target.closest('button,a,input,select');
        if (event.button !== 0 || (control && control !== handle))
            return;
        drag = { id: event.pointerId, offsetY: event.clientY - element.getBoundingClientRect().top, side: position.side };
        (_a = handle.setPointerCapture) === null || _a === void 0 ? void 0 : _a.call(handle, event.pointerId);
        event.preventDefault();
    };
    var move = function (event) {
        if (!drag || drag.id !== event.pointerId)
            return;
        position.side = drag.side === 'left' ? (event.clientX >= window.innerWidth * .4 ? 'right' : 'left') : (event.clientX <= window.innerWidth * .6 ? 'left' : 'right');
        position.top = Math.max(HEADER_HEIGHT, event.clientY - drag.offsetY);
        layoutOrganizerDocks(element);
    };
    var end = function () { if (drag) {
        drag = null;
        save();
    } };
    var keys = function (event) {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) || event.target !== handle)
            return;
        event.preventDefault();
        if (event.key === 'ArrowLeft')
            position.side = 'left';
        if (event.key === 'ArrowRight')
            position.side = 'right';
        if (event.key === 'ArrowUp')
            position.top -= event.shiftKey ? 1 : 10;
        if (event.key === 'ArrowDown')
            position.top += event.shiftKey ? 1 : 10;
        layoutOrganizerDocks(element);
        save();
    };
    handle.addEventListener('pointerdown', down);
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
    handle.addEventListener('lostpointercapture', end);
    handle.addEventListener('keydown', keys);
    var resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(function () { return layoutOrganizerDocks(); }) : null;
    resize === null || resize === void 0 ? void 0 : resize.observe(element);
    var content = new MutationObserver(function () { return layoutOrganizerDocks(); });
    content.observe(element, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['open', 'hidden'] });
    panels.set(element.id, { element: element, position: position, handle: handle, dispose: function () {
            resize === null || resize === void 0 ? void 0 : resize.disconnect();
            content.disconnect();
            handle.removeEventListener('pointerdown', down);
            handle.removeEventListener('pointermove', move);
            handle.removeEventListener('pointerup', end);
            handle.removeEventListener('pointercancel', end);
            handle.removeEventListener('lostpointercapture', end);
            handle.removeEventListener('keydown', keys);
        } });
    if (observingDocument !== document) {
        observingDocument = document;
        $(window).off('resize.sdOrganizerDock').on('resize.sdOrganizerDock', function () { layoutOrganizerDocks(); savePositions(); });
    }
    layoutOrganizerDocks(element);
}
exports.dockOrganizerPanel = dockOrganizerPanel;


/***/ }),

/***/ 409:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.keepOrganizerInViewport = exports.escapeHtml = exports.ensureOrganizerStyles = void 0;
var organizer_dock_1 = __webpack_require__(617);
function ensureOrganizerStyles() {
    if (document.getElementById('sd-organizer-style'))
        return;
    $('<style id="sd-organizer-style">').text("\n      .sd-organizer { color:#412b13; background:#f1e3c3; border:1px solid #a78c61;\n        box-shadow:0 2px 5px #0002; border-radius:9px; max-width:calc(100vw - 24px);\n        max-height:calc(100vh - 80px); overflow:auto; box-sizing:border-box; font:12px/1.5 Verdana,sans-serif; }\n      .sd-organizer .sd-organizer-handle { background:#f1e3c3;\n        color:#6e593b; padding:7px 10px; border-bottom:1px solid #c8b58e; font-size:11px; font-weight:normal; }\n      .sd-organizer input:not([type=button]):not([type=checkbox]), .sd-organizer select {\n        background:#fff8e8 !important; color:#3b2713 !important; border:1px solid #b59766 !important;\n        border-radius:2px; box-sizing:border-box; padding:4px; }\n      .sd-organizer .btn { background:#f4e4c2 !important; color:#412b13 !important;\n        border:1px solid #b39a6b; border-radius:6px; padding:5px 10px; font:inherit; cursor:pointer; box-sizing:border-box; max-width:100%; }\n      .sd-organizer .btn[aria-pressed=true] { background:#76502d !important; color:#fff4d9 !important; border-color:#563716; }\n      .sd-organizer :focus-visible { outline:2px solid #72501e; outline-offset:2px; }\n      .sd-organizer details { margin:10px 0; } .sd-organizer summary { cursor:pointer; font-weight:bold; }\n      .sd-organizer .sd-preset-buttons { display:flex; flex-wrap:wrap; gap:6px; margin:8px 0; }\n      .sd-organizer [aria-pressed=true] { outline:2px solid #72501e; outline-offset:1px; }\n      .sd-package-row { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; padding:10px 0; border-bottom:1px solid #c4a36b; }\n      .sd-package-row label { display:flex; align-items:center; gap:5px; }\n      .sd-package-row img { width:18px; height:18px; } .sd-package-row input { width:100%; min-width:0; }\n      .sd-field-error { border:1px solid #8d0100 !important; } .sd-organizer-error { color:#8d0100; }\n      .sd-tour-target,.sd-setup-target { outline:3px solid #915dac; outline-offset:3px; }\n      .sd-button { display:inline-block; cursor:pointer; font:12px/1.5 Verdana,sans-serif;\n        padding:5px 10px; border:1px solid #b39a6b; border-radius:6px; background:#f4e4c2; color:#412b13; text-decoration:none; box-sizing:border-box; max-width:100%; }\n      .sd-button:hover { background:#fff4d9; } .sd-button:disabled { opacity:.5; cursor:default; }\n      .sd-button.sd-primary { background:#76502d; color:#fff4d9; border-color:#563716; }\n      .sd-button:focus-visible { outline:2px solid #915dac; outline-offset:2px; }\n      #sd-setup-card { position:fixed; width:400px; z-index:10001; padding:16px; box-shadow:0 4px 24px #0004; }\n      .sd-setup-header { display:flex; align-items:center; justify-content:space-between; gap:8px; }\n      .sd-setup-header h2 { font-size:18px; margin:0; }\n      .sd-setup-close { padding:2px 8px; font-size:18px; }\n      .sd-setup-progress,.sd-setup-status { font-size:11px; color:#6e593b; }\n      .sd-tip { padding:10px; margin:10px 0; background:#fff4d9; border:1px solid #c8b58e; border-radius:6px; }\n      .sd-tip-primary { border-top:3px solid #76502d; }\n      .sd-tip h3 { font-size:13px; margin:0 0 4px; }\n      .sd-tip p { margin:0; } .sd-setup-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }\n      .sd-setup-checklist { padding:0; list-style:none; } .sd-setup-checklist .sd-button { width:100%; text-align:left; margin:2px 0; }\n      .sd-setup-checklist [aria-current=step] { border-left:3px solid #76502d; font-weight:bold; }\n      .sd-hover-help { position:fixed; z-index:10010; width:330px; max-width:calc(100vw - 16px);\n        max-height:calc(100vh - 16px); overflow:auto; box-sizing:border-box; padding:10px 12px;\n        background:#fff4d9; color:#412b13; border:1px solid #a78c61; border-radius:5px;\n        box-shadow:0 3px 10px #0003; font:12px/1.5 Verdana,sans-serif; }\n      .sd-hover-help p { margin:5px 0 0; white-space:pre-line; }\n      .sd-hover-help-all { width:720px; }\n      .sd-help-sections { columns:2; column-gap:20px; margin-top:10px; }\n      .sd-help-sections section { break-inside:avoid; margin-bottom:12px; }\n      #sd-settings-root .sd-setting-ready > td { background:#e8edcf; }\n      .sd-setting-status { display:inline-block; margin-left:10px; color:#766347; font-size:10px; }\n      .sd-setting-ready .sd-setting-status { color:#365b25; }\n      .sd-help-icon { float:right; display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px;\n        padding:0; margin:0 0 0 6px; border:1px solid #a78c61; border-radius:50%; background:transparent; color:#6e593b;\n        font:bold 12px Verdana,sans-serif; cursor:help; box-sizing:border-box; }\n      .sd-help-icon:focus-visible { outline:2px solid #915dac; outline-offset:2px; }\n      .sd-organizer .sd-help-header { display:flow-root; }\n      .sd-setup-resource select { width:100%; margin:6px 0; }\n      .sd-setup-resource label { font-weight:bold; }\n      .sd-setup-checks { margin:6px 0; padding-left:18px; }\n      .sd-check-pending { color:#6e593b; } .sd-check-done { color:#365b25; }\n      .sd-dock { position:fixed; padding:7px; }\n      .sd-dock-left { border-radius:0 9px 9px 0; }\n      .sd-dock-right { border-radius:9px 0 0 9px; }\n      .sd-dock .sd-dock-handle { position:sticky; top:0; z-index:1; width:100%; border:0; border-bottom:1px solid #c8b58e;\n        border-radius:0; background:#f1e3c3; color:#6e593b; font:11px Verdana,sans-serif; text-align:left;\n        font-weight:normal !important; padding:4px 2px 6px !important; cursor:ns-resize !important; touch-action:none; user-select:none; box-sizing:border-box; }\n      @media (max-width:600px) { #sd-setup-card { padding:12px; max-height:calc(100vh - 80px); }\n        .sd-help-sections { columns:1; } }\n    ").appendTo('head');
}
exports.ensureOrganizerStyles = ensureOrganizerStyles;
function escapeHtml(value) {
    return String(value !== null && value !== void 0 ? value : '').replace(/[&<>"']/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]); });
}
exports.escapeHtml = escapeHtml;
function keepOrganizerInViewport($panel) {
    if ($panel.hasClass('sd-dock')) {
        (0, organizer_dock_1.layoutOrganizerDocks)($panel[0]);
        return;
    }
    var clamp = function () {
        var _a;
        var rect = (_a = $panel[0]) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
        if (!rect)
            return;
        var left = Math.max(12, Math.min(rect.left, window.innerWidth - rect.width - 12));
        var top = Math.max(12, Math.min(rect.top, window.innerHeight - rect.height - 12));
        $panel.css({ left: "".concat(left, "px"), top: "".concat(top, "px"), right: 'auto' });
    };
    clamp();
    $(window).off('resize.sdOrganizerViewport').on('resize.sdOrganizerViewport', clamp);
}
exports.keepOrganizerInViewport = keepOrganizerInViewport;


/***/ }),

/***/ 658:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.confirmVisibleForumPosts = exports.showPendingOperations = void 0;
var pending_operation_1 = __webpack_require__(209);
var local_storage_helper_1 = __webpack_require__(326);
var organizer_style_1 = __webpack_require__(409);
function showPendingOperations() {
    $('#sd-pending-operations').remove();
    var operations = (0, pending_operation_1.readPendingOperations)();
    if (!operations.length)
        return;
    (0, organizer_style_1.ensureOrganizerStyles)();
    var $box = $('<div id="sd-pending-operations" class="sd-organizer" style="padding:10px;margin:10px 0" role="status">');
    $box.append($('<b>').text('Offene Vorgänge prüfen'));
    operations.forEach(function (operation) {
        var _a, _b;
        var $row = $('<div style="margin-top:8px">');
        $row.append($('<p>').text(operation.kind === 'send'
            ? "".concat(operation.amount, " Pakete f\u00FCr Dorf ").concat(operation.villageId, ": Versand noch nicht best\u00E4tigt. Bitte den tats\u00E4chlichen Versand im Spiel pr\u00FCfen.")
            : 'Forenbeitrag noch nicht bestätigt. Der Entwurf bleibt gespeichert. Bitte im Thread prüfen, ob der Beitrag angekommen ist.'));
        if (operation.kind === 'forum' && operation.message) {
            $('<input type="button" class="btn" value="Beitrag wieder einfüllen">').on('click', function () { return $('#message').val(operation.message); }).appendTo($row);
        }
        var $amount = $('<input type="number" min="1" step="1" aria-label="Tatsächlich verschickte Pakete" style="width:65px">').val((_a = operation.amount) !== null && _a !== void 0 ? _a : 0).attr('max', (_b = operation.amount) !== null && _b !== void 0 ? _b : 0);
        if (operation.kind === 'send')
            $row.append($('<label>').text('Tatsächlich verschickte Pakete: ').append($amount));
        $('<input type="button" class="btn" value="Erfolgreich bestätigen">').on('click', function () {
            var _a;
            var amount = Number($amount.val());
            if (operation.kind === 'send' && (!Number.isSafeInteger(amount) || amount <= 0 || amount > ((_a = operation.amount) !== null && _a !== void 0 ? _a : 0))) {
                UI.ErrorMessage('Bitte die tatsächlich verschickte Paketmenge prüfen.', 4000);
                return;
            }
            try {
                local_storage_helper_1.LocalStorageHelper.getInstance().confirmOperation(operation.kind === 'send' ? __assign(__assign({}, operation), { amount: amount }) : operation);
                showPendingOperations();
            }
            catch (_b) {
                UI.ErrorMessage('Bestätigung konnte nicht gespeichert werden. Der Vorgang bleibt erhalten.', 5000);
            }
        }).appendTo($row);
        $('<input type="button" class="btn" value="Versuch verwerfen">').on('click', function () { (0, pending_operation_1.discardPendingOperation)(operation.id); showPendingOperations(); }).appendTo($row);
        $box.append($row);
    });
    $('#content_value').length ? $('#content_value').prepend($box) : $('body').append($box);
}
exports.showPendingOperations = showPendingOperations;
function confirmVisibleForumPosts(threadId) {
    // Require a new numeric post anchor, the player's own author link, and exact message text.
    var playerId = String(game_data.player.id);
    (0, pending_operation_1.readPendingOperations)().filter(function (op) { return op.kind === 'forum' && op.threadId === threadId; }).forEach(function (operation) {
        var normalize = function (text) { return text.replace(/\r/g, '').trim(); };
        var found = $('.post').toArray().some(function (post) {
            var _a, _b;
            var $post = $(post);
            var id = $post.children('a[name]').map(function (_, a) { return a.getAttribute('name'); }).get().find(function (id) { return /^\d+$/.test(id); });
            return id && !((_a = operation.knownPostIds) === null || _a === void 0 ? void 0 : _a.includes(id)) && $post.find(".igmline a[href*=\"id=".concat(playerId, "\"]")).length > 0
                && normalize($post.find('.text').text()) === normalize((_b = operation.message) !== null && _b !== void 0 ? _b : '');
        });
        if (found)
            local_storage_helper_1.LocalStorageHelper.getInstance().confirmOperation(operation);
    });
}
exports.confirmVisibleForumPosts = confirmVisibleForumPosts;


/***/ }),

/***/ 40:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.postLayout = void 0;
var pending_operation_1 = __webpack_require__(209);
var table_domain_1 = __webpack_require__(219);
var tw_helper_1 = __webpack_require__(246);
var request_popup_1 = __webpack_require__(342);
var request_button_badge_1 = __webpack_require__(71);
var local_storage_helper_1 = __webpack_require__(326);
var logging_helper_1 = __webpack_require__(56);
var log = logging_helper_1.Log.scope("post-layout");
var PACKAGE_BADGE_STYLE_ID = "packageStatusNotificationBadgeStyle";
function postLayout(currentThreadId, isAnswerMode, updateData) {
    var _a;
    log.state("Preparing post layout", {
        currentThreadId: currentThreadId,
        isAnswerMode: isAnswerMode,
        parsedPostCount: updateData.size
    });
    if (!isAnswerMode) {
        return;
    }
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    if (!(0, tw_helper_1.isUserForumMod)()) {
        log.info("User is not forum mod; locking textarea by default");
        $("#message").prop("readonly", true);
        var element = $("#message");
        var styledElem = "<div class=\"hideUserInput\" style=\"position: relative\">\n                                                          <div id=\"messageCover\" style=\"position: absolute; width: 614px; height: 220px; top:-16%; left: 0; background-color: gray; opacity: 0.5\"></div>\n                                                      </div>";
        $("#message").parent().append(styledElem);
        $(".hideUserInput").append(element);
        $(".hideUserInput").on("dblclick", function () {
            $("#messageCover").remove();
            $("#message").prop("readonly", false);
        });
    }
    var finishedRequests = localStorageService.getPackagesSent(currentThreadId).size;
    var postLayoutHtml = "\n<input class=\"btn\" type=\"button\" value=\"Bunker anfragen\" id=\"requestBunker\">\n<input class=\"btn\" type=\"button\" value=\"Bearbeitung eintragen\" id=\"addBearbeitung\">";
    $("input[name=preview]").remove();
    $("input[name=send]").parent().prepend(postLayoutHtml);
    (0, request_button_badge_1.syncRequestBunkerBadge)(currentThreadId);
    if (finishedRequests > 0) {
        $("#addBearbeitung").after('<span class="notification-badge" id="notificationBadge">!</span>');
        if (!document.getElementById(PACKAGE_BADGE_STYLE_ID)) {
            var style = document.createElement("style");
            style.id = PACKAGE_BADGE_STYLE_ID;
            style.innerHTML = "\n.notification-badge {\n  position: relative;\n  top: -10px;\n  right: 10px;\n  background-color: red;\n  color: white;\n  border-radius: 50%;\n  padding: 5px 10px;\n  font-size: 12px;\n}";
            document.head.appendChild(style);
        }
    }
    log.info("Binding thread reply helpers", {
        finishedRequests: finishedRequests
    });
    $("#requestBunker").on("click", function () {
        (0, request_popup_1.showRequestPopup)(currentThreadId);
        log.info("Opened bunker request popup");
    });
    $("#addBearbeitung").on("click", function () {
        $("#notificationBadge").remove();
        var packagesSent = localStorageService.getPackagesSent(currentThreadId);
        var res = "";
        packagesSent.forEach(function (value, key) {
            res += "".concat(key, " ").concat(value, "\n");
        });
        $("#message").val(res);
        log.info("Inserted package status lines into reply textarea", {
            lineCount: packagesSent.size
        });
    });
    (_a = $('#message').closest('form')[0]) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (event) {
        var _a;
        var message = String((_a = $('#message').val()) !== null && _a !== void 0 ? _a : '').trim();
        var inquiries = localStorageService.getSdInquiry(currentThreadId);
        var packages = Array.from(localStorageService.getPackagesSent(currentThreadId));
        var packageText = packages.map(function (_a) {
            var _b = __read(_a, 2), id = _b[0], amount = _b[1];
            return "".concat(id, " ").concat(amount);
        }).join('\n');
        var requestText = (0, table_domain_1.convertRequestArrayToMessageString)(inquiries).trim();
        if (message !== packageText.trim() && message !== requestText)
            return;
        if (!message)
            return;
        try {
            (0, pending_operation_1.createPendingOperation)({ kind: 'forum', threadId: currentThreadId, message: message, knownPostIds: $('.post > a[name]').map(function (_, a) { return String(a.getAttribute('name')); }).get(),
                inquiries: message === requestText ? inquiries : [], packages: message === packageText.trim() ? packages : [] });
        }
        catch (_b) {
            event.preventDefault();
            event.stopImmediatePropagation();
            UI.ErrorMessage('Beitragsentwurf konnte nicht gespeichert werden. Bitte Browserspeicher prüfen.', 5000);
        }
    }, true);
}
exports.postLayout = postLayout;


/***/ }),

/***/ 71:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.syncRequestBunkerBadge = void 0;
var local_storage_helper_1 = __webpack_require__(326);
var REQUEST_BADGE_ID = "requestBunkerNotificationBadge";
var REQUEST_BADGE_STYLE_ID = "requestBunkerNotificationBadgeStyle";
function ensureRequestBadgeStyles() {
    if (document.getElementById(REQUEST_BADGE_STYLE_ID)) {
        return;
    }
    var style = document.createElement("style");
    style.id = REQUEST_BADGE_STYLE_ID;
    style.innerHTML = "\n.notification-badge-blue {\n  position: relative;\n  top: -10px;\n  right: 10px;\n  background-color: #0057d9;\n  color: white;\n  border-radius: 50%;\n  padding: 5px 10px;\n  font-size: 12px;\n}";
    document.head.appendChild(style);
}
function syncRequestBunkerBadge(currentThreadId) {
    var $button = $("#requestBunker");
    if ($button.length === 0) {
        return;
    }
    ensureRequestBadgeStyles();
    var requestCount = local_storage_helper_1.LocalStorageHelper.getInstance().getSdInquiry(currentThreadId).length;
    var $badge = $("#".concat(REQUEST_BADGE_ID));
    if (requestCount > 0) {
        if ($badge.length === 0) {
            $button.after("<span class=\"notification-badge-blue\" id=\"".concat(REQUEST_BADGE_ID, "\">!</span>"));
        }
        return;
    }
    $badge.remove();
}
exports.syncRequestBunkerBadge = syncRequestBunkerBadge;


/***/ }),

/***/ 342:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.showRequestPopup = void 0;
var organizer_style_1 = __webpack_require__(409);
var helper_functions_1 = __webpack_require__(424);
var table_domain_1 = __webpack_require__(219);
var local_storage_helper_1 = __webpack_require__(326);
var logging_helper_1 = __webpack_require__(56);
var request_button_badge_1 = __webpack_require__(71);
var log = logging_helper_1.Log.scope("request-popup");
function showRequestPopup(currentThreadId) {
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    log.info("show request popup", { currentThreadId: currentThreadId });
    // requestData-Objekt aus dem LocalStorage abrufen
    var initPopopBox = "\n                    <div class=\"popup_box_container\" id=\"dbInfo_popup_box\">\n                        <div class='popup_box show'>\n                            <a class='popup_box_close tooltip-delayed' href='#' onclick='$(\"#dbInfo_popup_box\").remove()'>&nbsp</a>\n                            <div class='popup_box_content'>\n                              <div class='center'>\n                                <h2>Bunker Anfragen</h2>\n                                <table class=\"requestContent\">\n                                  \n                                    \n                                </table>\n                                <hr style=\"margin-top: 15px; margin-bottom: 15px\">\n                                <textarea class=\"textAreaKoords\" id=\"textAreaKoords\" style=\"background-color:#EAD5AA;\" placeholder=\"Koordinaten\"></textarea>\n                                <input type=\"button\" value=\"Bunker anfragen\" class=\"addBunkerAnfrage btn\" disabled style=\"float: right; margin-top: 15px\">\n                              </div>\n                            </div>\n                        </div>\n                        <div class='fader'></div>\n                    </div>\n    ";
    $('#ds_body')[0].insertAdjacentHTML('beforeend', initPopopBox);
    $("#textAreaKoords").on("focusout", function () {
        var input = getFilteredInput(String($("#textAreaKoords").val()) || "");
        log.info("Parsed coordinates from textarea", input);
        addNewRequestsToArray(currentThreadId, input);
        renderTableRows(currentThreadId);
    });
    renderTableRows(currentThreadId);
    $(".addBunkerAnfrage").on("click", function () {
        var isEmpty = false;
        $(".amountInput").each(function () {
            if (!Number.isSafeInteger(Number($(this).val())) || Number($(this).val()) <= 0 || $(this).attr("aria-invalid") === "true") {
                $(this).css("background-color", "red");
                isEmpty = true;
                return false; // break the loop
            }
        });
        if (!isEmpty) {
            var result = (0, table_domain_1.convertRequestArrayToMessageString)(localStorageService.getSdInquiry(currentThreadId));
            $("#message").val(result);
            $("#dbInfo_popup_box").remove();
        }
    });
}
exports.showRequestPopup = showRequestPopup;
function renderTableRows(currentThreadId) {
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    $(".requestContent").empty();
    var requestDataArray = localStorageService.getSdInquiry(currentThreadId);
    var returnHtml = "<tr style='margin=2px;'><th style=\"padding-left: 10px; padding-right: 10px\">Koordinate</th>\n                                    <th style=\"padding-left: 10px; padding-right: 10px\">Pakete</th>\n                                    <th style=\"padding-left: 10px; padding-right: 10px\">Spieler <span style=\"font-size: 0.8em;\">(optional)</span></th>\n                                    <th style=\"padding-left: 10px; padding-right: 10px\">Anmerkung <span style=\"font-size: 0.8em;\">(optional)</span></th>\n                                    <th style=\"padding-left: 10px; padding-right: 10px\">ab <span style=\"font-size: 0.8em;\">(optional)</span></th>\n                                    <th style=\"padding-left: 10px; padding-right: 10px\">bis <span style=\"font-size: 0.8em;\">(optional)</span></th>\n                                    <th style=\"padding-left: 10px; padding-right: 10px\">L\u00F6schen <button style=\"cursor:pointer; background: url(/graphic/delete.png); width: 20px; height: 20px;  border: none\" type=\"button\" aria-label=\"Anfrage l\u00F6schen\" class=\"deleteRequest\" id=\"deleteAll\"></button></th></tr>";
    if (requestDataArray.length === 0) {
        $(".addBunkerAnfrage").prop("disabled", true);
    }
    else {
        $(".addBunkerAnfrage").prop("disabled", false);
    }
    requestDataArray.forEach(function (requestRow, index) {
        Object.values(requestRow).forEach(function (value) {
            if (value === undefined) {
                log.trace("value is undefined");
            }
        });
        returnHtml += "<tr style='margin=2px;'><td style=\"padding-left: 10px; padding-right: 10px\">";
        if (requestRow.coords) {
            returnHtml += "<span style=\"font-size: 1.2em; font-weight: bold;\">".concat((0, organizer_style_1.escapeHtml)(requestRow.coords), "</span>");
        }
        returnHtml += "</td><td style=\"padding-left: 10px; padding-right: 10px\">";
        if (requestRow.amount) {
            returnHtml += "<input type=\"number\" min=\"1\" step=\"1\" style=\"background-color:#EAD5AA; border: none;\" id=\"amountInput".concat(index, "\" class=\"amountInput\" value=\"").concat(requestRow.amount, "\">");
        }
        else {
            returnHtml += "<input type=\"number\" min=\"1\" step=\"1\" style=\"background-color:#EAD5AA; border: none;\" id=\"amountInput".concat(index, "\" class=\"amountInput\" value=\"\">");
        }
        returnHtml += "</td><td style=\"padding-left: 10px; padding-right: 10px\">";
        if (requestRow.playerName) {
            returnHtml += "<input type=\"text\" style=\"background-color:#EAD5AA; border: none;\" id=\"playerNameInput".concat(index, "\" class=\"playerNameInput\" value=\"").concat((0, organizer_style_1.escapeHtml)(requestRow.playerName), "\">");
        }
        else {
            returnHtml += "<input type=\"text\" style=\"background-color:#EAD5AA; border: none;\" id=\"playerNameInput".concat(index, "\" class=\"playerNameInput\" value=\"\">");
        }
        returnHtml += "</td><td style=\"padding-left: 10px; padding-right: 10px\">";
        if (requestRow.comment) {
            returnHtml += "<input type=\"text\" style=\"background-color:#EAD5AA; border: none;\" id=\"commentInput".concat(index, "\" class=\"commentInput\" value=\"").concat((0, organizer_style_1.escapeHtml)(requestRow.comment), "\">");
        }
        else {
            returnHtml += "<input type=\"text\" style=\"background-color:#EAD5AA; border: none;\" id=\"commentInput".concat(index, "\" class=\"commentInput\" value=\"\">");
        }
        returnHtml += "</td><td style=\"padding-left: 10px; padding-right: 10px\">";
        if (requestRow.dateFrom) {
            var dateFrom = (0, helper_functions_1.convertEpochToDate)(requestRow.dateFrom);
            returnHtml += "<input type=\"datetime-local\" style=\"background-color:#EAD5AA; border: none;\" id=\"dateFromInput".concat(index, "\" class=\"dateFromInput\" value=\"").concat(dateFrom, "\">");
        }
        else {
            returnHtml += "<input type=\"datetime-local\" style=\"background-color:#EAD5AA; border: none;\" id=\"dateFromInput".concat(index, "\" class=\"dateFromInput\" value=\"\">");
        }
        returnHtml += "</td><td style=\"padding-left: 10px; padding-right: 10px\">";
        if (requestRow.dateUntil) {
            var dateUntil = (0, helper_functions_1.convertEpochToDate)(requestRow.dateUntil);
            returnHtml += "<input type=\"datetime-local\" style=\"background-color:#EAD5AA; border: none;\" id=\"dateUntilInput".concat(index, "\" class=\"dateUntilInput\" value=\"").concat(dateUntil, "\">");
        }
        else {
            returnHtml += "<input type=\"datetime-local\" style=\"background-color:#EAD5AA; border: none;\" id=\"dateUntilInput".concat(index, "\" class=\"dateUntilInput\" value=\"\">");
        }
        returnHtml += "</td><td style=\"padding-left: 10px; padding-right: 10px\">";
        returnHtml += "<button style=\"cursor:pointer; background: url(/graphic/delete.png); width: 20px; height: 20px;  border: none\" type=\"button\" aria-label=\"Anfrage l\u00F6schen\" class=\"deleteRequest\" id=\"deleteRequest".concat(index, "\"></button>");
        returnHtml += "</td></tr>";
    });
    $(".requestContent").append(returnHtml);
    (0, request_button_badge_1.syncRequestBunkerBadge)(currentThreadId);
    $(".deleteRequest").on("click", function () {
        var sdInquiryCollection = localStorageService.getSdInquiry(currentThreadId);
        var coords = $(this).closest('tr').children('td:first').text();
        var index = sdInquiryCollection.findIndex(function (request) { return request.coords === coords; });
        if (index !== -1) {
            sdInquiryCollection.splice(index, 1);
            localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
            renderTableRows(currentThreadId);
        }
    });
    $(".amountInput").on("click", function () {
        $(this).val("");
        $(this).css("background-color", "#EAD5AA");
    });
    $(".amountInput").on("focusout", function () {
        var amount = Number($(this).val());
        if (!Number.isSafeInteger(amount) || amount <= 0) {
            $(this).attr('aria-invalid', 'true');
            return;
        }
        $(this).attr('aria-invalid', 'false');
        var sdInquiryCollection = localStorageService.getSdInquiry(currentThreadId);
        var coords = $(this).closest('tr').children('td:first').text();
        var index = sdInquiryCollection.findIndex(function (request) { return request.coords === coords; });
        if (index !== -1) {
            sdInquiryCollection[index].amount = Number($(this).val());
            localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
        }
        // Füllen Sie alle anderen leeren Textboxen mit dem Wert
        var value = String($(this).val());
        $(".amountInput").each(function () {
            if ($(this).val() === "") {
                $(this).val(value);
                var coords_1 = $(this).closest('tr').children('td:first').text();
                var index_1 = sdInquiryCollection.findIndex(function (request) { return request.coords === coords_1; });
                if (index_1 !== -1) {
                    sdInquiryCollection[index_1].amount = Number(value);
                    localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
                }
            }
        });
    });
    $(".playerNameInput").on("focusout", function () {
        var sdInquiryCollection = localStorageService.getSdInquiry(currentThreadId);
        var coords = $(this).closest('tr').children('td:first').text();
        var index = sdInquiryCollection.findIndex(function (request) { return request.coords === coords; });
        if (index !== -1) {
            sdInquiryCollection[index].playerName = String($(this).val());
            localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
        }
        // Füllen Sie alle anderen leeren Textboxen mit dem Wert
        var value = String($(this).val());
        $(".playerNameInput").each(function () {
            if ($(this).val() === "") {
                $(this).val(value);
                var coords_2 = $(this).closest('tr').children('td:first').text();
                var index_2 = sdInquiryCollection.findIndex(function (request) { return request.coords === coords_2; });
                if (index_2 !== -1) {
                    sdInquiryCollection[index_2].playerName = String(value);
                    localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
                }
            }
        });
    });
    $(".commentInput").on("focusout", function () {
        var sdInquiryCollection = localStorageService.getSdInquiry(currentThreadId);
        var coords = $(this).closest('tr').children('td:first').text();
        var index = sdInquiryCollection.findIndex(function (request) { return request.coords === coords; });
        if (index !== -1) {
            sdInquiryCollection[index].comment = String($(this).val());
            localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
        }
        // Füllen Sie alle anderen leeren Textboxen mit dem Wert
        var value = String($(this).val());
        $(".commentInput").each(function () {
            if ($(this).val() === "") {
                $(this).val(value);
                var coords_3 = $(this).closest('tr').children('td:first').text();
                var index_3 = sdInquiryCollection.findIndex(function (request) { return request.coords === coords_3; });
                if (index_3 !== -1) {
                    sdInquiryCollection[index_3].comment = String(value);
                    localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
                }
            }
        });
    });
    $(".dateFromInput").on("change", function () {
        var sdInquiryCollection = localStorageService.getSdInquiry(currentThreadId);
        var coords = $(this).closest('tr').children('td:first').text();
        var index = sdInquiryCollection.findIndex(function (request) { return request.coords === coords; });
        if (index !== -1) {
            var dateFrom = (0, helper_functions_1.convertDateToEpoch)(String($(this).val()));
            var dateUntil = sdInquiryCollection[index].dateUntil;
            if (dateUntil && dateFrom >= dateUntil) {
                $(this).css("background-color", "red");
                $(this).val("");
                return;
            }
            $(this).css("background-color", "#EAD5AA");
            sdInquiryCollection[index].dateFrom = dateFrom;
            localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
        }
    });
    $(".dateUntilInput").on("change", function () {
        var sdInquiryCollection = localStorageService.getSdInquiry(currentThreadId);
        var coords = $(this).closest('tr').children('td:first').text();
        var index = sdInquiryCollection.findIndex(function (request) { return request.coords === coords; });
        if (index !== -1) {
            var dateUntil = (0, helper_functions_1.convertDateToEpoch)(String($(this).val()));
            var dateFrom = sdInquiryCollection[index].dateFrom;
            if (dateFrom && dateUntil && dateFrom >= dateUntil) {
                $(this).css("background-color", "red");
                $(this).val("");
                return;
            }
            $(this).css("background-color", "#EAD5AA");
            sdInquiryCollection[index].dateUntil = dateUntil;
            localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
        }
    });
    $(".playerNameInput").on("input", function () {
        handleInput(this);
    });
    $(".commentInput").on("input", function () {
        handleInput(this);
    });
    $("#deleteAll").on("click", function () {
        localStorageService.setSdInquiry(currentThreadId, []);
        renderTableRows(currentThreadId);
    });
}
function handleInput(htmlElement) {
    var _a;
    var $el = $(htmlElement);
    var input = String((_a = $el.val()) !== null && _a !== void 0 ? _a : "");
    if (input.includes('"')) {
        var cleaned = input.replace(/"/g, "");
        $el.val(cleaned);
    }
}
function getFilteredInput(input) {
    log.info("Filtering bunker coordinate input");
    var coordsPattern = /\d{3}\|\d{3}/g;
    var inputArray = input.split("\n");
    var resultArray = [];
    log.trace("Raw bunker input lines", inputArray);
    inputArray.forEach(function (line) {
        var matches = line.match(coordsPattern);
        if (matches) {
            log.trace("Accepted bunker input line", line);
            resultArray.push.apply(resultArray, __spreadArray([], __read(matches), false));
        }
    });
    $("#textAreaKoords").val("");
    return resultArray;
}
function addNewRequestsToArray(currentThreadId, input) {
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    var sdInquiryCollection = localStorageService.getSdInquiry(currentThreadId);
    log.state("Existing bunker request collection", {
        currentThreadId: currentThreadId,
        count: sdInquiryCollection.length
    });
    input.forEach(function (line) {
        var _a = __read(line.split(' ', 3)), coords = _a[0], amount = _a[1], optionalData = _a.slice(2);
        var request = {
            coords: coords,
            amount: Number(amount),
            playerName: optionalData[1] || undefined,
            comment: optionalData[2] || undefined,
            dateFrom: Number(optionalData[3]) || undefined,
            dateUntil: Number(optionalData[4]) || undefined
        };
        sdInquiryCollection.push(request);
    });
    sdInquiryCollection = removeDuplicatesByCoords(sdInquiryCollection);
    log.state("Updated bunker request collection", {
        currentThreadId: currentThreadId,
        count: sdInquiryCollection.length
    });
    localStorageService.setSdInquiry(currentThreadId, sdInquiryCollection);
    (0, request_button_badge_1.syncRequestBunkerBadge)(currentThreadId);
}
function removeDuplicatesByCoords(collection) {
    var uniqueCoords = new Set();
    return collection.filter(function (item) {
        if (uniqueCoords.has(item.coords)) {
            return false;
        }
        else {
            uniqueCoords.add(item.coords);
            return true;
        }
    });
}


/***/ }),

/***/ 486:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeSdSettingsControls = void 0;
var organizer_style_1 = __webpack_require__(409);
var settings_help_1 = __webpack_require__(179);
var ACTIVE_BG = "#fff8e8";
var INACTIVE_BG = "#fff8e8";
var DEFAULT_SELECT_STYLE = "width:150px; background-color: #fff8e8; color: #3b2713; border: 1px solid #b59766; padding: 5px 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);";
function buildSortOptionsHtml() {
    var sortOptions = '<option value="default"></option>';
    game_data.units.forEach(function (unit) {
        sortOptions += "<option value=\"".concat(unit, "\">").concat(unit, "</option>");
    });
    return sortOptions;
}
function setControlColor($control, isActive) {
    if ($control.closest('[data-sd-native-settings]').length || $control.is(':checkbox'))
        return;
    $control.css("background", isActive ? ACTIVE_BG : INACTIVE_BG);
    if ($control.is("input[type=button]"))
        $control.attr("aria-pressed", String(isActive));
}
function isDuplicateSendingEnabled(localStorageService) {
    return !localStorageService.getPreventDuplicateDestination;
}
function syncDuplicateToggle($control, duplicateSendingEnabled) {
    if ($control.is(':checkbox'))
        $control.prop('checked', duplicateSendingEnabled);
    else
        $control.val(duplicateSendingEnabled ? "An" : "Aus");
    setControlColor($control, duplicateSendingEnabled);
}
function buildGroupSelectHtml(groups, style) {
    var dropdown = "<select id=\"sd-group-id\" style=\"".concat(style, "\">");
    dropdown += '<option value="0">nicht gesetzt</option>';
    groups.forEach(function (group) {
        dropdown += "<option value=\"".concat((0, organizer_style_1.escapeHtml)(group.id), "\">").concat((0, organizer_style_1.escapeHtml)(group.name), "</option>");
    });
    dropdown += "</select>";
    return dropdown;
}
function buildTemplateSelectHtml(templates, style) {
    var dropdown = "<select id=\"sd-template-id\" style=\"".concat(style, "\">");
    dropdown += '<option value="0">nicht gesetzt</option>';
    templates.forEach(function (template) {
        dropdown += "<option value=\"".concat((0, organizer_style_1.escapeHtml)(template.id), "\">").concat((0, organizer_style_1.escapeHtml)(template.name), "</option>");
    });
    dropdown += "</select>";
    return dropdown;
}
function getConfiguredSelectStyle($root, options) {
    var _a;
    if ($root.is('[data-sd-native-settings]'))
        return '';
    if (options === null || options === void 0 ? void 0 : options.selectStyle) {
        return options.selectStyle;
    }
    var existingStyle = String((_a = $root.find("#sd-sort-by").attr("style")) !== null && _a !== void 0 ? _a : "").trim();
    return existingStyle !== "" ? existingStyle : DEFAULT_SELECT_STYLE;
}
function syncToggleButtons($root, localStorageService) {
    var $automateToggle = $root.find("#automate-massen-ut");
    var $duplicateToggle = $root.find("#prevent-duplicate-destination");
    var automateEnabled = localStorageService.getAutomateMassenUt;
    if ($automateToggle.is(':checkbox'))
        $automateToggle.prop('checked', automateEnabled);
    else
        $automateToggle.val(automateEnabled ? "An" : "Aus");
    setControlColor($automateToggle, automateEnabled);
    syncDuplicateToggle($duplicateToggle, isDuplicateSendingEnabled(localStorageService));
}
function syncSortByControl($root, localStorageService) {
    var $sortBy = $root.find("#sd-sort-by");
    $sortBy.html(buildSortOptionsHtml());
    var storedSortBy = localStorageService.getSortBy;
    var sortByValue = storedSortBy !== "" ? storedSortBy : "default";
    $sortBy.val(sortByValue);
    setControlColor($sortBy, sortByValue !== "default");
}
function syncGroupControl($root, localStorageService, options) {
    var _a;
    var groups = localStorageService.getGroupData;
    var selectStyle = getConfiguredSelectStyle($root, options);
    var $existingControl = $root.find("#sd-group-id");
    if (groups.length > 0)
        replaceCatalogControl($existingControl, buildGroupSelectHtml(groups, selectStyle));
    else if ($existingControl.is('select'))
        replaceCatalogControl($existingControl, "<input type=\"number\" min=\"0\" id=\"sd-group-id\" size=\"6\" style=\"".concat((_a = options === null || options === void 0 ? void 0 : options.selectStyle) !== null && _a !== void 0 ? _a : ($root.is('[data-sd-native-settings]') ? '' : 'width:68px'), "\">"));
    var $groupControl = $root.find("#sd-group-id");
    var groupValue = localStorageService.getSdGroupId === "" ? "0" : localStorageService.getSdGroupId;
    $groupControl.val(groupValue);
    setControlColor($groupControl, groupValue !== "0");
}
function syncTemplateControl($root, localStorageService, options) {
    var _a;
    var templates = localStorageService.getTemplateData;
    var selectStyle = getConfiguredSelectStyle($root, options);
    var $existingControl = $root.find("#sd-template-id");
    if (templates.length > 0)
        replaceCatalogControl($existingControl, buildTemplateSelectHtml(templates, selectStyle));
    else if ($existingControl.is('select'))
        replaceCatalogControl($existingControl, "<input type=\"number\" min=\"0\" id=\"sd-template-id\" size=\"6\" style=\"".concat((_a = options === null || options === void 0 ? void 0 : options.selectStyle) !== null && _a !== void 0 ? _a : ($root.is('[data-sd-native-settings]') ? '' : 'width:68px'), "\">"));
    var $templateControl = $root.find("#sd-template-id");
    var templateValue = localStorageService.getSelectedTemplate === "" ? "0" : localStorageService.getSelectedTemplate;
    $templateControl.val(templateValue);
    setControlColor($templateControl, templateValue !== "0");
}
function replaceCatalogControl($existing, html) {
    var e_1, _a;
    var _b;
    var focused = document.activeElement === $existing[0];
    var $replacement = $(html);
    try {
        for (var _c = __values(['sd-setup-target', 'sd-tour-target']), _d = _c.next(); !_d.done; _d = _c.next()) {
            var className = _d.value;
            if ($existing.hasClass(className))
                $replacement.addClass(className);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
    $existing.replaceWith($replacement);
    if (focused)
        (_b = $replacement[0]) === null || _b === void 0 ? void 0 : _b.focus({ preventScroll: true });
}
function bindSettingsEvents($root, localStorageService, log, options) {
    var onChange = options === null || options === void 0 ? void 0 : options.onSettingsChange;
    var changed = function () { document.dispatchEvent(new Event('sd-settings-changed')); onChange === null || onChange === void 0 ? void 0 : onChange(); };
    options = __assign(__assign({}, options), { onSettingsChange: changed });
    $root.off(".sdSettingsControls");
    $root.on("click.sdSettingsControls change.sdSettingsControls", "#prevent-duplicate-destination", function (event) {
        var _a;
        var checkbox = $(this).is(':checkbox');
        if (checkbox !== (event.type === 'change'))
            return;
        var nextDuplicateSendingEnabled = checkbox ? $(this).prop('checked') : $(this).val() !== "An";
        syncDuplicateToggle($(this), nextDuplicateSendingEnabled);
        localStorageService.setPreventDuplicateDestination = !nextDuplicateSendingEnabled;
        log.info("Updated setting", {
            setting: "preventDuplicateDestination",
            preventDuplicateDestination: !nextDuplicateSendingEnabled,
            duplicateSendingEnabled: nextDuplicateSendingEnabled
        });
        (_a = options === null || options === void 0 ? void 0 : options.onSettingsChange) === null || _a === void 0 ? void 0 : _a.call(options);
    });
    $root.on("click.sdSettingsControls change.sdSettingsControls", "#automate-massen-ut", function (event) {
        var _a;
        var checkbox = $(this).is(':checkbox');
        if (checkbox !== (event.type === 'change'))
            return;
        var nextValue = checkbox ? $(this).prop('checked') : $(this).val() !== "An";
        if (!checkbox)
            $(this).val(nextValue ? "An" : "Aus");
        setControlColor($(this), nextValue);
        localStorageService.setAutomateMassenUt = nextValue;
        log.info("Updated setting", { setting: "automateMassenUt", value: nextValue });
        (_a = options === null || options === void 0 ? void 0 : options.onSettingsChange) === null || _a === void 0 ? void 0 : _a.call(options);
    });
    $root.on("change.sdSettingsControls", "#sd-group-id", function () {
        var _a, _b, _c;
        var value = String((_a = $(this).val()) !== null && _a !== void 0 ? _a : "").trim();
        if (value !== "" && value !== "0") {
            localStorageService.setSdGroupId = value;
            setControlColor($(this), true);
            log.info("Updated setting", { setting: "sdGroupId", value: value });
            (_b = options === null || options === void 0 ? void 0 : options.onSettingsChange) === null || _b === void 0 ? void 0 : _b.call(options);
            return;
        }
        localStorageService.setSdGroupId = "0";
        $(this).val("0");
        setControlColor($(this), false);
        log.info("Updated setting", { setting: "sdGroupId", value: "0" });
        (_c = options === null || options === void 0 ? void 0 : options.onSettingsChange) === null || _c === void 0 ? void 0 : _c.call(options);
    });
    $root.on("change.sdSettingsControls", "#sd-template-id", function () {
        var _a, _b, _c;
        var value = String((_a = $(this).val()) !== null && _a !== void 0 ? _a : "").trim();
        if (value !== "" && value !== "0") {
            localStorageService.setSelectedTemplate = value;
            setControlColor($(this), true);
            log.info("Updated setting", { setting: "selectedTemplate", value: value });
            (_b = options === null || options === void 0 ? void 0 : options.onSettingsChange) === null || _b === void 0 ? void 0 : _b.call(options);
            return;
        }
        localStorageService.setSelectedTemplate = "0";
        $(this).val("0");
        setControlColor($(this), false);
        log.info("Updated setting", { setting: "selectedTemplate", value: "0" });
        (_c = options === null || options === void 0 ? void 0 : options.onSettingsChange) === null || _c === void 0 ? void 0 : _c.call(options);
    });
    $root.on("change.sdSettingsControls", "#sd-sort-by", function () {
        var _a, _b, _c;
        var value = String((_a = $(this).val()) !== null && _a !== void 0 ? _a : "").trim();
        if (value !== "" && value !== "default") {
            localStorageService.setSortBy = value;
            setControlColor($(this), true);
            log.info("Updated setting", { setting: "sortBy", value: value });
            (_b = options === null || options === void 0 ? void 0 : options.onSettingsChange) === null || _b === void 0 ? void 0 : _b.call(options);
            return;
        }
        localStorageService.setSortBy = "default";
        $(this).val("default");
        setControlColor($(this), false);
        log.info("Updated setting", { setting: "sortBy", value: "default" });
        (_c = options === null || options === void 0 ? void 0 : options.onSettingsChange) === null || _c === void 0 ? void 0 : _c.call(options);
    });
}
function initializeSdSettingsControls($root, localStorageService, log, options) {
    syncToggleButtons($root, localStorageService);
    syncSortByControl($root, localStorageService);
    syncGroupControl($root, localStorageService, options);
    syncTemplateControl($root, localStorageService, options);
    bindSettingsEvents($root, localStorageService, log, options);
    (0, settings_help_1.initializeSettingsHelp)($root, localStorageService);
}
exports.initializeSdSettingsControls = initializeSdSettingsControls;


/***/ }),

/***/ 248:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sdTable = void 0;
var edit_sd_post_1 = __webpack_require__(659);
var post_layout_1 = __webpack_require__(40);
var local_storage_helper_1 = __webpack_require__(326);
var tw_helper_1 = __webpack_require__(246);
var table_helper_1 = __webpack_require__(283);
var table_domain_1 = __webpack_require__(219);
var logging_helper_1 = __webpack_require__(56);
var thread_guards_1 = __webpack_require__(727);
var log = logging_helper_1.Log.scope("sd-table");
function sdTable(pageContext, threads) {
    var _a;
    var pageState = readPageState(pageContext, threads);
    var derivedState = deriveState(pageContext, pageState, threads);
    log.info("Rendering SD table view");
    renderChrome(pageState);
    log.state("SD table context", {
        currentThreadId: pageState.currentThreadId,
        sdPostId: pageState.sdPostId,
        knownThreadIds: Object.keys(threads),
        isForumMod: pageState.isForumMod,
        postCount: $(".post").length,
        hasReplyTextarea: pageState.hasReplyTextarea,
        isAnswerMode: pageState.isAnswerMode
    });
    if (derivedState.isEditMode) {
        log.info("Detected edit mode for SD post", {
            currentThreadId: pageState.currentThreadId,
            editPostId: (_a = pageContext.query.edit_post_id) !== null && _a !== void 0 ? _a : ""
        });
        (0, edit_sd_post_1.editSdPost)(pageState.currentThreadId, pageState.updateData);
        return;
    }
    if (pageState.hasReplyTextarea) {
        (0, post_layout_1.postLayout)(pageState.currentThreadId, pageState.isAnswerMode, pageState.updateData);
    }
    if (!pageState.isForumMod) {
        removeNonModActions();
    }
    var sdTableDom = readSdTableDom(pageState.sdPostId);
    log.info("Resolved SD table DOM nodes", {
        currentThreadId: pageState.currentThreadId,
        sdPostId: pageState.sdPostId,
        hasTableBody: sdTableDom.sdTableBody.length > 0,
        postCacheLength: sdTableDom.postCacheText.length
    });
    if (sdTableDom.sdTableBody.length === 0) {
        log.error("sd table body not found");
        return;
    }
    var filteredUpdateData = applyPostCacheFiltering(pageState, sdTableDom.postCacheText);
    var sdTableState = (0, table_helper_1.parseTableHtmlElemToSdState)(sdTableDom.sdTableBody);
    local_storage_helper_1.LocalStorageHelper.getInstance().setSdTableState(pageState.currentThreadId, sdTableState);
    log.state("Initial SD table state loaded from DOM", {
        rowCount: sdTableState.size
    });
    var packagesToUpdateFromPosts = (0, table_domain_1.aggregatePackageUpdates)(filteredUpdateData);
    log.state("Aggregated package deltas from posts", {
        packageCount: packagesToUpdateFromPosts.size,
        entries: Array.from(packagesToUpdateFromPosts.entries()).slice(0, 10)
    });
    (0, table_helper_1.displayUpdatedSdTable)(pageState.currentThreadId, packagesToUpdateFromPosts);
    sdTableState = (0, table_helper_1.parseTableHtmlElemToSdState)(sdTableDom.sdTableBody);
    local_storage_helper_1.LocalStorageHelper.getInstance().setSdTableState(pageState.currentThreadId, sdTableState);
    updateSdTableTitle(sdTableDom.sdTablePost, sdTableState);
    (0, table_helper_1.updateSentPackagesInSdTable)(pageState.currentThreadId);
    (0, table_helper_1.applySettingsToMassUtLink)(pageState.currentThreadId);
    (0, table_helper_1.trimVillageNameText)(pageState.sdPostId);
    // Keep complete dates readable by subsequent parsing and editing.
    renderRoleSpecificView(pageState, sdTableDom.postCacheText);
    bindEvents(pageState, sdTableState);
}
exports.sdTable = sdTable;
function readPageState(pageContext, threads) {
    var currentThreadId = (0, thread_guards_1.getThreadIdFromContext)(pageContext);
    return {
        currentThreadId: currentThreadId,
        sdPostId: threads[currentThreadId].sdPostId,
        isForumMod: (0, tw_helper_1.isUserForumMod)(),
        updateData: (0, table_helper_1.parseSdPosts)(currentThreadId),
        hasReplyTextarea: $("#message").length > 0,
        isAnswerMode: (0, thread_guards_1.isAnswerMode)(pageContext)
    };
}
function deriveState(pageContext, pageState, threads) {
    return {
        isEditMode: (0, thread_guards_1.isEditingSdPost)(pageContext, threads),
        postCacheIds: (0, table_domain_1.parsePostCacheIds)(readSdTableDom(pageState.sdPostId).postCacheText)
    };
}
function renderChrome(pageState) {
    var sdTableTitle = "<span style=\"color: #72501e; font-size: x-small\"> (SD Tabelle)</span>";
    $(".clearfix > table").first().find("h2").append(sdTableTitle);
    $(".text").css("max-width", "100%");
    if (pageState.hasReplyTextarea) {
        log.info("Reply textarea detected; enabling post layout helpers");
    }
}
function updateSdTableTitle(sdTablePost, sdTableState) {
    var totalRequiredPackages = (0, table_domain_1.calculateTotalRequiredPackages)(sdTableState);
    var titleElement = sdTablePost.find(".text b").filter(function (index, element) {
        return $(element).text().trim().startsWith("SD Tabelle Paketsystem");
    }).first();
    if (titleElement.length === 0) {
        log.warn("Could not find SD table package system title for package total update", {
            totalRequiredPackages: totalRequiredPackages
        });
        return;
    }
    titleElement.text("SD Tabelle Paketsystem || Ben\u00F6tigte Pakete (".concat(totalRequiredPackages, ")"));
    log.info("Updated SD table package total in title", {
        totalRequiredPackages: totalRequiredPackages
    });
}
function removeNonModActions() {
    $(".postheader_right").each(function (index, elem) {
        $(elem).children().each(function (childIndex, childElem) {
            var keywords = ["Zitat", "Bearbeiten"];
            $(childElem).text().split(" ").some(function (word) { return keywords.includes(word); }) && $(childElem).remove();
        });
    });
}
function readSdTableDom(sdPostId) {
    var sdTablePost = $("a[name='" + sdPostId + "']").parent();
    return {
        sdTablePost: sdTablePost,
        sdTableBody: $(sdTablePost).find(".text .bbcodetable").first().children("tbody"),
        postCacheText: $(sdTablePost).find("input[value=postCache]").siblings().find("span").text()
    };
}
function applyPostCacheFiltering(pageState, postCacheText) {
    var e_1, _a;
    var filteredUpdateData = new Map(pageState.updateData);
    var postCacheIds = (0, table_domain_1.parsePostCacheIds)(postCacheText);
    try {
        for (var postCacheIds_1 = __values(postCacheIds), postCacheIds_1_1 = postCacheIds_1.next(); !postCacheIds_1_1.done; postCacheIds_1_1 = postCacheIds_1.next()) {
            var key = postCacheIds_1_1.value;
            filteredUpdateData.delete(key);
            if (!pageState.isForumMod) {
                $("a[name='" + key + "']").parent().remove();
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (postCacheIds_1_1 && !postCacheIds_1_1.done && (_a = postCacheIds_1.return)) _a.call(postCacheIds_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (postCacheIds.length > 0) {
        log.info("Applied post cache filter to updateData", {
            filteredPostIds: postCacheIds
        });
    }
    return filteredUpdateData;
}
function renderRoleSpecificView(pageState, postCacheText) {
    if (pageState.isForumMod) {
        log.info("Forum mod view: highlighting cached posts for deletion", {
            postsToDelete: postCacheText
        });
        if (postCacheText.length > 1) {
            var postToDelete = (0, table_domain_1.parsePostCacheIds)(postCacheText);
            postToDelete.forEach(function (postId) {
                $("input[value=".concat(postId, "]"))
                    .prop("checked", true)
                    .parent().parent()
                    .css("background", "#e8d5ac");
            });
        }
    }
    else {
        var sdPostElement = $("a[name='" + pageState.sdPostId + "']").parent();
        sdPostElement.nextAll(".post").hide();
        log.info("Non-mod view: hiding posts below SD table");
    }
}
function bindEvents(pageState, sdTableState) {
    var _a, _b;
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    var unresolved = (_b = (_a = localStorageService.getThreadData(pageState.currentThreadId)) === null || _a === void 0 ? void 0 : _a.unresolvedPackages) !== null && _b !== void 0 ? _b : [];
    if (unresolved.length && !$('#sd-unresolved-packages').length) {
        $('<div id="sd-unresolved-packages" role="alert" style="padding:8px;border:1px solid #8d0100">').text("".concat(unresolved.length, " alte Versandeintr\u00E4ge konnten keinem Dorf sicher zugeordnet werden. Bitte den tats\u00E4chlichen Versand pr\u00FCfen; diese Eintr\u00E4ge werden nicht automatisch auf neue Anfragen \u00FCbertragen.")).prependTo('#content_value');
    }
    var showHiddenPosts = '<button class="btn" id="showPostsButton">Zeige versteckte Posts</button>';
    $(".thread_button").last().parent().append(showHiddenPosts);
    $("#showPostsButton").on("click", function () {
        var sdPostElement = $("a[name='" + pageState.sdPostId + "']").parent();
        sdPostElement.nextAll(".post").show();
        $(this).remove();
        log.info("User restored hidden posts in SD thread view");
    });
    window.addEventListener("storage", function (event) {
        var _a;
        log.info("Received storage event", {
            key: event.key
        });
        if (event.key === "standdeff-organizer" || ((_a = event.key) === null || _a === void 0 ? void 0 : _a.startsWith("standdeff-organizer:change:"))) {
            log.info("Detected relevant localStorage change; syncing sent packages in SD table");
            (0, table_helper_1.updateSentPackagesInSdTable)(pageState.currentThreadId);
        }
    });
    localStorageService.setSdTableState(pageState.currentThreadId, sdTableState);
}


/***/ }),

/***/ 179:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeSettingsHelp = exports.getSettingsHelp = void 0;
var game_catalog_1 = __webpack_require__(444);
var hints = {
    'automate-massen-ut': { title: 'Massen-UT automatisch vorbereiten', text: 'Wendet deine SD-Gruppe, Truppen-Vorlage und Filter an, wenn du dem Link einer SD-Anfrage folgst. Gruppe und Vorlage müssen eingerichtet sein. Prüfe die vorausgewählten Dörfer und Truppen; du sendest selbst im Spiel.' },
    'prevent-duplicate-destination': { title: 'Doppeltes Schicken', text: 'Aus / ohne Häkchen: Bereits bearbeitete SD-Anfragen sind vor erneuter Vorauswahl geschützt. An / mit Häkchen: Sie dürfen erneut vorausgewählt werden. Aktiviere das nur, wenn du bewusst weitere Pakete schicken möchtest.' },
    'sd-sort-by': { title: 'Sortieren nach', text: 'Sortiert die Herkunftsdörfer für Massen-UT nach der gewählten Einheit. Ohne Auswahl bleibt die normale Spielsortierung bestehen.' },
    'sd-group-id': { title: 'SD-Gruppe', text: 'Wähle die Dorfgruppe, aus der du Standdeff verschicken möchtest. Gruppen werden direkt aus der Gruppenverwaltung geladen. Grün bedeutet: Die gewählte Gruppe wurde im Spiel gefunden und zugeordnet. Die Truppen in den Dörfern prüfst du vor dem Versand.' },
    'sd-template-id': { title: 'SD-Vorlage', text: 'Wähle die Truppen-Vorlage mit den Paketmengen eurer SD-Tabelle. Vorlagen werden direkt von der Vorlagenseite geladen. Grün bestätigt die vorhandene und zugeordnete Vorlage; prüfe selbst, dass ihre Einheitmengen zu euren Paketen passen.' },
    'sd-schwertLfz': { title: 'Schwert-Laufzeit', text: 'Normale Schwert-Laufzeit dieser Welt in Minuten pro Feld, ohne Unterstützungs-Speedboost. Sie wird für ab/bis-Anfragen und die Erkennung eines Speedboosts verwendet. Ein positiver Zahlenwert ist gültig; den Wert findest du in den Welteinstellungen.' },
    'reset-thread-packages': { title: 'Geschickte Pakete zurücksetzen', text: 'Löscht die lokal gespeicherten Versand-Einträge dieses Threads. Die Forenbeiträge bleiben bestehen. Danach können bereits bearbeitete Anfragen wieder vorausgewählt werden.' }
};
function getSettingsHelp($root) {
    return Object.entries(hints).filter(function (_a) {
        var _b = __read(_a, 1), id = _b[0];
        return $root.find("#".concat(id)).length > 0;
    }).map(function (_a) {
        var _b = __read(_a, 2), hint = _b[1];
        return hint;
    });
}
exports.getSettingsHelp = getSettingsHelp;
function initializeSettingsHelp($root, storage) {
    var native = $root.is('[data-sd-native-settings]');
    if (!native)
        return;
    var render = function () {
        var e_1, _a;
        var group = (0, game_catalog_1.isCatalogSelectionValid)('groups', storage.getSdGroupId);
        var template = (0, game_catalog_1.isCatalogSelectionValid)('templates', storage.getSelectedTemplate);
        var catalogState = function (kind, selected) {
            var check = (0, game_catalog_1.getCatalogCheck)(kind);
            if ((0, game_catalog_1.isCatalogSelectionValid)(kind, selected))
                return { ready: true, text: 'Im Spiel bestätigt' };
            if (!selected || selected === '0')
                return { ready: false, text: 'Bitte auswählen' };
            return { ready: false, text: check.state === 'error' ? 'Prüfung fehlgeschlagen' : check.state === 'ready' ? 'Nicht gefunden' : 'Wird geprüft' };
        };
        var sword = Number($root.find('#sd-schwertLfz').val());
        var sort = storage.getSortBy;
        var sortValid = sort === 'default' || sort === '' || game_data.units.some(function (unit) { return unit === sort; });
        var states = {
            'sd-group-id': catalogState('groups', storage.getSdGroupId),
            'sd-template-id': catalogState('templates', storage.getSelectedTemplate),
            'sd-schwertLfz': { ready: Number.isFinite(sword) && sword > 0, text: Number.isFinite(sword) && sword > 0 ? 'Gültiger Wert' : 'Bitte einstellen' },
            'automate-massen-ut': { ready: storage.getAutomateMassenUt && group && template, text: !storage.getAutomateMassenUt ? 'Aus' : group && template ? 'Bereit' : 'Gruppe / Vorlage prüfen' },
            'prevent-duplicate-destination': { ready: storage.getPreventDuplicateDestination, text: storage.getPreventDuplicateDestination ? 'Schutz aktiv' : 'Erneute Auswahl erlaubt' },
            'sd-sort-by': { ready: sortValid, text: sort === 'default' || sort === '' ? 'Spielsortierung' : sortValid ? 'Einheit gewählt' : 'Bitte auswählen' }
        };
        try {
            for (var _b = __values(Object.entries(states)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), id = _d[0], state = _d[1];
                var $row = $root.find("#".concat(id)).closest('tr').toggleClass('sd-setting-ready', state.ready);
                var $status = $row.find('.sd-setting-status');
                if (!$status.length)
                    $status = $('<small class="sd-setting-status">').appendTo($row.children('td').last());
                $status.text("".concat(state.ready ? '✓ ' : '').concat(state.text));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    $(document).off('.sdSettingsStatus').on('sd-catalog-updated.sdSettingsStatus sd-catalog-validated.sdSettingsStatus sd-settings-changed.sdSettingsStatus', render);
    render();
}
exports.initializeSettingsHelp = initializeSettingsHelp;


/***/ }),

/***/ 903:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeSetupOnboarding = exports.getSetupValidation = exports.setupSteps = void 0;
var local_storage_helper_1 = __webpack_require__(326);
var ui_assets_1 = __webpack_require__(871);
var game_url_helper_1 = __webpack_require__(579);
var organizer_style_1 = __webpack_require__(409);
var organizer_dock_1 = __webpack_require__(617);
var game_catalog_1 = __webpack_require__(444);
// A shared tour key deliberately survives context and role changes. Existing page tours remain intact.
var SETUP_KEY = game_catalog_1.SETUP_TOUR_KEY;
exports.setupSteps = [
    { title: 'SD-Gruppe erstellen', screen: 'overview_villages', mode: 'groups', type: 'static', target: '#add_new_group_name', link: 'Gruppen öffnen',
        text: 'Lege im Spiel eine Dorfgruppe „SD“ an. Ordne ihr die Dörfer zu, aus denen du Standdeff schicken möchtest. Eine vorhandene passende Gruppe kannst du weiterverwenden.',
        tip: 'Speichere die Gruppe im Spiel. Wähle sie danach hier aus und klicke „Als SD-Gruppe festlegen“. Eine bereits vorhandene passende Gruppe kannst du genauso verwenden. „Weiter“ wird erst nach erfolgreicher Prüfung freigegeben.' },
    { title: 'SD-Vorlage anlegen', screen: 'place', mode: 'templates', target: '#template_name', link: 'Truppen-Vorlagen öffnen',
        text: 'Lege eine Truppen-Vorlage für ein SD-Paket an. Verwende die Mengen aus der SD-Tabelle deines Stammes: Speer und Schwert, auf Bogenwelten gegebenenfalls Bogen, dazu die vereinbarten Späher.',
        tip: 'Zum Beispiel 100 Speer + 100 Schwert + 5 Späher für 100 Dual. Speichere im Spiel und lege die Vorlage hier als SD-Vorlage fest. Der Organizer prüft ihre Existenz direkt; ein Besuch auf Massen-UT zum Einlesen ist nicht nötig.' },
    { title: 'SD-Gruppe auswählen', screen: 'settings', target: '#sd-group-id', link: 'Organizer-Einstellungen öffnen',
        text: 'Wähle in den Organizer-Einstellungen deine SD-Gruppe. Beim Öffnen einer SD-Anfrage wird diese Gruppe für die Herkunftsdörfer verwendet.',
        tip: 'Eine gerade im Onboarding angelegte Gruppe ist schon vorausgewählt. Prüfe sie oder wähle eine vorhandene. Die Liste wird direkt aus der Gruppenverwaltung aktualisiert.' },
    { title: 'SD-Vorlage auswählen', screen: 'settings', target: '#sd-template-id', link: 'Organizer-Einstellungen öffnen',
        text: 'Wähle die eben angelegte SD-Vorlage. Sie bestimmt die Einheitenmenge pro Paket und wird bei aktiver Vorbereitung für SD-Anfragen ausgewählt.',
        tip: 'Kontrolliere die Mengen deiner Vorlage gegen die SD-Tabelle. Unterschiedliche Paketgrößen brauchen jeweils passende Vorlagen.' },
    { title: 'Massen-UT vorbereiten', screen: 'settings', target: '#automate-massen-ut', link: 'Organizer-Einstellungen öffnen',
        text: 'Schalte „Massen-UT automatisch vorbereiten“ auf „An“, wenn der Organizer deine Vorlage, Gruppe und Filter beim Öffnen einer SD-Anfrage anwenden soll.',
        tip: '„Aus“ lässt diese Auswahl dir. „An“ bereitet das Formular vor; du prüfst die Truppen und sendest selbst im Spiel.' },
    { title: 'Doppeltes Schicken verstehen', screen: 'settings', target: '#prevent-duplicate-destination', link: 'Organizer-Einstellungen öffnen',
        text: '„Doppeltes Schicken: Aus“ schützt bereits bearbeitete Anfragen vor erneuter Vorauswahl. „An“ erlaubt, dieselbe Anfrage noch einmal zu bedienen.',
        tip: 'Für die normale Einrichtung lasse den Schalter auf „Aus“. Es geht um bereits bearbeitete SD-Anfragen, nicht um jedes beliebige Unterstützen desselben Dorfes.' },
    { title: 'Sortierung wählen', screen: 'settings', target: '#sd-sort-by', link: 'Organizer-Einstellungen öffnen',
        text: 'Mit „Sortieren nach“ legst du fest, nach welcher Einheit die Herkunftsdörfer in Massen-UT sortiert werden. Ohne Auswahl bleibt die Spielsortierung bestehen.',
        tip: 'Wähle beispielsweise Schwert, wenn diese Einheit deine verfügbaren SD-Pakete begrenzt. Die Sortierung wird zusammen mit der automatischen Vorbereitung angewendet.' },
    { title: 'Schwert-Laufzeit prüfen', screen: 'settings', target: '#sd-schwertLfz', link: 'Organizer-Einstellungen öffnen',
        text: 'Prüfe die normale Schwert-Laufzeit deiner Welt in Minuten pro Feld. Sie hilft dem Organizer, die Laufzeit und einen aktiven Unterstützungs-Speedboost für ab/bis-Anfragen zu berücksichtigen.',
        tip: 'Trage den Basiswert der Welt ein. Prüfe das Ankunftsfenster vor dem Versand; einen zeitweiligen Speedboost musst du nicht als neuen Basiswert speichern.' },
    { title: 'Bereit für die SD-Tabelle', screen: 'forum', link: 'Stammesforum öffnen',
        text: 'Öffne euren SD-Thread und klicke „Als SD-Tabelle festlegen“. Danach führt dich der Link einer Anfrage mit deinen Einstellungen zu Massen-UT. Prüfe die Auswahl, übernimm sie und sende im Spiel.',
        tip: 'Forenmoderatoren können zusätzlich eine SD-Tabelle erstellen und pflegen. Die Seitenhilfe erklärt die jeweiligen Funktionen. Nach dem Versand trägst du die Bearbeitung im Thread ein.' }
];
function isStepPage(context, item) {
    return context.screen === item.screen && (!item.mode || context.mode === item.mode) && (!item.type || context.query.type === item.type);
}
function getSetupValidation(step) {
    var e_1, _a;
    var storage = local_storage_helper_1.LocalStorageHelper.getInstance();
    var checks = __spreadArray([{ kind: 'groups', id: storage.getSdGroupId, name: 'Gruppe' }], __read((step > 0 ? [{ kind: 'templates', id: storage.getSelectedTemplate, name: 'Vorlage' }] : [])), false);
    try {
        for (var checks_1 = __values(checks), checks_1_1 = checks_1.next(); !checks_1_1.done; checks_1_1 = checks_1.next()) {
            var item = checks_1_1.value;
            var check = (0, game_catalog_1.getCatalogCheck)(item.kind);
            if (check.state === 'idle' || check.state === 'loading')
                return { valid: false, message: "Die ".concat(item.name, " wird im Spiel gepr\u00FCft \u2026") };
            if (check.state === 'error')
                return { valid: false, message: "Die ".concat(item.name, " konnte im Spiel nicht gepr\u00FCft werden. \u00D6ffne die entsprechende Spielseite oder versuche \u201EErneut pr\u00FCfen\u201C.") };
            if (!check.ids.length)
                return { valid: false, message: "Noch keine gespeicherte ".concat(item.name, " im Spiel gefunden. Lege sie dort an und speichere sie.") };
            if (!(0, game_catalog_1.isCatalogSelectionValid)(item.kind, item.id))
                return { valid: false, message: "W\u00E4hle eine im Spiel vorhandene ".concat(item.name, " und lege sie als SD-").concat(item.name, " fest.") };
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (checks_1_1 && !checks_1_1.done && (_a = checks_1.return)) _a.call(checks_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (step >= 7) {
        var input = document.getElementById('sd-schwertLfz');
        var minutes = input ? Number(input.value) : storage.getSwordLfz;
        if (!Number.isFinite(minutes) || minutes <= 0)
            return { valid: false, message: 'Trage eine gültige Schwert-Laufzeit größer als 0 Minuten pro Feld ein.' };
    }
    return { valid: true, message: step === 0 ? 'SD-Gruppe im Spiel gefunden und festgelegt.' : 'SD-Gruppe und SD-Vorlage im Spiel gefunden und festgelegt.' };
}
exports.getSetupValidation = getSetupValidation;
function initializeSetupOnboarding(context) {
    var _a, _b, _c;
    $('#sd-setup-launcher,#sd-setup-card').remove();
    $(document).off('.sdSetup');
    var storage = local_storage_helper_1.LocalStorageHelper.getInstance();
    var saved = (_b = (_a = storage.getOnboarding) === null || _a === void 0 ? void 0 : _a.tours) === null || _b === void 0 ? void 0 : _b[SETUP_KEY];
    var forumPage = context.screen === 'forum' || (context.screen === 'ally' && context.mode === 'forum');
    // The forum is the entry point. Other pages only show a guide that the user activated.
    if (!forumPage && (!saved || saved.complete || saved.paused))
        return;
    (0, organizer_style_1.ensureOrganizerStyles)();
    var step = Math.min(exports.setupSteps.length - 1, (_c = saved === null || saved === void 0 ? void 0 : saved.step) !== null && _c !== void 0 ? _c : 0);
    var active = false;
    var candidates = {};
    var chosen = {};
    var save = function (paused, complete) {
        var _a;
        var _b;
        if (complete === void 0) { complete = false; }
        var current = storage.getOnboarding;
        storage.setOnboarding = { version: (_b = current === null || current === void 0 ? void 0 : current.version) !== null && _b !== void 0 ? _b : 1, tours: __assign(__assign({}, current === null || current === void 0 ? void 0 : current.tours), (_a = {}, _a[SETUP_KEY] = { step: step, paused: paused, complete: complete }, _a)) };
    };
    var $open = $('<a id="sd-setup-launcher" class="thread_button" href="#" role="button">').append('<span class="thread_new_close sd-setup-open" style="transform:scaleX(-1)"></span>');
    var $middle = $('<span class="thread_new">').appendTo($open);
    $('<img alt="" width="20" height="20" style="vertical-align:middle;margin:-2px 4px 0 0">').attr('src', ui_assets_1.SETUP_ICON_DATA_URI).appendTo($middle);
    var $label = $('<span style="float:none;display:inline;height:auto;padding:0">').text(saved && !saved.complete ? 'Einrichtung fortsetzen' : 'Einrichtung starten').appendTo($middle);
    $open.append('<span class="thread_new_close"></span>');
    if (forumPage) {
        var $newThread = $('#content_value a.thread_button[href*="mode=new_thread"]').first();
        var $poll = $newThread.parent().find('a.thread_button[href*="mode=new_poll"]').last();
        if ($newThread.length)
            ($poll.length ? $poll : $newThread).after($open);
    }
    var close = function () {
        active = false;
        $('#sd-setup-card').remove();
        $('.sd-setup-target').removeClass('sd-setup-target');
        (0, organizer_dock_1.layoutOrganizerDocks)();
    };
    var pause = function () {
        if (!active)
            return;
        save(true);
        close();
        $label.text('Einrichtung fortsetzen');
        $open.trigger('focus');
    };
    var render = function (focus) {
        var _a, _b, _c, _d;
        if (focus === void 0) { focus = true; }
        var previousFocus = document.activeElement;
        var previousId = (previousFocus === null || previousFocus === void 0 ? void 0 : previousFocus.closest('#sd-setup-card')) ? previousFocus.id : '';
        close();
        active = true;
        save(false);
        $label.text('Einrichtung fortsetzen');
        $('#sd-onboarding-card').remove();
        $('.sd-tour-target').removeClass('sd-tour-target');
        var item = exports.setupSteps[step];
        var here = isStepPage(context, item);
        var $card = $('<aside id="sd-setup-card" class="sd-organizer" role="region" aria-labelledby="sd-setup-title">');
        var $header = $('<div class="sd-setup-header">').append($('<h2 id="sd-setup-title" tabindex="-1">').text('SD Organizer einrichten'));
        $('<button type="button" class="sd-button sd-setup-close" aria-label="Einrichtung pausieren">×</button>').on('click', pause).appendTo($header);
        $card.append($header, $('<p class="sd-setup-progress">').text("Schritt ".concat(step + 1, " von ").concat(exports.setupSteps.length, " \u00B7 Fortschritt wird gespeichert")));
        var $list = $('<ol class="sd-setup-checklist" aria-label="Einrichtungsschritte">');
        exports.setupSteps.forEach(function (s, i) {
            var $button = $('<button type="button" class="sd-button">').text("".concat(i + 1, ". ").concat(s.title)).attr('aria-current', i === step ? 'step' : null);
            var blocked = i > step && (!getSetupValidation(0).valid || (i > 1 && !getSetupValidation(1).valid));
            $button.prop('disabled', blocked).on('click', function () { if (blocked)
                return; step = i; render(); });
            $('<li>').append($button).appendTo($list);
        });
        $card.append($('<details><summary>Alle Schritte</summary></details>').append($list));
        $card.append($('<section class="sd-tip sd-tip-primary">').append($('<h3>').text(item.title), $('<p>').text(item.text)), $('<section class="sd-tip">').append($('<h3>').text('Gut zu wissen'), $('<p>').text(item.tip)));
        if (step <= 1) {
            var kind_1 = step === 0 ? 'groups' : 'templates';
            var name_1 = step === 0 ? 'Gruppe' : 'Vorlage';
            var entries = step === 0 ? storage.getGroupData : storage.getTemplateData;
            var selected_1 = step === 0 ? storage.getSdGroupId : storage.getSelectedTemplate;
            if (!chosen[kind_1]) {
                var matches = entries.filter(function (entry) { return /(^|\W)sd(\W|$)|standdeff/i.test(entry.name); });
                candidates[kind_1] = entries.some(function (entry) { return entry.id === selected_1; }) ? selected_1 : matches.length === 1 ? matches[0].id : '0';
            }
            var candidate_1 = (_a = candidates[kind_1]) !== null && _a !== void 0 ? _a : '0';
            var found = (0, game_catalog_1.isCatalogSelectionValid)(kind_1, candidate_1);
            var assigned = found && candidate_1 === selected_1;
            var $resource = $('<section class="sd-tip sd-setup-resource">');
            $resource.append($('<label for="sd-setup-resource-select">').text("Gespeicherte ".concat(name_1, " w\u00E4hlen")));
            var $select_1 = $('<select id="sd-setup-resource-select">').append($('<option value="0">').text("Bitte ".concat(name_1, " w\u00E4hlen")));
            entries.forEach(function (entry) { return $select_1.append($('<option>').val(entry.id).text(entry.name)); });
            $select_1.val(candidate_1).on('change', function () { candidates[kind_1] = String($select_1.val()); chosen[kind_1] = true; render(false); });
            $resource.append($select_1);
            var $checks = $('<ul class="sd-setup-checks" aria-label="Prüfung">');
            $('<li>').addClass(found ? 'sd-check-done' : 'sd-check-pending').text("".concat(found ? '✓' : '○', " ").concat(name_1, " im Spiel gefunden")).appendTo($checks);
            $('<li>').addClass(assigned ? 'sd-check-done' : 'sd-check-pending').text("".concat(assigned ? '✓' : '○', " Als SD-").concat(name_1, " festgelegt")).appendTo($checks);
            $resource.append($checks);
            $('<button type="button" class="sd-button">').text("Als SD-".concat(name_1, " festlegen")).prop('disabled', !found).on('click', function () {
                if (!(0, game_catalog_1.isCatalogSelectionValid)(kind_1, candidate_1))
                    return;
                if (kind_1 === 'groups')
                    storage.setSdGroupId = candidate_1;
                else
                    storage.setSelectedTemplate = candidate_1;
                document.dispatchEvent(new Event('sd-catalog-updated'));
            }).appendTo($resource);
            $card.append($resource);
        }
        if (!here || step === exports.setupSteps.length - 1) {
            var href = step === exports.setupSteps.length - 1 ? (0, game_url_helper_1.buildGameUrl)('ally', { mode: 'forum' }) : (0, game_url_helper_1.buildGameUrl)(item.screen, { mode: item.mode, type: item.type });
            $('<a class="sd-button sd-primary" id="sd-setup-page-link">').attr('href', href).text(item.link).on('click', function () { return save(false); }).appendTo($card);
        }
        else
            $card.append($('<p class="sd-setup-status">').text('Du bist auf der passenden Seite. Nimm die Einstellung im Spiel vor und wähle dann „Weiter“.'));
        if (here && item.target) {
            var $target = $(item.target).first();
            $target.addClass('sd-setup-target');
            if (focus)
                (_c = (_b = $target[0]) === null || _b === void 0 ? void 0 : _b.scrollIntoView) === null || _c === void 0 ? void 0 : _c.call(_b, { block: 'center', behavior: 'smooth' });
        }
        var $actions = $('<div class="sd-setup-actions">');
        $('<button type="button" class="sd-button">Zurück</button>').prop('disabled', step === 0).on('click', function () { step--; render(); }).appendTo($actions);
        var needsSettings = step >= 2 && step <= 7 && !here;
        var validation = getSetupValidation(step);
        $('<button type="button" class="sd-button sd-primary" id="sd-setup-next">').text(step === exports.setupSteps.length - 1 ? 'Einrichtung abschließen' : 'Weiter').prop('disabled', needsSettings || !validation.valid).on('click', function () {
            if (!getSetupValidation(step).valid || needsSettings) {
                render(false);
                return;
            }
            if (step === exports.setupSteps.length - 1) {
                save(false, true);
                close();
                $label.text('Einrichtung neu starten');
                $open.trigger('focus');
            }
            else {
                step++;
                render();
            }
        }).appendTo($actions);
        $('<button type="button" class="sd-button">Später fortsetzen</button>').on('click', pause).appendTo($actions);
        $card.append($actions);
        $card.append($('<p id="sd-setup-validation" class="sd-setup-status" role="status">').text(validation.message));
        $('<button type="button" class="sd-button">Erneut prüfen</button>').on('click', function () { return void (0, game_catalog_1.refreshGameCatalogs)(); }).appendTo($card);
        $('body').append($card);
        (0, organizer_dock_1.dockOrganizerPanel)($card[0], { side: 'left', top: 140 });
        if (focus)
            $card.find('h2').trigger('focus');
        else if (previousFocus === null || previousFocus === void 0 ? void 0 : previousFocus.isConnected)
            previousFocus.focus({ preventScroll: true });
        else if (previousId)
            (_d = document.getElementById(previousId)) === null || _d === void 0 ? void 0 : _d.focus({ preventScroll: true });
    };
    $open.on('click', function (event) { var _a, _b, _c; event.preventDefault(); if ((_c = (_b = (_a = storage.getOnboarding) === null || _a === void 0 ? void 0 : _a.tours) === null || _b === void 0 ? void 0 : _b[SETUP_KEY]) === null || _c === void 0 ? void 0 : _c.complete)
        step = 0; render(); void (0, game_catalog_1.refreshGameCatalogs)(); });
    $open.on('keydown', function (event) { if (event.key === ' ') {
        event.preventDefault();
        $open.trigger('click');
    } });
    $(document).on('keydown.sdSetup', function (event) { if (event.key === 'Escape')
        pause(); }).on('sd-pause-setup.sdSetup', pause);
    $(document).on('sd-catalog-updated.sdSetup sd-catalog-validated.sdSetup sd-settings-changed.sdSetup', function () { if (active)
        render(false); });
    if (saved && !saved.paused && !saved.complete) {
        render();
        void (0, game_catalog_1.refreshGameCatalogs)();
    }
}
exports.initializeSetupOnboarding = initializeSetupOnboarding;


/***/ }),

/***/ 513:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.displayMassUt = void 0;
var mass_ut_selection_1 = __webpack_require__(215);
var pending_operation_1 = __webpack_require__(209);
var pending_operations_1 = __webpack_require__(658);
var local_storage_helper_1 = __webpack_require__(326);
var logging_helper_1 = __webpack_require__(56);
var tw_helper_1 = __webpack_require__(246);
var helper_functions_1 = __webpack_require__(424);
var game_url_helper_1 = __webpack_require__(579);
var table_domain_1 = __webpack_require__(219);
var log = logging_helper_1.Log.scope("mass-ut");
var UNIT_MINUTES_PER_FIELD = {
    spear: 16,
    sword: 22,
    axe: 16,
    archer: 16,
    spy: 9,
    light: 10,
    marcher: 10,
    heavy: 11,
    ram: 30,
    catapult: 30,
    knight: 10,
    snob: 35
};
var DEFAULT_TRAVEL_UNIT = "sword";
function summarizeThreadData(threadId, threadData) {
    return {
        threadId: threadId,
        threadName: threadData.threadName,
        forumId: threadData.forumId,
        sdPostId: threadData.sdPostId,
        bunkerInquiryCount: threadData.bunkerInquiryCache.length,
        sdRowCount: threadData.stateOfSdTable.size,
        packageCount: threadData.packagesSent.size
    };
}
function summarizeSendingRow(destinationVillageId, sendingObj, alreadySentAmount, packagesToSend) {
    var _a, _b, _c, _d, _e;
    return {
        destinationVillageId: destinationVillageId,
        sdId: (_a = sendingObj === null || sendingObj === void 0 ? void 0 : sendingObj.sdId) !== null && _a !== void 0 ? _a : null,
        coords: (_b = sendingObj === null || sendingObj === void 0 ? void 0 : sendingObj.coords) !== null && _b !== void 0 ? _b : null,
        leftAmount: (_c = sendingObj === null || sendingObj === void 0 ? void 0 : sendingObj.leftAmount) !== null && _c !== void 0 ? _c : null,
        alreadySentAmount: alreadySentAmount,
        packagesToSend: packagesToSend,
        dateFrom: (_d = sendingObj === null || sendingObj === void 0 ? void 0 : sendingObj.dateFrom) !== null && _d !== void 0 ? _d : "",
        dateUntil: (_e = sendingObj === null || sendingObj === void 0 ? void 0 : sendingObj.dateUntil) !== null && _e !== void 0 ? _e : ""
    };
}
function getConfiguredSwordMinutesPerField(localStorageService) {
    var configuredSwordMinutesPerField = localStorageService.getSwordLfz;
    return configuredSwordMinutesPerField > 0 ? configuredSwordMinutesPerField : 22;
}
function getConfiguredUnitMinutesPerField(unit, configuredSwordMinutesPerField) {
    var baseMinutesPerField = UNIT_MINUTES_PER_FIELD[unit];
    if (baseMinutesPerField === undefined) {
        return configuredSwordMinutesPerField;
    }
    return baseMinutesPerField * (configuredSwordMinutesPerField / 22);
}
function parseTemplateDefinition(rawValue) {
    if (rawValue.trim() === "") {
        return null;
    }
    try {
        return JSON.parse(rawValue);
    }
    catch (error) {
        log.warn("Failed to parse template option value", {
            rawValue: rawValue,
            error: error
        });
        return null;
    }
}
function resolveSelectedTemplateDefinition(pageState) {
    var _a;
    var $templateSelect = $("select[name='template']");
    var selectedOptionValue = String((_a = $templateSelect.find("option:selected").val()) !== null && _a !== void 0 ? _a : "").trim();
    var selectedTemplateFromDom = parseTemplateDefinition(selectedOptionValue);
    if (selectedTemplateFromDom) {
        return selectedTemplateFromDom;
    }
    if (pageState.selectedTemplate === "" || pageState.selectedTemplate === "0") {
        return null;
    }
    var matchingTemplate = null;
    $templateSelect.find("option").each(function () {
        var _a;
        var optionValue = String((_a = $(this).val()) !== null && _a !== void 0 ? _a : "").trim();
        var parsedTemplate = parseTemplateDefinition(optionValue);
        if (!parsedTemplate) {
            return;
        }
        if (String(parsedTemplate.id) === pageState.selectedTemplate) {
            matchingTemplate = parsedTemplate;
            return false;
        }
    });
    return matchingTemplate;
}
function resolveTemplateUsedUnits(templateDefinition) {
    if (!templateDefinition) {
        return [DEFAULT_TRAVEL_UNIT];
    }
    var usedUnits = new Set();
    Object.keys(UNIT_MINUTES_PER_FIELD).forEach(function (unit) {
        var _a;
        var configuredAmount = Number((_a = templateDefinition[unit]) !== null && _a !== void 0 ? _a : 0);
        if (!isNaN(configuredAmount) && configuredAmount !== 0) {
            usedUnits.add(unit);
        }
    });
    var useAllUnits = Array.isArray(templateDefinition.use_all) ? templateDefinition.use_all : [];
    useAllUnits.forEach(function (unit) {
        if (UNIT_MINUTES_PER_FIELD[unit] !== undefined) {
            usedUnits.add(unit);
        }
    });
    if (usedUnits.size === 0) {
        usedUnits.add(DEFAULT_TRAVEL_UNIT);
    }
    return Array.from(usedUnits);
}
function resolveTemplateTravelProfile(pageState, localStorageService) {
    var _a;
    var configuredSwordMinutesPerField = getConfiguredSwordMinutesPerField(localStorageService);
    var templateDefinition = resolveSelectedTemplateDefinition(pageState);
    var usedUnits = resolveTemplateUsedUnits(templateDefinition);
    var configuredSlowestUnit = (_a = usedUnits[0]) !== null && _a !== void 0 ? _a : DEFAULT_TRAVEL_UNIT;
    var configuredSlowestMinutesPerField = getConfiguredUnitMinutesPerField(configuredSlowestUnit, configuredSwordMinutesPerField);
    usedUnits.slice(1).forEach(function (unit) {
        var configuredMinutesPerField = getConfiguredUnitMinutesPerField(unit, configuredSwordMinutesPerField);
        if (configuredMinutesPerField >= configuredSlowestMinutesPerField) {
            configuredSlowestUnit = unit;
            configuredSlowestMinutesPerField = configuredMinutesPerField;
        }
    });
    return {
        templateId: (templateDefinition === null || templateDefinition === void 0 ? void 0 : templateDefinition.id) ? String(templateDefinition.id) : null,
        templateName: (templateDefinition === null || templateDefinition === void 0 ? void 0 : templateDefinition.name) ? String(templateDefinition.name) : null,
        usedUnits: usedUnits,
        configuredSlowestUnit: configuredSlowestUnit,
        configuredSlowestMinutesPerField: configuredSlowestMinutesPerField
    };
}
function readCurrentTargetCoords() {
    var _a;
    var targetText = $("#place_target .village-name").first().text().trim();
    var coordsMatch = targetText.match(/(\d{3}\|\d{3})/);
    return (_a = coordsMatch === null || coordsMatch === void 0 ? void 0 : coordsMatch[1]) !== null && _a !== void 0 ? _a : null;
}
function parseDisplayedDistance(value) {
    var normalizedValue = value.trim().replace(",", ".");
    var parsedValue = parseFloat(normalizedValue);
    return isNaN(parsedValue) ? 0 : parsedValue;
}
function parseTravelTimeTitleToMs(title) {
    var timeMatch = title.match(/(\d+):(\d{2}):(\d{2})/);
    if (!timeMatch) {
        return 0;
    }
    var hours = parseInt(timeMatch[1], 10);
    var minutes = parseInt(timeMatch[2], 10);
    var seconds = parseInt(timeMatch[3], 10);
    if ([hours, minutes, seconds].some(function (value) { return isNaN(value); })) {
        return 0;
    }
    return (((hours * 60) + minutes) * 60 + seconds) * 1000;
}
function readDisplayedSwordTravelTimeMs($row) {
    var _a;
    var title = String((_a = $row.find("td[data-unit='sword']").attr("data-title")) !== null && _a !== void 0 ? _a : "");
    return parseTravelTimeTitleToMs(title);
}
function readDisplayedUnitTravelTimeMs($row, unit) {
    var _a;
    var title = String((_a = $row.find("td[data-unit='".concat(unit, "']")).attr("data-title")) !== null && _a !== void 0 ? _a : "");
    return parseTravelTimeTitleToMs(title);
}
function readDisplayedRowDistance($row) {
    var _a;
    return parseDisplayedDistance(String((_a = $row.find("td").eq(1).text()) !== null && _a !== void 0 ? _a : ""));
}
function resolveSupportSpeedInsights(localStorageService) {
    var configuredSwordMsPerField = getConfiguredSwordMinutesPerField(localStorageService) * 60 * 1000;
    var samples = [];
    $(".call-village").each(function () {
        var $row = $(this);
        var displayedDistance = readDisplayedRowDistance($row);
        var displayedSwordTravelTimeMs = readDisplayedSwordTravelTimeMs($row);
        if (displayedDistance <= 0 || displayedSwordTravelTimeMs <= 0) {
            return;
        }
        samples.push(displayedSwordTravelTimeMs / displayedDistance);
    });
    var effectiveSwordMsPerField = samples.length > 0
        ? samples.reduce(function (sum, sample) { return sum + sample; }, 0) / samples.length
        : configuredSwordMsPerField;
    var speedModifier = configuredSwordMsPerField > 0
        ? effectiveSwordMsPerField / configuredSwordMsPerField
        : 1;
    var boostPercent = Math.max(0, (1 - speedModifier) * 100);
    var isBoostActive = Math.abs(speedModifier - 1) > 0.01;
    return {
        configuredSwordMsPerField: configuredSwordMsPerField,
        effectiveSwordMsPerField: effectiveSwordMsPerField,
        speedModifier: speedModifier,
        boostPercent: boostPercent,
        sampleCount: samples.length,
        isBoostActive: isBoostActive
    };
}
function resolveRowTemplateUnit($row, templateTravelProfile, configuredSwordMinutesPerField) {
    var resolvedUnit = null;
    var resolvedMinutesPerField = 0;
    templateTravelProfile.usedUnits.forEach(function (unit) {
        var _a;
        var availableCount = parseInt(String((_a = $row.find("td[data-unit='".concat(unit, "']")).attr("data-count")) !== null && _a !== void 0 ? _a : "0"), 10);
        if (isNaN(availableCount) || availableCount <= 0) {
            return;
        }
        var configuredMinutesPerField = getConfiguredUnitMinutesPerField(unit, configuredSwordMinutesPerField);
        if (configuredMinutesPerField >= resolvedMinutesPerField) {
            resolvedUnit = unit;
            resolvedMinutesPerField = configuredMinutesPerField;
        }
    });
    if (resolvedUnit === null) {
        return {
            unit: templateTravelProfile.configuredSlowestUnit,
            configuredMinutesPerField: templateTravelProfile.configuredSlowestMinutesPerField
        };
    }
    return {
        unit: resolvedUnit,
        configuredMinutesPerField: resolvedMinutesPerField
    };
}
function resolveRowTravelTime($row, sendingObj, supportSpeedInsights, templateTravelProfile) {
    var rowTemplateUnit = resolveRowTemplateUnit($row, templateTravelProfile, supportSpeedInsights.configuredSwordMsPerField / 60000);
    var displayedTemplateUnitTravelTimeMs = readDisplayedUnitTravelTimeMs($row, rowTemplateUnit.unit);
    var displayedDistance = readDisplayedRowDistance($row);
    if (displayedTemplateUnitTravelTimeMs > 0 && displayedDistance > 0) {
        return {
            travelTimeMs: displayedTemplateUnitTravelTimeMs,
            distance: displayedDistance,
            source: "displayedTemplateUnitTime",
            unit: rowTemplateUnit.unit
        };
    }
    if (displayedDistance > 0) {
        return {
            travelTimeMs: displayedDistance * rowTemplateUnit.configuredMinutesPerField * 60 * 1000 * supportSpeedInsights.speedModifier,
            distance: displayedDistance,
            source: "calculatedTemplateUnitTime",
            unit: rowTemplateUnit.unit
        };
    }
    var sourceCoords = (0, tw_helper_1.villageBBCodeToCoordinates)($row.find("a").text().trim());
    var destinationCoords = (0, tw_helper_1.villageBBCodeToCoordinates)(sendingObj.coords);
    var coordinateDistance = Number((0, tw_helper_1.distanceXY)(sourceCoords, destinationCoords).toFixed(3));
    return {
        travelTimeMs: coordinateDistance * rowTemplateUnit.configuredMinutesPerField * 60 * 1000 * supportSpeedInsights.speedModifier,
        distance: coordinateDistance,
        source: "coords",
        unit: rowTemplateUnit.unit
    };
}
function hasDateConstraint(row) {
    var _a, _b;
    var dateFrom = String((_a = row.dateFrom) !== null && _a !== void 0 ? _a : "").trim();
    var dateUntil = String((_b = row.dateUntil) !== null && _b !== void 0 ? _b : "").trim();
    return (dateFrom !== "" && dateFrom !== "0") || (dateUntil !== "" && dateUntil !== "0");
}
function buildRepeatSendUrl(pageState, threadId, targetVillageId, sendingObj) {
    var nextUrl = new URL((0, game_url_helper_1.buildMassUtCallUrl)(targetVillageId), window.location.origin);
    nextUrl.searchParams.set("sdTableId", threadId);
    nextUrl.searchParams.set("dir", "0");
    if (pageState.automateMassenUt) {
        if (pageState.sdGroupId !== "" && pageState.sdGroupId !== "0") {
            nextUrl.searchParams.set("group", pageState.sdGroupId);
        }
        if (pageState.sortBy !== "" && pageState.sortBy !== "default") {
            nextUrl.searchParams.set("order", pageState.sortBy);
        }
    }
    if (hasDateConstraint(sendingObj)) {
        nextUrl.searchParams.set("order", "distance");
        nextUrl.searchParams.set("dir", "1");
    }
    return nextUrl.toString();
}
function resolveRepeatSendTarget(pageState, localStorageService) {
    var _a;
    var targetVillageId = pageState.destinationVillageId;
    var targetCoords = readCurrentTargetCoords();
    var allThreads = localStorageService.getAllThreads;
    var matches = [];
    Object.entries(allThreads).forEach(function (_a) {
        var _b = __read(_a, 2), threadId = _b[0], threadData = _b[1];
        if (targetVillageId) {
            var sendingObjByVillageId = threadData.stateOfSdTable.get(Number(targetVillageId));
            if (sendingObjByVillageId) {
                matches.push({
                    threadId: threadId,
                    sendingObj: sendingObjByVillageId,
                    returnUrl: buildRepeatSendUrl(pageState, threadId, targetVillageId, sendingObjByVillageId),
                    matchedBy: "villageId"
                });
                return;
            }
        }
        if (!targetCoords) {
            return;
        }
        var matchingEntryByCoords = Array.from(threadData.stateOfSdTable.entries()).find(function (_a) {
            var _b = __read(_a, 2), _ = _b[0], row = _b[1];
            return row.coords === targetCoords;
        });
        if (!matchingEntryByCoords) {
            return;
        }
        var _c = __read(matchingEntryByCoords, 2), matchedVillageId = _c[0], sendingObjByCoords = _c[1];
        matches.push({
            threadId: threadId,
            sendingObj: sendingObjByCoords,
            returnUrl: buildRepeatSendUrl(pageState, threadId, String(matchedVillageId), sendingObjByCoords),
            matchedBy: "coords"
        });
    });
    if (matches.length === 0) {
        log.info("No matching SD target found for repeat-send button", {
            targetVillageId: targetVillageId,
            targetCoords: targetCoords
        });
        return null;
    }
    var preferredMatch = pageState.refererThreadId
        ? (_a = matches.find(function (match) { return match.threadId === pageState.refererThreadId; })) !== null && _a !== void 0 ? _a : matches[0]
        : matches[0];
    if (matches.length > 1) {
        log.warn("Found multiple SD targets for repeat-send button; using first matching entry", {
            targetVillageId: targetVillageId,
            targetCoords: targetCoords,
            preferredThreadId: preferredMatch.threadId,
            candidateThreadIds: matches.map(function (match) { return match.threadId; })
        });
    }
    return preferredMatch;
}
function renderRepeatSendButton(repeatSendTarget) {
    var $anchorButton = $(".evt-button-fill").first().length > 0
        ? $(".evt-button-fill").first()
        : $("#place_call_form_submit").first();
    if ($anchorButton.length === 0) {
        log.warn("No anchor button found for repeat-send button");
        return;
    }
    var $repeatButton = $("#sd-repeat-send-button");
    if ($repeatButton.length === 0) {
        $repeatButton = $('<input type="button" id="sd-repeat-send-button" class="btn" value="SD erneut schicken" style="margin-left: 8px;">');
        $anchorButton.after($repeatButton);
    }
    var isEnabled = repeatSendTarget !== null;
    $repeatButton.prop("disabled", !isEnabled)
        .css("opacity", isEnabled ? "1" : "0.5")
        .attr("title", isEnabled
        ? "Ruft die Massen-UT-Seite mit SD-Parametern erneut auf."
        : "Zieldorf wurde in keiner gespeicherten SD-Tabelle gefunden.");
    $repeatButton.off(".sdRepeatSend");
    $repeatButton.on("click.sdRepeatSend", function () {
        if (!repeatSendTarget) {
            return;
        }
        log.info("Navigating via repeat-send button", {
            threadId: repeatSendTarget.threadId,
            matchedBy: repeatSendTarget.matchedBy,
            targetCoords: repeatSendTarget.sendingObj.coords,
            returnUrl: repeatSendTarget.returnUrl
        });
        window.location.href = repeatSendTarget.returnUrl;
    });
}
function displayMassUt(pageContext) {
    log.info("Initializing mass-ut controller", { href: window.location.href });
    storeGroupData();
    storeTemplateData();
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    var pageState = readPageState(pageContext, localStorageService);
    log.state("Mass-ut route params", {
        refererThreadId: pageState.refererThreadId,
        destinationVillageId: pageState.destinationVillageId,
        automateMassenUt: pageState.automateMassenUt,
        preventDuplicateDestination: pageState.preventDuplicateDestination,
        sdGroupId: pageState.sdGroupId,
        sortBy: pageState.sortBy,
        duplicateSendingEnabled: !pageState.preventDuplicateDestination
    });
    var repeatSendTarget = resolveRepeatSendTarget(pageState, localStorageService);
    renderRepeatSendButton(repeatSendTarget);
    if (pageState.refererThreadId === null) {
        log.info("No sdTableId present; only caching groups, templates and repeat-send target on this page");
        return;
    }
    renderGroupLinks(pageState.refererThreadId);
    if (!pageState.threadData) {
        log.warn("No thread data found for sdTableId", { refererThreadId: pageState.refererThreadId });
        return;
    }
    log.state("Loaded thread data snapshot", summarizeThreadData(pageState.refererThreadId, pageState.threadData));
    applyTemplateSelection(pageState);
    var derivedState = deriveState(pageState);
    if (!derivedState.sendingObj) {
        log.warn("No SD row found for destination village", {
            refererThreadId: pageState.refererThreadId,
            destinationVillageId: pageState.destinationVillageId
        });
        return;
    }
    renderAutoSelection(pageState, derivedState, localStorageService);
    bindEvents(pageState, derivedState, localStorageService);
}
exports.displayMassUt = displayMassUt;
function readPageState(pageContext, localStorageService) {
    var _a;
    var refererThreadId = (_a = pageContext.query.sdTableId) !== null && _a !== void 0 ? _a : null;
    return {
        refererThreadId: refererThreadId,
        destinationVillageId: pageContext.targetVillageId,
        automateMassenUt: localStorageService.getAutomateMassenUt,
        preventDuplicateDestination: localStorageService.getPreventDuplicateDestination,
        sdGroupId: localStorageService.getSdGroupId,
        sortBy: localStorageService.getSortBy,
        selectedTemplate: localStorageService.getSelectedTemplate,
        threadData: refererThreadId ? localStorageService.getThreadData(refererThreadId) : undefined
    };
}
function deriveState(pageState) {
    var _a, _b, _c, _d, _e;
    var sendingObj = (_a = pageState.threadData) === null || _a === void 0 ? void 0 : _a.stateOfSdTable.get(Number(pageState.destinationVillageId));
    var alreadySentAmount = sendingObj
        ? parseInt(String((_b = pageState.threadData) === null || _b === void 0 ? void 0 : _b.packagesSent.get(sendingObj.sdId)), 10) || 0
        : 0;
    var packagesToSend = sendingObj ? (0, table_domain_1.calculatePackagesToSend)(sendingObj.leftAmount, (_c = pageState.threadData) === null || _c === void 0 ? void 0 : _c.packagesSent.get(sendingObj.sdId), pageState.preventDuplicateDestination) : 0;
    var epochDateUntil = (0, helper_functions_1.parseGermanDate)((_d = sendingObj === null || sendingObj === void 0 ? void 0 : sendingObj.dateUntil) !== null && _d !== void 0 ? _d : "");
    var epochDateFrom = (0, helper_functions_1.parseGermanDate)((_e = sendingObj === null || sendingObj === void 0 ? void 0 : sendingObj.dateFrom) !== null && _e !== void 0 ? _e : "");
    if ((alreadySentAmount > 0 && pageState.preventDuplicateDestination) || packagesToSend < 0) {
        packagesToSend = 0;
    }
    return {
        sendingObj: sendingObj,
        alreadySentAmount: alreadySentAmount,
        packagesToSend: packagesToSend,
        epochDateFrom: epochDateFrom,
        epochDateUntil: epochDateUntil
    };
}
function renderGroupLinks(refererThreadId) {
    $(".group-menu-item").each(function () {
        var currentHref = $(this).attr("href");
        if (!currentHref) {
            return;
        }
        var newHref = new URL(currentHref, window.location.origin);
        newHref.searchParams.set("sdTableId", refererThreadId);
        $(this).attr("href", newHref.toString());
    });
}
function applyTemplateSelection(pageState) {
    if (!pageState.automateMassenUt) {
        return;
    }
    var matchingTemplateFound = false;
    $("select[name='template'] > option").each(function () {
        var optionValue = $(this).val();
        if (!optionValue) {
            return;
        }
        var optionObj = parseTemplateDefinition(String(optionValue));
        if (optionObj && String(optionObj.id) === pageState.selectedTemplate) {
            $(this).prop("selected", true);
            matchingTemplateFound = true;
            return false;
        }
    });
    log.info("Template auto-selection completed", {
        selectedTemplate: pageState.selectedTemplate,
        matchingTemplateFound: matchingTemplateFound
    });
}
function renderAutoSelection(pageState, derivedState, localStorageService) {
    var _a, _b, _c, _d, _e;
    var sendingObj = derivedState.sendingObj, alreadySentAmount = derivedState.alreadySentAmount, packagesToSend = derivedState.packagesToSend, epochDateFrom = derivedState.epochDateFrom, epochDateUntil = derivedState.epochDateUntil;
    if (!sendingObj) {
        return;
    }
    var supportSpeedInsights = resolveSupportSpeedInsights(localStorageService);
    var templateTravelProfile = resolveTemplateTravelProfile(pageState, localStorageService);
    var selectionEvaluations = [];
    var selectionStartIso = epochDateFrom > 0 ? new Date(epochDateFrom).toISOString() : null;
    var selectionEndIso = epochDateUntil > 0 ? new Date(epochDateUntil).toISOString() : null;
    log.info("Computed sending target", summarizeSendingRow(pageState.destinationVillageId, sendingObj, alreadySentAmount, packagesToSend));
    log.state("Date window for package selection", {
        dateFrom: epochDateFrom > 0 ? new Date(epochDateFrom).toISOString() : null,
        dateUntil: epochDateUntil > 0 ? new Date(epochDateUntil).toISOString() : null,
        configuredSwordMinutesPerField: supportSpeedInsights.configuredSwordMsPerField / 60000,
        effectiveSwordMinutesPerField: Number((supportSpeedInsights.effectiveSwordMsPerField / 60000).toFixed(3)),
        speedModifier: Number(supportSpeedInsights.speedModifier.toFixed(4)),
        boostPercent: Number(supportSpeedInsights.boostPercent.toFixed(2)),
        isBoostActive: supportSpeedInsights.isBoostActive,
        sampleCount: supportSpeedInsights.sampleCount,
        templateId: templateTravelProfile.templateId,
        templateName: templateTravelProfile.templateName,
        templateUsedUnits: templateTravelProfile.usedUnits,
        configuredSlowestTemplateUnit: templateTravelProfile.configuredSlowestUnit,
        configuredSlowestTemplateMinutesPerField: templateTravelProfile.configuredSlowestMinutesPerField
    });
    log.state("Mass-ut checkbox selection boundaries", {
        selectionStartIso: selectionStartIso,
        selectionEndIso: selectionEndIso,
        initialPackagesToSend: packagesToSend,
        destinationCoords: sendingObj.coords,
        targetVillageId: pageState.destinationVillageId,
        templateId: templateTravelProfile.templateId,
        templateName: templateTravelProfile.templateName,
        templateUsedUnits: templateTravelProfile.usedUnits,
        configuredSlowestTemplateUnit: templateTravelProfile.configuredSlowestUnit,
        configuredSlowestTemplateMinutesPerField: templateTravelProfile.configuredSlowestMinutesPerField,
        configuredSwordMinutesPerField: supportSpeedInsights.configuredSwordMsPerField / 60000,
        effectiveSwordMinutesPerField: Number((supportSpeedInsights.effectiveSwordMsPerField / 60000).toFixed(3)),
        speedModifier: Number(supportSpeedInsights.speedModifier.toFixed(4)),
        boostPercent: Number(supportSpeedInsights.boostPercent.toFixed(2))
    });
    $(".troop-request-selector:checked").each(function () { (0, mass_ut_selection_1.setCheckboxState)($(this), false); });
    $(".unit_checkbox").each(function () {
        if (!$(this).is(":checked")) {
            $(this).trigger("click");
        }
    });
    {
        var currentTime_1 = Date.now();
        $(".call-village").each(function (index) {
            var _a, _b;
            var $row = $(this);
            var villageId = String((_a = $row.find(".troop-request-selector").data("village-id")) !== null && _a !== void 0 ? _a : "");
            var sourceCoords = (0, tw_helper_1.villageBBCodeToCoordinates)($row.find("a").text().trim());
            var travelTimeResolution = resolveRowTravelTime($row, sendingObj, supportSpeedInsights, templateTravelProfile);
            var arrival = currentTime_1 + travelTimeResolution.travelTimeMs;
            var packagesRemainingBeforeSelection = packagesToSend;
            var fromIsSet = epochDateFrom > 0;
            var untilIsSet = epochDateUntil > 0;
            var withinFrom = fromIsSet ? arrival >= epochDateFrom : true;
            var withinUntil = untilIsSet ? arrival <= epochDateUntil : true;
            var selected = packagesToSend > 0 && withinFrom && withinUntil && Number.isFinite(arrival) && !$row.find(".troop-request-selector").prop("disabled")
                && (0, mass_ut_selection_1.hasEnoughTemplateTroops)($row, String((_b = $('select[name=template]').val()) !== null && _b !== void 0 ? _b : ''));
            var skipReason = null;
            if (!selected) {
                skipReason = packagesToSend <= 0 ? "packages-exhausted" : "outside-window";
            }
            log.trace("Evaluated candidate village", {
                index: index,
                villageId: villageId,
                sourceCoords: sourceCoords,
                destinationCoords: sendingObj.coords,
                distance: Number(travelTimeResolution.distance.toFixed(3)),
                travelTimeHours: Number((travelTimeResolution.travelTimeMs / 3600000).toFixed(3)),
                travelTimeSource: travelTimeResolution.source,
                slowestTemplateUnit: travelTimeResolution.unit,
                arrivalIso: Number.isFinite(arrival) ? new Date(arrival).toISOString() : "ungültig",
                fromIso: fromIsSet ? new Date(epochDateFrom).toISOString() : null,
                untilIso: untilIsSet ? new Date(epochDateUntil).toISOString() : null,
                withinFrom: withinFrom,
                withinUntil: withinUntil,
                selected: selected,
                skipReason: skipReason,
                packagesRemainingBeforeSelection: packagesRemainingBeforeSelection
            });
            if (selected) {
                (0, mass_ut_selection_1.setCheckboxState)($row.find(".troop-request-selector"), true);
                packagesToSend--;
            }
            selectionEvaluations.push({
                index: index,
                villageId: villageId,
                sourceCoords: sourceCoords,
                distance: Number(travelTimeResolution.distance.toFixed(3)),
                travelTimeHours: Number((travelTimeResolution.travelTimeMs / 3600000).toFixed(3)),
                travelTimeSource: travelTimeResolution.source,
                slowestTemplateUnit: travelTimeResolution.unit,
                arrivalIso: Number.isFinite(arrival) ? new Date(arrival).toISOString() : "ungültig",
                fromIso: selectionStartIso,
                untilIso: selectionEndIso,
                withinFrom: withinFrom,
                withinUntil: withinUntil,
                selected: selected,
                skipReason: skipReason,
                packagesRemainingBeforeSelection: packagesRemainingBeforeSelection,
                packagesRemainingAfterSelection: packagesToSend
            });
        });
    }
    derivedState.packagesToSend = packagesToSend;
    var selectedEvaluations = selectionEvaluations.filter(function (evaluation) { return evaluation.selected; });
    var lastSelectedEvaluation = selectedEvaluations.length > 0
        ? selectedEvaluations[selectedEvaluations.length - 1]
        : null;
    var firstRejectedEvaluation = (_a = selectionEvaluations.find(function (evaluation) { return !evaluation.selected; })) !== null && _a !== void 0 ? _a : null;
    if (selectionEvaluations.length > 0) {
        log.state("Mass-ut checkbox selection evaluation", {
            totalCandidatesEvaluated: selectionEvaluations.length,
            selectedCandidateCount: selectedEvaluations.length,
            remainingPackagesAfterSelection: packagesToSend,
            lastSelectedEvaluation: lastSelectedEvaluation,
            firstRejectedEvaluation: firstRejectedEvaluation,
            evaluations: selectionEvaluations
        });
    }
    log.info("Auto-selection completed", {
        checkedBoxes: $(".troop-request-selector:checked").length,
        packagesRemainingAfterSelection: packagesToSend,
        selectionStartIso: selectionStartIso,
        selectionEndIso: selectionEndIso,
        selectedCandidateCount: selectedEvaluations.length,
        lastSelectedVillageId: (_b = lastSelectedEvaluation === null || lastSelectedEvaluation === void 0 ? void 0 : lastSelectedEvaluation.villageId) !== null && _b !== void 0 ? _b : null,
        lastSelectedArrivalIso: (_c = lastSelectedEvaluation === null || lastSelectedEvaluation === void 0 ? void 0 : lastSelectedEvaluation.arrivalIso) !== null && _c !== void 0 ? _c : null,
        firstRejectedVillageId: (_d = firstRejectedEvaluation === null || firstRejectedEvaluation === void 0 ? void 0 : firstRejectedEvaluation.villageId) !== null && _d !== void 0 ? _d : null,
        firstRejectedArrivalIso: (_e = firstRejectedEvaluation === null || firstRejectedEvaluation === void 0 ? void 0 : firstRejectedEvaluation.arrivalIso) !== null && _e !== void 0 ? _e : null
    });
    $("#place_call_form_submit").prop("disabled", true);
    $(".evt-button-fill").attr("title", "Auswahl prüfen und mit Übernehmen einfüllen");
}
function bindEvents(pageState, derivedState, localStorageService) {
    var _a;
    if (!pageState.refererThreadId || !pageState.threadData || !derivedState.sendingObj) {
        return;
    }
    var refererThreadId = pageState.refererThreadId;
    var sendingObj = derivedState.sendingObj;
    $(".evt-button-fill").on("click", function () {
        $(this).prop("disabled", true);
        $("#place_call_form_submit").prop("disabled", false);
        $("#place_call_form_submit").attr("title", "Auswahl prüfen und mit Übernehmen einfüllen");
        log.info("User confirmed auto-filled selection", {
            checkedBoxes: $(".troop-request-selector:checked").length
        });
    });
    var pendingId = '';
    (_a = document.querySelector('#place_call_form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (event) {
        var checkedBoxes = $('.troop-request-selector:checked:not(:disabled)').length;
        if (!checkedBoxes)
            return;
        if (pendingId && (0, pending_operation_1.readPendingOperations)().some(function (op) { return op.id === pendingId; })) {
            event.preventDefault();
            event.stopImmediatePropagation();
            UI.ErrorMessage('Bitte den offenen Versand bestätigen oder verwerfen, bevor erneut gesendet wird.', 5000);
            return false;
        }
        try {
            var operation = (0, pending_operation_1.createPendingOperation)({ kind: 'send', threadId: refererThreadId,
                villageId: Number(pageState.destinationVillageId), requestId: sendingObj.sdId, amount: checkedBoxes, leftAmount: sendingObj.leftAmount });
            pendingId = operation.id;
            (0, pending_operations_1.showPendingOperations)();
        }
        catch (error) {
            event.preventDefault();
            event.stopImmediatePropagation();
            UI.ErrorMessage('Versandstatus konnte nicht gespeichert werden. Bitte Browserspeicher prüfen.', 5000);
            return false;
        }
    }, true);
}
function storeGroupData() {
    var groupEntries = [];
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    $(".vis_item").find(".group-menu-item").each(function () {
        var groupId = $(this).attr("data-group-id");
        var groupName = $(this).text().trim().slice(1, -1);
        if (groupId !== undefined && groupName !== undefined) {
            groupEntries.push({ id: groupId, name: groupName });
            return;
        }
        log.error("Group id or group name is undefined");
    });
    localStorageService.setGroupData = groupEntries;
    log.info("Cached mass-ut group data", { groupCount: groupEntries.length });
}
function storeTemplateData() {
    var optionArray = [];
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    $("select[name='template'] > option").each(function () {
        var _a;
        if ($(this).val() === "") {
            return;
        }
        var optionValue = String($(this).val());
        var optionObj = parseTemplateDefinition(optionValue);
        if (optionObj)
            optionArray.push({ id: String(optionObj.id), name: (_a = optionObj.name) !== null && _a !== void 0 ? _a : String(optionObj.id) });
    });
    localStorageService.setTemplateData = optionArray;
    log.info("Cached mass-ut template data", { templateCount: optionArray.length });
}


/***/ }),

/***/ 926:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createNewTable = void 0;
var organizer_style_1 = __webpack_require__(409);
var tw_helper_1 = __webpack_require__(246);
var local_storage_helper_1 = __webpack_require__(326);
var logging_helper_1 = __webpack_require__(56);
var forum_quick_settings_1 = __webpack_require__(585);
var log = logging_helper_1.Log.scope("new-thread");
var DEFAULT_THREAD_TITLE = 'SD Tabelle';
function createNewTable(pageContext) {
    var _a;
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    log.info("Initializing new-thread controller", { href: pageContext.href });
    sessionStorage.removeItem("sd-created-title");
    (0, forum_quick_settings_1.addForumQuickSettings)();
    if (!(0, tw_helper_1.isUserForumMod)()) {
        $('#sd-forum-quick-settings .sd-organizer-body').empty().append($('<p>').text('SD-Tabellen können Forenmoderatoren hier erstellen.'));
        return;
    }
    var $panel = $("#sd-forum-quick-settings");
    $panel.css("width", "330px").find(".sd-organizer-body").empty().append("\n      <div style=\"font-weight:bold\">Neue SD-Tabelle</div>\n      <p>Infanterie eingeben: Speer, Schwert und gegebenenfalls Bogen werden gleich skaliert. Sp\u00E4her: 5 %.</p>\n      <div class=\"inputCollection\"></div>\n      <input type=\"button\" class=\"btn\" id=\"newPaketLine\" value=\"Weiteres Paket\" style=\"margin:10px 0\">\n      <input type=\"button\" class=\"btn\" id=\"setupTable\" value=\"SD Tabelle generieren\">\n      <p id=\"sd-generator-error\" class=\"sd-organizer-error\" role=\"alert\"></p>");
    var addRow = function () {
        var units = __spreadArray(__spreadArray([{ unit: 'spear', name: 'Speer', field: 'inputSpear' }, { unit: 'sword', name: 'Schwert', field: 'inputSword' }], __read((game_data.units.includes('archer') ? [{ unit: 'archer', name: 'Bogen', field: 'inputBow' }] : [])), false), [{ unit: 'spy', name: 'Späher', field: 'inputSpy' }], false);
        var $row = $('<div class="sd-package-row">');
        units.forEach(function (_a) {
            var unit = _a.unit, name = _a.name, field = _a.field;
            return $row.append("<label><img src=\"/graphic/unit/unit_".concat(unit, "@2x.png\" alt=\"").concat(name, "\" title=\"").concat(name, "\"><input type=\"number\" min=\"0\" step=\"1\" class=\"").concat(field, "\" aria-label=\"").concat(name, "\"></label>"));
        });
        $panel.find('.inputCollection').append($row);
    };
    addRow();
    (0, organizer_style_1.keepOrganizerInViewport)($panel);
    $panel.off('.sdGenerator').on('click.sdGenerator', '#newPaketLine', addRow)
        .on('click.sdGenerator', '.sd-package-row input', function () { if ($(this).val() !== '')
        $(this).val(''); })
        .on('input.sdGenerator', '.inputSpear,.inputSword,.inputBow', function () {
        if ($(this).val() === '')
            return;
        var amount = Number($(this).val());
        if (!Number.isSafeInteger(amount) || amount < 0)
            return;
        var $row = $(this).closest('.sd-package-row');
        $row.find('.inputSpear,.inputSword,.inputBow').val(amount);
        $row.find('.inputSpy').val(Math.round(amount * 0.05));
    }).on('click.sdGenerator', '#setupTable', newThread);
    var $form = $('#message').closest('form');
    $form.find('input[name=subject]').off('.sdTitleSuggestion')
        .on('click.sdTitleSuggestion', function () {
        var $title = $(this);
        if ($title.data('sd-title-suggestion') && $title.val() === DEFAULT_THREAD_TITLE)
            $title.val('');
        $title.removeData('sd-title-suggestion');
    }).on('input.sdTitleSuggestion', function () { $(this).removeData('sd-title-suggestion'); });
    (_a = $form[0]) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (event) {
        var _a, _b;
        if (String((_a = $form.find('input[name=subject]').val()) !== null && _a !== void 0 ? _a : '').trim().length < 3) {
            event.preventDefault();
            event.stopImmediatePropagation();
            $('#sd-generator-error').text('Bitte einen Titel mit mindestens 3 Zeichen eingeben.');
            $form.find('input[name=subject]').trigger('focus');
            return;
        }
        if ($form.data('sd-generated') && String($('#message').val()).startsWith('[b]SD Tabelle Paketsystem[/b]')) {
            try {
                localStorageService.setNewThread = true;
                sessionStorage.setItem('sd-created-title', String((_b = $form.find('input[name=subject]').val()) !== null && _b !== void 0 ? _b : '').trim());
                var knownIds = $('a[href*="thread_id="]').map(function (_, a) { return new URL(a.getAttribute('href'), location.href).searchParams.get('thread_id'); }).get();
                sessionStorage.setItem('sd-created-existing', JSON.stringify(knownIds));
            }
            catch (_c) {
                event.preventDefault();
                event.stopImmediatePropagation();
                $('#sd-generator-error').text('Die neue SD-Tabelle konnte nicht vorgemerkt werden. Bitte Browserspeicher prüfen.');
            }
        }
    }, true);
}
exports.createNewTable = createNewTable;
function newThread() {
    var _a;
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    var $inputs = $('#sd-forum-quick-settings .sd-package-row input');
    if ($inputs.toArray().some(function (input) { var _a; var raw = String((_a = $(input).val()) !== null && _a !== void 0 ? _a : ''); return raw !== '' && (!Number.isSafeInteger(Number(raw)) || Number(raw) < 0); })) {
        $('#sd-generator-error').text('Truppenzahlen müssen ganze, nicht negative Zahlen sein.');
        return;
    }
    $('#sd-generator-error').empty();
    var troopArray = [];
    // Collect values from input elements with the class 'inputSpear'
    var spear = $(".inputSpear").map(function () {
        return $(this).val();
    }).get();
    // Collect values from input elements with the class 'inputSword'
    var sword = $(".inputSword").map(function () {
        return $(this).val();
    }).get();
    // Collect values from input elements with the class 'inputBow' if 'archer' is included in game_data.units
    var bow = game_data.units.includes("archer") ? $(".inputBow").map(function () {
        return $(this).val();
    }).get() : null;
    var spy = $(".inputSpy").map(function () {
        return $(this).val();
    }).get();
    var allInputsEmpty = spear.every(function (val) { return val === ""; }) && sword.every(function (val) { return val === ""; }) && (!bow || bow.every(function (val) { return val === ""; })) && spy.every(function (val) { return val === ""; });
    // Set default values if all inputs are empty
    if (allInputsEmpty) {
        spear = spear.map(function () { return "100"; });
        sword = sword.map(function () { return "100"; });
        if (bow) {
            bow = bow.map(function () { return "100"; });
        }
        spy = spy.map(function () { return "5"; });
    }
    // Determine the maximum number of rows
    var maxRows = Math.max(spear.length, sword.length, bow ? bow.length : 0, spy.length);
    // Group values row by row
    for (var i = 0; i < maxRows; i++) {
        var row = [];
        row.push(spear[i] || "");
        row.push(sword[i] || "");
        if (bow) {
            row.push(bow[i] || "");
        }
        row.push(spy[i] || "");
        troopArray.push(row);
    }
    troopArray = troopArray.filter(function (row) { return row.some(function (value) { return value !== ""; }); });
    var paketText = createPaketHtml(troopArray);
    log.info("Generated package configuration for new SD thread", {
        packageCount: troopArray.length,
        usedDefaultValues: allInputsEmpty,
        includesArchers: game_data.units.includes("archer")
    });
    $("#message").closest("form").data("sd-generated", true);
    var text = "[b]SD Tabelle Paketsystem[/b]\n\n[table]\n[**]ID[||]Dorfkoordinaten[||]angefordert[||][color=#8d0100]noch ben\u00F6tigt[/color] [||]Spieler[||]Bemerkung[||]ab[||]bis[||][color=#001c83]Massen UT-Link[/color][/**]\n[/table]\n\n".concat(paketText, "\n\n[spoiler=Erkl\u00E4rung Paketsystem]Zur Vereinfachung des Standdeffschickens wird ein Paketsystem verwendet.\n- regt zum Splitten an\n- einheitliche Bunker und keine komischen Ausrutscher\n- Rechnung innerhalb des Skriptes einfacher :)\n- das Pflegen der Tabelle w\u00E4re auch ohne Skript einfacher\n\nEin Paket besteht aus einer festen hoffentlich sinnvollen (keine skav in sd splits) Anzahl an Einheiten.\nDadruch entstehen im Stamm einheitliche Bunker und keine komischen Ausrutscher. Durch diese Art des Deffens k\u00F6nnen Verluste aufgeteilt und schneller nachgebaut werden.\n[/spoiler]\n\n[spoiler=Erkl\u00E4rung SD Skript]\nDas SD Skript besteht seit dem Update aus mehreren Bereichen:\n- Spieloptionen ganz unten -> Settings: Hier k\u00F6nnen die Einstellungen f\u00FCr das Skript vorgenommen werden\n- Massenunterst\u00FCtzung: Hier\u00FCber wird die Deff verschickt und das Skript (wenn eingeschaltet) trackt wieviele Einheiten ben\u00F6tigt werden und im Anschluss geschickt wurde.\n- SD Tabelle: Die Sd Tabelle ist die \u00DCbersicht, welche Auskunft \u00FCber die Deffanfragen gibt. Es ist bei jedem Nutzer einzustellen in welchem Forum sich die SD Tabelle befindet. \u00D6ffne den Beitrag mit der SD-Tabelle und klicke im SD Organizer auf \u201EAls SD-Tabelle festlegen\u201C. Die Einf\u00FChrung im Organizer erkl\u00E4rt die wichtigsten Abl\u00E4ufe.\n- Bearbeiten und Erstellen von Posts:\n  ->\u00FCber den Button \"Bunker Anfragen\" wird eine neue Anfrage erstellt. Diese wird innerhalb einem UI bearbeitet.\n  ->\u00FCber den Button \"Bearbeitung eintragen\" werden die bisher bearbeiteten Anfragen in das Nachrichtenfenster eingetragen.\n\n\nHandling ohne das Skript: (wieso auch immer)\n[b]Beispiele: \nAnfordern:[/b]\n[code]\n567|123 200 \"TheHebel97\"ohne den Bunker front rip\"\"\n897|123 2 \"-EDM\"2 Pakete f\u00FCr Bruder Marwin\"\"\n234|123 444 \"alt_f4 \" mauer_f4\"\"\n432|848 222 \"Manu|RWE\"\"\"\n345|123 1 \"Andimacht\"\"\"\n345|123 1 \"\"\"\"\n  [/code]\n[b]Bearbeiten:[/b]\n [code] id5 20\n  2 20\n  1 70Pakete\n  1 done\n  [/code]\n\n\n[spoiler=Wissenswertes f\u00FCr SFs]\nMoin SFs:\n- postCache Spoiler ignorieren und nicht bearbeiten\n- nun muss jeder im Stamm das entsprechende Skript installieren um von den Neuerungen zu profitieren (gl beim einrichten xD)\n- um Filter und \u00E4hnliches in Massen Ut auszuf\u00FChren, muss das Setting in den Spieleinstellungen aktiviert werden\n- Die Einrichtung startet im Forum neben \u201ENeuer Thread\u201C und \u201ENeue Umfrage\u201C. Gruppen und Truppen-Vorlagen werden direkt auf ihren Spielseiten erkannt und in den Settings aktualisiert; ein zus\u00E4tzlicher Besuch auf Massen UT zum Einlesen ist nicht n\u00F6tig.\n- f\u00FCr die normalen Nutzer ist das Textfeld blockiert, dies kann durch einen Doppelklick entfernt werden. Das dient dazu, dass die Sd posts clean bleiben. Sozialer Overhead in der SD Tabelle ist nicht erw\u00FCnscht.\n- normale Nutzer haben ebenfalls keine bearbeiten Funktionen im sd Thread, au\u00DFerdem sehen diese keine posts\n\n[/spoiler]\n[spoiler=postCache]\n[/spoiler]\n[/spoiler]\n\n");
    $("#message").val(text);
    var $title = $('#message').closest('form').find('input[name=subject]');
    if (String((_a = $title.val()) !== null && _a !== void 0 ? _a : '').trim() === '') {
        $title.val(DEFAULT_THREAD_TITLE).data('sd-title-suggestion', true);
    }
    log.info("Inserted generated SD thread template into message textarea", {
        messageLength: text.length
    });
}
var createPaketHtml = function (troopArray) {
    var text = "";
    troopArray.forEach(function (row, index) {
        text += "[b]Paket ".concat(index + 1, ":[/b]\n");
        text += "[unit]spear[/unit] ".concat(row[0] || 0, " ");
        text += "[unit]sword[/unit] ".concat(row[1] || 0, " ");
        if (row.length > 3) {
            text += "[unit]archer[/unit] ".concat(row[2] || 0, " ");
        }
        text += "[unit]spy[/unit] ".concat(row[row.length - 1] || 0, "\n ");
        text += "\n";
    });
    return text;
};


/***/ }),

/***/ 858:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.displaySettings = void 0;
var game_catalog_1 = __webpack_require__(444);
var organizer_style_1 = __webpack_require__(409);
var local_storage_helper_1 = __webpack_require__(326);
var logging_helper_1 = __webpack_require__(56);
var game_url_helper_1 = __webpack_require__(579);
var sd_settings_controls_1 = __webpack_require__(486);
var localStorageService;
var log = logging_helper_1.Log.scope("settings");
function buildThreadRow(threadId, threadData) {
    var threadLink = (0, game_url_helper_1.buildForumThreadUrl)(threadData.forumId, threadId);
    var sentPackageCount = threadData.packagesSent.size;
    return "<tr>\n             <td>\n                 <span style=\"font-size: larger; font-weight: bold\">".concat((0, organizer_style_1.escapeHtml)(threadData.forumName), "</span> -\n                 <a href=\"").concat(threadLink, "\">\n                     ").concat((0, organizer_style_1.escapeHtml)(threadData.threadName), "\n                 </a>\n                 <div style=\"font-size: x-small; margin-top: 4px;\">Gespeicherte Versand-Eintraege: ").concat(sentPackageCount, "</div>\n             </td>\n             <td style=\"text-align: center;\">\n                 <input type=\"button\" value=\"Reset\" class=\"btn reset-thread-packages\" data-thread-id=\"").concat(threadId, "\"\n                        style=\"width: 70px;\">\n             </td>\n             <td style=\"text-align: center;\"><button style=\"background: url(/graphic/delete.png); width: 20px; height: 20px;  border: none\" class=\"delete-thread\" data-thread-id=\"").concat(threadId, "\"></button></td>\n         </tr>");
}
function renderThreadRows(threads) {
    var rowsHtml = "<tr><th colspan=\"3\">Gespeicherte SD-Threads</th></tr><tr>\n          <th width=\"75%\">\n            Forenname\n          </th>\n          <th>\n            Pakete\n          </th>\n          <th> L\u00C3\u00B6schen\n          </th>\n        </tr>";
    Object.entries(threads).forEach(function (_a) {
        var _b = __read(_a, 2), threadId = _b[0], threadData = _b[1];
        rowsHtml += buildThreadRow(threadId, threadData);
    });
    $("#activeSdThreads").html(rowsHtml);
    $("#activeSdThreads th").last().text("Loeschen");
}
function displaySettings(pageContext) {
    localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    (0, organizer_style_1.ensureOrganizerStyles)();
    log.info("Initializing settings controller", { href: pageContext.href });
    var settingsHtml = "<table class=\"vis\" id=\"sd-settings-root\" data-sd-native-settings=\"true\" width=\"100%\">\n      <tbody>\n        <tr><th colspan=\"2\">SD Organizer</th></tr>\n        <tr>\n          <td>Massen-UT automatisch vorbereiten:</td>\n          <td><label><input type=\"checkbox\" id=\"automate-massen-ut\"> Gruppe, Vorlage und Filter f\u00FCr SD-Anfragen anwenden</label></td>\n        </tr>\n        <tr>\n          <td>Doppeltes Schicken:</td>\n          <td><label><input type=\"checkbox\" id=\"prevent-duplicate-destination\"> Bereits bearbeitete SD-Anfragen erneut vorausw\u00E4hlen</label></td>\n        </tr>\n        <tr>\n          <td><label for=\"sd-sort-by\">Sortieren nach:</label></td>\n          <td><select id=\"sd-sort-by\"></select></td>\n        </tr>\n        <tr>\n          <td><label for=\"sd-group-id\">SD-Gruppe:</label></td>\n          <td><input type=\"number\" min=\"0\" value=\"0\" id=\"sd-group-id\" size=\"6\"></td>\n        </tr>\n        <tr>\n          <td><label for=\"sd-template-id\">SD-Vorlage:</label></td>\n          <td><input type=\"number\" min=\"0\" value=\"0\" id=\"sd-template-id\" size=\"6\"></td>\n        </tr>\n        <tr>\n          <td><label for=\"sd-schwertLfz\">Schwert-Laufzeit:</label></td>\n          <td><input type=\"number\" min=\"0.01\" step=\"any\" value=\"0\" id=\"sd-schwertLfz\" size=\"6\"> Minuten pro Feld</td>\n        </tr>\n        <tr><td colspan=\"2\"><small>\u00C4nderungen werden sofort gespeichert. Gr\u00FCn / \u2713: g\u00FCltig oder aktiv.</small></td></tr>\n      </tbody>\n    </table>\n    <br>\n    <table class=\"vis\" width=\"100%\"><tbody id=\"activeSdThreads\"></tbody></table>";
    var $mount = $("#content_value > table > tbody > tr > td:nth-child(2)").first();
    ($mount.length ? $mount : $("#content_value")).append(settingsHtml);
    var $settingsRoot = $("#sd-settings-root");
    if (localStorageService.getSwordLfz !== 0) {
        $("#sd-schwertLfz").val(localStorageService.getSwordLfz);
    }
    else {
        $("#sd-schwertLfz").val("0");
    }
    log.state("Loaded settings data sources", {
        groupCount: localStorageService.getGroupData.length,
        templateCount: localStorageService.getTemplateData.length,
        threadCount: Object.keys(localStorageService.getAllThreads).length
    });
    (0, sd_settings_controls_1.initializeSdSettingsControls)($settingsRoot, localStorageService, log);
    $(document).off('sd-catalog-updated.sdSettings').on('sd-catalog-updated.sdSettings', function () { return (0, sd_settings_controls_1.initializeSdSettingsControls)($settingsRoot, localStorageService, log); });
    void (0, game_catalog_1.refreshGameCatalogs)();
    var threads = localStorageService.getAllThreads;
    renderThreadRows(threads);
    //listener
    $("#activeSdThreads").on("click", ".delete-thread", function () {
        var threadIdToDelete = String($(this).data("thread-id"));
        log.info("Deleting thread from settings", { threadIdToDelete: threadIdToDelete });
        localStorageService.deleteThread(threadIdToDelete);
        renderThreadRows(localStorageService.getAllThreads);
    });
    $("#activeSdThreads").on("click", ".reset-thread-packages", function () {
        var threadId = String($(this).data("thread-id"));
        localStorageService.resetPackagesSent(threadId);
        log.info("Reset sent packages from settings", { threadId: threadId });
        renderThreadRows(localStorageService.getAllThreads);
    });
    $("#sd-schwertLfz").on("change", function () {
        var value = Number($(this).val());
        if (Number.isFinite(value) && value > 0) {
            localStorageService.setSwordLfz = value;
            document.dispatchEvent(new Event('sd-settings-changed'));
            log.info("Updated setting", { setting: "swordLfz", value: value });
        }
        else {
            log.error("Invalid value for sword travel time", { value: $(this).val() });
            $(this).val(localStorageService.getSwordLfz);
            document.dispatchEvent(new Event('sd-settings-changed'));
        }
    });
    $("#sd-schwertLfz").on('input', function () { return document.dispatchEvent(new Event('sd-settings-changed')); });
}
exports.displaySettings = displaySettings;


/***/ }),

/***/ 871:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SETUP_ICON_DATA_URI = exports.ADD_THREAD_ICON_DATA_URI = void 0;
exports.ADD_THREAD_ICON_DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMESURBVDhPrZVpSFRRFMf/740zo+hgmjpODqNpmYWQwZgLZIL5oYxwiyJoFcJoozIjIsoPQYQgWYQ1TSAaKbmippKFpZaS5kZaUoimuGaoM46z9+71OSYaqPT78t4957z/vefcw3kMOHTTQ9bmkidoKs6CZmKImFaMk6sMIXHJUMaehoNExjBErPDOKXxvrITX1mB4bQniQxcwGk0QCu341WIGv7VhsPsTNoXuRcKNZ2DqctKsb9S3EJWUhpD4JD5sdTQVqTGvwaTHy6zOUjmOpxfz7rWRnRKHyZEBsKRmy6W5WogG0VpUGL3egO6vPZia0oBhGLi5ucDHWwF7ezF6e/sxMjpG60lgWQYyTynk8g0Qi0XURrAJErH39R+hUudifHwCApZFQMBmXL6YzH0kQ5YqG7XvPsDBwZ5eEMuw8Pf3Q0L8fuxU7uBVuI34J4aHR3D3XiaOHklEVXkeql/l02AniSP12wkEOHHsEAry1aipKkB56XN4eLgh8+FTtLZ1YnbWQONsgiaTGa6uLpxDz6Vl5FJiERkRDne39XzEYkQiIVKvnIPvRgWaW9qh0f0lSOqykXMEbQ9EYUkFyiqq0dXdA51ulgb9Czs7AYKVQTCZTdBotdRmOyE50fXUC0iIjUFxaSUy7j/G29p6TE9r+IjlsVoBrWYGFvLCQQX1et3cghM9mHgAL3KyEB0VgcwHKnxu7aTlWA6LxYrR0XFIpe4QCwXUZjuhVjuDXxO/bfWL2RcNF9d16P85AN3s0tQtFgvaO76grqERfn4+cHSYax3aNgbNJN2JpOjJ7SaRSDA2Ng6z2QyZTAqxSERT6+sbQGNjM5ydnWE0GZGT+xK7d4XT2jd0lC0IEry95RjiWqewqBwGo4HrQwHOnjmJsBAlbVyFwgvVr2vR0tpO40VCEa5dPY+wUCW98XmY25GwbttzGLGX0nnT2ijJSEFXTR5YMs8mB3/w5rVDNIgWS4YjmWc1qjTetXoqH92kGkRryYD18A20tdFKICdbNGCJ8f/9AmTMH8N0QjyBbMOkAAAAAElFTkSuQmCC";
// Embedded vector: no asset host or network request needed by the userscript.
exports.SETUP_ICON_DATA_URI = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22"><path d="M9 1h4l.6 2.4 2 .9 2.2-1.1 2 3.4-1.7 1.7.2 2.3 2 1.6-2 3.4-2.5-.6-1.8 1.3-.4 2.7H10l-.5-2.6-2-1-2.4.8-2-3.4 1.8-1.9V9L3 7.5l2-3.4 2.4.8 1.5-1.2Z" fill="#b59860" stroke="#6b431a"/><circle cx="11.5" cy="10.5" r="4" fill="#fff3d2" stroke="#6b431a"/><circle cx="16.5" cy="16.5" r="5" fill="#f3e5be" stroke="#6b431a"/><path d="m13.5 16.5 2 2 4-4" fill="none" stroke="#42642a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');


/***/ }),

/***/ 187:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.viewThread = void 0;
var thread_registration_1 = __webpack_require__(452);
var options_sd_thread_1 = __webpack_require__(625);
var sd_table_1 = __webpack_require__(248);
var local_storage_helper_1 = __webpack_require__(326);
var logging_helper_1 = __webpack_require__(56);
var thread_guards_1 = __webpack_require__(727);
var forum_quick_settings_1 = __webpack_require__(585);
var log = logging_helper_1.Log.scope("view-thread");
function viewThread(pageContext) {
    var _a;
    var localStorageService = local_storage_helper_1.LocalStorageHelper.getInstance();
    var currentThreadId = (0, thread_guards_1.getThreadIdFromContext)(pageContext);
    log.info("Initializing view-thread controller", {
        currentThreadId: currentThreadId,
        href: window.location.href
    });
    (0, forum_quick_settings_1.addForumQuickSettings)(currentThreadId);
    var pageState = readPageState(pageContext, localStorageService);
    var derivedState = deriveState(pageContext, pageState, localStorageService);
    var createdTitle = sessionStorage.getItem('sd-created-title');
    var currentTitle = $('.clearfix > table').first().find('h2').text().trim();
    var existingThreads = JSON.parse((_a = sessionStorage.getItem('sd-created-existing')) !== null && _a !== void 0 ? _a : '[]');
    if (!existingThreads.includes(currentThreadId) && derivedState.hasPendingNewThreadMarker && (0, thread_registration_1.readSdPostId)() && createdTitle && createdTitle === currentTitle) {
        if ((0, thread_registration_1.registerSdThread)(currentThreadId, pageContext.forumId)) {
            localStorageService.setNewThread = false;
            sessionStorage.removeItem('sd-created-title');
            sessionStorage.removeItem('sd-created-existing');
            pageState = readPageState(pageContext, localStorageService);
            derivedState = deriveState(pageContext, pageState, localStorageService);
        }
    }
    log.state("Known thread ids in localStorage", {
        currentThreadId: pageState.currentThreadId,
        knownThreadIds: Object.keys(pageState.threads),
        knownThreadCount: Object.keys(pageState.threads).length
    });
    (0, options_sd_thread_1.addSdOptions)(pageState.currentThreadId, pageContext.forumId, function () { return viewThread(pageContext); }, derivedState.isKnownThread);
    if (derivedState.isKnownThread) {
        localStorageService.setBunkerImportTargetThreadId = pageState.currentThreadId;
        log.info("Thread is registered as SD thread; rendering SD table", {
            currentThreadId: pageState.currentThreadId
        });
        (0, sd_table_1.sdTable)(pageContext, pageState.threads);
    }
}
exports.viewThread = viewThread;
function readPageState(pageContext, localStorageService) {
    return {
        currentThreadId: (0, thread_guards_1.getThreadIdFromContext)(pageContext),
        threads: localStorageService.getAllThreads
    };
}
function deriveState(pageContext, pageState, localStorageService) {
    return {
        hasPendingNewThreadMarker: localStorageService.getNewThread || !!sessionStorage.getItem('sd-created-title'),
        isKnownThread: (0, thread_guards_1.isKnownSdThread)(pageState.threads, pageContext)
    };
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
var pending_operations_1 = __webpack_require__(658);
var onboarding_1 = __webpack_require__(271);
var game_catalog_1 = __webpack_require__(444);
var mass_ut_1 = __webpack_require__(513);
var view_thread_1 = __webpack_require__(187);
var new_thread_1 = __webpack_require__(926);
var settings_1 = __webpack_require__(858);
var logging_helper_1 = __webpack_require__(56);
var script_context_1 = __webpack_require__(757);
var away_detail_1 = __webpack_require__(107);
var log = logging_helper_1.Log.scope("bootstrap");
var contextHandlers = {
    "place": { name: "displayMassUt", run: mass_ut_1.displayMassUt },
    "overview-away_detail": { name: "displayAwayDetail", run: away_detail_1.displayAwayDetail },
    "forum-view_thread": { name: "viewThread", run: view_thread_1.viewThread },
    "forum-new_thread": { name: "createNewTable", run: new_thread_1.createNewTable },
    "settings": { name: "displaySettings", run: settings_1.displaySettings }
};
(function () {
    var api = typeof unsafeWindow != 'undefined' ? unsafeWindow.ScriptAPI : window.ScriptAPI;
    api.register('Standdeff Tabelle', true, 'TheHebel97', 'support-nur-im-forum@die-staemme.de');
    $(function () {
        var _a;
        document.addEventListener('sd-storage-error', function () {
            $('#sd-storage-error').remove();
            $('<p id="sd-storage-error" role="alert" style="padding:8px;border:1px solid #8d0100">').text('SD Organizer: Speichern fehlgeschlagen. Bitte freien Browserspeicher prüfen und die Änderung erneut ausführen.').prependTo('#content_value');
        });
        var contextResolution = (0, script_context_1.resolveScriptContext)();
        (0, game_catalog_1.initializeGameCatalog)(contextResolution);
        log.groupCollapsed("Boot sequence");
        log.state("Resolved script context", contextResolution);
        var handler = contextHandlers[contextResolution.context];
        if (!handler) {
            // Setup spans native group/template pages and survives other page changes.
            (0, onboarding_1.initializeOnboarding)(contextResolution);
            log.warn("No controller registered for resolved context", {
                context: contextResolution.context,
                screen: contextResolution.screen,
                mode: contextResolution.mode
            });
            log.groupEnd();
            return;
        }
        log.info("Dispatching controller", {
            context: contextResolution.context,
            handler: handler.name
        });
        try {
            if (contextResolution.context === 'forum-view_thread')
                (0, pending_operations_1.confirmVisibleForumPosts)((_a = contextResolution.query.thread_id) !== null && _a !== void 0 ? _a : '');
            handler.run(contextResolution);
            (0, pending_operations_1.showPendingOperations)();
            (0, onboarding_1.initializeOnboarding)(contextResolution);
            if (sessionStorage.getItem('sd-storage-recovered')) {
                $('<p role="alert" style="padding:8px;border:1px solid #8d0100">').text('SD Organizer: beschädigte Speicherdaten wurden vor der Wiederherstellung unter standdeff-organizer:backup gesichert. Bitte die Thread-Zuordnungen und Einstellungen prüfen.').prependTo('#content_value');
                sessionStorage.removeItem('sd-storage-recovered');
            }
            log.info("Controller finished boot phase", {
                context: contextResolution.context,
                handler: handler.name
            });
        }
        catch (error) {
            log.error("Unhandled error during controller boot", error);
            $('<p role="alert" style="padding:8px;border:1px solid #8d0100">').text("SD Organizer konnte nicht gestartet werden: ".concat(error instanceof Error ? error.message : 'unbekannter Fehler')).prependTo('#content_value');
            throw error;
        }
        finally {
            log.groupEnd();
        }
    });
})();

})();

/******/ })()
;