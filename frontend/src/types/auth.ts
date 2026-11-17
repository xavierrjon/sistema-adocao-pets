export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type LoginData = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};
