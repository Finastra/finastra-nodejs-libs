declare module Express {
  interface Request {
    user?: any;
    logout(callback: (err?: any) => void): void;
  }
  interface User {
    username: string;
    id?: string;
  }
}
