const consoleStyles = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",
    FgGray: "\x1b[90m",
    FgOrange: "\x1b[38;5;208m",
    FgLightGreen: "\x1b[38;5;119m",
    FgLightBlue: "\x1b[38;5;117m",
    FgViolet: "\x1b[38;5;141m",
    FgBrown: "\x1b[38;5;130m",
    FgPink: "\x1b[38;5;219m",
    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m",
    BgGray: "\x1b[100m",
};

const consoleModuleColors = [
    consoleStyles.FgCyan,
    consoleStyles.FgGreen,
    consoleStyles.FgLightGreen,
    consoleStyles.FgBlue,
    consoleStyles.FgLightBlue,
    consoleStyles.FgMagenta,
    consoleStyles.FgOrange,
    consoleStyles.FgViolet,
    consoleStyles.FgBrown,
    consoleStyles.FgPink,
];

enum LogLevel {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    DEBUG = "DEBUG",
}

const consoleLevelColors = {
    "INFO": consoleStyles.FgCyan,
    "WARN": consoleStyles.FgYellow,
    "ERROR": consoleStyles.FgRed,
    "DEBUG": consoleStyles.FgPink,
} as Record<string, string>;

export class Logger {
    hideLog = {
        info: [],
        warn: [],
        error: [],
        debug: [],
    } as Record<string, string[]>;

    private hashCache: Record<string, number> = {};

    private _module: string;
    private debugMode = true;

    constructor(private module: string) {
        this._module = module.toUpperCase();
    }

    info(msg: unknown) {
        this.log(msg, LogLevel.INFO);
    }

    warn(msg: unknown) {
        this.log(msg, LogLevel.WARN);
    }

    error(msg: unknown) {
        this.log(msg, LogLevel.ERROR);
    }

    debug(msg: unknown) {
        if (this.debugMode)
            this.log(msg, LogLevel.DEBUG);
    }

    exception(module: string, exception: string, msg: string) {
        this.log(msg ? `${msg}: ${exception}` : exception, LogLevel.ERROR);
    }

    private log(msg: unknown, level: LogLevel) {
        if (this.hideLog[level.toLowerCase()]?.includes(this.module.toLowerCase())) return;

        const now = new Date().toISOString();
        const moduleColor = consoleModuleColors[this.intHash(this.module, consoleModuleColors.length)];
        const levelColor = consoleLevelColors[level];

        const timePart = `${consoleStyles.FgCyan}${now}${consoleStyles.Reset}`;
        const modulePart = `[${moduleColor}${this.module}${consoleStyles.Reset}]`;
        const levelPart = `${levelColor}${level}:${consoleStyles.Reset}`;

        switch (level) {
            case LogLevel.INFO:
                console.info(timePart, modulePart, levelPart, msg);
                break;
            case LogLevel.WARN:
                console.warn(timePart, modulePart, levelPart, typeof msg === "string" ? `${consoleStyles.FgYellow}${msg}${consoleStyles.Reset}` : msg);
                break;
            case LogLevel.ERROR:
                console.error(timePart, modulePart, levelPart, typeof msg === "string" ? `${consoleStyles.FgRed}${msg}${consoleStyles.Reset}` : msg);
                break;
            case LogLevel.DEBUG:
                console.debug(`${consoleStyles.FgGray}${now}${consoleStyles.Reset}`, modulePart, levelPart, typeof msg === "string" ? `${consoleStyles.FgGray}${msg}${consoleStyles.Reset}` : msg);
                break;
            default:
                console.log(timePart, modulePart, msg);
        }
    }

    private intHash(str: string, length = 10): number {
        const cached = this.hashCache[str];
        if (cached) return cached;

        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
        }
        const h = (hash % length + length + str.length) % length;

        this.hashCache[str] = h;
        return h;
    }
}
