/**
 * Given a path with leading slashes removed, tell me which index to consume until.
 *
 * Return -1 if nothing can be consumed (e.g. path is empty, not long enough, etc.)
 */
import {leading} from "@http4t/core/uri";

export type PathConsumer = (pathNoLeadingSlashes: string) => number;

export type Consumed = {
  captured: string,
  consumed: string
  remaining: string
};

/**
 * 1. consume leading slashes from path
 * 2. use consumer to capture some substring of what's left, e.g. everything until the first '/'
 * 3. consume leading slashes from the remaining path
 *
 */
export function consume(path: string, consumer: PathConsumer): Consumed | undefined {
  const prefix = path.match(leading)?.[0] || "";

  const leadingStripped = path.substring(prefix.length);

  const index = consumer(leadingStripped);
  if (index < 0) return undefined;
  if (index > leadingStripped.length) throw new Error(`cannot consume ${index} characters from ${leadingStripped.length} character path '${leadingStripped}'`);

  const captured = leadingStripped.substring(0, index);

  const consumed = prefix + captured;
  return {
    captured,
    consumed,
    remaining: path.substring(consumed.length)
  }
}

export function upToChars(count: number) {
  return (path: string): number => {
    return Math.min(count, path.length);
  }
}

export function exactlyChars(count: number) {
  return (path: string): number => {
    return path.length < count ? -1 : count;
  }
}

export function upToSegments(count: number) {
  return (path: string): number => {
    const segments = path.split('/', count);
    return segments.reduce((acc, s) => acc + 1 + s.length, -1);
  }
}

export function exactlySegments(count: number) {
  return (path: string): number => {
    const segments = path.split('/', count);
    return segments.length !== count ? -1 : segments.reduce((acc, s) => acc + 1 + s.length, -1);
  }
}

export function nextSlashOrEnd(path: string): number {
  const i = path.indexOf('/');
  return i > 0
    ? i
    : path !== ""
      ? path.length
      : -1;
}

export function endOfPath(path: string): number {
  return path === "" ? -1 : path.length;
}