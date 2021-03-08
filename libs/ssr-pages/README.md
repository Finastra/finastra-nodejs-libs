# SSR Pages builder

Builder of html pages for the purpose of SSR (Server-side rendering).

## Use it

```typescript
import { SSRPages } from '@finastra/ssr-pages';

const ssrPagesService = new SSRPages();
const msgPageOpts = {
  title: 'SSR example',
  subtitle: `This is an example of a server-side rendered content`,
  description: 'Built with @finastra/ssr-pages library',
  svg: 'exit' as const,
  redirect: {
    auto: false,
    link: '/user',
    label: 'Check your user',
  },
};
const html = ssrPagesService.build(msgPageOpts);
```

And use the generated html as you see fit ;)

<br/>
<br/>
<br/>

## NestJS

To use it in NestJS, simply create an injectable service that extends the SSRPage class.

```typescript
import { SSRPages } from '@finastra/ssr-pages';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SSRPagesService extends SSRPages {
  constructor() {
    super();
  }
}
```

Inject it in a controller, and use it in an endpoint to return the templated html !

```typescript

constructor(private ssrPagesService: SSRPagesService) {}

@Get('/ssr')
  async ssr(): Promise<string> {
    const msgPageOpts = {
      title: 'SSR example',
      subtitle: `This is an example of a server-side rendered content`,
      description: 'Built with our @finastra/ssr-pages library',
      svg: 'exit' as const,
      redirect: {
        auto: false,
        link: '/user',
        label: 'Check your user',
      },
    };
    return this.ssrPagesService.build(msgPageOpts);
  }
```
