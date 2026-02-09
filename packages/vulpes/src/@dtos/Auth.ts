export interface IAuthResponse {
  access_token: string;
  user: IUser;
}

export interface IUser {
  userId: string;
  email: string;
  name: string;
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
  institutionId: number | null;
}

export interface ISignupRequest {
  name: string;
  email: string;
  password: string;
  institutionId?: number;
}

export interface ILoginRequest {
  email: string;
  password: string;
}
