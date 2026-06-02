"use client";

import { UpdateUserDTO } from "@/@dtos/User";
import { UpdateUserSchema } from "@/@schemas/User";
import RHFTextField from "@/components/RHF/TextField";
import { useAuth } from "@/providers/AuthProvider";
import API from "@/services/API";
import { safeZodResolver } from "@/utils/safeZodResolver";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function PersonalInfoTab() {
  const { user } = useAuth();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
    watch,
  } = useForm<UpdateUserDTO>({
    resolver: safeZodResolver(UpdateUserSchema),
    mode: "onChange",
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const onUpdateUser = async (data: UpdateUserDTO) => {
    const payload: Partial<UpdateUserDTO> = {};

    if (data.name !== user?.name) payload.name = data.name;
    if (data.email !== user?.email) payload.email = data.email;

    if (Object.keys(payload).length === 0) return;

    try {
      await API.patch("/user/me", payload);

      if (payload.name) {
        toast.success("Nome atualizado com sucesso!");
      }

      if (payload.email) {
        toast.info(
          `Enviamos um link de confirmação para ${payload.email}. A troca de email só será efetivada após a confirmação.`,
        );
      }

      // O nome novo já está persistido; o email permanece o atual até a
      // confirmação pelo link enviado.
      reset({
        name: payload.name ?? user?.name ?? "",
        email: user?.email ?? "",
      });
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error("Email já está em uso");
      } else {
        toast.error("Não foi possível atualizar seus dados.");
      }
    }
  };

  const formEmail = watch("email");
  const formName = watch("name");

  const isDataChanged = useMemo(() => {
    return formEmail !== user?.email || formName !== user?.name;
  }, [formEmail, formName, user]);

  return (
    <Box sx={{ width: "100%", height: "100%", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Informações Pessoais
      </Typography>

      <form onSubmit={handleSubmit(onUpdateUser)}>
        <Stack spacing={2} direction="column">
          <RHFTextField
            control={control}
            name="name"
            label="Nome"
            errors={errors}
          />
          <Divider />
          <Typography gutterBottom>Trasferência de email</Typography>
          <RHFTextField
            control={control}
            name="email"
            label="Email"
            errors={errors}
          />
          <span className="text-[12px]">
            Nota: Para realizar a transferência de email, você deverá realizar o
            processo de verificação novamente no email de destino.
          </span>

          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || !isDataChanged || isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
