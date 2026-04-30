'use strict'

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "silent";

export interface LoggerApi {
    scope(scopeName: string): LoggerApi;
    trace(...args: unknown[]): void;
    debug(...args: unknown[]): void;
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
    state(label: string, data: unknown): void;
    group(label: string, ...args: unknown[]): void;
    groupCollapsed(label: string, ...args: unknown[]): void;
    groupEnd(): void;
    time(label: string): void;
    timeEnd(label: string): void;
    getLevel(): LogLevel;
    setLevel(level: LogLevel): void;
}

declare global {
    interface Window {
        STANDDEFF_LOG_LEVEL?: LogLevel | string;
        STANDDEFF_LOGGER?: LoggerApi;
    }
}

type ActiveLogLevel = Exclude<LogLevel, "silent">;
type ConsoleMethod = "log" | "info" | "warn" | "error";

const LOGGER_NAME = "StandDeff";
const LOG_STORAGE_KEY = "standdeff-organizer-log-level";
const DEFAULT_LOG_LEVEL: LogLevel = "debug";

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    silent: 60
};

const CONSOLE_METHOD_BY_LEVEL: Record<ActiveLogLevel, ConsoleMethod> = {
    trace: "log",
    debug: "log",
    info: "info",
    warn: "warn",
    error: "error"
};

function parseLogLevel(rawLevel: unknown): LogLevel | null {
    if (typeof rawLevel !== "string") {
        return null;
    }
    const normalizedLevel = rawLevel.trim().toLowerCase();
    if (normalizedLevel in LOG_LEVEL_ORDER) {
        return normalizedLevel as LogLevel;
    }
    return null;
}

function safeGetStoredLogLevel(): LogLevel | null {
    try {
        return parseLogLevel(localStorage.getItem(LOG_STORAGE_KEY));
    } catch (error) {
        console.warn(`[${LOGGER_NAME}] Failed to read stored log level`, error);
        return null;
    }
}

function safeSetStoredLogLevel(level: LogLevel) {
    try {
        if (level === DEFAULT_LOG_LEVEL) {
            localStorage.removeItem(LOG_STORAGE_KEY);
            return;
        }
        localStorage.setItem(LOG_STORAGE_KEY, level);
    } catch (error) {
        console.warn(`[${LOGGER_NAME}] Failed to persist log level`, error);
    }
}

function resolveLogLevel(): LogLevel {
    const urlParams = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();

    const urlLogLevel = parseLogLevel(urlParams.get("sdLogLevel"));
    if (urlLogLevel !== null) {
        return urlLogLevel;
    }

    const debugFlag = urlParams.get("sdDebug");
    if (debugFlag === "trace") {
        return "trace";
    }
    if (debugFlag === "1" || debugFlag === "true") {
        return "debug";
    }

    if (typeof window !== "undefined") {
        const windowLogLevel = parseLogLevel(window.STANDDEFF_LOG_LEVEL);
        if (windowLogLevel !== null) {
            return windowLogLevel;
        }
    }

    return safeGetStoredLogLevel() ?? DEFAULT_LOG_LEVEL;
}

class BrowserLogger implements LoggerApi {
    constructor(private readonly scopeParts: string[] = []) {
    }

    public scope(scopeName: string): LoggerApi {
        return new BrowserLogger([...this.scopeParts, scopeName]);
    }

    public trace(...args: unknown[]) {
        this.write("trace", args);
    }

    public debug(...args: unknown[]) {
        this.write("debug", args);
    }

    public info(...args: unknown[]) {
        this.write("info", args);
    }

    public warn(...args: unknown[]) {
        this.write("warn", args);
    }

    public error(...args: unknown[]) {
        this.write("error", args);
    }

    public state(label: string, data: unknown) {
        if (!this.shouldLog("debug")) {
            return;
        }
        console.groupCollapsed(`${this.buildPrefix("debug")} ${label}`);
        console.dir(data);
        console.groupEnd();
    }

    public group(label: string, ...args: unknown[]) {
        if (!this.shouldLog("debug")) {
            return;
        }
        if (args.length > 0) {
            console.group(`${this.buildPrefix("debug")} ${label}`, ...args);
            return;
        }
        console.group(`${this.buildPrefix("debug")} ${label}`);
    }

    public groupCollapsed(label: string, ...args: unknown[]) {
        if (!this.shouldLog("debug")) {
            return;
        }
        if (args.length > 0) {
            console.groupCollapsed(`${this.buildPrefix("debug")} ${label}`, ...args);
            return;
        }
        console.groupCollapsed(`${this.buildPrefix("debug")} ${label}`);
    }

    public groupEnd() {
        if (!this.shouldLog("debug")) {
            return;
        }
        console.groupEnd();
    }

    public time(label: string) {
        if (!this.shouldLog("debug")) {
            return;
        }
        console.time(`${this.buildPrefix("debug")} ${label}`);
    }

    public timeEnd(label: string) {
        if (!this.shouldLog("debug")) {
            return;
        }
        console.timeEnd(`${this.buildPrefix("debug")} ${label}`);
    }

    public getLevel(): LogLevel {
        return resolveLogLevel();
    }

    public setLevel(level: LogLevel) {
        safeSetStoredLogLevel(level);
        const prefix = this.buildPrefix("info");
        console.info(`${prefix} Log level updated`, {level});
    }

    private write(level: ActiveLogLevel, args: unknown[]) {
        if (!this.shouldLog(level)) {
            return;
        }

        const prefix = this.buildPrefix(level);
        const consoleMethod = CONSOLE_METHOD_BY_LEVEL[level];
        if (args.length === 0) {
            console[consoleMethod](prefix);
            return;
        }

        const [firstArg, ...remainingArgs] = args;
        if (typeof firstArg === "string") {
            console[consoleMethod](`${prefix} ${firstArg}`, ...remainingArgs);
            return;
        }
        console[consoleMethod](prefix, firstArg, ...remainingArgs);
    }

    private shouldLog(level: ActiveLogLevel): boolean {
        const activeLogLevel = this.getLevel();
        if (activeLogLevel === "silent") {
            return false;
        }
        return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[activeLogLevel];
    }

    private buildPrefix(level: ActiveLogLevel): string {
        const timestamp = new Date().toISOString();
        const scopeLabel = this.scopeParts.length > 0 ? this.scopeParts.join(":") : "root";
        return `[${LOGGER_NAME}][${timestamp}][${level.toUpperCase()}][${scopeLabel}]`;
    }
}

export const Log: LoggerApi = new BrowserLogger();

if (typeof window !== "undefined") {
    window.STANDDEFF_LOGGER = Log;
}
