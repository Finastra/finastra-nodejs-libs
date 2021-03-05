import { readFileSync } from 'fs';
import { join } from 'path';

export default function inlineSVG(iconName) {
  const path = join(__dirname, `../assets/img/${iconName}.svg`);
  return readFileSync(path, 'utf8');
}
