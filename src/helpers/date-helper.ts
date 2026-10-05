function pad(value: number): string { return String(value).padStart(2, "0"); }

function localEpoch(year: number, month: number, day: number, hour: number, minute: number): number {
    const date = new Date(year, month - 1, day, hour, minute);
    if (year < 1970 || year > 3000 || date.getFullYear() !== year || date.getMonth() !== month - 1 ||
        date.getDate() !== day || date.getHours() !== hour || date.getMinutes() !== minute) return 0;
    return date.getTime() / 1000;
}

/** Internal inquiry timestamps use seconds; table cells use German local dates. */
export function normalizeDateEpoch(value: unknown): number {
    if (value === undefined || value === null || value === "" || value === 0) return 0;
    const raw = String(value).trim();
    const german = /^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{1,2}):(\d{2})$/.exec(raw);
    if (german) return localEpoch(+german[3], +german[2], +german[1], +german[4], +german[5]);
    const iso = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(raw);
    if (iso) return localEpoch(+iso[1], +iso[2], +iso[3], +iso[4], +iso[5]);
    if (/^\d{8}$/.test(raw)) return localEpoch(+raw.slice(0,4), +raw.slice(4,6), +raw.slice(6,8), 0, 0);
    if (/^\d{4}$/.test(raw)) return localEpoch(+raw, 1, 1, 0, 0);
    const numeric = Number(raw);
    if (!Number.isFinite(numeric) || numeric <= 0) return 0;
    const seconds = numeric > 1e12 ? numeric / 1000 : numeric;
    const date = new Date(seconds * 1000);
    return Number.isFinite(date.getTime()) && date.getFullYear() >= 1970 && date.getFullYear() <= 3000 ? seconds : 0;
}

export function formatLocalDateInput(value: unknown): string {
    const epoch = normalizeDateEpoch(value);
    if (!epoch) return "";
    const date = new Date(epoch * 1000);
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatGermanDate(value: unknown): string {
    const input = formatLocalDateInput(value);
    if (!input) return "";
    return `${input.slice(8,10)}.${input.slice(5,7)}.${input.slice(0,4)} ${input.slice(11)}`;
}
