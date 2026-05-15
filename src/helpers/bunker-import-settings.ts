import {unitNumberMap} from "../types/types";
import {Unit} from "../types/tw-types";

export const BUNKER_IMPORT_UNIT_ORDER: Unit[] = [
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

export const DEFAULT_BUNKER_UNIT_POWERS: unitNumberMap = {
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

export const DEFAULT_BUNKER_SPLIT_CONFIG: unitNumberMap = {
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

export function normalizeUnitNumberMap(
    value: Partial<Record<Unit, number>> | null | undefined,
    defaults: unitNumberMap,
): unitNumberMap {
    const normalized: unitNumberMap = {...defaults};
    const source = value ?? {};

    BUNKER_IMPORT_UNIT_ORDER.forEach((unit) => {
        const rawValue = source[unit];
        const numericValue = typeof rawValue === "number" ? rawValue : Number(rawValue);
        if (!isNaN(numericValue) && isFinite(numericValue) && numericValue >= 0) {
            normalized[unit] = numericValue;
        }
    });

    return normalized;
}

export function calculateBunkerSplitPower(
    splitConfig: unitNumberMap,
    unitPowers: unitNumberMap,
    units: readonly Unit[],
): number {
    return units.reduce((sum, unit) => {
        const splitAmount = Number(splitConfig[unit] ?? 0);
        const unitPower = Number(unitPowers[unit] ?? 0);
        if (isNaN(splitAmount) || isNaN(unitPower) || splitAmount <= 0 || unitPower <= 0) {
            return sum;
        }
        return sum + (splitAmount * unitPower);
    }, 0);
}
