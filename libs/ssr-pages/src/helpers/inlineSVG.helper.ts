import { readFileSync } from 'fs';
import { join } from 'path';

export default function inlineSVG(iconName) {
  const path = join(__dirname, `../assets/img/${iconName}.svg`);
  const bla = readFileSync(path, 'utf8');
  return bla;
}
