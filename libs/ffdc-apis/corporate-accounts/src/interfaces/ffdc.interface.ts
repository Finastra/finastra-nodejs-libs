export interface FFDCItems<T> {
  items: T;
  meta: FFDCDataMeta;
}

export interface FFDCDataMeta {
  limit: number;
  pageCount: number;
  itemCount: number;
  page: number;
}

export interface User {
  access_token: string;
}
