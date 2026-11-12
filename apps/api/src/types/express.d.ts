declare global {
  namespace Express {
    interface Request {
      auth?: { userId: number; email: string; name: string; roles: string[]; permissions: string[] };
      requestId?: string;
    }
  }
}
export {};
