import { SSRPages } from '@finastra/ssr-pages';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SSRPagesService extends SSRPages {
  constructor() {
    super();
  }
}
