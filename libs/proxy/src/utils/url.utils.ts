export function getBaseURL(path) {
  const url = new URL(path);
  return url.origin;
}

export function concatPath(...args: any[]) {
  let path = '';
  for (let i = 0; i < arguments.length; i++) {
    if (arguments[i] === '') {
      continue;
    }
    path += arguments[i].startsWith('/') ? arguments[i].substr(1) : arguments[i];
    if (i < arguments.length - 1 && !isAbsolute(arguments[i + 1]) && !path.endsWith('/')) {
      path += '/';
    }
  }
  return path;
}

export function isAbsolute(path) {
  return !path.indexOf('/');
}
