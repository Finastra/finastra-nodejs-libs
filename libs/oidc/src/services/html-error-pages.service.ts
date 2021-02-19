import { HtmlErrorPage } from '@finastra/html-error-pages';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HtmlErrorPagesService extends HtmlErrorPage {
  constructor() {
    super();
  }
}
