import { endsWith } from './string.utils';

export function getBaseURL(path) {
  var url = path.split('/');
  var baseUrl = url[0] + '//' + url[2];
  return baseUrl;
}

export function concatPath(...args: any[]) {
  let path = '';
  for (let i = 0; i < arguments.length; i++) {
    if (arguments[i] === '') {
      continue;
    }
    path += arguments[i];
    if (
      i < arguments.length - 1 &&
      !this.isAbsolute(arguments[i + 1]) &&
      !endsWith(path, '/')
    ) {
      path += '/';
    }
  }
  return path;
}

export function isAbsolute(path) {
  return !path.indexOf('/');
}
