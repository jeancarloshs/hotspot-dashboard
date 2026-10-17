export type AuthSession = {
  permission: string | null;
  name: string | null;
  email: string | null;
  ispID: number | null;
  userID: number | null;
};

export const EMPTY_SESSION: AuthSession = {
  permission: null,
  name: null,
  email: null,
  ispID: null,
  userID: null,
};
