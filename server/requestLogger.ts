/**
 * HTTP request logger middleware.
 * Logs one line per request after response finishes: method, url, status, duration, ua.
 * Skips /api/news/refresh noise only by default; configurable via options.
 */
import type { Request, Response, NextFunction } from "express";
import { createLogger } from "./logger";

const log = createLogger("http");

export interface RequestLoggerOptions {
  /** Paths to skip (exact match). */
  skipPaths?: string[];
}

export function requestLogger(opts: RequestLoggerOptions = {}) {
  const skip = new Set(opts.skipPaths ?? []);
  return (req: Request, res: Response, next: NextFunction) => {
    if (skip.has(req.path)) return next();
    const start = process.hrtime.bigint();
    res.on("finish", () => {
      const ns = Number(process.hrtime.bigint() - start);
      const ms = (ns / 1e6).toFixed(1);
      const ua = req.headers["user-agent"] || "-";
      const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
      const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms ua="${String(ua).slice(0, 60)}"`;
      if (level === "error") log.error(line);
      else if (level === "warn") log.warn(line);
      else log.info(line);
    });
    next();
  };
}
