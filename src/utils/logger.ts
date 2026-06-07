/**
 * Lightweight client-side logger.
 * - Mirrors server/logger.ts interface for consistency.
 * - Disabled in production by default (only warn/error surface).
 * - Controlled by Vite's import.meta.env.DEV + a global __LOG_LEVEL__ override.
 */

type Level = "debug" | "info" | "warn" | "error";

const LEVEL_RANK: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

declare global {
  interface Window {
    __LOG_LEVEL__?: Level;
  }
}

const IS_DEV = (import.meta as any).env?.DEV === true;
const ENV_LEVEL: Level | undefined = (import.meta as any).env?.VITE_LOG_LEVEL as Level | undefined;
const OVERRIDE: Level | undefined =
  typeof window !== "undefined" ? window.__LOG_LEVEL__ : undefined;

const ACTIVE_LEVEL: Level = (OVERRIDE || ENV_LEVEL || (IS_DEV ? "debug" : "warn")) as Level;

function ts(): string {
  return new Date().toISOString();
}

function format(module: string, level: Level, args: unknown[]): unknown[] {
  return [`${ts()} [${level.toUpperCase()}] [${module}]`, ...args];
}

export interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  child: (subModule: string) => Logger;
}

export function createLogger(module: string): Logger {
  const emit = (level: Level, args: unknown[]) => {
    if (LEVEL_RANK[level] < LEVEL_RANK[ACTIVE_LEVEL]) return;
    const out = format(module, level, args);
    if (level === "warn") console.warn(...out);
    else if (level === "error") console.error(...out);
    else if (level === "info") console.info(...out);
    else console.log(...out);
  };
  return {
    debug: (...args) => emit("debug", args),
    info: (...args) => emit("info", args),
    warn: (...args) => emit("warn", args),
    error: (...args) => emit("error", args),
    child: (sub) => createLogger(`${module}:${sub}`),
  };
}
