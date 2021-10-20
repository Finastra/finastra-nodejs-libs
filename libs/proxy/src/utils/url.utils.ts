import { URL } from 'url';
import urljoin from 'url-join';

export function getBaseURL(path) {
  const url = new URL(path);
  return url.origin;
}

export function concatPath(...args: string[]) {
  return urljoin(...args);
}

export function isAbsolute(path) {
  return !path.indexOf('/');
}
