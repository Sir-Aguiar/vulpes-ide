import type {
  ICompleteResetPasswordDTO,
  IResetPasswordDTO,
  ValidateResetPasswordOrderResponse,
} from "@/@schemas/Auth.schema";
import API from "@/services/API";

/** Cria uma ordem de reset e dispara o email com o link (backend). */
export async function requestResetPasswordOrder(
  data: IResetPasswordDTO,
): Promise<void> {
  await API.post("/reset-password", data);
}

/** Valida o token JWT do link e retorna o orderId se ainda for válido. */
export async function validateResetPasswordOrder(
  token: string,
): Promise<ValidateResetPasswordOrderResponse> {
  const { data } = await API.get<ValidateResetPasswordOrderResponse>(
    `/reset-password/verify/${token}`,
  );
  return data;
}

/** Define a nova senha para a ordem validada. */
export async function completeResetPassword(
  orderId: string,
  data: ICompleteResetPasswordDTO,
): Promise<void> {
  await API.post("/reset-password/confirm", {
    orderId,
    password: data.password,
  });
}
