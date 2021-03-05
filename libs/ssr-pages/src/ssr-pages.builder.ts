import { readFileSync } from 'fs';
import * as handlebars from 'handlebars';
import { join } from 'path';
import background from './helpers/background.helper';
import inlineSVG from './helpers/inlineSVG.helper';
import { MessagePageOptions } from './ssr-pages.interface';

export class SSRPages {
  private templateMessagePage: HandlebarsTemplateDelegate;

  constructor() {
    this.registerHelpers();
    this.setTemplateMessagePage();
  }

  private setTemplateMessagePage() {
    const path = join(__dirname, './assets/page.hbs');
    const source = readFileSync(path, 'utf8');
    this.templateMessagePage = handlebars.compile(source);
  }

  private registerHelpers() {
    handlebars.registerHelper('inlineSvg', inlineSVG);
    handlebars.registerHelper('background', background);
  }

  build(msgPageOpts: MessagePageOptions) {
    return this.templateMessagePage(msgPageOpts);
  }
}
