import { join } from 'path';
import { URL } from 'url';

export function getBaseURL(path) {
  const url = new URL(path);
  return url.origin;
}

export function concatPath(...args: any[]) {
  const baseUrl = args.shift();
  const finalUrl = new URL(baseUrl);
  finalUrl.pathname = join(...args);
  return finalUrl.toString();
}

export function isAbsolute(path) {
  return !path.indexOf('/');
}
