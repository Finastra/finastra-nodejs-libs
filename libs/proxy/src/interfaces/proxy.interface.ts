export interface ProxyOptions {
  headers?: {
    [key: string]: string;
  };
}

export interface Service {
  id: string;
  url: string;
  options?: ProxyOptions;
}
