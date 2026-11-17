export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthenticatedSession = {
  id: string;
  expiresAt: Date;
};
