
export interface MapVillage {
    ally_id: string;
    id: string;
    name: string;
    owner: string;
    points: string;
    type: any;
    special: any;
    bonus_id: any;
}

export type Unit =
    'spear'
    | 'sword'
    | 'archer'
    | 'axe'
    | 'spy'
    | 'light'
    | 'marcher'
    | 'heavy'
    | 'ram'
    | 'catapult'
    | 'knight'
    | 'snob';

export interface GameDataVillage {
    display_name: string;
    id: number;
    name: string;
}

export interface GameDataPlayer {
    ally: string;
    id: string;
    name: string;
    sitter: string;
}

export interface GameData {
    group_id: string;
    link_base_pure: string;
    locale: string;
    majorVersion: string;
    market: string;
    player: GameDataPlayer;
    pregame: boolean;
    version: string;
    village: GameDataVillage;
    world: string;
    units: Unit[];
    mode: string;
}


export interface TWMapPopupCacheEntry {
    id: string;
    xy: number;
}

declare global {
    const Dialog: {
        show: (title: string, html: string) => void;
    }
    const game_data: GameData;
    const Format: {
        userImageThumbURL: (id: string) => string;
    }
    const Timing: {
        tickHandlers: {
            timers: {
                _timers: { element: HTMLElement; end: number }[];
            };
        };
    };
    const UI: {
        ToolTip: (
            elem: JQuery,
            tooltip: { bodyHandler: () => string; extraClass: string }
        ) => void;
    };
    const TribalWars: {
        redirect: (screen: string, args: { [key: string]: any }) => void;
    };
    const GM_getValue: (key: string) => string;
    const GM_setValue: (key: string, value: string) => void;
    const TWMap: {
        allies: {
            [id: number]: {
                name: string;
                points: string;
                tag: string;
                image_id: string;
            }
        }
        players: {
            [id: number]: {
                ally: string;
                image_id: string;
                name: string;
                newbie: number;
                points: string;
                sleep: boolean;
                village_count_text: string;
            };
        };
        popup: {
            displayForVillage: (village: MapVillage, x: number, y: number) => void;
            _cache: { [id: number]: TWMapPopupCacheEntry };
            receivedPopupInformationForSingleVillage: (
                entry: TWMapPopupCacheEntry
            ) => void;
        };
        con: {
            continentByXY: (x: number, y: number) => number;
        };
        bonus_data: { [id: number]: { text: string; image: string } };
    };
}


