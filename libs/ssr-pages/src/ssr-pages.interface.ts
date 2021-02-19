export interface MessagePageOptions {
  title: string;
  subtitle: string;
  description?: string;
  svg?: MessagePageSvgs;

  redirect: RedirectOptions;

  backLabel?: string;
}

export interface RedirectOptions {
  /** Whether the page will auto-redirect to another uri after x seconds */
  auto?: boolean;
  link: string;
  label?: string;
}

export type MessagePageSvgs = 'warning' | 'exit';
