import { IGetUsersParams, IGetUsersResponse } from "@/@types/UserManagement";
import API from "@/services/API";

export async function getUsers(
  params: IGetUsersParams = {},
): Promise<IGetUsersResponse> {
  const response = await API.get<IGetUsersResponse>("/user", { params });
  return response.data;
}

export async function updateUserStatus(
  userId: string,
  desativado: boolean,
): Promise<void> {
  await API.patch(`/user/${userId}/status`, { desativado });
}
