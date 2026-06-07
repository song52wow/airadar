/**
 * Lightweight server-side logger.
 * - Wraps console with ISO timestamp + level + module prefix.
 * - Levels: debug < info < warn < error.
 * - Output: debug/info → stdout; warn/error → stderr (Unix convention).
 * - Controlled by LOG_LEVEL env (default: "info" in prod, "debug" in dev).
 */

type Level = "debug" | "info" | "warn" | "error";

const LEVEL_RANK: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const ENV_LEVEL = (process.env.LOG_LEVEL || "").toLowerCase() as Level;
const IS_DEV = process.env.NODE_ENV !== "production";
const ACTIVE_LEVEL: Level =
  (ENV_LEVEL && LEVEL_RANK[ENV_LEVEL] !== undefined ? ENV_LEVEL : IS_DEV ? "debug" : "info");

function ts(): string {
  return new Date().toISOString();
}

function format(module: string, level: Level, args: unknown[]): string {
  const head = `${ts()} [${level.toUpperCase()}] [${module}]`;
  // Strings get inlined; objects get appended as JSON; everything else is coerced.
  const tail = args
    .map((a) => {
      if (typeof a === "string") return a;
      if (a instanceof Error) return a.stack || `${a.name}: ${a.message}`;
      try {
        return JSON.stringify(a);
      } catch {
        return String(a);
      }
    })
    .join(" ");
  return `${head} ${tail}`;
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
    const line = format(module, level, args) + "\n";
    if (level === "warn" || level === "error") {
      process.stderr.write(line);
    } else {
      process.stdout.write(line);
    }
  };
  return {
    debug: (...args) => emit("debug", args),
    info: (...args) => emit("info", args),
    warn: (...args) => emit("warn", args),
    error: (...args) => emit("error", args),
    child: (sub) => createLogger(`${module}:${sub}`),
  };
}
