import type { AuthenticatedSession, AuthenticatedUser } from "./auth";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      authSession?: AuthenticatedSession;
    }
  }
}

export {};
