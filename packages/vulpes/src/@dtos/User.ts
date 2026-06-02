import { ChangePasswordSchema, UpdateUserSchema } from "@/@schemas/User";
import * as Zod from "zod";

export type UpdateUserDTO = Zod.infer<typeof UpdateUserSchema>;
export type ChangePasswordDTO = Zod.infer<typeof ChangePasswordSchema>;
