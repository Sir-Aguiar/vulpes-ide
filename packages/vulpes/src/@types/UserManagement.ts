export type UserSortOrder = "asc" | "desc";

export interface IUserListItem {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  desativado: boolean;
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
}

export interface IGetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  order?: UserSortOrder;
}

export interface IGetUsersResponse {
  data: IUserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
