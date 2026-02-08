export interface IAuthResponse {
  access_token: string;
  user: IUser;
}

export interface IUser {
  userId: string;
  email: string;
  name: string;
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
  institution: string | null;
}

export interface ISignupRequest {
  name: string;
  email: string;
  password: string;
  institution?: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}
